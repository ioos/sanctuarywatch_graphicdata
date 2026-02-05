document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById("front-page-map");

    // Check if map container exists and data is available
    if (
        !mapContainer ||
        typeof sanctuaryMapData === "undefined" ||
        !sanctuaryMapData.length
    ) {
        return;
    }

    // Check if Plotly is loaded
    if (typeof Plotly === "undefined") {
        console.error("Plotly is not loaded.");
        return;
    }

    // Prepare data for Plotly
    const lats = sanctuaryMapData.map((item) => parseFloat(item.lat));
    const lons = sanctuaryMapData.map((item) => parseFloat(item.lon));
    const texts = sanctuaryMapData.map((item) => item.title);
    const urls = sanctuaryMapData.map((item) => item.url);

    const data = [
        {
            type: "scattermapbox",
            lat: lats,
            lon: lons,
            mode: "markers",
            marker: {
                size: 14,
                color: "#00467F", // Sanctuary Watch Blue
            },
            text: texts,
            hoverinfo: "text",
            customdata: urls, // Store URLs in customdata
        },
    ];

    const layout = {
        mapbox: {
            style: "open-street-map", // generic style, no token needed usually or use white-bg
            center: { lat: 38, lon: -96 }, // Center of US roughly
            zoom: 3,
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 500,
        showlegend: false,
        hovermode: "closest",
        dragmode: "zoom",
    };

    const config = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["select2d", "lasso2d"],
    };

    Plotly.newPlot(mapContainer, data, layout, config);

    // Add click event for redirection
    mapContainer.on("plotly_click", function (data) {
        if (data.points.length > 0) {
            const url = data.points[0].customdata;
            if (url) {
                window.location.href = url;
            }
        }
    });

    // Change cursor on hover
    mapContainer.on("plotly_hover", function () {
        mapContainer.style.cursor = "pointer";
    });

    mapContainer.on("plotly_unhover", function () {
        mapContainer.style.cursor = "";
    });
});
