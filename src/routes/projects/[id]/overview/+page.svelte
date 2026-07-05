<script>
    import { page } from '$app/state';
    import { Check } from '@lucide/svelte';

    let { data } = $props();
    let activeAccordion = $state('m1');

    // Dynamic timeline status calculations
    let currentStatus = $derived(data.project.status);
    let statusOrder = ['pre_development', 'licensing', 'financial_closure', 'construction', 'operational'];
    let currentIndex = $derived(statusOrder.indexOf(currentStatus) === -1 ? 0 : statusOrder.indexOf(currentStatus));

    // Phase lists
    let phases = $derived([
        {
            id: 'pre_development',
            name: 'Pre-Development',
            date: data.project.createdAt ? new Date(data.project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Initiated',
            status: currentIndex > 0 ? 'completed' : (currentIndex === 0 ? 'current' : 'future')
        },
        {
            id: 'licensing',
            name: 'Licensing & Clearance',
            date: data.project.generationLicenseDate ? new Date(data.project.generationLicenseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (data.project.surveyLicenseDate ? new Date(data.project.surveyLicenseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'In progress'),
            status: currentIndex > 1 ? 'completed' : (currentIndex === 1 ? 'current' : 'future')
        },
        {
            id: 'financial_closure',
            name: 'Financial Closure',
            date: data.project.financialClosureDate ? new Date(data.project.financialClosureDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Pending',
            status: currentIndex > 2 ? 'completed' : (currentIndex === 2 ? 'current' : 'future')
        },
        {
            id: 'construction',
            name: 'Construction Stage',
            date: data.project.constructionStartDate ? new Date(data.project.constructionStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Pending',
            status: currentIndex > 3 ? 'completed' : (currentIndex === 3 ? 'current' : 'future')
        },
        {
            id: 'operational',
            name: 'Operations (COD)',
            date: data.project.targetCodDate ? new Date(data.project.targetCodDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Target Date',
            status: currentIndex > 4 ? 'completed' : (currentIndex === 4 ? 'current' : 'future')
        }
    ]);

    // Format dates nicely
    function formatDate(dateStr) {
        if (!dateStr) return 'Pending';
        return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

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
    <title>Executive Overview - {data.project.name}</title>
    <style>
        @media print {
            aside, header, .btn, .no-print {
                display: none !important;
            }
            body, .md\:ml-60, main {
                margin-left: 0 !important;
                padding: 0 !important;
                background: white !important;
            }
            .card {
                box-shadow: none !important;
                border: 1px solid #CBD5E1 !important;
                page-break-inside: avoid;
            }
            .print-footer {
                display: block !important;
            }
        }
        .print-footer {
            display: none;
        }
    </style>
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- Page Title Section -->
    <div class="page-title-section">
        <div>
            <h1 class="page-title">Executive Project Overview</h1>
            <p class="page-subtitle">{data.project.name} — {data.project.capacityMw.toFixed(1)} MW {formatStatus(data.project.projectType)}</p>
        </div>
        <button onclick={() => window.print()} class="btn btn-secondary no-print">
            🖨️ Print Executive Summary
        </button>
    </div>

    <!-- SECTION 1 — Project Identity Card -->
    <div class="card grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Identity fields -->
        <div class="lg:col-span-2 flex flex-col gap-4">
            <div>
                <h2 class="text-2xl font-bold" style="color: var(--primary); font-size:24px;">{data.project.name}</h2>
                <p class="text-xs text-slate-500 font-semibold uppercase mt-1">
                    {data.project.capacityMw.toFixed(1)} MW {formatStatus(data.project.projectType)} · {data.project.river || 'Unknown'} River, {data.project.district}
                </p>
            </div>
            <div class="flex gap-2">
                <span class="badge badge-primary uppercase text-[10px]">{formatStatus(data.project.status)} Phase</span>
                <span class="badge badge-gray uppercase text-[10px]">{data.project.province}</span>
            </div>
            <div class="h-px bg-slate-100 my-2"></div>
            
            <!-- Grid of 6 fields -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Survey License Date</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.surveyLicenseDate)}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gen License Date</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.generationLicenseDate)}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PPA Signed</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.ppaSignedDate)}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Closure</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.financialClosureDate)}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Construction Start</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.constructionStartDate)}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target COD</span>
                    <span class="text-xs font-semibold text-slate-800">{formatDate(data.project.targetCodDate)}</span>
                </div>
            </div>
        </div>

        <!-- Right: Vertical Timeline -->
        <div class="border-l border-slate-100 pl-6 flex flex-col gap-4">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Lifecycle Timeline</h5>
            
            <div class="flex flex-col gap-3">
                {#each phases as phase}
                    <div class="flex gap-3 relative items-center">
                        <div 
                            class="w-5 h-5 rounded-full flex items-center justify-center border-2
                            {phase.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                             (phase.status === 'current' ? 'bg-blue-600 border-blue-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-300')}"
                        >
                            {#if phase.status === 'completed'}
                                <Check size={12} strokeWidth={3} />
                            {:else if phase.status === 'current'}
                                ●
                            {:else}
                                ○
                            {/if}
                        </div>
                        <div class="flex-grow">
                            <h6 class="text-xs font-bold leading-none {phase.status === 'current' ? 'text-blue-600' : 'text-slate-800'}">{phase.name}</h6>
                            <p class="text-[10px] text-slate-500 mt-1 m-0">{phase.date}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- SECTION 2 — Module Status Cards (3 across) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="card flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-4">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Regulatory &amp; Licenses</span>
                    <span class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">🛡️</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-800">{data.stats.approvedClearances} / {data.stats.totalClearances} Approved</h3>
                
                <div class="progress-bar-track my-3">
                    <div class="progress-bar-fill bg-blue-600" style="width: {data.stats.totalClearances > 0 ? (data.stats.approvedClearances / data.stats.totalClearances) * 100 : 0}%;"></div>
                </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-xs font-bold text-rose-600">{data.stats.riskAlerts} items need attention</span>
                <a href="/projects/{data.project.id}/clearances" class="text-xs font-semibold text-indigo-600 hover:underline no-print" style="color: var(--primary);">View Clearances →</a>
            </div>
        </div>

        <!-- Card 2 -->
        <div class="card flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-4">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Land Acquisition</span>
                    <span class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">📍</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-800">{data.stats.registeredParcels} / {data.stats.totalParcels} Registered</h3>
                
                <div class="progress-bar-track my-3">
                    <div class="progress-bar-fill bg-amber-500" style="width: {data.stats.totalParcels > 0 ? (data.stats.registeredParcels / data.stats.totalParcels) * 100 : 0}%;"></div>
                </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-xs font-bold text-rose-600">Rs {(data.stats.outstandingCompensation/100000).toFixed(1)}L outstanding</span>
                <a href="/projects/{data.project.id}/parcels" class="text-xs font-semibold text-indigo-600 hover:underline no-print" style="color: var(--primary);">View Parcels →</a>
            </div>
        </div>

        <!-- Card 3 -->
        <div class="card flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-4">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Construction Progress</span>
                    <span class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">🏗️</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-800">{data.stats.overallProgress}% Overall</h3>
                
                <div class="progress-bar-track my-3">
                    <div class="progress-bar-fill bg-emerald-600" style="width: {data.stats.overallProgress}%;"></div>
                </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <span class="text-xs font-bold text-slate-600">{data.stats.totalComponents} components · {data.project.milestones.length} milestones</span>
                <a href="/projects/{data.project.id}/construction" class="text-xs font-semibold text-indigo-600 hover:underline no-print" style="color: var(--primary);">View Construction →</a>
            </div>
        </div>
    </div>

    <!-- SECTION 3 — Feature Guide (collapsible accordion) -->
    <div class="card no-print">
        <div class="card-header">
            <div>
                <h4 class="card-title">HydroTrack Nepal — Platform Features</h4>
                <p class="card-subtitle">Click any section to explore what this platform tracks</p>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <!-- MODULE 1 Accordion -->
            <div class="border border-slate-100 rounded-lg overflow-hidden">
                <button onclick={() => activeAccordion = (activeAccordion === 'm1' ? '' : 'm1')} class="w-full flex justify-between items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition text-left border-none cursor-pointer">
                    <div class="flex items-center gap-2">
                        <span>🛡️</span>
                        <span class="font-bold text-xs uppercase text-slate-700 tracking-wider">Module 1: Regulatory &amp; License Tracker</span>
                        <span class="text-slate-400 text-xs italic ml-2">— Never miss a license deadline again</span>
                    </div>
                    <span class="text-xs text-slate-400 font-bold">{activeAccordion === 'm1' ? '▲' : '▼'}</span>
                </button>
                {#if activeAccordion === 'm1'}
                    <div class="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Tracks all 10 clearance types (Survey License, Generation License, EIA, Forest Clearance, Tree Cutting, PPA, etc.)</li>
                            <li>Automated email alerts at 90, 60, 30, and 7 days before any deadline</li>
                            <li>Document vault — all approval PDFs stored with version history</li>
                        </ul>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Overdue detection with responsible person assignment</li>
                            <li>Activity log — full audit trail of every status change</li>
                            <li>One-click "Mark as Approved" with automatic renewal deadline calculation</li>
                        </ul>
                    </div>
                {/if}
            </div>

            <!-- MODULE 2 Accordion -->
            <div class="border border-slate-100 rounded-lg overflow-hidden">
                <button onclick={() => activeAccordion = (activeAccordion === 'm2' ? '' : 'm2')} class="w-full flex justify-between items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition text-left border-none cursor-pointer">
                    <div class="flex items-center gap-2">
                        <span>📍</span>
                        <span class="font-bold text-xs uppercase text-slate-700 tracking-wider">Module 2: Land Acquisition Manager</span>
                        <span class="text-slate-400 text-xs italic ml-2">— Track every parcel from negotiation to registration</span>
                    </div>
                    <span class="text-xs text-slate-400 font-bold">{activeAccordion === 'm2' ? '▲' : '▼'}</span>
                </button>
                {#if activeAccordion === 'm2'}
                    <div class="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Parcel-by-parcel database (plot number, owner, ward, area, land type)</li>
                            <li>6 acquisition statuses: Not Initiated → Negotiation → Agreement → Paid → Registered → Disputed</li>
                            <li>Compensation tracking: agreed vs paid vs outstanding per parcel</li>
                            <li>Payment history with method, reference number, and date</li>
                        </ul>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Dispute tracking: reason, legal status, responsible handler</li>
                            <li>Bulk import from CSV — migrate existing Excel data instantly</li>
                            <li>Export to CSV — share with district office or consultant</li>
                            <li>Map view — color-coded pins on Leaflet map (green=registered, red=disputed)</li>
                        </ul>
                    </div>
                {/if}
            </div>

            <!-- MODULE 3 Accordion -->
            <div class="border border-slate-100 rounded-lg overflow-hidden">
                <button onclick={() => activeAccordion = (activeAccordion === 'm3' ? '' : 'm3')} class="w-full flex justify-between items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition text-left border-none cursor-pointer">
                    <div class="flex items-center gap-2">
                        <span>🏗️</span>
                        <span class="font-bold text-xs uppercase text-slate-700 tracking-wider">Module 3: Construction Progress Tracker</span>
                        <span class="text-slate-400 text-xs italic ml-2">— See where your project is bleeding time and money</span>
                    </div>
                    <span class="text-xs text-slate-400 font-bold">{activeAccordion === 'm3' ? '▲' : '▼'}</span>
                </button>
                {#if activeAccordion === 'm3'}
                    <div class="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Work Breakdown Structure (WBS) — 7 Nepal-hydro-specific components pre-configured</li>
                            <li>S-Curve chart — planned vs actual cumulative progress over time</li>
                            <li>Overall project progress — weighted average across all components</li>
                            <li>Schedule status per component: On Track / Slight Delay / Delayed / Critical</li>
                            <li>Milestone tracker — critical path milestones with planned vs actual dates</li>
                        </ul>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>Bank trigger milestones — flags milestones that release loan tranches</li>
                            <li>Contractor management — contract value, billing, certification, payment workflow</li>
                            <li>Bill certification workflow: Submitted → Certified → Paid</li>
                            <li>Retention tracking — automatically deducted from each certified bill</li>
                            <li>Daily site reports — work done, workers, weather, materials, issues</li>
                        </ul>
                    </div>
                {/if}
            </div>

            <!-- FUTURE Accordion -->
            <div class="border border-slate-100 rounded-lg overflow-hidden opacity-60">
                <button onclick={() => activeAccordion = (activeAccordion === 'future' ? '' : 'future')} class="w-full flex justify-between items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition text-left border-none cursor-pointer">
                    <div class="flex items-center gap-2">
                        <span>⏳</span>
                        <span class="font-bold text-xs uppercase text-slate-600 tracking-wider">Coming Soon — Future Modules</span>
                    </div>
                    <span class="text-xs text-slate-400 font-bold">{activeAccordion === 'future' ? '▲' : '▼'}</span>
                </button>
                {#if activeAccordion === 'future'}
                    <div class="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-100">
                        <ul class="list-disc pl-5 space-y-1">
                            <li>MODULE 4: Financial &amp; Loan Dashboard — Tranche tracking, DSCR, covenant monitoring</li>
                            <li>MODULE 5: Operations Monitor — NEA billing reconciliation, generation tracking</li>
                        </ul>
                        <ul class="list-disc pl-5 space-y-1">
                            <li>MODULE 6: EIA &amp; Community Relations — Environmental compliance, grievance portal</li>
                            <li>MODULE 7: Board Reporting — Auto-generated quarterly PDF reports</li>
                        </ul>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- SECTION 4 — Print footer -->
    <div class="print-footer mt-12 text-center border-t border-slate-200 pt-6 text-[10px] text-slate-400">
        <div class="flex justify-between items-center">
            <span>HydroTrack Nepal · hydrotrack.com.np · Generated: {new Date().toLocaleString()}</span>
            <span class="font-bold uppercase tracking-wider">Confidential — {data.project.name} Promoter Board</span>
        </div>
    </div>
</div>
