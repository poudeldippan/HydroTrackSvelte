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
        const plotNumber = data.get('plot_number');
        const vdcMunicipality = data.get('vdc_municipality');
        const wardNumber = data.get('ward_number');
        const ownerName = data.get('owner_name');
        const ownerContact = data.get('owner_contact');
        const ownerCitizenshipNo = data.get('owner_citizenship_no');
        const areaRopaniStr = data.get('area_ropani');
        const areaSqmStr = data.get('area_sqm');
        const landType = data.get('land_type');
        const acquisitionStatus = data.get('acquisition_status');
        const agreedCompensationStr = data.get('agreed_compensation');
        const latitudeStr = data.get('latitude');
        const longitudeStr = data.get('longitude');
        const assignedTo = data.get('assigned_to');
        const isDisputed = data.get('is_disputed') === '1' || acquisitionStatus === 'disputed';
        const disputeReason = data.get('dispute_reason');
        const disputeStatus = data.get('dispute_status');
        const agreementDateStr = data.get('agreement_date');
        const registrationDateStr = data.get('registration_date');
        const notes = data.get('notes');

        // Validation
        const errors = {};
        if (!plotNumber) errors.plot_number = 'Plot number is required';
        if (!vdcMunicipality) errors.vdc_municipality = 'VDC/Municipality is required';
        if (!wardNumber) errors.ward_number = 'Ward number is required';
        if (!ownerName) errors.owner_name = 'Owner name is required';
        if (!landType) errors.land_type = 'Land type is required';
        if (!acquisitionStatus) errors.acquisition_status = 'Acquisition status is required';

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors,
                values: Object.fromEntries(data.entries())
            };
        }

        // Parse numbers/dates
        const areaRopani = areaRopaniStr ? parseFloat(areaRopaniStr) : null;
        const areaSqm = areaSqmStr ? parseFloat(areaSqmStr) : null;
        const agreedCompensation = agreedCompensationStr ? parseFloat(agreedCompensationStr) : null;
        const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
        const longitude = longitudeStr ? parseFloat(longitudeStr) : null;
        const agreementDate = agreementDateStr ? new Date(agreementDateStr) : null;
        const registrationDate = registrationDateStr ? new Date(registrationDateStr) : null;

        // Insert
        await prisma.landParcel.create({
            data: {
                projectId,
                plotNumber,
                vdcMunicipality,
                wardNumber,
                ownerName,
                ownerContact,
                ownerCitizenshipNo,
                areaRopani,
                areaSqm,
                landType,
                acquisitionStatus,
                agreedCompensation,
                latitude,
                longitude,
                assignedTo,
                isDisputed,
                disputeReason: isDisputed ? disputeReason : null,
                disputeStatus: isDisputed ? disputeStatus : null,
                agreementDate,
                registrationDate,
                notes
            }
        });

        throw redirect(303, `/projects/${projectId}/parcels`);
    }
};
