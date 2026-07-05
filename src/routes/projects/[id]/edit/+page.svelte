<script>
    import { ChevronLeft } from '@lucide/svelte';

    let { data, form } = $props();

    // Helper to format date strings for input elements (YYYY-MM-DD)
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
    <title>Edit Project - {data.project.name}</title>
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
    <div>
        <a href="/projects" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2 text-decoration-none">
            <ChevronLeft size={16} /> Back to List
        </a>
        <h2 class="text-2xl font-bold text-slate-800">Edit Project: {data.project.name}</h2>
        <p class="text-slate-500 text-sm mt-0.5">Update technical parameters and key milestone dates.</p>
    </div>

    <form method="POST" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <!-- Form Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name *</label>
                <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    required 
                    value={form?.values?.name || data.project.name} 
                    placeholder="e.g. Upper Marsyangdi-A" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.name}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.name}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="river" class="text-xs font-bold text-slate-500 uppercase tracking-wider">River Name</label>
                <input 
                    type="text" 
                    name="river" 
                    id="river" 
                    value={form?.values?.river || data.project.river || ''} 
                    placeholder="e.g. Marsyangdi" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="district" class="text-xs font-bold text-slate-500 uppercase tracking-wider">District *</label>
                <input 
                    type="text" 
                    name="district" 
                    id="district" 
                    required 
                    value={form?.values?.district || data.project.district} 
                    placeholder="e.g. Lamjung" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.district}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.district}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="province" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Province *</label>
                <select 
                    name="province" 
                    id="province" 
                    required 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">Select Province</option>
                    <option value="Koshi" selected={(form?.values?.province || data.project.province) === 'Koshi'}>Koshi</option>
                    <option value="Madhesh" selected={(form?.values?.province || data.project.province) === 'Madhesh'}>Madhesh</option>
                    <option value="Bagmati" selected={(form?.values?.province || data.project.province) === 'Bagmati'}>Bagmati</option>
                    <option value="Gandaki" selected={(form?.values?.province || data.project.province) === 'Gandaki'}>Gandaki</option>
                    <option value="Lumbini" selected={(form?.values?.province || data.project.province) === 'Lumbini'}>Lumbini</option>
                    <option value="Karnali" selected={(form?.values?.province || data.project.province) === 'Karnali'}>Karnali</option>
                    <option value="Sudurpashchim" selected={(form?.values?.province || data.project.province) === 'Sudurpashchim'}>Sudurpashchim</option>
                </select>
            </div>
        </div>

        <!-- Form Row 3 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="capacity_mw" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Installed Capacity (MW) *</label>
                <input 
                    type="number" 
                    step="0.01" 
                    name="capacity_mw" 
                    id="capacity_mw" 
                    required 
                    value={form?.values?.capacity_mw || data.project.capacityMw} 
                    placeholder="e.g. 12.5" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                {#if form?.errors?.capacity_mw}
                    <span class="text-xs font-semibold text-rose-600 mt-1">{form.errors.capacity_mw}</span>
                {/if}
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="project_type" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Type *</label>
                <select 
                    name="project_type" 
                    id="project_type" 
                    required 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="run_of_river" selected={(form?.values?.project_type || data.project.projectType) === 'run_of_river'}>Run of River (RoR)</option>
                    <option value="peaking" selected={(form?.values?.project_type || data.project.projectType) === 'peaking'}>Peaking RoR (PRoR)</option>
                    <option value="storage" selected={(form?.values?.project_type || data.project.projectType) === 'storage'}>Storage</option>
                </select>
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Development Status *</label>
                <select 
                    name="status" 
                    id="status" 
                    required 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="pre_development" selected={(form?.values?.status || data.project.status) === 'pre_development'}>Pre-Development</option>
                    <option value="licensing" selected={(form?.values?.status || data.project.status) === 'licensing'}>Licensing</option>
                    <option value="financial_closure" selected={(form?.values?.status || data.project.status) === 'financial_closure'}>Financial Closure</option>
                    <option value="construction" selected={(form?.values?.status || data.project.status) === 'construction'}>Construction</option>
                    <option value="operational" selected={(form?.values?.status || data.project.status) === 'operational'}>Operational</option>
                </select>
            </div>
        </div>

        <!-- Form Row 4 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
                <label for="survey_license_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Survey License Issue Date</label>
                <input 
                    type="date" 
                    name="survey_license_date" 
                    id="survey_license_date" 
                    value={form?.values?.survey_license_date || formatDateInput(data.project.surveyLicenseDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="generation_license_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Generation License Issue Date</label>
                <input 
                    type="date" 
                    name="generation_license_date" 
                    id="generation_license_date" 
                    value={form?.values?.generation_license_date || formatDateInput(data.project.generationLicenseDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="total_project_cost" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Project Cost (NPR)</label>
                <input 
                    type="number" 
                    step="1" 
                    name="total_project_cost" 
                    id="total_project_cost" 
                    value={form?.values?.total_project_cost || data.project.totalProjectCost || ''} 
                    placeholder="e.g. 450000000" 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
            </div>
        </div>

        <!-- Form Row 4.5: Milestone Dates -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div class="flex flex-col gap-1.5">
                <label for="ppa_signed_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">PPA Signed Date</label>
                <input 
                    type="date" 
                    name="ppa_signed_date" 
                    id="ppa_signed_date" 
                    value={form?.values?.ppa_signed_date || formatDateInput(data.project.ppaSignedDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>
            <div class="flex flex-col gap-1.5">
                <label for="financial_closure_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Closure Date</label>
                <input 
                    type="date" 
                    name="financial_closure_date" 
                    id="financial_closure_date" 
                    value={form?.values?.financial_closure_date || formatDateInput(data.project.financialClosureDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>
            <div class="flex flex-col gap-1.5">
                <label for="construction_start_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Construction Start Date</label>
                <input 
                    type="date" 
                    name="construction_start_date" 
                    id="construction_start_date" 
                    value={form?.values?.construction_start_date || formatDateInput(data.project.constructionStartDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>
            <div class="flex flex-col gap-1.5">
                <label for="target_cod_date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Target COD Date</label>
                <input 
                    type="date" 
                    name="target_cod_date" 
                    id="target_cod_date" 
                    value={form?.values?.target_cod_date || formatDateInput(data.project.targetCodDate)} 
                    class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                >
            </div>
        </div>

        <!-- Form Row 5 -->
        <div class="flex flex-col gap-1.5">
            <label for="description" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea 
                name="description" 
                id="description" 
                rows="4" 
                placeholder="Notes on project location, funding, or status..." 
                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >{form?.values?.description || data.project.description || ''}</textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <a href="/projects" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-sm text-decoration-none">Cancel</a>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm shadow-md shadow-indigo-600/10 cursor-pointer">Save Changes</button>
        </div>
    </form>
</div>
