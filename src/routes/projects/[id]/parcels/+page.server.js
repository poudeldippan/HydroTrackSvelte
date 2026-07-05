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

    const parcels = await prisma.landParcel.findMany({
        where: { projectId },
        orderBy: { plotNumber: 'asc' }
    });

    // Compute stats
    const totalParcelsCount = parcels.length;
    const registeredParcelsCount = parcels.filter(p => p.acquisitionStatus === 'land_registered').length;
    const negotiationParcelsCount = parcels.filter(p => p.acquisitionStatus === 'in_negotiation').length;
    const disputedParcelsCount = parcels.filter(p => p.isDisputed).length;
    const notStartedParcelsCount = parcels.filter(p => p.acquisitionStatus === 'not_initiated').length;

    const totalAgreedComp = parcels.reduce((acc, p) => acc + (p.agreedCompensation || 0), 0);
    const totalPaidComp = parcels.reduce((acc, p) => acc + (p.paidCompensation || 0), 0);
    const outstandingComp = totalAgreedComp - totalPaidComp;

    return {
        project,
        parcels,
        stats: {
            totalParcelsCount,
            registeredParcelsCount,
            negotiationParcelsCount,
            disputedParcelsCount,
            notStartedParcelsCount,
            totalAgreedComp,
            totalPaidComp,
            outstandingComp
        }
    };
}

export const actions = {
    import: async ({ params, request }) => {
        const projectId = parseInt(params.id);
        const formData = await request.formData();
        const file = formData.get('file');
        const importMode = formData.get('import_mode')?.toString() || 'add';

        if (!file || !(file instanceof File)) {
            return fail(400, { error: 'Please upload a valid CSV file.' });
        }

        const text = await file.text();
        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
            return fail(400, { error: 'CSV file is empty.' });
        }

        const headerLine = lines.shift();
        const headers = headerLine.split(',').map(h => h.trim().replace(/[\x00-\x1F\x7F-\x9F\xEF\xBB\xBF]/g, ''));

        if (importMode === 'replace') {
            await prisma.landParcel.deleteMany({
                where: { projectId }
            });
        }

        let imported = 0;
        for (const line of lines) {
            if (!line.trim()) continue;
            
            const row = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (row.length < 4) continue;

            const data = {};
            headers.forEach((header, index) => {
                data[header] = row[index];
            });

            const plotNumber = data['plot_number'] || 'UNKNOWN';
            const vdc = data['vdc_municipality'] || '';
            const ward = data['ward_number'] || '';
            const ownerName = data['owner_name'] || '';
            const ownerContact = data['owner_contact'] || null;
            const areaRopani = parseFloat(data['area_ropani']) || null;
            const areaSqm = areaRopani !== null ? areaRopani * 508.72 : null;
            
            const inputLandType = (data['land_type'] || 'agricultural').toLowerCase();
            const allowedLandTypes = ['agricultural', 'forest', 'barren', 'residential', 'river_bank', 'other'];
            const landType = allowedLandTypes.includes(inputLandType) ? inputLandType : 'other';

            const inputStatus = (data['acquisition_status'] || 'not_initiated').toLowerCase();
            const allowedStatuses = ['not_initiated', 'in_negotiation', 'agreement_signed', 'compensation_paid', 'land_registered', 'disputed'];
            const status = allowedStatuses.includes(inputStatus) ? inputStatus : 'not_initiated';

            const agreedComp = parseFloat(data['agreed_compensation']) || null;

            // Duplicate protection
            const existing = await prisma.landParcel.findFirst({
                where: { projectId, plotNumber }
            });

            if (existing) {
                await prisma.landParcel.update({
                    where: { id: existing.id },
                    data: {
                        vdcMunicipality: vdc,
                        wardNumber: ward,
                        ownerName,
                        ownerContact,
                        areaRopani,
                        areaSqm,
                        landType,
                        acquisitionStatus: status,
                        agreedCompensation: agreedComp
                    }
                });
            } else {
                await prisma.landParcel.create({
                    data: {
                        projectId,
                        plotNumber,
                        vdcMunicipality: vdc,
                        wardNumber: ward,
                        ownerName,
                        ownerContact,
                        areaRopani,
                        areaSqm,
                        landType,
                        acquisitionStatus: status,
                        agreedCompensation: agreedComp,
                        paidCompensation: 0.0,
                        isDisputed: false
                    }
                });
            }
            imported++;
        }

        return { success: true, imported };
    },

    pay: async ({ request }) => {
        const formData = await request.formData();
        const parcelId = parseInt(formData.get('parcel_id'));
        const amount = parseFloat(formData.get('amount'));

        if (isNaN(parcelId) || isNaN(amount) || amount <= 0) {
            return fail(400, { error: 'Valid payment amount is required.' });
        }

        const parcel = await prisma.landParcel.findUnique({
            where: { id: parcelId }
        });

        if (!parcel) {
            return fail(404, { error: 'Parcel not found.' });
        }

        const newPaid = (parcel.paidCompensation || 0) + amount;
        let newStatus = parcel.acquisitionStatus;
        if (parcel.agreedCompensation && newPaid >= parcel.agreedCompensation) {
            newStatus = 'compensation_paid';
        }

        // Create payment record
        await prisma.parcelPayment.create({
            data: {
                landParcelId: parcelId,
                amount,
                paymentDate: new Date(),
                paymentMethod: 'cash',
                paidBy: 'HydroTrack System',
                notes: 'Logged from Land Acquisition summary page'
            }
        });

        await prisma.landParcel.update({
            where: { id: parcelId },
            data: {
                paidCompensation: newPaid,
                acquisitionStatus: newStatus
            }
        });

        return { success: true };
    }
};
