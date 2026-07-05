import { prisma } from '$lib/server/db.js';
import { getSCurveData } from '$lib/server/helpers.js';

export async function load() {
    // 1. Fetch projects
    const projects = await prisma.project.findMany({
        include: {
            clearances: true,
            landParcels: true,
            components: true,
        },
        orderBy: { name: 'asc' }
    });

    let projectStats = null;
    let sCurveData = { planned: [], actual: [] };

    if (projects.length > 0) {
        const project = projects[0];

        // Clearances stats
        const totalClearancesCount = project.clearances.length;
        const approvedClearancesCount = project.clearances.filter(c => c.status === 'approved').length;
        const pendingClearancesCount = totalClearancesCount - approvedClearancesCount;

        const today = new Date();
        const clearancesWithDays = project.clearances.map(c => {
            let daysLeft = null;
            if (c.expiryDate) {
                const expiry = new Date(c.expiryDate);
                daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            }
            const isOverdue = c.status !== 'approved' && daysLeft !== null && daysLeft < 0;
            const isDueSoon = c.status !== 'approved' && daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
            return { ...c, daysLeft, isOverdue, isDueSoon };
        });

        const overdueClearancesCount = clearancesWithDays.filter(c => c.isOverdue).length;
        const dueSoonClearancesCount = clearancesWithDays.filter(c => c.isDueSoon).length;

        // Parcels stats
        const totalParcelsCount = project.landParcels.length;
        const registeredParcelsCount = project.landParcels.filter(p => p.acquisitionStatus === 'land_registered').length;
        const negotiationParcelsCount = project.landParcels.filter(p => p.acquisitionStatus === 'in_negotiation').length;
        const disputedParcelsCount = project.landParcels.filter(p => p.isDisputed).length;
        const notStartedParcelsCount = project.landParcels.filter(p => p.acquisitionStatus === 'not_initiated').length;

        const totalAgreedComp = project.landParcels.reduce((acc, p) => acc + (p.agreedCompensation || 0), 0);
        const totalPaidComp = project.landParcels.reduce((acc, p) => acc + (p.paidCompensation || 0), 0);
        const outstandingComp = totalAgreedComp - totalPaidComp;

        // WBS Progress
        const totalWeight = project.components.reduce((acc, c) => acc + c.weightPct, 0);
        let overallProgress = 0;
        if (totalWeight > 0) {
            project.components.forEach(c => {
                overallProgress += (c.actualProgress * c.weightPct) / totalWeight;
            });
        }
        overallProgress = Math.round(overallProgress * 10) / 10;
        const onTrackCount = project.components.filter(c => c.scheduleStatus === 'on_track').length;

        // Urgent clearances (take top 5 sorted by days left)
        const urgentClearances = clearancesWithDays
            .filter(c => c.status !== 'approved')
            .sort((a, b) => {
                const aDays = a.daysLeft !== null ? a.daysLeft : 9999;
                const bDays = b.daysLeft !== null ? b.daysLeft : 9999;
                return aDays - bDays;
            })
            .slice(0, 5);

        // Action required alerts
        const actionAlerts = [];
        clearancesWithDays.forEach(c => {
            if (c.isOverdue) {
                actionAlerts.push({
                    type: 'danger',
                    name: c.name,
                    desc: `Overdue by ${Math.abs(c.daysLeft)} days`,
                    link: `/projects/${project.id}/clearances`
                });
            } else if (c.isDueSoon) {
                actionAlerts.push({
                    type: 'warning',
                    name: c.name,
                    desc: `Expiring in ${c.daysLeft} days`,
                    link: `/projects/${project.id}/clearances`
                });
            }
        });

        projectStats = {
            id: project.id,
            name: project.name,
            capacityMw: project.capacityMw,
            status: project.status,
            district: project.district,
            totalClearancesCount,
            approvedClearancesCount,
            pendingClearancesCount,
            overdueClearancesCount,
            dueSoonClearancesCount,
            totalParcelsCount,
            registeredParcelsCount,
            negotiationParcelsCount,
            disputedParcelsCount,
            notStartedParcelsCount,
            totalAgreedComp,
            totalPaidComp,
            outstandingComp,
            overallProgress,
            onTrackCount,
            urgentClearances,
            actionAlerts
        };

        sCurveData = getSCurveData(project.components);
    }

    return {
        projectStats,
        sCurveData
    };
}
