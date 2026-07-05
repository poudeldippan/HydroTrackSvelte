<script>
    import { page } from '$app/state';
    import { enhance } from '$app/forms';
    import { 
        Plus, 
        Upload, 
        Map, 
        FileSpreadsheet,
        TrendingUp,
        Coins,
        Users,
        ChevronLeft
    } from '@lucide/svelte';

    let { data, form } = $props();

    // Toggle states
    let showImportPanel = $state(false);
    let showPayModal = $state(false);
    let selectedParcelForPay = $state(null);
    let paymentAmount = $state('');

    // Reactive filter state
    let statusFilter = $state('');
    let wardFilter = $state('');
    let landTypeFilter = $state('');
    let disputedOnly = $state(false);
    let searchQuery = $state('');

    // Filtered list
    let filteredParcels = $derived(data.parcels.filter(p => {
        let matchesStatus = !statusFilter || p.acquisitionStatus === statusFilter;
        let matchesWard = !wardFilter || p.wardNumber === wardFilter;
        let matchesType = !landTypeFilter || p.landType === landTypeFilter;
        let matchesDisputed = !disputedOnly || p.isDisputed;
        
        let matchesSearch = !searchQuery || 
            p.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vdcMunicipality.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesWard && matchesType && matchesDisputed && matchesSearch;
    }));

    // Dynamic stats based on filtered list
    let totalAgreed = $derived(filteredParcels.reduce((acc, p) => acc + (p.agreedCompensation || 0), 0));
    let totalPaid = $derived(filteredParcels.reduce((acc, p) => acc + (p.paidCompensation || 0), 0));
    let outstanding = $derived(totalAgreed - totalPaid);

    function formatMoney(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-IN');
    }

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function openPayModal(parcel) {
        selectedParcelForPay = parcel;
        paymentAmount = (parcel.agreedCompensation - parcel.paidCompensation).toString();
        showPayModal = true;
    }
</script>

<svelte:head>
    <title>Land Acquisition - {data.project.name}</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- Page Title Section -->
    <div class="page-title-section">
        <div>
            <h1 class="page-title">Land Acquisition Manager</h1>
            <p class="page-subtitle">Track parcel-by-parcel acquisition for {data.project.name}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <button onclick={() => showImportPanel = !showImportPanel} class="btn btn-secondary cursor-pointer">
                <Upload size={14} /> Import CSV
            </button>
            <a href="/projects/{data.project.id}/parcels/map" class="btn btn-secondary text-decoration-none">
                <Map size={14} /> View Map
            </a>
            <a href="/projects/{data.project.id}/parcels/create" class="btn btn-primary text-decoration-none">
                <Plus size={14} /> Add Parcel
            </a>
        </div>
    </div>

    <!-- CSV Import Panel (Toggleable) -->
    {#if showImportPanel}
        <div class="card transition-all">
            <h3 class="card-title uppercase tracking-wider mb-2">Import Parcels from CSV</h3>
            <p class="card-subtitle mb-4">
                Upload a CSV file containing your parcel data. Columns expected: 
                <code>plot_number</code>, <code>vdc_municipality</code>, <code>ward_number</code>, 
                <code>owner_name</code>, <code>owner_contact</code>, <code>area_ropani</code>, 
                <code>land_type</code>, <code>agreed_compensation</code>, <code>acquisition_status</code>.
            </p>
            
            <form method="POST" action="?/import" enctype="multipart/form-data" class="flex items-center gap-4 m-0 flex-wrap">
                <input 
                    type="file" 
                    name="file" 
                    required 
                    class="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                >
                <select name="import_mode" class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 bg-white" required>
                    <option value="add">Add Data (Skip existing)</option>
                    <option value="replace">Replace Everything</option>
                </select>
                <button type="submit" class="btn btn-primary btn-sm cursor-pointer">
                    Upload &amp; Process
                </button>
            </form>
        </div>
    {/if}

    <!-- 5 Metric Cards Row -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <!-- Total -->
        <div class="metric-card">
            <span class="metric-label">Total Parcels</span>
            <p class="metric-value">{data.stats.totalParcelsCount}</p>
        </div>
        <!-- Registered -->
        <div class="metric-card" style="border-left: 3px solid var(--success);">
            <span class="metric-label" style="color: var(--success);">Registered</span>
            <p class="metric-value" style="color: var(--success);">{data.stats.registeredParcelsCount}</p>
        </div>
        <!-- In Negotiation -->
        <div class="metric-card" style="border-left: 3px solid var(--warning);">
            <span class="metric-label" style="color: var(--warning);">In Negotiation</span>
            <p class="metric-value" style="color: var(--warning);">{data.stats.negotiationParcelsCount}</p>
        </div>
        <!-- Disputed -->
        <div class="metric-card" style="border-left: 3px solid var(--danger);">
            <span class="metric-label" style="color: var(--danger);">Disputed</span>
            <p class="metric-value" style="color: var(--danger);">{data.stats.disputedParcelsCount}</p>
        </div>
        <!-- Not Started -->
        <div class="metric-card">
            <span class="metric-label">Not Started</span>
            <p class="metric-value">{data.stats.notStartedParcelsCount}</p>
        </div>
    </div>

    <!-- Compensation Summary Card (Full Width) -->
    <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Agreed Compensation</span>
                <h3 class="text-xl font-bold text-slate-800 mt-1">Rs {formatMoney(totalAgreed)}</h3>
            </div>
            <div>
                <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Paid</span>
                <h3 class="text-xl font-bold text-emerald-600 mt-1">Rs {formatMoney(totalPaid)}</h3>
            </div>
            <div>
                <span class="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Outstanding</span>
                <h3 class="text-xl font-bold text-rose-600 mt-1">Rs {formatMoney(outstanding)}</h3>
            </div>
        </div>
        <div>
            <div class="progress-bar-track" style="height: 12px;">
                <div class="progress-bar-fill" style="width: {totalAgreed > 0 ? Math.round((totalPaid / totalAgreed) * 100) : 0}%; background: var(--success);"></div>
            </div>
            <span class="text-xs font-semibold text-slate-500 mt-2 block">{totalAgreed > 0 ? Math.round((totalPaid / totalAgreed) * 100) : 0}% of total compensation disbursed</span>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4">
        <div class="flex flex-wrap items-end gap-4 m-0">
            <div class="flex flex-col gap-1.5 flex-grow max-w-xs">
                <label for="parcel-search" class="text-[10px] uppercase font-bold text-slate-400">Search</label>
                <input 
                    type="text" 
                    id="parcel-search"
                    bind:value={searchQuery}
                    placeholder="Search by plot, owner..." 
                    class="rounded-lg border-slate-200 text-xs py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="status-filter" class="text-[10px] uppercase font-bold text-slate-400">Acquisition Status</label>
                <select 
                    id="status-filter"
                    bind:value={statusFilter}
                    class="rounded-lg border-slate-200 text-xs py-2 bg-white"
                >
                    <option value="">All Statuses</option>
                    <option value="not_initiated">Not Initiated</option>
                    <option value="in_negotiation">In Negotiation</option>
                    <option value="agreement_signed">Agreement Signed</option>
                    <option value="compensation_paid">Compensation Paid</option>
                    <option value="land_registered">Land Registered</option>
                    <option value="disputed">Disputed</option>
                </select>
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="ward-filter" class="text-[10px] uppercase font-bold text-slate-400">Ward Number</label>
                <input 
                    type="text" 
                    id="ward-filter"
                    bind:value={wardFilter}
                    placeholder="e.g. 3" 
                    class="rounded-lg border-slate-200 text-xs py-2 w-24 bg-white"
                >
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="land-type-filter" class="text-[10px] uppercase font-bold text-slate-400">Land Type</label>
                <select 
                    id="land-type-filter"
                    bind:value={landTypeFilter}
                    class="rounded-lg border-slate-200 text-xs py-2 bg-white"
                >
                    <option value="">All Types</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="forest">Forest</option>
                    <option value="barren">Barren</option>
                    <option value="residential">Residential</option>
                    <option value="river_bank">River Bank</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div class="flex items-center gap-2 mb-2">
                <input 
                    type="checkbox" 
                    bind:checked={disputedOnly}
                    id="disputed_only" 
                    class="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                >
                <label for="disputed_only" class="text-xs font-bold text-slate-600 cursor-pointer">Disputed Only</label>
            </div>

            <div class="flex gap-2 ml-auto">
                <button 
                    onclick={() => { statusFilter = ''; wardFilter = ''; landTypeFilter = ''; disputedOnly = false; searchQuery = ''; }}
                    class="btn btn-secondary btn-sm cursor-pointer"
                >
                    Reset
                </button>
            </div>
        </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
        <div class="overflow-x-auto w-full">
            <table class="w-full min-w-max">
            <thead>
                <tr>
                    <th>Plot No</th>
                    <th>Owner</th>
                    <th>VDC / Ward</th>
                    <th>Area (Ropani)</th>
                    <th>Land Type</th>
                    <th>Status</th>
                    <th>Agreed (Rs)</th>
                    <th>Paid (Rs)</th>
                    <th>Outstanding</th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredParcels as p}
                    <tr 
                        class="transition cursor-pointer hover:bg-slate-50" 
                        style={p.isDisputed ? 'background: #FFF5F5;' : ''}
                        onclick={() => window.location.href = `/projects/${data.project.id}/parcels/${p.id}`}
                    >
                        <td>
                            <span class="font-bold" style="color: var(--primary);">{p.plotNumber}</span>
                        </td>
                        <td class="font-semibold text-slate-800">
                            {p.ownerName}
                        </td>
                        <td>{p.vdcMunicipality} - Ward {p.wardNumber}</td>
                        <td class="font-bold text-slate-900">{p.areaRopani !== null ? p.areaRopani.toFixed(2) : 'N/A'}</td>
                        <td class="uppercase text-xs tracking-wider text-slate-500">{p.landType}</td>
                        <td>
                            <span class="badge 
                                {p.acquisitionStatus === 'land_registered' ? 'badge-success' : 
                                 (p.acquisitionStatus === 'compensation_paid' ? 'badge-success' : 
                                  (p.acquisitionStatus === 'agreement_signed' ? 'badge-info' : 
                                   (p.acquisitionStatus === 'in_negotiation' ? 'badge-warning' : 
                                    (p.acquisitionStatus === 'disputed' || p.isDisputed ? 'badge-danger' : 'badge-gray'))))}">
                                {formatStatus(p.acquisitionStatus)}
                            </span>
                        </td>
                        <td>Rs {formatMoney(p.agreedCompensation)}</td>
                        <td class="text-emerald-600 font-semibold">Rs {formatMoney(p.paidCompensation)}</td>
                        <td class={((p.agreedCompensation || 0) - (p.paidCompensation || 0)) > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            Rs {formatMoney((p.agreedCompensation || 0) - (p.paidCompensation || 0))}
                        </td>
                        <td class="text-right whitespace-nowrap" onclick={(e) => e.stopPropagation()}>
                            <div class="flex items-center justify-end gap-2 flex-wrap min-w-[max-content]">
                                <a href="/projects/{data.project.id}/parcels/{p.id}" class="btn btn-secondary btn-sm text-decoration-none">View</a>
                                <a href="/projects/{data.project.id}/parcels/{p.id}/edit" class="btn btn-secondary btn-sm text-decoration-none">Edit</a>
                                {#if ((p.agreedCompensation || 0) - (p.paidCompensation || 0)) > 0}
                                    <button 
                                        onclick={() => openPayModal(p)}
                                        class="btn btn-success btn-sm cursor-pointer"
                                    >
                                        Log Payment
                                    </button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="10" class="px-6 py-12 text-center text-slate-400 italic">
                            No land parcels matched the filters. Click Import or register details.
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        </div>
    </div>
</div>

<!-- Pay Modal -->
{#if showPayModal && selectedParcelForPay}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Log Compensation Payout</h3>
            <p class="text-xs text-slate-500 mb-4">
                Log payment details for Plot {selectedParcelForPay.plotNumber} owned by {selectedParcelForPay.ownerName}.
            </p>

            <form 
                method="POST" 
                action="?/pay" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showPayModal = false;
                        await update();
                    };
                }}
            >
                <input type="hidden" name="parcel_id" value={selectedParcelForPay.id} />
                
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="pay-amount" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (Rs) *</label>
                        <input 
                            type="number" 
                            name="amount" 
                            id="pay-amount" 
                            required 
                            bind:value={paymentAmount}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                        type="button" 
                        onclick={() => showPayModal = false}
                        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                        Confirm Payment
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
