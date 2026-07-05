import { prisma } from '$lib/server/db.js';

export async function load({ url }) {
    // 1. Fetch all projects
    const projects = await prisma.project.findMany({
        orderBy: { name: 'asc' }
    });

    // 2. Determine active project
    let activeProjectId = null;
    const pathParts = url.pathname.split('/');
    const projectIndex = pathParts.indexOf('projects');
    if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
        activeProjectId = parseInt(pathParts[projectIndex + 1]);
    }

    let activeProject = null;
    if (activeProjectId) {
        activeProject = projects.find(p => p.id === activeProjectId);
    }
    if (!activeProject && projects.length > 0) {
        activeProject = projects[0];
    }

    // 3. Count alert alerts
    let alertCount = 0;
    if (activeProject) {
        const clearances = await prisma.clearance.findMany({
            where: { projectId: activeProject.id }
        });
        const today = new Date();
        alertCount = clearances.filter(c => {
            if (c.status === 'approved') return false;
            if (!c.expiryDate) return false;
            const expiry = new Date(c.expiryDate);
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            return daysLeft <= 30; // overdue or due soon
        }).length;
    }

    return {
        projects,
        activeProject,
        alertCount,
        user: {
            name: 'HydroTrack Admin',
            initials: 'HA'
        }
    };
}
