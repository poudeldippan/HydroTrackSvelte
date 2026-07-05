<script>
    import '../app.css';
    import { page } from '$app/state';
    import { 
        LayoutDashboard, 
        Briefcase, 
        Bell, 
        ShieldCheck, 
        MapPin, 
        Activity, 
        Info, 
        LogOut, 
        Menu,
        Zap
    } from '@lucide/svelte';

    let { data, children } = $props();
    let sidebarOpen = $state(false);

    // Watch active route paths
    let pathname = $derived(page.url.pathname);

    // Helper to format Nepal time
    let nepalTime = $state('');
    function updateTime() {
        const date = new Date();
        // Convert to Nepal time zone (UTC +5:45)
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const npl = new Date(utc + (3600000 * 5.75));
        
        let hours = npl.getHours();
        let minutes = npl.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        nepalTime = `${hours}:${minutes} ${ampm}`;
    }
    
    $effect(() => {
        updateTime();
        const interval = setInterval(updateTime, 10000);
        return () => clearInterval(interval);
    });
</script>

<div class="min-h-screen flex flex-col antialiased">
    <!-- Sidebar -->
    <aside 
        class="fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-800 md:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
        style="background: var(--sidebar-bg); z-index: 100;"
    >
        <div>
            <!-- Logo area -->
            <div class="px-5 py-6 border-b border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-indigo-600 flex items-center justify-center" style="background: var(--primary); border-radius: var(--radius-sm);">
                        <Zap size={18} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p class="text-white font-semibold text-sm tracking-tight leading-none">HydroTrack</p>
                        <p class="text-slate-500 text-[10px] font-normal leading-none mt-1">Nepal</p>
                    </div>
                </div>
            </div>

            <!-- Nav links -->
            <nav class="px-3 py-4 space-y-1">
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">Main Menu</p>

                <a 
                    href="/" 
                    class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                    style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname === '/' ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </a>

                <a 
                    href="/projects" 
                    class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                    style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.startsWith('/projects') && !pathname.includes('clearances') && !pathname.includes('parcels') && !pathname.includes('construction') && !pathname.includes('overview') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                >
                    <Briefcase size={16} />
                    Projects
                </a>

                <a 
                    href="/alerts" 
                    class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                    style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.startsWith('/alerts') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                >
                    <Bell size={16} />
                    <span>Alerts</span>
                    {#if data.alertCount > 0}
                        <span class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style="background: var(--danger); color: white;">
                            {data.alertCount}
                        </span>
                    {/if}
                </a>

                {#if data.activeProject}
                    <div class="h-px bg-slate-800 my-4"></div>
                    <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">Project Modules</p>

                    <a 
                        href="/projects/{data.activeProject.id}/clearances" 
                        class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                        style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.includes('clearances') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                    >
                        <ShieldCheck size={16} />
                        Clearances
                    </a>

                    <a 
                        href="/projects/{data.activeProject.id}/parcels" 
                        class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                        style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.includes('parcels') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                    >
                        <MapPin size={16} />
                        Land Parcels
                    </a>

                    <a 
                        href="/projects/{data.activeProject.id}/construction" 
                        class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                        style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.includes('construction') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                    >
                        <Activity size={16} />
                        Construction
                    </a>

                    <a 
                        href="/projects/{data.activeProject.id}/overview" 
                        class="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition hover:bg-slate-800 hover:text-white"
                        style="border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; {pathname.includes('overview') ? 'background: var(--sidebar-active-bg); color: var(--sidebar-active);' : 'color: var(--sidebar-text);'}"
                    >
                        <Info size={16} />
                        Overview
                    </a>
                {/if}
            </nav>
        </div>

        <!-- Bottom: User info -->
        <div class="px-5 py-4 border-t border-slate-800">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs" style="background: var(--primary);">
                        {data.user.initials}
                    </div>
                    <div class="truncate max-w-[100px]">
                        <p class="text-white font-semibold text-xs leading-none truncate">{data.user.name}</p>
                        <p class="text-slate-500 text-[10px] leading-none mt-1">Admin</p>
                    </div>
                </div>

                <a href="/logout" class="text-slate-500 hover:text-red-400 transition">
                    <LogOut size={16} />
                </a>
            </div>
        </div>
    </aside>

    <!-- Sidebar overlay for mobile -->
    {#if sidebarOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            onclick={() => sidebarOpen = false} 
            class="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
        ></div>
    {/if}

    <!-- Main content wrapper -->
    <div class="md:ml-60 flex-grow min-h-screen flex flex-col bg-slate-50" style="background: var(--page-bg);">
        <!-- Top header bar -->
        <header 
            class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30" 
            style="background: var(--white); border-bottom: 1px solid var(--border); box-shadow: var(--shadow-sm); height: 64px;"
        >
            <div class="flex items-center gap-3">
                <!-- Hamburger toggle for mobile -->
                <button 
                    onclick={() => sidebarOpen = !sidebarOpen} 
                    class="text-slate-500 md:hidden hover:text-slate-800 focus:outline-none"
                >
                    <Menu size={22} />
                </button>
            </div>

            <!-- Right side info -->
            <div class="flex items-center gap-4">
                <span class="text-xs text-slate-500 font-medium" style="color: var(--gray-500); font-size: 12px;">
                    Nepal Time: <span class="font-semibold text-slate-700">{nepalTime}</span>
                </span>
                <a href="/alerts" class="relative text-slate-500 hover:text-slate-700 transition" style="color: var(--gray-500);">
                    <Bell size={20} />
                    {#if data.alertCount > 0}
                        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style="background: var(--danger);"></span>
                    {/if}
                </a>
            </div>
        </header>

        <!-- Page content -->
        <main class="p-6 md:p-8 flex-grow">
            {@render children()}
        </main>
    </div>
</div>
