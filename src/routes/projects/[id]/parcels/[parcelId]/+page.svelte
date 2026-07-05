<script>
    let { data } = $props();
    const { project, parcel } = data;

    let showPaymentModal = $state(false);
    let showDisputeModal = $state(false);

    let payAmount = $state('');
    let payDate = $state(new Date().toISOString().split('T')[0]);
    let payMethod = $state('cheque');
    let payRef = $state('');
    let payNotes = $state('');

    let disputeReason = $state(parcel.disputeReason || '');
    let disputeStatus = $state(parcel.disputeStatus || '');
    let isDisputed = $state(parcel.isDisputed);

    const outstanding = (parcel.agreedCompensation || 0) - (parcel.paidCompensation || 0);
    const completionPct = parcel.agreedCompensation > 0
        ? Math.round(((parcel.paidCompensation || 0) / parcel.agreedCompensation) * 100)
        : 0;

    function formatMoney(num) {
        if (!num) return '0';
        return num.toLocaleString('en-IN');
    }

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function formatDate(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function badgeClass(status) {
        switch (status) {
            case 'land_registered': return 'badge-success';
            case 'compensation_paid': return 'badge-success';
            case 'agreement_signed': return 'badge-info';
            case 'in_negotiation': return 'badge-warning';
            case 'disputed': return 'badge-danger';
            default: return 'badge-gray';
        }
    }
</script>

<svelte:head>
    <title>Plot {parcel.plotNumber} - {project.name}</title>
</svelte:head>

<div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex justify-between items-start flex-wrap gap-4">
        <div>
            <a href="/projects/{project.id}/parcels" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path>
                </svg>
                Back to Parcels List
            </a>
            <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-2xl font-bold text-slate-800">Land Parcel: Plot {parcel.plotNumber}</h2>
                <span class="badge {badgeClass(parcel.acquisitionStatus)}">
                    {formatStatus(parcel.acquisitionStatus)}
                </span>
                {#if parcel.isDisputed}
                    <span class="px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold uppercase tracking-wider">
                        ⚠️ Active Dispute
                    </span>
                {/if}
            </div>
            <p class="text-slate-500 text-sm mt-0.5">VDC/Municipality: {parcel.vdcMunicipality}, Ward {parcel.wardNumber}</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
            <a href="/projects/{project.id}/parcels/{parcel.id}/edit" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition border border-slate-200">
                Edit Parcel Details
            </a>
            <button onclick={() => showDisputeModal = true} class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 rounded-xl text-sm transition cursor-pointer">
                {parcel.isDisputed ? 'Update Dispute' : 'Mark as Disputed'}
            </button>
            {#if outstanding > 0}
                <button onclick={() => { payAmount = outstanding.toString(); showPaymentModal = true; }} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 cursor-pointer">
                    Record Payment
                </button>
            {/if}
        </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left 2 Cols -->
        <div class="lg:col-span-2 flex flex-col gap-8">
            <!-- Owner Info & Spatial Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Owner Card -->
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Land Owner Details</h3>
                    <div class="space-y-3">
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Owner Name</span>
                            <span class="text-sm font-bold text-slate-800">{parcel.ownerName}</span>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Contact Information</span>
                            <span class="text-sm font-semibold text-slate-800">{parcel.ownerContact ?? 'N/A'}</span>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Citizenship No.</span>
                            <span class="text-sm font-semibold text-slate-800">{parcel.ownerCitizenshipNo ?? 'N/A'}</span>
                        </div>
                        {#if parcel.assignedTo}
                            <div>
                                <span class="text-[10px] uppercase font-bold text-slate-400 block">Assigned To</span>
                                <span class="text-sm font-semibold text-slate-800">{parcel.assignedTo}</span>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Spatial Card -->
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Spatial Parameters</h3>
                    <div class="space-y-3">
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Area (Ropani)</span>
                            <span class="text-sm font-bold text-slate-800">{parcel.areaRopani?.toFixed(2) ?? 'N/A'} Ropani</span>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Area (Square Meters)</span>
                            <span class="text-sm font-semibold text-slate-800">{parcel.areaSqm?.toFixed(2) ?? 'N/A'} SqM</span>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">Land Type / Cover</span>
                            <span class="text-sm font-semibold text-slate-800 uppercase">{parcel.landType}</span>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 block">GPS Coordinates</span>
                            <span class="text-sm font-semibold text-slate-800">
                                {parcel.latitude && parcel.longitude ? `${parcel.latitude}, ${parcel.longitude}` : 'Not Set'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Compensation Progress -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Compensation Progress</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Agreed Compensation</span>
                        <span class="text-base font-extrabold text-slate-800">Rs {formatMoney(parcel.agreedCompensation)}</span>
                    </div>
                    <div class="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Paid Compensation</span>
                        <span class="text-base font-extrabold text-emerald-800">Rs {formatMoney(parcel.paidCompensation)}</span>
                    </div>
                    <div class="p-3 bg-rose-50/30 border border-rose-100 rounded-xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Outstanding Balance</span>
                        <span class="text-base font-extrabold text-rose-800">Rs {formatMoney(outstanding)}</span>
                    </div>
                </div>
                {#if parcel.agreedCompensation > 0}
                    <div>
                        <div class="flex justify-between text-xs text-slate-400 font-bold mb-1 uppercase">
                            <span>Compensation Payout Bar</span>
                            <span>{completionPct}% Paid</span>
                        </div>
                        <div class="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex border border-slate-200">
                            <div class="bg-emerald-500 h-3.5 rounded-full" style="width: {completionPct}%"></div>
                        </div>
                    </div>
                {/if}
                {#if parcel.agreementDate || parcel.registrationDate}
                    <div class="grid grid-cols-2 gap-4 pt-2">
                        {#if parcel.agreementDate}
                            <div>
                                <span class="text-[10px] uppercase font-bold text-slate-400 block">Agreement Date</span>
                                <span class="text-sm font-semibold text-slate-800">{formatDate(parcel.agreementDate)}</span>
                            </div>
                        {/if}
                        {#if parcel.registrationDate}
                            <div>
                                <span class="text-[10px] uppercase font-bold text-slate-400 block">Registration Date</span>
                                <span class="text-sm font-semibold text-slate-800">{formatDate(parcel.registrationDate)}</span>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Dispute Block -->
            {#if parcel.isDisputed}
                <div class="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div class="flex items-center gap-2 text-rose-800 font-bold">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path>
                        </svg>
                        Active Land Dispute Details
                    </div>
                    <div class="text-xs space-y-2 text-slate-700">
                        <div>
                            <span class="font-extrabold text-slate-400 uppercase text-[9px] block">Dispute Reason</span>
                            <p class="text-slate-800 font-medium leading-relaxed bg-white p-3 border border-slate-200 rounded-xl mt-0.5">{parcel.disputeReason}</p>
                        </div>
                        <div>
                            <span class="font-extrabold text-slate-400 uppercase text-[9px] block">Mediation / Legal Status</span>
                            <p class="text-slate-800 font-semibold mt-0.5">{parcel.disputeStatus ?? 'No details provided.'}</p>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Payment Logs -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Compensation Payment Logs</h3>
                <div class="overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                                <th class="px-4 py-3">Payment Date</th>
                                <th class="px-4 py-3">Amount (Rs)</th>
                                <th class="px-4 py-3">Method</th>
                                <th class="px-4 py-3">Reference / Cheque</th>
                                <th class="px-4 py-3">Notes</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {#each parcel.payments as pay}
                                <tr class="hover:bg-slate-50/50">
                                    <td class="px-4 py-3 font-semibold">{formatDate(pay.paymentDate)}</td>
                                    <td class="px-4 py-3 font-bold text-slate-800">Rs {formatMoney(pay.amount)}</td>
                                    <td class="px-4 py-3 uppercase">{pay.paymentMethod ?? 'N/A'}</td>
                                    <td class="px-4 py-3 text-slate-500">{pay.referenceNumber ?? '-'}</td>
                                    <td class="px-4 py-3 text-slate-400 truncate max-w-[150px]">{pay.notes ?? '-'}</td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="5" class="px-4 py-8 text-center text-slate-400 italic">No payment logs recorded yet.</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Notes -->
            {#if parcel.notes}
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Additional Notes</h3>
                    <p class="text-sm text-slate-600 leading-relaxed">{parcel.notes}</p>
                </div>
            {/if}
        </div>

        <!-- Right Col: Map & Quick Info -->
        <div class="flex flex-col gap-6">
            <!-- GPS Map Card -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">GPS Location Map</h3>
                {#if parcel.latitude && parcel.longitude}
                    <div class="rounded-xl overflow-hidden border border-slate-200" style="height: 240px;">
                        <iframe
                            title="Parcel GPS Location"
                            width="100%"
                            height="240"
                            frameborder="0"
                            scrolling="no"
                            marginheight="0"
                            marginwidth="0"
                            src="https://www.openstreetmap.org/export/embed.html?bbox={parcel.longitude - 0.005},{parcel.latitude - 0.005},{parcel.longitude + 0.005},{parcel.latitude + 0.005}&layer=mapnik&marker={parcel.latitude},{parcel.longitude}"
                            style="border:0; width:100%; height:240px;"
                        ></iframe>
                    </div>
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-500 font-semibold">
                            📍 {parcel.latitude}, {parcel.longitude}
                        </p>
                        <a
                            href="https://www.openstreetmap.org/?mlat={parcel.latitude}&mlon={parcel.longitude}#map=15/{parcel.latitude}/{parcel.longitude}"
                            target="_blank"
                            rel="noopener"
                            class="btn btn-secondary btn-sm text-decoration-none"
                        >
                            Open Full Map ↗
                        </a>
                    </div>
                {:else}
                    <div class="h-44 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <svg class="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
                        </svg>
                        <span class="text-xs font-bold text-slate-500">No Location Pin Configured</span>
                        <p class="text-[10px] text-slate-400 mt-0.5">Edit this parcel to enter GPS coordinates.</p>
                    </div>
                {/if}
            </div>

            <!-- Quick Summary -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Parcel Summary</h3>
                <div class="space-y-3 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Plot Number</span>
                        <span class="font-bold text-slate-800">{parcel.plotNumber}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">VDC / Ward</span>
                        <span class="font-semibold text-slate-700">{parcel.vdcMunicipality}, Ward {parcel.wardNumber}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Land Type</span>
                        <span class="font-semibold text-slate-700 uppercase">{parcel.landType}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                        <span class="badge {badgeClass(parcel.acquisitionStatus)} text-[10px]">{formatStatus(parcel.acquisitionStatus)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Disputed</span>
                        <span class="font-semibold {parcel.isDisputed ? 'text-rose-600' : 'text-emerald-600'}">{parcel.isDisputed ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Payment Progress</span>
                        <span class="font-bold text-slate-800">{completionPct}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Payment Modal -->
{#if showPaymentModal}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Record Compensation Payment</h3>
            <p class="text-xs text-slate-500 mb-4">
                Add a payment log to offset the agreed compensation of Rs {formatMoney(parcel.agreedCompensation)}.
            </p>

            <form method="POST" action="?/pay" onsubmit={() => showPaymentModal = false}>
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="pay-amount" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Amount (NPR) *</label>
                        <input type="number" name="amount" id="pay-amount" step="0.01" required bind:value={payAmount} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="pay-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Date *</label>
                        <input type="date" name="payment_date" id="pay-date" required bind:value={payDate} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="pay-method" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                            <select name="payment_method" id="pay-method" bind:value={payMethod} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                                <option value="cheque">Cheque</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cash">Cash</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="pay-ref" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference / Cheque No.</label>
                            <input type="text" name="reference_number" id="pay-ref" placeholder="Cheque #12345" bind:value={payRef} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="pay-notes" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                        <textarea name="notes" id="pay-notes" rows="2" placeholder="e.g. Paid first installment" bind:value={payNotes} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"></textarea>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showPaymentModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Save Payment</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Dispute Modal -->
{#if showDisputeModal}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Manage Land Dispute</h3>
            <p class="text-xs text-slate-500 mb-4">Mark this parcel as active dispute or update its mediation status.</p>

            <form method="POST" action="?/dispute" onsubmit={() => showDisputeModal = false}>
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" name="is_disputed" value="1" id="is_disputed_toggle" bind:checked={isDisputed} class="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500">
                        <label for="is_disputed_toggle" class="text-sm font-bold text-slate-700 cursor-pointer">Active Dispute Status</label>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="dispute-reason" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispute Reason *</label>
                        <textarea name="dispute_reason" id="dispute-reason" rows="3" required placeholder="e.g. Compensation rate is disputed..." bind:value={disputeReason} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"></textarea>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="dispute-status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Court / Mediation Status</label>
                        <input type="text" name="dispute_status" id="dispute-status" placeholder="e.g. Under mediation at Lamjung DAO" bind:value={disputeStatus} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showDisputeModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-rose-600/10 cursor-pointer">Save Dispute Details</button>
                </div>
            </form>
        </div>
    </div>
{/if}
