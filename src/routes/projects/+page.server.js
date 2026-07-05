import { prisma } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export async function load() {
    const projects = await prisma.project.findMany({
        include: {
            components: true,
            clearances: true,
            landParcels: true
        },
        orderBy: { name: 'asc' }
    });

    const parsedProjects = projects.map(p => {
        const totalWeight = p.components.reduce((acc, c) => acc + c.weightPct, 0);
        let progress = 0;
        if (totalWeight > 0) {
            p.components.forEach(c => {
                progress += (c.actualProgress * c.weightPct) / totalWeight;
            });
        }
        progress = Math.round(progress * 10) / 10;

        return {
            id: p.id,
            name: p.name,
            river: p.river,
            district: p.district,
            province: p.province,
            capacityMw: p.capacityMw,
            projectType: p.projectType,
            status: p.status,
            progress,
            clearancesCount: p.clearances.length,
            parcelsCount: p.landParcels.length
        };
    });

    return {
        projects: parsedProjects
    };
}

export const actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id'));

        if (!isNaN(id)) {
            await prisma.project.delete({
                where: { id }
            });
        }

        return { success: true };
    }
};
