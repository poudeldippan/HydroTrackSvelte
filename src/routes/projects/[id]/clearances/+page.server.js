import { prisma } from '$lib/server/db.js';
import { error, fail } from '@sveltejs/kit';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
        throw error(400, 'Invalid Project ID');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw error(404, 'Project Not Found');
    }

    const clearances = await prisma.clearance.findMany({
        where: { projectId },
        include: {
            documents: true
        },
        orderBy: { name: 'asc' }
    });

    const today = new Date();
    const parsedClearances = clearances.map(c => {
        let daysLeft = null;
        if (c.expiryDate) {
            const expiry = new Date(c.expiryDate);
            daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        }

        const isOverdue = c.status !== 'approved' && daysLeft !== null && daysLeft < 0;
        const isDueSoon = c.status !== 'approved' && daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

        return {
            ...c,
            daysLeft,
            isOverdue,
            isDueSoon
        };
    });

    return {
        project,
        clearances: parsedClearances
    };
}

export const actions = {
    approve: async ({ params, request }) => {
        const projectId = parseInt(params.id);
        const formData = await request.formData();
        
        const clearanceId = parseInt(formData.get('clearance_id'));
        const approvalDateStr = formData.get('approval_date');
        const validityYears = parseInt(formData.get('validity_years')) || null;

        if (isNaN(clearanceId) || !approvalDateStr) {
            return fail(400, { error: 'Approval date is required.' });
        }

        const approvalDate = new Date(approvalDateStr);
        let expiryDate = null;
        if (validityYears) {
            expiryDate = new Date(approvalDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);
        }

        await prisma.clearance.update({
            where: { id: clearanceId },
            data: {
                status: 'approved',
                approvalDate,
                validityYears,
                expiryDate
            }
        });

        return { success: true };
    }
};
