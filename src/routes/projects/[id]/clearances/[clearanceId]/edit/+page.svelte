<script>
    import { ChevronLeft } from '@lucide/svelte';

    let { data, form } = $props();

    let clearanceType = $state(form?.values?.type || data.clearance.type || 'survey_license');

    function formatDateInput(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
</script>

<svelte:head>
    <title>Edit Clearance - {data.project.name}</title>
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
    <div>
        <a href="/projects/{data.project.id}/clearances/{data.clearance.id}" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2 text-decoration-none">
            <ChevronLeft size={16} /> Back to Details
        </a>
        <h2 class="text-2xl font-bold text-slate-800">Edit Clearance: {data.clearance.name}</h2>
        <p class="text-slate-500 text-sm mt-0.5">Modify the tracking properties for this license checkpoint.</p>
    </div>

    <form method="POST" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <!-- Form Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="type" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Clearance Type *</label>
                <select 
                    name="type" 
                    id="type" 
                    required 
                    bind:value={clearanceType} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
                    <option value="survey_license">Survey License</option>
                    <option value="generation_license">Generation License</option>
                    <option value="construction_permit">Construction Permit</option>
                    <option value="eia_approval">EIA Approval (Environmental Impact Assessment)</option>
                    <option value="iee_approval">IEE Approval (Initial Environmental Examination)</option>
                    <option value="forest_clearance">Forest Land Clearance</option>
                    <option value="tree_cutting_permit">Tree Cutting Permit</option>
                    <option value="land_acquisition_approval">Land Acquisition Approval</option>
                    <option value="transmission_license">Transmission License</option>
                    <option value="ppa_agreement">Power Purchase Agreement (PPA)</option>
                    <option value="environmental_audit">Environmental Audit</option>
                    <option value="other">Other (Custom Name)</option>
                </select>
                {#if form?.errors?.type}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.type}</span>
                {/if}
            </div>

            {#if clearanceType === 'other'}
                <div class="flex flex-col gap-1.5">
                    <label for="custom_name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Clearance Name *</label>
                    <input 
                        type="text" 
                        name="custom_name" 
                        id="custom_name" 
                        value={form?.values?.customName || data.clearance.name || ''} 
                        required 
                        placeholder="e.g. Explosive Storage Permit" 
                        class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                    {#if form?.errors?.custom_name}
                        <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.custom_name}</span>
                    {/if}
                </div>
            {/if}
        </div>

        <!-- Form Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="issuing_authority" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Issuing Authority *</label>
                <input 
                    type="text" 
                    name="issuing_authority" 
                    id="issuing_authority" 
                    value={form?.values?.issuingAuthority || data.clearance.issuingAgency || ''} 
                    required 
                    placeholder="e.g. Department of Electricity Development (DoED)" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.issuing_authority}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.issuing_authority}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status *</label>
                <select 
                    name="status" 
                    id="status" 
                    required 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
                    <option value="not_started" selected={(form?.values?.status || data.clearance.status || '') === 'not_started'}>Not Started</option>
                    <option value="submitted" selected={(form?.values?.status || data.clearance.status || '') === 'submitted'}>Submitted</option>
                    <option value="approved" selected={(form?.values?.status || data.clearance.status || '') === 'approved'}>Approved</option>
                    <option value="renewal_due" selected={(form?.values?.status || data.clearance.status || '') === 'renewal_due'}>Renewal Due</option>
                    <option value="expired" selected={(form?.values?.status || data.clearance.status || '') === 'expired'}>Expired</option>
                </select>
                {#if form?.errors?.status}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.status}</span>
                {/if}
            </div>
        </div>

        <!-- Form Row 3 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="submission_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Date</label>
                <input 
                    type="date" 
                    name="submission_date" 
                    id="submission_date" 
                    value={form?.values?.submissionDateStr || formatDateInput(data.clearance.applicationDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="expected_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Issue Date</label>
                <input 
                    type="date" 
                    name="expected_date" 
                    id="expected_date" 
                    value={form?.values?.expectedDateStr || formatDateInput(data.clearance.expectedDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="actual_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Date Received</label>
                <input 
                    type="date" 
                    name="actual_date" 
                    id="actual_date" 
                    value={form?.values?.actualDateStr || formatDateInput(data.clearance.approvalDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 4 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="validity_years" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Validity Period (Years)</label>
                <input 
                    type="number" 
                    name="validity_years" 
                    id="validity_years" 
                    value={form?.values?.validityYearsStr || data.clearance.validityYears || ''} 
                    placeholder="e.g. 5" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="assigned_to" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Person</label>
                <input 
                    type="text" 
                    name="assigned_to" 
                    id="assigned_to" 
                    value={form?.values?.assignedTo || data.clearance.responsiblePerson || ''} 
                    placeholder="e.g. Ram Bahadur KC" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="assigned_email" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Email</label>
                <input 
                    type="email" 
                    name="assigned_email" 
                    id="assigned_email" 
                    value={form?.values?.assignedEmail || data.clearance.responsibleEmail || ''} 
                    placeholder="e.g. ram@example.com" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 5 -->
        <div class="flex flex-col gap-1.5">
            <label for="notes" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea 
                name="notes" 
                id="notes" 
                rows="4" 
                placeholder="Detail any issues, status updates, or conditions of license..." 
                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >{form?.values?.notes || data.clearance.notes || ''}</textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <a href="/projects/{data.project.id}/clearances/{data.clearance.id}" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition text-decoration-none">Cancel</a>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Save Changes</button>
        </div>
    </form>
</div>
