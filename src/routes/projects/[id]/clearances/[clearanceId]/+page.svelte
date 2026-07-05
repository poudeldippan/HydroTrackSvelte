<script>
    import { ChevronLeft } from '@lucide/svelte';

    let { data, form } = $props();

    let showApproveModal = $state(false);
    let approvalDate = $state(new Date().toISOString().split('T')[0]);
    let validityYears = $state('');

    function formatMoney(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-IN');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function formatBytes(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
</script>

<svelte:head>
    <title>{data.clearance.name} - {data.project.name}</title>
</svelte:head>

<div class="max-w-5xl mx-auto flex flex-col gap-8">
    
    <!-- Back Link & Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <a href="/projects/{data.project.id}/clearances" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2 text-decoration-none">
                <ChevronLeft size={16} /> Back to Clearances List
            </a>
            <h2 class="text-2xl font-bold text-slate-800">{data.clearance.name}</h2>
            <p class="text-slate-500 text-sm mt-0.5">Details and history of the clearance request under {data.project.name}.</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="/projects/{data.project.id}/clearances/{data.clearance.id}/edit" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-750 font-semibold rounded-xl text-sm transition border border-slate-200 text-decoration-none">
                Edit Clearance Info
            </a>
            {#if data.clearance.status !== 'approved'}
                <button onclick={() => showApproveModal = true} class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/10 cursor-pointer">
                    Mark as Approved
                </button>
            {/if}
        </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left 2 Cols: Details & Documents -->
        <div class="lg:col-span-2 flex flex-col gap-8">
            
            <!-- Main Clearance Card -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <h3 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Clearance Parameters</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Issuing Authority</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{data.clearance.issuingAgency || 'N/A'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                        <p class="mt-1">
                            <span class="badge 
                                {data.clearance.status === 'approved' ? 'badge-success' : 
                                 (data.clearance.status === 'submitted' ? 'badge-info' : 
                                  (data.clearance.status === 'renewal_due' ? 'badge-warning' : 
                                   (data.clearance.status === 'expired' || data.clearance.isOverdue ? 'badge-danger' : 'badge-gray')))}">
                                {#if data.clearance.isOverdue}
                                    Expired / Overdue
                                {:else}
                                    {formatStatus(data.clearance.status)}
                                {/if}
                            </span>
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Submission Date</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(data.clearance.applicationDate) || 'Not Submitted'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Expected Date</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(data.clearance.expectedDate) || 'N/A'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Actual Received Date</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(data.clearance.approvalDate) || 'Pending'}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-5">
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Validity (Years)</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{data.clearance.validityYears ? `${data.clearance.validityYears} Years` : 'Permanent / N/A'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Renewal/Expiry Deadline</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(data.clearance.expiryDate) || 'N/A'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Days to Deadline</span>
                        <p class="text-sm font-bold mt-0.5 {data.clearance.isOverdue ? 'text-rose-600' : (data.clearance.isDueSoon ? 'text-amber-600' : 'text-slate-850')}">
                            {#if data.clearance.daysLeft === null}
                                N/A
                            {:else if data.clearance.isOverdue}
                                OVERDUE BY {Math.abs(data.clearance.daysLeft)} DAYS
                            {:else}
                                {data.clearance.daysLeft} Days Remaining
                            {/if}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Responsible Person</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{data.clearance.responsiblePerson || 'Unassigned'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                        <p class="text-sm font-semibold text-slate-800 mt-0.5">{data.clearance.responsibleEmail || 'N/A'}</p>
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-5">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Notes & Comments</span>
                    <p class="text-sm text-slate-600 mt-1 whitespace-pre-line">{data.clearance.notes || 'No comments.'}</p>
                </div>
            </div>

            <!-- Documents Section -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <h3 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Document Version History</h3>
                
                <div class="overflow-hidden table-card" style="box-shadow:none; border:none; border-radius:0;">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                                <th class="px-4 py-3">Filename</th>
                                <th class="px-4 py-3">Uploaded By</th>
                                <th class="px-4 py-3">Size</th>
                                <th class="px-4 py-3">Date</th>
                                <th class="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {#each data.clearance.documents as doc}
                                <tr class="hover:bg-slate-50/50">
                                    <td class="px-4 py-3 font-bold text-slate-700 truncate max-w-[200px]" title={doc.fileName}>
                                        {doc.fileName}
                                    </td>
                                    <td class="px-4 py-3">{doc.uploadedBy || 'N/A'}</td>
                                    <td class="px-4 py-3">{formatBytes(doc.fileSize)}</td>
                                    <td class="px-4 py-3">{formatDate(doc.createdAt)}</td>
                                    <td class="px-4 py-3 text-right">
                                        <a href="/projects/{data.project.id}/clearances/documents/{doc.id}" download class="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded font-bold transition text-decoration-none">
                                            Download
                                        </a>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="5" class="px-4 py-8 text-center text-slate-400 italic">
                                        No file attachments uploaded. Add a new file version below.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Upload New Version Form -->
                <form method="POST" action="?/upload" enctype="multipart/form-data" class="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col gap-4 mt-2">
                    <h4 class="text-xs font-bold text-slate-600 uppercase tracking-wider leading-none">Upload New File Version</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1">
                            <label for="doc-file" class="text-[10px] uppercase font-bold text-slate-400">File Attachment *</label>
                            <input 
                                type="file" 
                                name="document" 
                                id="doc-file" 
                                required 
                                class="text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            >
                            <span class="text-[10px] text-slate-400 mt-1">Accepts: PDF, Image, Word (Max 20MB)</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="doc-notes" class="text-[10px] uppercase font-bold text-slate-400">Version Notes</label>
                            <input 
                                type="text" 
                                name="notes" 
                                id="doc-notes" 
                                placeholder="e.g. Initial draft, approved final scan" 
                                class="rounded-lg border-slate-200 text-xs py-2 bg-white"
                            >
                        </div>
                    </div>
                    <div class="flex justify-end mt-1">
                        <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition shadow-sm cursor-pointer">
                            Upload Version
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Right Col: Activity/Guidance card -->
        <div class="flex flex-col gap-6">
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">Activity Trail</h3>
                
                <div class="flow-root">
                    <ul class="-mb-8 text-xs text-slate-600 space-y-4">
                        <li class="flex gap-2">
                            <span class="text-emerald-500">✓</span>
                            <div>
                                <span class="font-bold text-slate-850">Clearance entry created</span>
                                <div class="text-[10px] text-slate-400">Project initialization seed</div>
                            </div>
                        </li>
                        {#if data.clearance.approvalDate}
                            <li class="flex gap-2">
                                <span class="text-emerald-500">✓</span>
                                <div>
                                    <span class="font-bold text-slate-850">Marked as Approved</span>
                                    <div class="text-[10px] text-slate-400">{formatDate(data.clearance.approvalDate)}</div>
                                </div>
                            </li>
                        {/if}
                        {#each data.clearance.documents as doc}
                            <li class="flex gap-2">
                                <span class="text-indigo-500">📄</span>
                                <div>
                                    <span class="font-bold text-slate-850">Document uploaded: {doc.fileName}</span>
                                    <div class="text-[10px] text-slate-400">By {doc.uploadedBy} · {formatDate(doc.createdAt)}</div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Approve Modal -->
    {#if showApproveModal}
        <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
                <form method="POST" action="?/approve" onsubmit={() => showApproveModal = false} class="flex flex-col gap-5">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Mark Clearance as Approved</h3>
                        <p class="text-xs text-slate-500 mt-1">Please enter the actual date this clearance was officially issued and its validity length.</p>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="actual-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Date Received *</label>
                        <input 
                            type="date" 
                            name="actual_date" 
                            id="actual-date" 
                            required 
                            bind:value={approvalDate}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                        >
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="val-years" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Validity Period (Years)</label>
                        <input 
                            type="number" 
                            name="validity_years" 
                            id="val-years" 
                            bind:value={validityYears}
                            placeholder="e.g. 5 (Leave empty for permanent)" 
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                        <span class="text-[10px] text-slate-400 mt-1">If set, a renewal deadline alert will be automatically calculated.</span>
                    </div>

                    <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onclick={() => showApproveModal = false} 
                            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                            Confirm Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

</div>
