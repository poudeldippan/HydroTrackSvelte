<script>
    import { Trash2, Edit, Eye, Plus } from '@lucide/svelte';

    let { data } = $props();

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
</script>

<svelte:head>
    <title>Projects List - HydroTrack Nepal</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <div class="page-title-section">
        <div>
            <h1 class="page-title">Projects Directory</h1>
            <p class="page-subtitle">Manage and track all company hydroelectric developments</p>
        </div>
        <a href="/projects/create" class="btn btn-primary">
            <Plus size={16} /> Create New Project
        </a>
    </div>

    <div class="table-card">
        <table class="w-full">
            <thead>
                <tr>
                    <th>Project Name</th>
                    <th>River / Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>WBS Progress</th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each data.projects as p}
                    <tr>
                        <td>
                            <a href="/projects/{p.id}/overview" class="font-semibold text-slate-800 hover:text-indigo-600">
                                {p.name}
                            </a>
                        </td>
                        <td>
                            <div class="text-xs text-slate-600 font-medium">
                                {p.river ? `${p.river} River` : 'N/A'} · {p.district}, {p.province}
                            </div>
                        </td>
                        <td>
                            <span class="font-bold text-xs text-slate-700">{p.capacityMw.toFixed(1)} MW</span>
                        </td>
                        <td>
                            <span class="badge badge-primary text-[10px]">
                                {formatStatus(p.status)}
                            </span>
                        </td>
                        <td class="w-1/4">
                            <div class="flex items-center gap-2">
                                <div class="flex-grow progress-bar-track">
                                    <div class="progress-bar-fill bg-indigo-600" style="width: {p.progress}%;"></div>
                                </div>
                                <span class="text-xs font-bold text-slate-600">{p.progress}%</span>
                            </div>
                        </td>
                        <td class="text-right">
                            <div class="inline-flex items-center gap-2">
                                <a href="/projects/{p.id}/overview" class="btn btn-secondary btn-sm p-1.5" title="Overview">
                                    <Eye size={14} />
                                </a>
                                <a href="/projects/{p.id}/edit" class="btn btn-secondary btn-sm p-1.5" title="Edit">
                                    <Edit size={14} />
                                </a>
                                <form method="POST" action="?/delete" class="m-0 inline-block" onsubmit={(e) => { if (!confirm('Are you sure you want to delete this project? All associated clearances, land parcels and bills will be deleted.')) e.preventDefault(); }}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <button type="submit" class="btn btn-danger btn-sm p-1.5 cursor-pointer" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="6" class="text-center py-12 text-slate-400 italic">No projects registered. Create your first project to begin!</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
