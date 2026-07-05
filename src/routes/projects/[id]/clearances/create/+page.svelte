<script>
    import { ChevronLeft } from '@lucide/svelte';

    let { data, form } = $props();

    let clearanceType = $state(form?.values?.type || 'survey_license');
</script>

<svelte:head>
    <title>Add Clearance - {data.project.name}</title>
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
    <div>
        <a href="/projects/{data.project.id}/clearances" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-3 text-decoration-none">
            <ChevronLeft size={16} /> Back to Clearances List
        </a>
        <h1 class="text-2xl font-bold text-slate-800">Add Clearance / License</h1>
        <p class="text-slate-500 text-sm mt-1">Create a tracking entry for a regulatory approval or license for {data.project.name}.</p>
    </div>

    <form method="POST" class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-0 overflow-hidden">
        <!-- Section: Clearance Type -->
        <div class="p-6 border-b border-slate-100">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clearance Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                    <label for="type" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Clearance Type *</label>
                    <select
                        name="type"
                        id="type"
                        required
                        bind:value={clearanceType}
                        class="w-full rounded-xl border border-slate-300 bg-white text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition appearance-none"
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
                        <span class="text-xs font-semibold text-rose-600">{form.errors.type}</span>
                    {/if}
                </div>

                <div class="flex flex-col gap-2">
                    <label for="status" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Status *</label>
                    <select
                        name="status"
                        id="status"
                        required
                        class="w-full rounded-xl border border-slate-300 bg-white text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition appearance-none"
                    >
                        <option value="not_started" selected={(form?.values?.status || '') === 'not_started'}>Not Started</option>
                        <option value="submitted" selected={(form?.values?.status || '') === 'submitted'}>Submitted</option>
                        <option value="approved" selected={(form?.values?.status || '') === 'approved'}>Approved</option>
                        <option value="renewal_due" selected={(form?.values?.status || '') === 'renewal_due'}>Renewal Due</option>
                        <option value="expired" selected={(form?.values?.status || '') === 'expired'}>Expired</option>
                    </select>
                    {#if form?.errors?.status}
                        <span class="text-xs font-semibold text-rose-600">{form.errors.status}</span>
                    {/if}
                </div>

                {#if clearanceType === 'other'}
                    <div class="md:col-span-2 flex flex-col gap-2">
                        <label for="custom_name" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Custom Clearance Name *</label>
                        <input
                            type="text"
                            name="custom_name"
                            id="custom_name"
                            value={form?.values?.customName || ''}
                            required
                            placeholder="e.g. Explosive Storage Permit"
                            class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                        >
                        {#if form?.errors?.custom_name}
                            <span class="text-xs font-semibold text-rose-600">{form.errors.custom_name}</span>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Section: Authority -->
        <div class="p-6 border-b border-slate-100">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Authority & Responsibility</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="md:col-span-1 flex flex-col gap-2">
                    <label for="issuing_authority" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Issuing Authority *</label>
                    <input
                        type="text"
                        name="issuing_authority"
                        id="issuing_authority"
                        value={form?.values?.issuingAuthority || ''}
                        required
                        placeholder="e.g. Department of Electricity Development (DoED)"
                        class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                    {#if form?.errors?.issuing_authority}
                        <span class="text-xs font-semibold text-rose-600">{form.errors.issuing_authority}</span>
                    {/if}
                </div>
                <div class="flex flex-col gap-2">
                    <label for="assigned_to" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Person</label>
                    <input
                        type="text"
                        name="assigned_to"
                        id="assigned_to"
                        value={form?.values?.assignedTo || ''}
                        placeholder="e.g. Ram Bahadur KC"
                        class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
                <div class="flex flex-col gap-2">
                    <label for="assigned_email" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Email</label>
                    <input
                        type="email"
                        name="assigned_email"
                        id="assigned_email"
                        value={form?.values?.assignedEmail || ''}
                        placeholder="e.g. ram@example.com"
                        class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
            </div>
        </div>

        <!-- Section: Dates & Validity -->
        <div class="p-6 border-b border-slate-100">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Timeline & Validity</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div class="flex flex-col gap-2">
                    <label for="submission_date" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Submission Date</label>
                    <input
                        type="date"
                        name="submission_date"
                        id="submission_date"
                        value={form?.values?.submissionDateStr || ''}
                        class="w-full rounded-xl border border-slate-300 bg-white text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
                <div class="flex flex-col gap-2">
                    <label for="expected_date" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Expected Issue Date</label>
                    <input
                        type="date"
                        name="expected_date"
                        id="expected_date"
                        value={form?.values?.expectedDateStr || ''}
                        class="w-full rounded-xl border border-slate-300 bg-white text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
                <div class="flex flex-col gap-2">
                    <label for="actual_date" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Actual Date Received</label>
                    <input
                        type="date"
                        name="actual_date"
                        id="actual_date"
                        value={form?.values?.actualDateStr || ''}
                        class="w-full rounded-xl border border-slate-300 bg-white text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
                <div class="flex flex-col gap-2">
                    <label for="validity_years" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Validity Period (Years)</label>
                    <input
                        type="number"
                        name="validity_years"
                        id="validity_years"
                        value={form?.values?.validityYearsStr || ''}
                        placeholder="e.g. 5"
                        min="0"
                        class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    >
                </div>
            </div>
        </div>

        <!-- Section: Notes -->
        <div class="p-6 border-b border-slate-100">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Additional Notes</h3>
            <div class="flex flex-col gap-2">
                <label for="notes" class="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes & Conditions</label>
                <textarea
                    name="notes"
                    id="notes"
                    rows="5"
                    placeholder="Detail any issues, status updates, or conditions of the license..."
                    class="w-full rounded-xl border border-slate-300 text-slate-800 text-sm px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition resize-y"
                    style="min-height: 120px;"
                >{form?.values?.notes || ''}</textarea>
            </div>
        </div>

        <!-- Submit -->
        <div class="px-6 py-4 bg-slate-50/50 flex justify-between items-center">
            <p class="text-xs text-slate-400">Fields marked with * are required</p>
            <div class="flex gap-3">
                <a href="/projects/{data.project.id}/clearances" class="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition text-decoration-none">
                    Cancel
                </a>
                <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/15 cursor-pointer">
                    Save Clearance
                </button>
            </div>
        </div>
    </form>
</div>
