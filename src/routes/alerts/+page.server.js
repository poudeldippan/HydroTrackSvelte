import { prisma } from '$lib/server/db.js';

export async function load() {
    const clearances = await prisma.clearance.findMany({
        where: {
            status: { not: 'approved' }
        },
        include: {
            project: true
        }
    });

    const today = new Date();
    const parsedClearances = clearances.map(c => {
        let daysLeft = null;
        if (c.expiryDate) {
            const expiry = new Date(c.expiryDate);
            daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        }

        const isOverdue = daysLeft !== null && daysLeft < 0;
        const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

        return {
            ...c,
            daysLeft,
            isOverdue,
            isDueSoon
        };
    });

    const overdue = parsedClearances.filter(c => c.isOverdue);
    const dueSoon = parsedClearances.filter(c => c.isDueSoon);

    const disputedParcels = await prisma.landParcel.findMany({
        where: {
            isDisputed: true,
            acquisitionStatus: { not: 'land_registered' }
        },
        include: {
            project: true
        }
    });

    return {
        overdue,
        dueSoon,
        disputedParcels
    };
}
