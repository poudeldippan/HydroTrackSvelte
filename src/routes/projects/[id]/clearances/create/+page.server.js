import { prisma } from '$lib/server/db.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
        throw error(404, 'Project not found');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw error(404, 'Project not found');
    }

    return {
        project
    };
}

export const actions = {
    default: async ({ request, params }) => {
        const projectId = parseInt(params.id);
        if (isNaN(projectId)) {
            throw error(404, 'Project not found');
        }

        const data = await request.formData();
        const type = data.get('type');
        const customName = data.get('custom_name');
        const issuingAuthority = data.get('issuing_authority');
        const status = data.get('status');
        const submissionDateStr = data.get('submission_date');
        const expectedDateStr = data.get('expected_date');
        const actualDateStr = data.get('actual_date');
        const validityYearsStr = data.get('validity_years');
        const assignedTo = data.get('assigned_to');
        const assignedEmail = data.get('assigned_email');
        const notes = data.get('notes');

        // Validation
        const errors = {};
        if (!type) errors.type = 'Clearance type is required';
        if (type === 'other' && !customName) errors.custom_name = 'Custom clearance name is required';
        if (!issuingAuthority) errors.issuing_authority = 'Issuing authority is required';
        if (!status) errors.status = 'Status is required';

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors,
                values: { type, customName, issuingAuthority, status, submissionDateStr, expectedDateStr, actualDateStr, validityYearsStr, assignedTo, assignedEmail, notes }
            };
        }

        // Map type to display name
        const displayNameMap = {
            survey_license: 'Survey License',
            generation_license: 'Generation License',
            construction_permit: 'Construction Permit',
            eia_approval: 'EIA Approval (Environmental Impact Assessment)',
            iee_approval: 'IEE Approval (Initial Environmental Examination)',
            forest_clearance: 'Forest Land Clearance',
            tree_cutting_permit: 'Tree Cutting Permit',
            land_acquisition_approval: 'Land Acquisition Approval',
            transmission_license: 'Transmission License',
            ppa_agreement: 'Power Purchase Agreement (PPA)',
            environmental_audit: 'Environmental Audit',
            other: customName
        };

        const name = displayNameMap[type] || type;

        // Parse dates
        const applicationDate = submissionDateStr ? new Date(submissionDateStr) : null;
        const expectedDate = expectedDateStr ? new Date(expectedDateStr) : null;
        const approvalDate = actualDateStr ? new Date(actualDateStr) : null;
        const validityYears = validityYearsStr ? parseInt(validityYearsStr) : null;

        // Calculate expiry date if approved
        let expiryDate = null;
        if (status === 'approved' && approvalDate && validityYears) {
            expiryDate = new Date(approvalDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);
        }

        // Insert
        await prisma.clearance.create({
            data: {
                projectId,
                type,
                name,
                issuingAgency: issuingAuthority,
                status,
                applicationDate,
                expectedDate,
                approvalDate,
                expiryDate,
                validityYears,
                responsiblePerson: assignedTo,
                responsibleEmail: assignedEmail,
                notes: notes
            }
        });

        throw redirect(303, `/projects/${projectId}/clearances`);
    }
};
