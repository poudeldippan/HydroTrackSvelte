import { prisma } from '$lib/server/db.js';
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const projectId = parseInt(params.id);
    const parcelId = parseInt(params.parcelId);

    if (isNaN(projectId) || isNaN(parcelId)) {
        throw error(400, 'Invalid IDs');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw error(404, 'Project Not Found');

    const parcel = await prisma.landParcel.findUnique({
        where: { id: parcelId },
        include: { payments: { orderBy: { paymentDate: 'desc' } } }
    });

    if (!parcel || parcel.projectId !== projectId) {
        throw error(404, 'Parcel Not Found');
    }

    return { project, parcel };
}

export const actions = {
    pay: async ({ params, request }) => {
        const parcelId = parseInt(params.parcelId);
        const formData = await request.formData();

        const amount = parseFloat(formData.get('amount'));
        const paymentDateStr = formData.get('payment_date')?.toString();
        const paymentMethod = formData.get('payment_method')?.toString() || 'cheque';
        const referenceNumber = formData.get('reference_number')?.toString() || null;
        const notes = formData.get('notes')?.toString() || null;

        if (isNaN(parcelId) || isNaN(amount) || amount <= 0 || !paymentDateStr) {
            return fail(400, { error: 'Valid payment amount and date are required.' });
        }

        const parcel = await prisma.landParcel.findUnique({ where: { id: parcelId } });
        if (!parcel) return fail(404, { error: 'Parcel not found.' });

        // Create payment record
        await prisma.parcelPayment.create({
            data: {
                landParcelId: parcelId,
                amount,
                paymentDate: new Date(paymentDateStr),
                paymentMethod,
                referenceNumber,
                paidBy: 'HydroTrack System',
                notes
            }
        });

        // Update paid compensation
        const newPaid = (parcel.paidCompensation || 0) + amount;
        let newStatus = parcel.acquisitionStatus;
        if (parcel.agreedCompensation && newPaid >= parcel.agreedCompensation) {
            newStatus = 'compensation_paid';
        }

        await prisma.landParcel.update({
            where: { id: parcelId },
            data: { paidCompensation: newPaid, acquisitionStatus: newStatus }
        });

        return { success: true };
    },

    dispute: async ({ params, request }) => {
        const parcelId = parseInt(params.parcelId);
        const formData = await request.formData();

        const isDisputed = formData.get('is_disputed') === '1';
        const disputeReason = formData.get('dispute_reason')?.toString() || '';
        const disputeStatus = formData.get('dispute_status')?.toString() || null;

        const updateData = {
            isDisputed,
            disputeReason,
            disputeStatus
        };

        if (isDisputed) {
            updateData.acquisitionStatus = 'disputed';
        }

        await prisma.landParcel.update({
            where: { id: parcelId },
            data: updateData
        });

        return { success: true };
    }
};
