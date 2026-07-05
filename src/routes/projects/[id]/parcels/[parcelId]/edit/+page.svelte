<script>
    import { ChevronLeft } from '@lucide/svelte';

    let { data, form } = $props();

    // Local state for area conversion and dispute toggle
    let ropani = $state(form?.values?.area_ropani || data.parcel.areaRopani || '');
    let sqm = $state(form?.values?.area_sqm || data.parcel.areaSqm || '');
    let acquisitionStatus = $state(form?.values?.acquisition_status || data.parcel.acquisitionStatus || 'not_initiated');
    let isDisputed = $state(form?.values?.is_disputed === '1' || data.parcel.isDisputed || data.parcel.acquisitionStatus === 'disputed');

    // Run reactivity conversions
    function updateRopani() {
        if (ropani) {
            sqm = (parseFloat(ropani) * 508.72).toFixed(2);
        } else {
            sqm = '';
        }
    }

    function updateSqm() {
        if (sqm) {
            ropani = (parseFloat(sqm) / 508.72).toFixed(2);
        } else {
            ropani = '';
        }
    }

    function formatDateInput(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    $effect(() => {
        if (acquisitionStatus === 'disputed') {
            isDisputed = true;
        }
    });
</script>

<svelte:head>
    <title>Edit Land Parcel - {data.project.name}</title>
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
    <div>
        <a href="/projects/{data.project.id}/parcels" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2 text-decoration-none">
            <ChevronLeft size={16} /> Back to Parcels List
        </a>
        <h2 class="text-2xl font-bold text-slate-800">Edit Land Parcel</h2>
        <p class="text-slate-500 text-sm mt-0.5">Modify land parcel details for plot {data.parcel.plotNumber} under {data.project.name}.</p>
    </div>

    <form method="POST" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <!-- Form Row 1: Plot, VDC, Ward -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="plot_number" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Plot Number (Lalpurja No.) *</label>
                <input 
                    type="text" 
                    name="plot_number" 
                    id="plot_number" 
                    value={form?.values?.plot_number || data.parcel.plotNumber || ''} 
                    required 
                    placeholder="e.g. 56-Ka" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.plot_number}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.plot_number}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="vdc_municipality" class="text-xs font-bold text-slate-500 uppercase tracking-wider">VDC / Municipality *</label>
                <input 
                    type="text" 
                    name="vdc_municipality" 
                    id="vdc_municipality" 
                    value={form?.values?.vdc_municipality || data.parcel.vdcMunicipality || ''} 
                    required 
                    placeholder="e.g. Marsyangdi RM" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.vdc_municipality}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.vdc_municipality}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="ward_number" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ward Number *</label>
                <input 
                    type="text" 
                    name="ward_number" 
                    id="ward_number" 
                    value={form?.values?.ward_number || data.parcel.wardNumber || ''} 
                    required 
                    placeholder="e.g. 3" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.ward_number}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.ward_number}</span>
                {/if}
            </div>
        </div>

        <!-- Form Row 2: Owner Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="owner_name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name *</label>
                <input 
                    type="text" 
                    name="owner_name" 
                    id="owner_name" 
                    value={form?.values?.owner_name || data.parcel.ownerName || ''} 
                    required 
                    placeholder="e.g. Dhan Bahadur Gurung" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.owner_name}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.owner_name}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="owner_contact" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Contact Info</label>
                <input 
                    type="text" 
                    name="owner_contact" 
                    id="owner_contact" 
                    value={form?.values?.owner_contact || data.parcel.ownerContact || ''} 
                    placeholder="e.g. 9841234567" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="owner_citizenship_no" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizenship Number</label>
                <input 
                    type="text" 
                    name="owner_citizenship_no" 
                    id="owner_citizenship_no" 
                    value={form?.values?.owner_citizenship_no || data.parcel.ownerCitizenshipNo || ''} 
                    placeholder="e.g. 45-01-70-12345" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 3: Area Converter -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100 items-end">
            <div class="flex flex-col gap-1.5">
                <label for="area_ropani" class="text-xs font-bold text-slate-650 uppercase tracking-wider">Area (Ropani)</label>
                <input 
                    type="number" 
                    step="0.01" 
                    name="area_ropani" 
                    id="area_ropani" 
                    bind:value={ropani} 
                    oninput={updateRopani} 
                    placeholder="e.g. 4.5" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>

            <div class="flex items-center justify-center pb-3 text-slate-400 font-bold text-[10px] uppercase text-center">
                <span>Double Converter (1 Ropani = 508.72 m²)</span>
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="area_sqm" class="text-xs font-bold text-slate-650 uppercase tracking-wider">Area (Square Meters)</label>
                <input 
                    type="number" 
                    step="0.01" 
                    name="area_sqm" 
                    id="area_sqm" 
                    bind:value={sqm} 
                    oninput={updateSqm} 
                    placeholder="e.g. 2289.24" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>
        </div>

        <!-- Form Row 4: Land Type, Status, Compensation -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="land_type" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Land Type *</label>
                <select 
                    name="land_type" 
                    id="land_type" 
                    required 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
                    <option value="agricultural" selected={(form?.values?.land_type || data.parcel.landType || '') === 'agricultural'}>Agricultural</option>
                    <option value="forest" selected={(form?.values?.land_type || data.parcel.landType || '') === 'forest'}>Forest</option>
                    <option value="barren" selected={(form?.values?.land_type || data.parcel.landType || '') === 'barren'}>Barren</option>
                    <option value="residential" selected={(form?.values?.land_type || data.parcel.landType || '') === 'residential'}>Residential</option>
                    <option value="river_bank" selected={(form?.values?.land_type || data.parcel.landType || '') === 'river_bank'}>River Bank</option>
                    <option value="other" selected={(form?.values?.land_type || data.parcel.landType || '') === 'other'}>Other</option>
                </select>
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="acquisition_status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Acquisition Status *</label>
                <select 
                    name="acquisition_status" 
                    id="acquisition_status" 
                    required 
                    bind:value={acquisitionStatus}
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
                    <option value="not_initiated">Not Initiated</option>
                    <option value="in_negotiation">In Negotiation</option>
                    <option value="agreement_signed">Agreement Signed</option>
                    <option value="compensation_paid">Compensation Paid</option>
                    <option value="land_registered">Land Registered</option>
                    <option value="disputed">Disputed</option>
                </select>
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="agreed_compensation" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Agreed Compensation (Rs)</label>
                <input 
                    type="number" 
                    step="0.01" 
                    name="agreed_compensation" 
                    id="agreed_compensation" 
                    value={form?.values?.agreed_compensation || data.parcel.agreedCompensation || ''} 
                    placeholder="e.g. 675000" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 5: GPS Coordinates -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="latitude" class="text-xs font-bold text-slate-500 uppercase tracking-wider">GPS Latitude</label>
                <input 
                    type="number" 
                    step="0.0000001" 
                    name="latitude" 
                    id="latitude" 
                    value={form?.values?.latitude || data.parcel.latitude || ''} 
                    placeholder="e.g. 28.1234" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="longitude" class="text-xs font-bold text-slate-500 uppercase tracking-wider">GPS Longitude</label>
                <input 
                    type="number" 
                    step="0.0000001" 
                    name="longitude" 
                    id="longitude" 
                    value={form?.values?.longitude || data.parcel.longitude || ''} 
                    placeholder="e.g. 84.5678" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="assigned_to" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Agent</label>
                <input 
                    type="text" 
                    name="assigned_to" 
                    id="assigned_to" 
                    value={form?.values?.assigned_to || data.parcel.assignedTo || ''} 
                    placeholder="e.g. Hari Prasad Tiwari" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Dispute Fields (Conditional) -->
        {#if acquisitionStatus === 'disputed' || isDisputed}
            <div class="flex flex-col gap-3 p-4 rounded-xl bg-rose-50/50 border border-rose-100 mt-2">
                <div class="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        name="is_disputed" 
                        value="1" 
                        id="is_disputed" 
                        bind:checked={isDisputed} 
                        class="rounded border-slate-200 text-rose-600 focus:ring-rose-500"
                    >
                    <label for="is_disputed" class="text-xs font-bold text-rose-700 cursor-pointer">Confirm Active Dispute</label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label for="dispute_reason" class="text-xs font-bold text-rose-750 uppercase tracking-wider">Dispute Reason</label>
                        <textarea 
                            name="dispute_reason" 
                            id="dispute_reason" 
                            rows="2" 
                            placeholder="e.g. Overlapping plot boundaries claim..." 
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        >{form?.values?.dispute_reason || data.parcel.disputeReason || ''}</textarea>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="dispute_status" class="text-xs font-bold text-rose-750 uppercase tracking-wider">Dispute Status</label>
                        <input 
                            type="text" 
                            name="dispute_status" 
                            id="dispute_status" 
                            value={form?.values?.dispute_status || data.parcel.disputeStatus || ''} 
                            placeholder="e.g. Legal mediation ongoing" 
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        >
                    </div>
                </div>
            </div>
        {/if}

        <!-- Form Row 6: Dates & Notes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="agreement_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Agreement Date</label>
                <input 
                    type="date" 
                    name="agreement_date" 
                    id="agreement_date" 
                    value={form?.values?.agreement_date || formatDateInput(data.parcel.agreementDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
            <div class="flex flex-col gap-1.5">
                <label for="registration_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Malpot Registration Date</label>
                <input 
                    type="date" 
                    name="registration_date" 
                    id="registration_date" 
                    value={form?.values?.registration_date || formatDateInput(data.parcel.registrationDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <div class="flex flex-col gap-1.5">
            <label for="notes" class="text-xs font-bold text-slate-500 uppercase tracking-wider">General Notes</label>
            <textarea 
                name="notes" 
                id="notes" 
                rows="3" 
                placeholder="Notes on negotiations, terms, or Malpot paperwork..." 
                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >{form?.values?.notes || data.parcel.notes || ''}</textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <a href="/projects/{data.project.id}/parcels" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition text-decoration-none">Cancel</a>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Save Changes</button>
        </div>
    </form>
</div>
