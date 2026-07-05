import { prisma } from '$lib/server/db.js';
import { error, fail } from '@sveltejs/kit';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
        throw error(400, 'Invalid Project ID');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            components: true,
            milestones: true,
            contractors: {
                include: {
                    bills: true
                }
            },
            dailySiteReports: true
        }
    });

    if (!project) {
        throw error(404, 'Project Not Found');
    }

    // Compute WBS Progress
    const totalWeight = project.components.reduce((acc, c) => acc + c.weightPct, 0);
    let overallProgress = 0;
    if (totalWeight > 0) {
        project.components.forEach(c => {
            overallProgress += (c.actualProgress * c.weightPct) / totalWeight;
        });
    }
    overallProgress = Math.round(overallProgress * 10) / 10;

    // Calculate days elapsed vs planned duration
    const plannedStarts = project.components.map(c => new Date(c.plannedStart).getTime());
    const plannedEnds = project.components.map(c => new Date(c.plannedEnd).getTime());
    const minStart = plannedStarts.length > 0 ? new Date(Math.min(...plannedStarts)) : null;
    const maxEnd = plannedEnds.length > 0 ? new Date(Math.max(...plannedEnds)) : null;
    
    let daysElapsed = 0;
    if (minStart) {
        const today = new Date();
        const diffTime = Math.abs(today - minStart);
        daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate contractor sums
    let totalContractVal = 0;
    let totalPaidBillsVal = 0;
    let totalPendingBillsVal = 0;

    project.contractors.forEach(c => {
        totalContractVal += c.contractValue + c.variationOrders;
        c.bills.forEach(b => {
            if (b.status === 'paid') {
                totalPaidBillsVal += b.paidAmount || b.certifiedAmount || b.billAmount;
            } else {
                totalPendingBillsVal += b.billAmount;
            }
        });
    });

    return {
        project,
        stats: {
            overallProgress,
            daysElapsed,
            totalContractVal,
            totalPaidBillsVal,
            totalPendingBillsVal
        }
    };
}

export const actions = {
    add_site_report: async ({ params, request }) => {
        const projectId = parseInt(params.id);
        const formData = await request.formData();
        
        const reportDateStr = formData.get('report_date')?.toString();
        const reportedBy = formData.get('reported_by')?.toString();
        const workDone = formData.get('work_done')?.toString();

        if (!reportDateStr || !reportedBy || !workDone) {
            return fail(400, { error: 'Date, reporter name and work description are required.' });
        }

        const report = await prisma.dailySiteReport.create({
            data: {
                projectId,
                reportDate: new Date(reportDateStr),
                reportedBy,
                workDone,
                photos: '[]',
                isApproved: true,
                approvedBy: 'Auto System'
            }
        });

        return { success: true, report };
    },

    add_component: async ({ params, request }) => {
        const projectId = parseInt(params.id);
        const formData = await request.formData();

        const name = formData.get('name')?.toString();
        const code = formData.get('code')?.toString() || '';
        const category = formData.get('category')?.toString() || 'other';
        const plannedStartStr = formData.get('planned_start')?.toString();
        const plannedEndStr = formData.get('planned_end')?.toString();
        const plannedCost = parseFloat(formData.get('planned_cost')) || 0.0;
        const weightPct = parseFloat(formData.get('weight_pct')) || 0.0;

        if (!name || !plannedStartStr || !plannedEndStr) {
            return fail(400, { error: 'Component name, planned start and end dates are required.' });
        }

        await prisma.constructionComponent.create({
            data: {
                projectId,
                name,
                code,
                category,
                plannedStart: new Date(plannedStartStr),
                plannedEnd: new Date(plannedEndStr),
                plannedCost,
                weightPct,
                actualProgress: 0,
                scheduleStatus: 'on_track'
            }
        });

        return { success: true };
    },

    update_progress: async ({ request }) => {
        const formData = await request.formData();
        const componentId = parseInt(formData.get('component_id'));
        const actualProgress = parseFloat(formData.get('actual_progress'));
        const actualCost = formData.get('actual_cost') ? parseFloat(formData.get('actual_cost')) : null;
        const notes = formData.get('notes')?.toString() || '';

        if (isNaN(componentId) || isNaN(actualProgress)) {
            return fail(400, { error: 'Valid component ID and progress value are required.' });
        }

        // Determine schedule_status based on progress
        const component = await prisma.constructionComponent.findUnique({ where: { id: componentId } });
        if (!component) {
            return fail(404, { error: 'Component not found.' });
        }

        const today = new Date();
        const plannedEnd = new Date(component.plannedEnd);
        const plannedStart = new Date(component.plannedStart);
        const totalDuration = plannedEnd - plannedStart;
        const elapsed = today - plannedStart;
        const plannedProgress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
        
        let scheduleStatus = 'on_track';
        const diff = actualProgress - plannedProgress;
        if (diff >= -5) scheduleStatus = 'on_track';
        else if (diff >= -15) scheduleStatus = 'slight_delay';
        else if (diff >= -30) scheduleStatus = 'delayed';
        else scheduleStatus = 'critical';

        const updateData = {
            actualProgress,
            scheduleStatus,
            notes
        };
        if (actualCost !== null && !isNaN(actualCost)) {
            updateData.actualCost = actualCost;
        }

        await prisma.constructionComponent.update({
            where: { id: componentId },
            data: updateData
        });

        return { success: true };
    },

    add_contractor: async ({ params, request }) => {
        const projectId = parseInt(params.id);
        const formData = await request.formData();

        const companyName = formData.get('company_name')?.toString();
        const contactPerson = formData.get('contact_person')?.toString() || null;
        const contractNumber = formData.get('contract_number')?.toString() || null;
        const contractType = formData.get('contract_type')?.toString() || 'civil';
        const workScope = formData.get('work_scope')?.toString() || '';
        const contractValue = parseFloat(formData.get('contract_value')) || 0.0;
        const mobilizationAdvance = parseFloat(formData.get('mobilization_advance')) || 0.0;
        const contractStartStr = formData.get('contract_start')?.toString();
        const contractEndStr = formData.get('contract_end')?.toString();
        const retentionPct = parseFloat(formData.get('retention_pct')) || 5.0;
        const performanceStatus = formData.get('performance_status')?.toString() || 'not_mobilized';

        if (!companyName || !contractStartStr || !contractEndStr) {
            return fail(400, { error: 'Company name, start and end dates are required.' });
        }

        await prisma.contractor.create({
            data: {
                projectId,
                companyName,
                contactPerson,
                contractNumber,
                contractType,
                workScope,
                contractValue,
                mobilizationAdvance,
                contractStart: new Date(contractStartStr),
                contractEnd: new Date(contractEndStr),
                retentionPct,
                performanceStatus
            }
        });

        return { success: true };
    },

    add_bill: async ({ request }) => {
        const formData = await request.formData();

        const contractorId = parseInt(formData.get('contractor_id'));
        const billNumber = formData.get('bill_number')?.toString();
        const billAmount = parseFloat(formData.get('bill_amount'));
        const billDateStr = formData.get('bill_date')?.toString();

        if (isNaN(contractorId) || !billNumber || isNaN(billAmount) || !billDateStr) {
            return fail(400, { error: 'All bill information fields are required.' });
        }

        await prisma.contractorBill.create({
            data: {
                contractorId,
                billNumber,
                billAmount,
                billDate: new Date(billDateStr),
                submissionDate: new Date(),
                status: 'submitted'
            }
        });

        return { success: true };
    },

    certify_bill: async ({ request }) => {
        const formData = await request.formData();
        const billId = parseInt(formData.get('bill_id'));
        const certifiedAmount = parseFloat(formData.get('certified_amount'));

        if (isNaN(billId) || isNaN(certifiedAmount) || certifiedAmount <= 0) {
            return fail(400, { error: 'Certified amount must be a positive number.' });
        }

        await prisma.contractorBill.update({
            where: { id: billId },
            data: {
                certifiedAmount,
                certifiedDate: new Date(),
                certifiedBy: 'HydroTrack System',
                status: 'certified'
            }
        });

        return { success: true };
    },

    pay_bill: async ({ request }) => {
        const formData = await request.formData();
        const billId = parseInt(formData.get('bill_id'));
        const paidAmount = parseFloat(formData.get('paid_amount'));

        if (isNaN(billId) || isNaN(paidAmount) || paidAmount <= 0) {
            return fail(400, { error: 'Payment amount must be a positive number.' });
        }

        await prisma.contractorBill.update({
            where: { id: billId },
            data: {
                paidAmount,
                paidDate: new Date(),
                status: 'paid'
            }
        });

        return { success: true };
    },

    edit_bill: async ({ request }) => {
        const formData = await request.formData();
        const billId = parseInt(formData.get('bill_id'));
        const billNumber = formData.get('bill_number')?.toString();
        const billAmount = parseFloat(formData.get('bill_amount'));
        const status = formData.get('status')?.toString();

        if (isNaN(billId) || !billNumber || isNaN(billAmount)) {
            return fail(400, { error: 'Bill ID, number, and amount are required.' });
        }

        await prisma.contractorBill.update({
            where: { id: billId },
            data: {
                billNumber,
                billAmount,
                status
            }
        });

        return { success: true };
    }
};
