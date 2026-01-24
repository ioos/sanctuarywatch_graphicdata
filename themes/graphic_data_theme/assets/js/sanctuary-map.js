/**
 * Sanctuary Map View
 * 
 * Displays all sanctuaries (instances) on an interactive map using Leaflet.
 * Markers are clickable and navigate to the sanctuary detail page.
 */

(function () {
    'use strict';

    function initMap() {
        const mapContainer = document.getElementById('sanctuary-map');
        if (!mapContainer || !window.sanctuaryData || window.sanctuaryData.length === 0) {
            return;
        }

        // Initialize Leaflet map
        // default view (will be overridden by fitBounds)
        const map = L.map('sanctuary-map').setView([37.8, -96], 4);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const markers = [];
        const bounds = L.latLngBounds();

        // Add markers for each sanctuary
        window.sanctuaryData.forEach(sanctuary => {
            if (sanctuary.lat && sanctuary.lng) {
                const marker = L.marker([sanctuary.lat, sanctuary.lng]).addTo(map);

                // create popup content
                let popupContent = `<strong>${sanctuary.title}</strong>`;
                if (sanctuary.image) {
                    popupContent += `<br><img src="${sanctuary.image}" style="max-width:150px; height:auto; margin-top:5px;">`;
                }

                marker.bindPopup(popupContent);
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });

                // Add click handler to navigate
                marker.on('click', function () {
                    if (sanctuary.url) {
                        window.location.href = sanctuary.url;
                    }
                });

                markers.push(marker);
                bounds.extend([sanctuary.lat, sanctuary.lng]);
            }
        });

        // Fit map bounds to show all markers
        if (markers.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    // Initialize map when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
    } else {
        initMap();
    }

})();
