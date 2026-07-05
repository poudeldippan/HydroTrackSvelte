import { prisma } from '$lib/server/db.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
        throw error(400, 'Invalid Project ID');
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            clearances: true,
            landParcels: true,
            components: true,
            milestones: true,
        }
    });

    if (!project) {
        throw error(404, 'Project Not Found');
    }

    // 1. Clearances stats
    const totalClearances = project.clearances.length;
    const approvedClearances = project.clearances.filter(c => c.status === 'approved').length;
    
    const today = new Date();
    let riskAlerts = 0;
    project.clearances.forEach(c => {
        if (c.status !== 'approved' && c.expiryDate) {
            const expiry = new Date(c.expiryDate);
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 30) riskAlerts++;
        }
    });

    // 2. Land stats
    const totalParcels = project.landParcels.length;
    const registeredParcels = project.landParcels.filter(p => p.acquisitionStatus === 'land_registered').length;
    const totalAgreedComp = project.landParcels.reduce((acc, p) => acc + (p.agreedCompensation || 0), 0);
    const totalPaidComp = project.landParcels.reduce((acc, p) => acc + (p.paidCompensation || 0), 0);
    const outstandingCompensation = totalAgreedComp - totalPaidComp;

    // 3. WBS stats
    const totalComponents = project.components.length;
    const totalWeight = project.components.reduce((acc, c) => acc + c.weightPct, 0);
    let overallProgress = 0;
    if (totalWeight > 0) {
        project.components.forEach(c => {
            overallProgress += (c.actualProgress * c.weightPct) / totalWeight;
        });
    }
    overallProgress = Math.round(overallProgress * 10) / 10;

    return {
        project,
        stats: {
            totalClearances,
            approvedClearances,
            riskAlerts,
            totalParcels,
            registeredParcels,
            outstandingCompensation,
            overallProgress,
            totalComponents
        }
    };
}
