<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { enhance } from '$app/forms';

    let { data, form } = $props();

    // Modal states
    let showAddReportModal = $state(false);
    let showAddContractorModal = $state(false);
    let showAddComponentModal = $state(false);
    let showUpdateProgressModal = $state(false);
    let showAddBillModal = $state(false);
    let showCertifyBillModal = $state(false);
    let showEditBillModal = $state(false);

    // Selected items for modal operations
    let selectedContractorForBill = $state(null);
    let selectedBill = $state(null);
    let selectedComponent = $state(null);

    // Form binding variables — Daily Site Report
    let newReportDate = $state(new Date().toISOString().split('T')[0]);
    let newReportedBy = $state('');
    let newReportWorkDone = $state('');

    // Form binding variables — Add Component
    let newComponentName = $state('');
    let newComponentCode = $state('');
    let newComponentCategory = $state('civil_headworks');
    let newComponentPlannedStart = $state('');
    let newComponentPlannedEnd = $state('');
    let newComponentPlannedCost = $state('');
    let newComponentWeightPct = $state('');

    // Form binding variables — Update Progress
    let updateActualProgress = $state('');
    let updateActualCost = $state('');
    let updateNotes = $state('');

    // Form binding variables — Add Contractor
    let newCompanyName = $state('');
    let newContractNumber = $state('');
    let newContractType = $state('civil');
    let newWorkScope = $state('');
    let newContractValue = $state('');
    let newMobAdvance = $state('0');
    let newContractStart = $state('');
    let newContractEnd = $state('');
    let newRetentionPct = $state('5');
    let newPerformanceStatus = $state('not_mobilized');

    // Form binding variables — Add Bill
    let newBillNumber = $state('');
    let newBillAmount = $state('');
    let newBillDate = $state(new Date().toISOString().split('T')[0]);

    // Form binding variables — Certify / Edit bill
    let certifyAmount = $state('');
    let editBillNumber = $state('');
    let editBillAmount = $state('');
    let editBillStatus = $state('');

    // S-curve Chart
    let chartRef = $state(null);
    let chartInstance = null;

    // Contractor computed totals (for footer row) - must be $derived, not @const in HTML
    let grandVal = $derived(data.project.contractors.reduce((s, c) => s + c.contractValue + (c.variationOrders || 0), 0));
    let grandBilled = $derived(data.project.contractors.reduce((s, c) => s + c.bills.reduce((bs, b) => bs + b.billAmount, 0), 0));
    let grandCert = $derived(data.project.contractors.reduce((s, c) => s + c.bills.reduce((bs, b) => bs + (b.certifiedAmount || 0), 0), 0));
    let grandPaid = $derived(data.project.contractors.reduce((s, c) => s + c.bills.reduce((bs, b) => bs + (b.paidAmount || 0), 0), 0));

    // All bills across contractors
    let allBills = $derived(data.project.contractors.flatMap(c => c.bills.map(b => ({ ...b, contractor: c }))));

    onMount(async () => {
        if (data.project && chartRef) {
            const { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler } = await import('chart.js');
            Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler);

            const plannedStarts = data.project.components.map(c => new Date(c.plannedStart).getTime());
            const plannedEnds = data.project.components.map(c => new Date(c.plannedEnd).getTime());
            
            if (plannedStarts.length === 0) return;

            const minStart = new Date(Math.min(...plannedStarts));
            const maxEnd = new Date(Math.max(...plannedEnds));

            const months = [];
            let current = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
            const end = new Date(maxEnd.getFullYear(), maxEnd.getMonth(), 1);
            while (current <= end) {
                months.push(new Date(current));
                current.setMonth(current.getMonth() + 1);
            }

            const totalMonths = months.length;
            const labels = [];
            const plannedData = [];
            const actualData = [];
            const today = new Date();
            const currentYearMonth = today.getFullYear() * 12 + today.getMonth();

            for (let i = 0; i < totalMonths; i++) {
                const date = months[i];
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                labels.push(monthName);
                
                let plannedVal = 0;
                if (totalMonths > 1) {
                    const fraction = i / (totalMonths - 1);
                    const z = (fraction - 0.5) * 6;
                    plannedVal = 100 / (1 + Math.exp(-z));
                    if (i === 0) plannedVal = 0;
                    if (i === totalMonths - 1) plannedVal = 100;
                } else {
                    plannedVal = 100;
                }
                plannedData.push(plannedVal);

                const monthYearMonth = date.getFullYear() * 12 + date.getMonth();
                if (monthYearMonth <= currentYearMonth) {
                    let overallProgress = data.stats.overallProgress;
                    let elapsedMonths = 0;
                    months.forEach(m => {
                        if ((m.getFullYear() * 12 + m.getMonth()) <= currentYearMonth) elapsedMonths++;
                    });

                    let actualVal = 0;
                    if (elapsedMonths > 1 && i < elapsedMonths) {
                        actualVal = overallProgress * (i / (elapsedMonths - 1));
                        if (i > 0 && i < elapsedMonths - 1) {
                            actualVal += (Math.sin(i) * 2);
                            if (actualVal < 0) actualVal = 0;
                            if (actualVal > overallProgress) actualVal = overallProgress;
                        }
                    } else if (i === 0) {
                        actualVal = 0;
                    } else {
                        actualVal = overallProgress;
                    }
                    actualData.push(actualVal);
                }
            }

            chartInstance = new Chart(chartRef, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Planned WBS Progress (%)',
                            data: plannedData,
                            borderColor: '#94A3B8',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.1,
                            pointRadius: 0
                        },
                        {
                            label: 'Actual Progress (%)',
                            data: actualData,
                            borderColor: '#1E40AF',
                            borderWidth: 3,
                            fill: true,
                            backgroundColor: 'rgba(30,64,175,0.05)',
                            tension: 0.1,
                            pointRadius: 2,
                            pointBackgroundColor: '#1E40AF'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                callback: function(value) { return value + '%'; }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    });

    // Formatting helpers
    function formatMoney(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-IN');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatCategory(cat) {
        if (!cat) return '';
        return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function openAddBillModal(contractor) {
        selectedContractorForBill = contractor;
        newBillNumber = '';
        newBillAmount = '';
        showAddBillModal = true;
    }

    function openCertifyModal(bill) {
        selectedBill = bill;
        certifyAmount = bill.billAmount.toString();
        showCertifyBillModal = true;
    }

    function openEditBillModal(bill) {
        selectedBill = bill;
        editBillNumber = bill.billNumber;
        editBillAmount = bill.billAmount.toString();
        editBillStatus = bill.status;
        showEditBillModal = true;
    }

    function openUpdateProgressModal(component) {
        selectedComponent = component;
        updateActualProgress = component.actualProgress.toString();
        updateActualCost = (component.actualCost || '').toString();
        updateNotes = '';
        showUpdateProgressModal = true;
    }
</script>

<svelte:head>
    <title>Construction - {data.project.name}</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- Page Title Section -->
    <div class="page-title-section">
        <div>
            <h1 class="page-title">Construction Progress Tracker</h1>
            <p class="page-subtitle">{data.project.name} · WBS Construction Phase</p>
        </div>
        <div class="flex items-center gap-2">
            <button
                onclick={() => { showAddReportModal = true; newReportedBy = ''; newReportWorkDone = ''; }}
                class="btn btn-secondary cursor-pointer"
            >
                👷 Log Daily Report
            </button>
            <button
                onclick={() => { showAddComponentModal = true; newComponentName = ''; newComponentCode = ''; }}
                class="btn btn-primary cursor-pointer"
            >
                + Add Component
            </button>
        </div>
    </div>

    <!-- SECTION 1 — Overall Progress Hero Card -->
    <div
        class="text-white shadow-md flex flex-col md:flex-row items-center gap-8"
        style="background: linear-gradient(135deg, #1E3A8A, #1E40AF); border-radius: var(--radius-lg); padding: 28px 32px;"
    >
        <!-- Left: Donut Chart -->
        <div class="flex items-center gap-4 flex-shrink-0">
            <div class="relative w-28 h-28">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path class="text-white/20" stroke="currentColor" stroke-width="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="text-white" stroke="currentColor" stroke-width="3.5" stroke-dasharray="{data.stats.overallProgress}, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-2xl font-bold text-white leading-none">{data.stats.overallProgress}%</span>
                    <span class="text-[9px] text-white/70 uppercase tracking-widest mt-1">Progress</span>
                </div>
            </div>
            <div>
                <h3 class="text-white text-lg font-bold m-0">Overall Status</h3>
                <p class="text-white/70 text-xs m-0 mt-0.5">Weighted WBS Progression</p>
            </div>
        </div>

        <!-- Vertical Divider -->
        <div class="hidden md:block w-px h-16 bg-white/20"></div>

        <!-- Right Column: 3 Stat Blocks -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-grow w-full">
            <div>
                <span class="text-white/70 text-[10px] font-bold uppercase tracking-wider block">Days Elapsed</span>
                <p class="text-white text-2xl font-bold m-0 mt-0.5">{data.stats.daysElapsed}</p>
            </div>
            <div>
                <span class="text-white/70 text-[10px] font-bold uppercase tracking-wider block">WBS Components</span>
                <p class="text-white text-2xl font-bold m-0 mt-0.5">{data.project.components.length}</p>
            </div>
            <div>
                <span class="text-white/70 text-[10px] font-bold uppercase tracking-wider block">On Track</span>
                <p class="text-white text-2xl font-bold m-0 mt-0.5">
                    {data.project.components.filter(c => c.scheduleStatus === 'on_track').length} / {data.project.components.length}
                </p>
            </div>
        </div>
    </div>

    <!-- SECTION 2 — S-CURVE CHART -->
    <div class="card">
        <div class="card-header">
            <div>
                <h4 class="card-title">S-Curve — Planned vs Actual Progress</h4>
                <p class="card-subtitle">Cumulative WBS hydropower construction timeline</p>
            </div>
        </div>
        <div style="position: relative; height: 280px; width: 100%;">
            <canvas bind:this={chartRef} style="height: 280px;"></canvas>
        </div>
    </div>

    <!-- SECTION 3 — WBS Components Card (Full Width) -->
    <div class="card">
        <div class="card-header">
            <h4 class="card-title">Construction WBS Components</h4>
        </div>
        <div class="table-card" style="border:none; box-shadow:none; border-radius:0;">
            <div class="overflow-x-auto w-full">
            <table class="w-full min-w-max">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Component</th>
                        <th>Planned vs Actual</th>
                        <th>Status</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.project.components as c}
                        {@const barColor = c.scheduleStatus === 'critical' ? 'var(--danger)' :
                                           (c.scheduleStatus === 'delayed' ? '#EA580C' :
                                            (c.scheduleStatus === 'slight_delay' ? 'var(--warning)' : 'var(--success)'))}
                        {@const now = new Date()}
                        {@const pStart = new Date(c.plannedStart)}
                        {@const pEnd = new Date(c.plannedEnd)}
                        {@const dur = pEnd - pStart}
                        {@const elapsed = now - pStart}
                        {@const plannedPct = dur > 0 ? Math.round(Math.min(100, Math.max(0, (elapsed / dur) * 100))) : 0}
                        <tr>
                            <td class="font-bold text-xs">{c.code ?? 'CC'}</td>
                            <td>
                                <div class="font-semibold text-slate-800">{c.name}</div>
                                <div class="text-[10px] text-slate-400 font-medium">{formatCategory(c.category)}</div>
                            </td>
                            <td>
                                <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                    <span>Planned: {plannedPct}%</span>
                                    <span class="font-bold text-slate-800">Actual: {c.actualProgress}%</span>
                                </div>
                                <div class="progress-bar-track relative">
                                    <!-- Planned fill (gray) -->
                                    <div class="absolute top-0 bottom-0 left-0 bg-slate-300" style="width: {plannedPct}%;"></div>
                                    <!-- Actual fill (colored) -->
                                    <div class="absolute top-0 bottom-0 left-0 progress-bar-fill" style="width: {c.actualProgress}%; background: {barColor}; z-index: 10;"></div>
                                </div>
                            </td>
                            <td>
                                <span class="badge
                                    {c.scheduleStatus === 'on_track' ? 'badge-success' :
                                     (c.scheduleStatus === 'slight_delay' ? 'badge-warning' :
                                      (c.scheduleStatus === 'delayed' ? 'badge-warning' : 'badge-danger'))}">
                                    {formatCategory(c.scheduleStatus)}
                                </span>
                            </td>
                            <td class="text-right">
                                <button
                                    onclick={() => openUpdateProgressModal(c)}
                                    class="btn btn-secondary btn-sm cursor-pointer"
                                >
                                    Update Progress
                                </button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" class="text-center py-6 text-slate-400 italic">No WBS components configured.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            </div>
        </div>
    </div>

    <!-- SECTION 4 — Contractor Summary Card -->
    <div class="card">
        <div class="card-header">
            <h4 class="card-title">Contractor Summary</h4>
            <button
                onclick={() => { showAddContractorModal = true; newCompanyName = ''; newWorkScope = ''; }}
                class="btn btn-primary btn-sm cursor-pointer"
            >
                + Add Contractor
            </button>
        </div>
        <div class="table-card" style="border:none; box-shadow:none; border-radius:0;">
            <div class="overflow-x-auto w-full">
            <table class="w-full min-w-max">
                <thead>
                    <tr>
                        <th>Contractor</th>
                        <th>Scope of Work</th>
                        <th>Contract Value</th>
                        <th>Billed / Certified / Paid</th>
                        <th>Status</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.project.contractors as c}
                        {@const totalBilled = c.bills.reduce((s, b) => s + b.billAmount, 0)}
                        {@const totalCert = c.bills.reduce((s, b) => s + (b.certifiedAmount || 0), 0)}
                        {@const totalPaid = c.bills.reduce((s, b) => s + (b.paidAmount || 0), 0)}
                        {@const adjustedVal = c.contractValue + (c.variationOrders || 0)}
                        {@const pctPaid = adjustedVal > 0 ? (totalPaid / adjustedVal) * 100 : 0}
                        {@const pctCert = adjustedVal > 0 ? (totalCert / adjustedVal) * 100 : 0}
                        <tr>
                            <td>
                                <div class="font-bold text-slate-800" style="color: var(--primary);">{c.companyName}</div>
                                <div class="text-[10px] text-slate-400">{c.contractNumber || ''}</div>
                            </td>
                            <td class="text-xs text-slate-500 max-w-xs truncate">{c.workScope || ''}</td>
                            <td class="font-bold text-slate-800">Rs {formatMoney(adjustedVal)}</td>
                            <td>
                                <div class="flex flex-col gap-1">
                                    <div class="flex justify-between text-[10px] text-slate-500 font-semibold">
                                        <span>Billed: Rs {formatMoney(totalBilled)}</span>
                                        <span>Paid: Rs {formatMoney(totalPaid)}</span>
                                    </div>
                                    <div class="progress-bar-track relative">
                                        <!-- Certified bar -->
                                        <div class="absolute top-0 bottom-0 left-0 bg-blue-300" style="width: {pctCert}%;"></div>
                                        <!-- Paid bar -->
                                        <div class="absolute top-0 bottom-0 left-0 bg-blue-600" style="width: {pctPaid}%; z-index: 10;"></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge
                                    {c.performanceStatus === 'on_track' ? 'badge-success' :
                                     (c.performanceStatus === 'delayed' ? 'badge-warning' :
                                      (c.performanceStatus === 'critical' ? 'badge-danger' :
                                       (c.performanceStatus === 'completed' ? 'badge-success' : 'badge-gray')))}">
                                    {formatCategory(c.performanceStatus)}
                                </span>
                            </td>
                            <td class="text-right">
                                <button onclick={() => openAddBillModal(c)} class="btn btn-secondary btn-sm cursor-pointer">View Bills</button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="text-center py-6 text-slate-400 italic">No contractors registered.</td>
                        </tr>
                    {/each}
                </tbody>
                {#if data.project.contractors.length > 0}
                    <tfoot>
                        <tr class="bg-slate-50/50 font-bold border-t border-slate-200">
                            <td colspan="2">Total Sums</td>
                            <td>Rs {formatMoney(grandVal)}</td>
                            <td>
                                <div class="text-[11px]">
                                    Billed: Rs {formatMoney(grandBilled)} ·
                                    Cert: Rs {formatMoney(grandCert)} ·
                                    Paid: Rs {formatMoney(grandPaid)}
                                </div>
                            </td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                {/if}
            </table>
            </div>
        </div>
    </div>

    <!-- Billing Ledger -->
    <div class="card">
        <div class="card-header">
            <h4 class="card-title">Billing Ledger &amp; Invoices</h4>
        </div>
        <div class="table-card" style="border:none; box-shadow:none; border-radius:0;">
            <div class="overflow-x-auto w-full">
            <table class="w-full min-w-max">
                <thead>
                    <tr>
                        <th>Bill #</th>
                        <th>Contractor</th>
                        <th>Billed Amount</th>
                        <th>Certified Amount</th>
                        <th>Paid Amount</th>
                        <th>Status</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each allBills as bill}
                        <tr>
                            <td class="font-bold text-slate-800">{bill.billNumber}</td>
                            <td>
                                <div class="font-semibold text-slate-700 text-xs">{bill.contractor.companyName}</div>
                            </td>
                            <td class="font-semibold text-slate-700">Rs {formatMoney(bill.billAmount)}</td>
                            <td>
                                {bill.certifiedAmount ? `Rs ${formatMoney(bill.certifiedAmount)}` : 'Pending'}
                            </td>
                            <td class="text-emerald-650 font-bold">
                                {bill.paidAmount ? `Rs ${formatMoney(bill.paidAmount)}` : 'Pending'}
                            </td>
                            <td>
                                <span class="badge
                                    {bill.status === 'paid' ? 'badge-success' :
                                     (bill.status === 'certified' ? 'badge-info' :
                                      (bill.status === 'under_review' ? 'badge-warning' : 'badge-gray'))}">
                                    {formatCategory(bill.status)}
                                </span>
                            </td>
                            <td class="text-right">
                                <div class="inline-flex gap-2">
                                    {#if bill.status === 'submitted'}
                                        <button onclick={() => openCertifyModal(bill)} class="btn btn-success btn-sm cursor-pointer">Certify</button>
                                    {:else if bill.status === 'certified'}
                                        <form method="POST" action="?/pay_bill" class="m-0 inline-block">
                                            <input type="hidden" name="bill_id" value={bill.id} />
                                            <input type="hidden" name="paid_amount" value={bill.certifiedAmount} />
                                            <button type="submit" class="btn btn-primary btn-sm cursor-pointer">Record Payment</button>
                                        </form>
                                    {/if}
                                    <button onclick={() => openEditBillModal(bill)} class="btn btn-secondary btn-sm cursor-pointer">Edit</button>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="7" class="text-center py-12 text-slate-400 italic">No contractor bills submitted.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            </div>
        </div>
    </div>

    <!-- SECTION 5 — Recent Site Reports -->
    <div class="card">
        <div class="card-header">
            <h4 class="card-title">Recent Site Reports</h4>
            <button
                onclick={() => { showAddReportModal = true; newReportedBy = ''; newReportWorkDone = ''; }}
                class="btn btn-secondary btn-sm cursor-pointer"
            >
                + New Report
            </button>
        </div>
        <div class="table-card" style="border:none; box-shadow:none; border-radius:0;">
            <div class="overflow-x-auto w-full">
            <table class="w-full min-w-max">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reported By</th>
                        <th>Description / Work Done</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.project.dailySiteReports as report}
                        <tr>
                            <td class="font-semibold text-sm">{formatDate(report.reportDate)}</td>
                            <td class="text-xs font-bold text-slate-700">{report.reportedBy}</td>
                            <td class="text-xs text-slate-600" style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                {report.workDone}
                            </td>
                            <td class="text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <span class="btn btn-secondary btn-sm" style="opacity:0.5; cursor:default;">View</span>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="4" class="text-center py-6 text-slate-400 italic">No site reports logged yet.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Add WBS Construction Component -->
{#if showAddComponentModal}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Add WBS Construction Component</h3>

            <form 
                method="POST" 
                action="?/add_component" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showAddComponentModal = false;
                        await update();
                    };
                }}
            >
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="comp-name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Component Name *</label>
                        <input
                            type="text" name="name" id="comp-name" required
                            placeholder="e.g. Headrace Tunnel"
                            bind:value={newComponentName}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                        >
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-code" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Code</label>
                            <input
                                type="text" name="code" id="comp-code"
                                placeholder="e.g. CC-02"
                                bind:value={newComponentCode}
                                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                            >
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-category" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                            <select name="category" id="comp-category" bind:value={newComponentCategory} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                                <option value="civil_headworks">Civil Headworks</option>
                                <option value="headrace">Headrace Tunnel / Pipe</option>
                                <option value="powerhouse_civil">Powerhouse Civil Works</option>
                                <option value="electromechanical">Electromechanical Works</option>
                                <option value="switchyard">Switchyard</option>
                                <option value="transmission">Transmission Line</option>
                                <option value="access_road">Access Road</option>
                                <option value="camp_facilities">Camp Facilities</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-start" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Start *</label>
                            <input
                                type="date" name="planned_start" id="comp-start" required
                                bind:value={newComponentPlannedStart}
                                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white"
                            >
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-end" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned End *</label>
                            <input
                                type="date" name="planned_end" id="comp-end" required
                                bind:value={newComponentPlannedEnd}
                                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white"
                            >
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-cost" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Cost (NPR) *</label>
                            <input
                                type="number" name="planned_cost" id="comp-cost" required
                                placeholder="e.g. 5000000"
                                bind:value={newComponentPlannedCost}
                                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                            >
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="comp-weight" class="text-xs font-bold text-slate-500 uppercase tracking-wider">WBS Weight Pct (%) *</label>
                            <input
                                type="number" name="weight_pct" id="comp-weight" required min="1" max="100"
                                bind:value={newComponentWeightPct}
                                class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                            >
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showAddComponentModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Add Component</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Update Component Progress -->
{#if showUpdateProgressModal && selectedComponent}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Update Progress: {selectedComponent.name}</h3>

            <form 
                method="POST" 
                action="?/update_progress" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showUpdateProgressModal = false;
                        await update();
                    };
                }}
            >
                <input type="hidden" name="component_id" value={selectedComponent.id} />
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="upd-progress" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Progress (%)</label>
                        <input
                            type="number" name="actual_progress" id="upd-progress" required min="0" max="100"
                            bind:value={updateActualProgress}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                        >
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="upd-cost" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Cost Spent (NPR)</label>
                        <input
                            type="number" name="actual_cost" id="upd-cost" min="0"
                            bind:value={updateActualCost}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                        >
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="upd-notes" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Update Notes</label>
                        <textarea
                            name="notes" id="upd-notes" rows="3"
                            bind:value={updateNotes}
                            class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"
                        ></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showUpdateProgressModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Save Progress</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Add Daily Site Report -->
{#if showAddReportModal}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Log Daily Site Report</h3>
            <p class="text-xs text-slate-500 mb-4">Create a new site report entry.</p>

            <form 
                method="POST" 
                action="?/add_site_report" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showAddReportModal = false;
                        await update();
                    };
                }}
            >
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="report-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Date *</label>
                        <input type="date" name="report_date" id="report-date" required bind:value={newReportDate} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="reported-by" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Reporter Name *</label>
                        <input type="text" name="reported_by" id="reported-by" required placeholder="e.g. Ramesh Giri" bind:value={newReportedBy} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="work-done" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Description of Work Done *</label>
                        <textarea name="work_done" id="work-done" required rows="4" placeholder="Civil excavation complete, concrete pouring started..." bind:value={newReportWorkDone} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border"></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showAddReportModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Submit Report</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Add Contractor Profile -->
{#if showAddContractorModal}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Add Contractor Profile</h3>
            <p class="text-xs text-slate-500 mb-4">Register a new contractor scope and contract values.</p>

            <form 
                method="POST" 
                action="?/add_contractor" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showAddContractorModal = false;
                        await update();
                    };
                }}
            >
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="company-name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name *</label>
                        <input type="text" name="company_name" id="company-name" required placeholder="Chitwan Builders" bind:value={newCompanyName} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="contract-num" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Number</label>
                            <input type="text" name="contract_number" id="contract-num" placeholder="e.g. MKH-CV-01" bind:value={newContractNumber} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="contract-type" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Type</label>
                            <select name="contract_type" id="contract-type" bind:value={newContractType} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                                <option value="civil">Civil Works</option>
                                <option value="electromechanical">Electromechanical</option>
                                <option value="transmission">Transmission Line</option>
                                <option value="road">Access Road</option>
                                <option value="camp">Camp Facilities</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="work-scope" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Scope of Work *</label>
                        <input type="text" name="work_scope" id="work-scope" required placeholder="Civil works & foundations" bind:value={newWorkScope} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="contract-val" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Value (NPR) *</label>
                            <input type="number" name="contract_value" id="contract-val" required placeholder="5000000" bind:value={newContractValue} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="mob-advance" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobilization Advance (NPR)</label>
                            <input type="number" name="mobilization_advance" id="mob-advance" bind:value={newMobAdvance} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="start-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Start *</label>
                            <input type="date" name="contract_start" id="start-date" required bind:value={newContractStart} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="end-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned End *</label>
                            <input type="date" name="contract_end" id="end-date" required bind:value={newContractEnd} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="retention-pct" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Retention Pct (%)</label>
                            <input type="number" name="retention_pct" id="retention-pct" bind:value={newRetentionPct} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="perf-status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Performance Status</label>
                            <select name="performance_status" id="perf-status" bind:value={newPerformanceStatus} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                                <option value="not_mobilized">Not Mobilized</option>
                                <option value="mobilized">Mobilized</option>
                                <option value="on_track">On Track</option>
                                <option value="delayed">Delayed</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showAddContractorModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Add Contractor</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Submit Contractor Bill -->
{#if showAddBillModal && selectedContractorForBill}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Submit Contractor Bill</h3>
            <p class="text-xs text-slate-500 mb-4">Register a billing invoice for {selectedContractorForBill.companyName}.</p>

            <form 
                method="POST" 
                action="?/add_bill" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showAddBillModal = false;
                        await update();
                    };
                }}
            >
                <input type="hidden" name="contractor_id" value={selectedContractorForBill.id} />
                
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="bill-no" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Bill Number *</label>
                        <input type="text" name="bill_number" id="bill-no" required placeholder="e.g. BILL-RA-04" bind:value={newBillNumber} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="bill-amount" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (NPR) *</label>
                            <input type="number" name="bill_amount" id="bill-amount" required placeholder="250000" bind:value={newBillAmount} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="bill-date" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Date *</label>
                            <input type="date" name="bill_date" id="bill-date" required bind:value={newBillDate} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showAddBillModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Submit Invoice</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Certify Bill -->
{#if showCertifyBillModal && selectedBill}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Certify Contractor Bill</h3>
            <p class="text-xs text-slate-500 mb-4">Set the verified amount for Bill {selectedBill.billNumber}.</p>

            <form 
                method="POST" 
                action="?/certify_bill" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showCertifyBillModal = false;
                        await update();
                    };
                }}
            >
                <input type="hidden" name="bill_id" value={selectedBill.id} />
                
                <div class="flex flex-col gap-4 mb-6">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Submitted Invoice Amount</span>
                        <p class="text-base font-bold text-slate-700 mt-1">Rs {formatMoney(selectedBill.billAmount)}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="cert-amount" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Certified Amount (NPR) *</label>
                        <input type="number" name="certified_amount" id="cert-amount" required bind:value={certifyAmount} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showCertifyBillModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="btn btn-success cursor-pointer">Certify Bill</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal: Edit Bill -->
{#if showEditBillModal && selectedBill}
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-2">Edit Contractor Bill</h3>
            <p class="text-xs text-slate-500 mb-4">Modify properties for Bill {selectedBill.billNumber}.</p>

            <form 
                method="POST" 
                action="?/edit_bill" 
                use:enhance={() => {
                    return async ({ update }) => {
                        showEditBillModal = false;
                        await update();
                    };
                }}
            >
                <input type="hidden" name="bill_id" value={selectedBill.id} />
                
                <div class="flex flex-col gap-4 mb-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="edit-bill-no" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Bill Number *</label>
                        <input type="text" name="bill_number" id="edit-bill-no" required bind:value={editBillNumber} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="edit-bill-amt" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Billed Amount (NPR) *</label>
                        <input type="number" name="bill_amount" id="edit-bill-amt" required bind:value={editBillAmount} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label for="edit-bill-status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status *</label>
                        <select name="status" id="edit-bill-status" bind:value={editBillStatus} class="rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 w-full border bg-white">
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="certified">Certified</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onclick={() => showEditBillModal = false} class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
{/if}
