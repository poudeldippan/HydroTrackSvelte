import { prisma } from '$lib/server/db.js';
import { error, redirect, fail } from '@sveltejs/kit';

export async function load({ params }) {
    const id = parseInt(params.id);
    if (isNaN(id)) {
        throw error(400, 'Invalid Project ID');
    }

    const project = await prisma.project.findUnique({
        where: { id }
    });

    if (!project) {
        throw error(404, 'Project Not Found');
    }

    return {
        project
    };
}

export const actions = {
    default: async ({ params, request }) => {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            throw error(400, 'Invalid Project ID');
        }

        const formData = await request.formData();
        
        const name = formData.get('name')?.toString();
        const river = formData.get('river')?.toString() || null;
        const district = formData.get('district')?.toString();
        const province = formData.get('province')?.toString();
        const capacityMw = parseFloat(formData.get('capacity_mw'));
        const projectType = formData.get('project_type')?.toString();
        const status = formData.get('status')?.toString();
        const totalProjectCost = parseFloat(formData.get('total_project_cost')) || null;
        const description = formData.get('description')?.toString() || null;

        // Parse optional dates
        const parseDate = (key) => {
            const val = formData.get(key);
            return val ? new Date(val) : null;
        };

        const surveyLicenseDate = parseDate('survey_license_date');
        const generationLicenseDate = parseDate('generation_license_date');
        const ppaSignedDate = parseDate('ppa_signed_date');
        const financialClosureDate = parseDate('financial_closure_date');
        const constructionStartDate = parseDate('construction_start_date');
        const targetCodDate = parseDate('target_cod_date');

        // Simple validation
        const errors = {};
        if (!name) errors.name = 'Project name is required';
        if (!district) errors.district = 'District is required';
        if (!province) errors.province = 'Province is required';
        if (isNaN(capacityMw) || capacityMw <= 0) errors.capacity_mw = 'Capacity in MW must be a positive number';

        if (Object.keys(errors).length > 0) {
            return fail(400, { errors, values: Object.fromEntries(formData) });
        }

        await prisma.project.update({
            where: { id },
            data: {
                name,
                river,
                district,
                province,
                capacityMw,
                projectType,
                status,
                surveyLicenseDate,
                generationLicenseDate,
                ppaSignedDate,
                financialClosureDate,
                constructionStartDate,
                targetCodDate,
                totalProjectCost,
                description
            }
        });

        throw redirect(303, `/projects/${id}/overview`);
    }
};
