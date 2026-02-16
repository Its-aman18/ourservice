/* =====================================================
   SERVICE TAB SWITCHER
===================================================== */
function switchService(id) {
    document.querySelectorAll(".service-panel")
        .forEach(panel => panel.classList.remove("active"));

    document.querySelectorAll(".service-tab")
        .forEach(tab => tab.classList.remove("active"));

    document.getElementById("panel-" + id)
        .classList.add("active");

    document.getElementById("tab-" + id)
        .classList.add("active");

    if (id === "gps" && !mapInitialized) {
        initMap();
    }
}

/* =====================================================
   LEAFLET MAP SECTION
===================================================== */
let map;
let drawnItems;
let drawControl;
let mapInitialized = false;

function initMap() {

    if (mapInitialized) return;

    map = L.map("map").setView([28.9845, 77.7064], 12); // Meerut Default

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19
        }
    ).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.addLayer(e.layer);
        calculateArea(e.layer);
    });

    mapInitialized = true;
}

/* =====================================================
   LOCATION FUNCTIONS
===================================================== */
function getCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        map.setView([lat, lng], 16);

        L.marker([lat, lng]).addTo(map)
            .bindPopup("Your Location")
            .openPopup();

    });
}

async function searchLocation() {

    const query = document.getElementById("searchLocation").value;

    if (!query) return;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );

        const data = await response.json();

        if (data.length > 0) {

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            map.setView([lat, lon], 15);

            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(data[0].display_name)
                .openPopup();
        }

    } catch (error) {
        alert("Location search failed");
    }
}

/* =====================================================
   DRAWING & AREA CALCULATION
===================================================== */
function startDrawing() {

    if (drawControl) {
        map.removeControl(drawControl);
    }

    drawControl = new L.Control.Draw({
        draw: {
            polygon: true,
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });

    map.addControl(drawControl);
}

function calculateArea(layer) {

    const latlngs = layer.getLatLngs()[0];

    const coordinates = latlngs.map(ll => [ll.lng, ll.lat]);
    coordinates.push(coordinates[0]);

    const polygon = turf.polygon([coordinates]);

    const area = turf.area(polygon);
    const perimeter = turf.length(polygon, { units: "kilometers" }) * 1000;

    document.getElementById("areaSqM").textContent =
        area.toFixed(2);

    document.getElementById("areaAcre").textContent =
        (area / 4046.86).toFixed(4);

    document.getElementById("perimeter").textContent =
        perimeter.toFixed(2);

    document.getElementById("resultCard")
        .classList.add("show");
}

function clearAll() {
    drawnItems.clearLayers();
    document.getElementById("resultCard")
        .classList.remove("show");
}

/* =====================================================
   FERTILIZER CALCULATOR
===================================================== */
function calculateFertilizer() {

    const crop = document.getElementById("crop").value;
    const acres = parseFloat(
        document.getElementById("acres").value
    );

    if (!crop || !acres || acres <= 0) {
        alert("Please enter valid data");
        return;
    }

    const fertilizerData = {
        Wheat: { urea: 260, dap: 130 },
        Rice: { urea: 220, dap: 110 },
        Cotton: { urea: 325, dap: 130 },
        Sugarcane: { urea: 435, dap: 175 }
    };

    const data = fertilizerData[crop];

    const totalUrea = (data.urea * acres).toFixed(2);
    const totalDAP = (data.dap * acres).toFixed(2);

    const resultBox =
        document.getElementById("fertilizerResult");

    resultBox.innerHTML = `
        <div class="result-item">
            <span>Urea Required</span>
            <span>${totalUrea} kg</span>
        </div>
        <div class="result-item">
            <span>DAP Required</span>
            <span>${totalDAP} kg</span>
        </div>
    `;

    resultBox.classList.add("show");
}

/* =====================================================
   INITIALIZE ON LOAD
===================================================== */
window.onload = function () {
    initMap();
};
