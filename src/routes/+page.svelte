<script>
    import { onMount } from 'svelte';
    import { 
        ShieldAlert, 
        AlertTriangle, 
        TrendingUp,
        Map,
        ListTodo,
        FolderOpen,
        CalendarDays,
        FileText
    } from '@lucide/svelte';

    let { data } = $props();

    // Chart.js instance ref
    let chartRef = $state(null);
    let chartInstance = null;

    onMount(async () => {
        if (data.projectStats && data.sCurveData && chartRef) {
            const { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } = await import('chart.js');
            
            Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

            const labels = data.sCurveData.planned.map(item => item.x);
            const plannedData = data.sCurveData.planned.map(item => item.y);
            const actualData = data.sCurveData.actual.map(item => item.y);

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
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    });

    // Formatting helpers
    function formatMoney(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-IN');
    }

    function formatStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
</script>

<svelte:head>
    <title>Dashboard - HydroTrack Nepal</title>
</svelte:head>

<div class="flex flex-col gap-6">
    {#if data.projectStats}
        <!-- SECTION 1 — Welcome banner -->
        <div 
            class="text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            style="background: linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%); border-radius: var(--radius-lg); padding: 28px 32px;"
        >
            <div>
                <h2 class="text-white text-2xl font-bold m-0" style="font-size:22px;">Welcome to HydroTrack Nepal</h2>
                <p class="text-white/80 text-sm m-0 mt-1" style="font-size:14px;">
                    {data.projectStats.name} — {data.projectStats.capacityMw.toFixed(1)} MW Run-of-River
                </p>
            </div>
            <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    ● {formatStatus(data.projectStats.status)} Phase
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    ● {data.projectStats.district} District
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    ● Est. COD: Dec 2026
                </span>
            </div>
        </div>

        <!-- QUICK MODULE LINKS (Uniform height card sizes, 3-on-top, 2-on-bottom wrapping on small screens) -->
        <div class="grid grid-cols-3 md:grid-cols-5 gap-4">
            <a 
                href="/projects/{data.projectStats.id}/overview" 
                class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 group h-28 text-decoration-none"
            >
                <span class="text-2xl">📋</span>
                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">Executive Overview</span>
            </a>
            <a 
                href="/projects/{data.projectStats.id}/construction" 
                class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 group h-28 text-decoration-none"
            >
                <span class="text-2xl">🏗️</span>
                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">Construction Tracker</span>
            </a>
            <a 
                href="/projects/{data.projectStats.id}/clearances" 
                class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 group h-28 text-decoration-none"
            >
                <span class="text-2xl">🛡️</span>
                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">Clearance Tracker</span>
            </a>
            <a 
                href="/projects/{data.projectStats.id}/parcels" 
                class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 group h-28 text-decoration-none"
            >
                <span class="text-2xl">📍</span>
                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">Land Acquisition</span>
            </a>
            <a 
                href="/projects/{data.projectStats.id}/parcels/map" 
                class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 group h-28 text-decoration-none"
            >
                <span class="text-2xl">🗺️</span>
                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 leading-tight">Land GPS Map</span>
            </a>
        </div>

        <!-- SECTION 2 — 4 metric cards in a row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1 -->
            <div class="metric-card flex flex-col justify-between" style="border-left: 4px solid var(--primary);">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="metric-label">Total Clearances</span>
                        <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldAlert size={14} />
                        </div>
                    </div>
                    <h3 class="metric-value">{data.projectStats.totalClearancesCount}</h3>
                </div>
                <p class="metric-sub">
                    {data.projectStats.approvedClearancesCount} approved · {data.projectStats.pendingClearancesCount} pending
                </p>
            </div>

            <!-- Card 2 -->
            <div class="metric-card flex flex-col justify-between" style="border-left: 4px solid var(--danger);">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="metric-label">Clearances at Risk</span>
                        <div class="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertTriangle size={14} />
                        </div>
                    </div>
                    <h3 class="metric-value {(data.projectStats.overdueClearancesCount + data.projectStats.dueSoonClearancesCount) > 0 ? 'text-red-600' : ''}">
                        {data.projectStats.overdueClearancesCount + data.projectStats.dueSoonClearancesCount}
                    </h3>
                </div>
                <p class="metric-sub">
                    {data.projectStats.overdueClearancesCount} overdue · {data.projectStats.dueSoonClearancesCount} due soon
                </p>
            </div>

            <!-- Card 3 -->
            <div class="metric-card flex flex-col justify-between" style="border-left: 4px solid var(--warning);">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="metric-label">Land Parcels Acquired</span>
                        <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Map size={14} />
                        </div>
                    </div>
                    <h3 class="metric-value">{data.projectStats.registeredParcelsCount} / {data.projectStats.totalParcelsCount}</h3>
                </div>
                <p class="metric-sub">
                    {data.projectStats.totalAgreedComp > 0 ? Math.round((data.projectStats.totalPaidComp / data.projectStats.totalAgreedComp) * 100) : 0}% complete · Rs {(data.projectStats.totalPaidComp/100000).toFixed(1)}L paid
                </p>
            </div>

            <!-- Card 4 -->
            <div class="metric-card flex flex-col justify-between" style="border-left: 4px solid var(--success);">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="metric-label">Construction Progress</span>
                        <div class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <h3 class="metric-value">{data.projectStats.overallProgress}%</h3>
                </div>
                <p class="metric-sub">
                    {data.projectStats.overallProgress > 0 ? `${data.projectStats.onTrackCount} components on track` : 'Not yet started'}
                </p>
            </div>
        </div>

        <!-- SECTION 3 — 2 column grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- LEFT: Clearance status overview card -->
            <div class="card lg:col-span-2">
                <div class="card-header">
                    <h4 class="card-title">Regulatory Clearances</h4>
                    <a href="/projects/{data.projectStats.id}/clearances" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800" style="color: var(--primary);">View All →</a>
                </div>
                <div class="table-card" style="box-shadow: none; border: none; border-radius: 0;">
                    <table class="w-full">
                        <thead>
                            <tr>
                                <th>Clearance</th>
                                <th>Status</th>
                                <th>Days</th>
                                <th>Assigned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.projectStats.urgentClearances as c}
                                <tr>
                                    <td>
                                        <a href="/projects/{data.projectStats.id}/clearances" class="font-semibold text-indigo-600 hover:underline" style="color: var(--primary);">
                                            {c.name}
                                        </a>
                                    </td>
                                    <td>
                                        <span class="badge {c.status === 'approved' ? 'badge-success' : (c.isOverdue ? 'badge-danger' : 'badge-warning')}">
                                            {formatStatus(c.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {#if c.isOverdue}
                                            <span class="text-rose-600 font-semibold">-{Math.abs(c.daysLeft)} days</span>
                                        {:else}
                                            <span class="text-amber-600 font-semibold">+{c.daysLeft} days</span>
                                        {/if}
                                    </td>
                                    <td>
                                        <div class="font-medium text-slate-700 text-xs">{c.responsiblePerson || 'Unassigned'}</div>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="4" class="text-center py-6 text-slate-400 italic">No pending clearances.</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- RIGHT: Quick alerts panel card -->
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Action Required</h4>
                </div>
                <div class="flex flex-col gap-4">
                    {#each data.projectStats.actionAlerts as alert}
                        <div class="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                            <span class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style="background: {alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'};"></span>
                            <div class="flex-grow">
                                <h5 class="font-semibold text-xs text-slate-800 m-0 leading-tight">{alert.name}</h5>
                                <p class="text-[11px] text-slate-500 m-0 mt-0.5">{alert.desc}</p>
                            </div>
                            <a href={alert.link} class="text-[11px] font-bold text-indigo-600 hover:underline" style="color: var(--primary);">View →</a>
                        </div>
                    {:else}
                        <div class="text-center py-8">
                            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                ✓
                            </div>
                            <p class="text-xs font-semibold text-slate-700 m-0">All clearances on track</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- SECTION 4 — Full width: Land acquisition progress card -->
        <div class="card">
            <div class="card-header">
                <h4 class="card-title">Land Acquisition Summary</h4>
                <a href="/projects/{data.projectStats.id}/parcels" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800" style="color: var(--primary);">View Parcels →</a>
            </div>
            <div class="flex flex-col gap-6">
                <div>
                    <div class="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                        <span>REGISTRATION PROGRESS</span>
                        <span>{data.projectStats.totalParcelsCount > 0 ? Math.round((data.projectStats.registeredParcelsCount / data.projectStats.totalParcelsCount) * 100) : 0}%</span>
                    </div>
                    <div class="progress-bar-track" style="height: 12px;">
                        <div class="progress-bar-fill" style="width: {data.projectStats.totalParcelsCount > 0 ? Math.round((data.projectStats.registeredParcelsCount / data.projectStats.totalParcelsCount) * 100) : 0}%; background: var(--primary);"></div>
                    </div>
                </div>

                <!-- 5-column stat row -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <div class="p-3 bg-slate-50 rounded-lg">
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">Total Parcels</span>
                        <span class="text-base font-bold text-slate-700">{data.projectStats.totalParcelsCount}</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">Registered</span>
                        <span class="text-base font-bold text-emerald-600">{data.projectStats.registeredParcelsCount}</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">In Negotiation</span>
                        <span class="text-base font-bold text-amber-600">{data.projectStats.negotiationParcelsCount}</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">Disputed</span>
                        <span class="text-base font-bold text-rose-600">{data.projectStats.disputedParcelsCount}</span>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg">
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">Not Started</span>
                        <span class="text-base font-bold text-slate-500">{data.projectStats.notStartedParcelsCount}</span>
                    </div>
                </div>

                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div class="text-xs font-semibold text-slate-600">
                        Compensation Status:
                        <span class="text-slate-800 font-bold ml-1">Total Agreed:</span> Rs {formatMoney(data.projectStats.totalAgreedComp)} · 
                        <span class="text-emerald-600 font-bold">Paid:</span> Rs {formatMoney(data.projectStats.totalPaidComp)} · 
                        <span class="text-rose-600 font-bold">Outstanding:</span> Rs {formatMoney(data.projectStats.outstandingComp)}
                    </div>
                    <span class="badge badge-primary text-[10px] uppercase font-bold">{data.projectStats.totalAgreedComp > 0 ? Math.round((data.projectStats.totalPaidComp / data.projectStats.totalAgreedComp) * 100) : 0}% of total compensation disbursed</span>
                </div>
            </div>
        </div>

        <!-- SECTION 5 — Construction Progress S-Curve -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h4 class="card-title">Construction S-Curve — Planned vs Actual Progress</h4>
                    <p class="card-subtitle">Cumulative WBS hydropower construction timeline for {data.projectStats.name}</p>
                </div>
                <a href="/projects/{data.projectStats.id}/construction" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800" style="color: var(--primary);">View Construction Tracker →</a>
            </div>
            <div style="position: relative; height: 280px; width: 100%;">
                <canvas bind:this={chartRef} style="height: 280px;"></canvas>
            </div>
        </div>
    {:else}
        <!-- If no project seeded -->
        <div class="card p-12 text-center">
            <h3 class="text-lg font-bold text-slate-700">Welcome to HydroTrack Nepal</h3>
            <p class="text-slate-400 text-sm mt-1 mb-6">Create your first hydropower project to unlock WBS progress tracking, clearances list, and land acquisition registers.</p>
            <a href="/projects/create" class="btn btn-primary">Create Project</a>
        </div>
    {/if}
</div>
