<script>
    import { page } from '$app/state';
    import { 
        Plus, 
        Search,
        ShieldAlert, 
        AlertTriangle, 
        TrendingUp,
        CalendarDays,
        FileText
    } from '@lucide/svelte';

    let { data } = $props();

    // Reactive filter state
    let searchQuery = $state('');
    let statusFilter = $state('');

    // Group stats
    let total = $derived(data.clearances.length);
    let approvedCount = $derived(data.clearances.filter(c => c.status === 'approved').length);
    let overdueCount = $derived(data.clearances.filter(c => c.isOverdue).length);
    let dueSoonCount = $derived(data.clearances.filter(c => c.isDueSoon).length);

    let overdueList = $derived(data.clearances.filter(c => c.isOverdue));
    let dueSoonList = $derived(data.clearances.filter(c => c.isDueSoon));

    // Reactive filtered row listings
    let filteredClearances = $derived(data.clearances.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (c.issuingAgency && c.issuingAgency.toLowerCase().includes(searchQuery.toLowerCase()));
        
        let matchesStatus = true;
        if (statusFilter === 'overdue') {
            matchesStatus = c.isOverdue;
        } else if (statusFilter) {
            matchesStatus = c.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    }));

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }
</script>

<svelte:head>
    <title>Clearances - {data.project.name}</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- Page Title Section -->
    <div class="page-title-section">
        <div>
            <h1 class="page-title">Regulatory &amp; License Tracker</h1>
            <p class="page-subtitle">Track approvals, clearances and licenses for {data.project.name}</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="/projects/{data.project.id}/clearances/create" class="btn btn-primary text-decoration-none">
                <Plus size={16} /> Add Clearance
            </a>
        </div>
    </div>

    <!-- 4-Column Stat Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="metric-card">
            <div class="metric-label">Total Clearances</div>
            <div class="metric-value">{total}</div>
        </div>
        <!-- Approved -->
        <div class="metric-card" style="border-left: 3px solid var(--success);">
            <div class="metric-label" style="color: var(--success);">Approved</div>
            <div class="metric-value" style="color: var(--success);">{approvedCount}</div>
        </div>
        <!-- Overdue -->
        <div class="metric-card" style="border-left: 3px solid var(--danger);">
            <div class="metric-label" style="color: var(--danger);">Overdue</div>
            <div class="metric-value" style="color: var(--danger);">{overdueCount}</div>
        </div>
        <!-- Due Within 30 Days -->
        <div class="metric-card" style="border-left: 3px solid var(--warning);">
            <div class="metric-label" style="color: var(--warning);">Due Within 30 Days</div>
            <div class="metric-value" style="color: var(--warning);">{dueSoonCount}</div>
        </div>
    </div>

    <!-- Alert boxes (if applicable) -->
    {#if overdueCount > 0}
        <div class="alert alert-danger">
            <div class="alert-title">⚠️ {overdueCount} clearances are OVERDUE</div>
            <div class="alert-body">
                {#each overdueList as c}
                    <div>
                        <strong>{c.name}</strong>
                        — {Math.abs(c.daysLeft)} days overdue
                        — Assigned: {c.responsiblePerson || 'N/A'}
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    {#if dueSoonCount > 0}
        <div class="alert alert-warning">
            <div class="alert-title">🕐 {dueSoonCount} clearances due/expiring within 30 days</div>
            <div class="alert-body">
                {#each dueSoonList as c}
                    <div>
                        <strong>{c.name}</strong>
                        — due in {c.daysLeft} days
                        ({formatDate(c.expiryDate || c.expectedDate)})
                        — Assigned: {c.responsiblePerson || 'N/A'}
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Filter / Search Row -->
    <div class="card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
        <div class="relative flex-grow max-w-xs w-full">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
            </span>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search clearances..."
                class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
            <label for="status-filter" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</label>
            <select 
                id="status-filter" 
                bind:value={statusFilter}
                class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="renewal_due">Renewal Due</option>
                <option value="expired">Expired</option>
                <option value="overdue">Overdue</option>
            </select>
        </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
        <div class="overflow-x-auto w-full">
            <table class="w-full min-w-[1000px]">
            <thead>
                <tr>
                    <th>Clearance Type</th>
                    <th class="hidden md:table-cell">Issuing Authority</th>
                    <th>Dates</th>
                    <th class="hidden md:table-cell">Validity</th>
                    <th>Status</th>
                    <th>Assigned</th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredClearances as c}
                    <tr>
                        <!-- Type -->
                        <td>
                            <div class="flex items-center flex-wrap gap-1.5">
                                <a href="/projects/{data.project.id}/clearances/{c.id}" class="font-bold hover:underline text-sm" style="color: var(--primary);">
                                    {c.name}
                                </a>
                                {#if c.type === 'other'}
                                    <span class="text-[9px] text-slate-400 font-extrabold uppercase bg-slate-100 px-1 py-0.5 rounded">Custom</span>
                                {/if}
                                {#if c.documents && c.documents.length > 0}
                                    {@const latestDoc = [...c.documents].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0]}
                                    <a 
                                        href="/projects/{data.project.id}/clearances/documents/{latestDoc.id}" 
                                        download 
                                        class="inline-flex items-center gap-0.5 text-[9px] text-rose-600 hover:text-rose-800 font-extrabold bg-rose-50 hover:bg-rose-100 border border-rose-250 px-1.5 py-0.5 rounded transition whitespace-nowrap text-decoration-none"
                                        title="Download Document"
                                    >
                                        📄 PDF
                                    </a>
                                {/if}
                            </div>
                        </td>

                        <!-- Authority (hidden on mobile) -->
                        <td class="hidden md:table-cell text-xs text-slate-500">
                            {c.issuingAgency || 'N/A'}
                        </td>

                        <!-- Dates -->
                        <td class="text-xs leading-5">
                            {#if c.applicationDate}
                                <div><span class="text-slate-400 font-bold">Sub:</span> {formatDate(c.applicationDate)}</div>
                            {/if}
                            {#if c.approvalDate}
                                <div><span class="text-emerald-600 font-bold">Rec:</span> {formatDate(c.approvalDate)}</div>
                            {:else if c.expectedDate}
                                <div><span class="text-amber-500 font-bold">Exp:</span> {formatDate(c.expectedDate)}</div>
                            {/if}
                        </td>

                        <!-- Validity (hidden on mobile) -->
                        <td class="hidden md:table-cell text-xs text-slate-700">
                            {#if c.validityYears}
                                {c.validityYears} Years
                                {#if c.expiryDate}
                                    <div class="text-[10px] text-slate-400 mt-0.5">Due: {formatDate(c.expiryDate)}</div>
                                {/if}
                            {:else}
                                Permanent
                            {/if}
                        </td>

                        <!-- Status -->
                        <td>
                            <span class="badge 
                                {c.status === 'approved' ? 'badge-success' : 
                                 (c.status === 'submitted' ? 'badge-info' : 
                                  (c.status === 'renewal_due' ? 'badge-warning' : 
                                   (c.status === 'expired' || c.isOverdue ? 'badge-danger' : 'badge-gray')))}">
                                {#if c.isOverdue}
                                    Expired / Overdue
                                {:else}
                                    {formatStatus(c.status)}
                                {/if}
                            </span>
                        </td>

                        <!-- Assigned -->
                        <td class="text-xs text-slate-600">
                            {#if c.responsiblePerson}
                                <div class="font-bold text-slate-700 leading-none">{c.responsiblePerson}</div>
                            {:else}
                                <span class="text-slate-400 italic">Unassigned</span>
                            {/if}
                        </td>

                        <!-- Actions -->
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <a href="/projects/{data.project.id}/clearances/{c.id}" class="btn btn-secondary btn-sm text-decoration-none">View</a>
                                {#if c.status !== 'approved'}
                                    <form method="POST" action="?/approve" class="m-0 inline-block">
                                        <input type="hidden" name="clearance_id" value={c.id} />
                                        <input type="hidden" name="approval_date" value={new Date().toISOString().split('T')[0]} />
                                        <input type="hidden" name="validity_years" value={c.validityYears || 1} />
                                        <button type="submit" class="btn btn-success btn-sm cursor-pointer">Approve</button>
                                    </form>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-slate-400 italic">
                            No clearances created. Click "Add Clearance" to track your first license.
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        </div>
    </div>
</div>
