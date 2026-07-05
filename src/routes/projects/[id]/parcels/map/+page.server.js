import { prisma } from '$lib/server/db.js';
import { error } from '@sveltejs/kit';

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

    const parcels = await prisma.landParcel.findMany({
        where: {
            projectId,
            latitude: { not: null },
            longitude: { not: null }
        }
    });

    return {
        project,
        parcels
    };
}
