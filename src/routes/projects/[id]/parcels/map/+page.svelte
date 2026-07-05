<script>
    import { onMount } from 'svelte';
    import { ChevronLeft } from '@lucide/svelte';

    let { data } = $props();
    let mapContainer = $state(null);
    let mapInstance = null;

    onMount(async () => {
        if (typeof window !== 'undefined' && mapContainer && data.parcels.length > 0) {
            const L = await import('leaflet');
            
            // Set default map view around first parcel coordinates
            const firstParcel = data.parcels[0];
            mapInstance = L.map(mapContainer).setView([firstParcel.latitude, firstParcel.longitude], 14);

            // Load OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);

            // Render pins for all parcels
            data.parcels.forEach(p => {
                let pinColor = '#1E40AF'; // Default blue
                if (p.isDisputed) pinColor = '#DC2626'; // Red for disputes
                else if (p.acquisitionStatus === 'land_registered') pinColor = '#059669'; // Green for registered

                // Standard HTML marker styling
                const customIcon = L.divIcon({
                    html: `<div style="background: ${pinColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
                    className: 'custom-map-pin',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });

                const marker = L.marker([p.latitude, p.longitude], { icon: customIcon }).addTo(mapInstance);

                const popupContent = `
                    <div style="font-family: Poppins, sans-serif; font-size: 11px;">
                        <h4 style="margin: 0 0 4px; font-weight: 700; color: #1e293b;">Plot Number: ${p.plotNumber}</h4>
                        <p style="margin: 0 0 2px;"><strong>Owner:</strong> ${p.ownerName}</p>
                        <p style="margin: 0 0 2px;"><strong>Area:</strong> ${p.areaRopani ? p.areaRopani.toFixed(2) : 'N/A'} Ropani (${p.areaSqm ? p.areaSqm.toFixed(1) : 'N/A'} SqM)</p>
                        <p style="margin: 0 0 4px;"><strong>Status:</strong> <span style="font-weight: 600; color: ${pinColor};">${p.acquisitionStatus.replace('_', ' ').toUpperCase()}</span></p>
                        <p style="margin: 0; font-size: 10px; color: #64748b;">Rs ${p.paidCompensation?.toLocaleString('en-IN')} paid of Rs ${p.agreedCompensation?.toLocaleString('en-IN')}</p>
                    </div>
                `;

                marker.bindPopup(popupContent);
            });
        }

        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    });
</script>

<svelte:head>
    <title>Land GPS Map - {data.project.name}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha255-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- Header -->
    <div>
        <a href="/projects/{data.project.id}/parcels" class="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2 text-decoration-none">
            <ChevronLeft size={16} /> Back to Land Acquisition
        </a>
        <h2 class="text-2xl font-bold text-slate-800">Land GPS Map</h2>
        <p class="text-slate-500 text-sm mt-0.5">Geographical coordinates of project land plots.</p>
    </div>

    <!-- Map container -->
    <div class="card p-0 overflow-hidden" style="height: 500px; border-radius: var(--radius-lg);">
        {#if data.parcels.length > 0}
            <div bind:this={mapContainer} style="height: 100%; width: 100%;"></div>
        {:else}
            <div class="flex flex-col items-center justify-center h-full text-slate-400 italic bg-slate-50">
                No parcels with coordinates seeded. Import or register coordinates to load pins.
            </div>
        {/if}
    </div>
</div>
