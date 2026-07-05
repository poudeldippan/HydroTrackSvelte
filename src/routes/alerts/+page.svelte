<script>
    import { AlertTriangle, CalendarDays, CheckCircle2 } from '@lucide/svelte';

    let { data } = $props();
</script>

<svelte:head>
    <title>Global System Alerts - HydroTrack Nepal</title>
</svelte:head>

<div class="flex flex-col gap-8">
    <!-- Header -->
    <div>
        <h2 class="text-2xl font-bold text-slate-800">Global System Alerts</h2>
        <p class="text-slate-500 text-sm mt-0.5">Summary of all regulatory deadlines, expirations, and land disputes requiring administrative action.</p>
    </div>

    <!-- Overdue Clearances Section -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-bold text-rose-700 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            ⚠️ Overdue Regulatory Actions ({data.overdue.length})
        </h3>
        
        <div class="overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                        <th class="px-4 py-3">Project</th>
                        <th class="px-4 py-3">Clearance / License</th>
                        <th class="px-4 py-3">Issuing Authority</th>
                        <th class="px-4 py-3">Deadline Passed By</th>
                        <th class="px-4 py-3">Assigned Agent</th>
                        <th class="px-4 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {#each data.overdue as c}
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="px-4 py-3 font-bold text-slate-900">{c.project.name}</td>
                            <td class="px-4 py-3">{c.name}</td>
                            <td class="px-4 py-3 text-slate-500">{c.issuingAgency || 'N/A'}</td>
                            <td class="px-4 py-3 text-rose-600 font-bold">
                                {Math.abs(c.daysLeft)} DAYS OVERDUE
                            </td>
                            <td class="px-4 py-3">
                                {c.responsiblePerson || 'Unassigned'}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <a href="/projects/{c.projectId}/clearances" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition text-decoration-none">
                                    View
                                </a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="px-4 py-6 text-center text-slate-400 italic">
                                No overdue regulatory checkpoints. Great job!
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Upcoming Clearances Section -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-bold text-amber-700 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            📅 Expiring / Due Within 30 Days ({data.dueSoon.length})
        </h3>
        
        <div class="overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                        <th class="px-4 py-3">Project</th>
                        <th class="px-4 py-3">Clearance / License</th>
                        <th class="px-4 py-3">Issuing Authority</th>
                        <th class="px-4 py-3">Time Remaining</th>
                        <th class="px-4 py-3">Assigned Agent</th>
                        <th class="px-4 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {#each data.dueSoon as c}
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="px-4 py-3 font-bold text-slate-900">{c.project.name}</td>
                            <td class="px-4 py-3">{c.name}</td>
                            <td class="px-4 py-3 text-slate-500">{c.issuingAgency || 'N/A'}</td>
                            <td class="px-4 py-3 text-amber-600 font-bold">
                                {c.daysLeft} DAYS REMAINING
                            </td>
                            <td class="px-4 py-3">
                                {c.responsiblePerson || 'Unassigned'}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <a href="/projects/{c.projectId}/clearances" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition text-decoration-none">
                                    View
                                </a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="px-4 py-6 text-center text-slate-400 italic">
                                No clearance actions due in the next 30 days.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Disputed Parcels Section -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-bold text-rose-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} class="text-rose-700" />
            ⚖️ Active Land Acquisition Disputes ({data.disputedParcels.length})
        </h3>
        
        <div class="overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                        <th class="px-4 py-3">Project</th>
                        <th class="px-4 py-3">Plot No.</th>
                        <th class="px-4 py-3">Owner Details</th>
                        <th class="px-4 py-3">Dispute Reason Summary</th>
                        <th class="px-4 py-3">Current Mediation Status</th>
                        <th class="px-4 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {#each data.disputedParcels as p}
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="px-4 py-3 font-bold text-slate-900">{p.project.name}</td>
                            <td class="px-4 py-3 font-bold text-slate-700">{p.plotNumber}</td>
                            <td class="px-4 py-3">
                                {p.ownerName}
                                {#if p.ownerContact}
                                    <div class="text-[10px] text-slate-400 leading-none">{p.ownerContact}</div>
                                {/if}
                            </td>
                            <td class="px-4 py-3 text-slate-500 truncate max-w-xs" title={p.disputeReason}>
                                {p.disputeReason || 'Boundary dispute'}
                            </td>
                            <td class="px-4 py-3 font-semibold text-rose-700">
                                {p.disputeStatus || 'Mediation pending'}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <a href="/projects/{p.projectId}/parcels" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 font-bold rounded-lg transition text-decoration-none">
                                    Open
                                </a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="px-4 py-6 text-center text-slate-400 italic">
                                No active land disputes. Excellent!
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
