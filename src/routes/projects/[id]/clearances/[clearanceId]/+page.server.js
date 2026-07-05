import { prisma } from '$lib/server/db.js';
import { error, redirect } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    const clearanceId = parseInt(params.clearanceId);
    if (isNaN(projectId) || isNaN(clearanceId)) {
        throw error(404, 'Clearance not found');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw error(404, 'Project not found');
    }

    const clearance = await prisma.clearance.findUnique({
        where: { id: clearanceId },
        include: { documents: true }
    });

    if (!clearance || clearance.projectId !== projectId) {
        throw error(404, 'Clearance not found');
    }

    // Calculations helper (days left/status)
    const today = new Date();
    let daysLeft = null;
    let isOverdue = false;
    let isDueSoon = false;

    const targetDate = clearance.expiryDate || clearance.expectedDate;
    if (targetDate) {
        const diffTime = new Date(targetDate).getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysLeft < 0;
        isDueSoon = daysLeft >= 0 && daysLeft <= 30;
    }

    return {
        project,
        clearance: {
            ...clearance,
            daysLeft,
            isOverdue,
            isDueSoon
        }
    };
}

export const actions = {
    approve: async ({ request, params }) => {
        const projectId = parseInt(params.id);
        const clearanceId = parseInt(params.clearanceId);
        if (isNaN(projectId) || isNaN(clearanceId)) {
            throw error(404, 'Clearance not found');
        }

        const data = await request.formData();
        const actualDateStr = data.get('actual_date');
        const validityYearsStr = data.get('validity_years');

        if (!actualDateStr) {
            return { success: false, error: 'Approval date is required' };
        }

        const approvalDate = new Date(actualDateStr);
        const validityYears = validityYearsStr ? parseInt(validityYearsStr) : null;

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
                expiryDate,
                validityYears
            }
        });

        return { success: true };
    },

    upload: async ({ request, params }) => {
        const projectId = parseInt(params.id);
        const clearanceId = parseInt(params.clearanceId);
        if (isNaN(projectId) || isNaN(clearanceId)) {
            throw error(404, 'Clearance not found');
        }

        const data = await request.formData();
        const documentFile = data.get('document');
        const notes = data.get('notes') || '';

        if (!documentFile || !(documentFile instanceof File) || documentFile.size === 0) {
            return { success: false, error: 'Valid file attachment is required' };
        }

        // Save file to static/uploads/clearances/
        const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'clearances');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueFilename = `${Date.now()}_${documentFile.name}`;
        const filePathOnDisk = path.join(uploadDir, uniqueFilename);
        const fileBuffer = Buffer.from(await documentFile.arrayBuffer());
        
        fs.writeFileSync(filePathOnDisk, fileBuffer);

        const relativePath = `/uploads/clearances/${uniqueFilename}`;

        await prisma.clearanceDocument.create({
            data: {
                clearanceId,
                fileName: documentFile.name,
                filePath: relativePath,
                fileSize: documentFile.size,
                uploadedBy: 'HydroTrack Admin'
            }
        });

        // Optionally, update status to submitted if it was not_started
        const clearance = await prisma.clearance.findUnique({ where: { id: clearanceId } });
        if (clearance && clearance.status === 'not_started') {
            await prisma.clearance.update({
                where: { id: clearanceId },
                data: { status: 'submitted' }
            });
        }

        return { success: true };
    }
};
