// IoT Fleet Tracking Dashboard JavaScript

let currentSection = 'vehicles';

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadData('vehicles');
    loadData('shipments');
    loadData('telemetry');
});

// Navigation functions
function showSection(sectionName) {
    // Update active button
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show selected section
    document.querySelectorAll('.data-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    currentSection = sectionName;
}

function refreshData() {
    loadData('vehicles');
    loadData('shipments');
    loadData('telemetry');
}

// Load data from API
async function loadData(endpoint) {
    const contentDiv = document.getElementById(`${endpoint}-content`);
    contentDiv.innerHTML = '<div class="loading">Loading ' + endpoint + '...</div>';

    try {
        const response = await fetch(`/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (endpoint === 'vehicles') {
            displayVehicles(data);
        } else if (endpoint === 'shipments') {
            displayShipments(data);
        } else if (endpoint === 'telemetry') {
            displayTelemetry(data);
        }
    } catch (error) {
        contentDiv.innerHTML = `<div class="error">Error loading ${endpoint}: ${error.message}</div>`;
    }
}

// Display vehicles data
function displayVehicles(vehicles) {
    if (vehicles.length === 0) {
        document.getElementById('vehicles-content').innerHTML = '<p>No vehicles found.</p>';
        return;
    }

    let html = '<div class="metrics">';
    html += '<div class="metric-card"><h3>Total Vehicles</h3><div class="metric-value">' + vehicles.length + '</div></div>';

    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    html += '<div class="metric-card"><h3>Active Vehicles</h3><div class="metric-value">' + activeVehicles + '</div></div>';

    const totalCapacity = vehicles.reduce((sum, v) => sum + v.load_capacity, 0);
    html += '<div class="metric-card"><h3>Total Capacity</h3><div class="metric-value">' + totalCapacity + '</div><div class="metric-unit">tons</div></div>';

    html += '</div>';

    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th>ID</th><th>Make & Model</th><th>Year</th><th>Capacity</th><th>Fuel Type</th><th>Status</th>';
    html += '</tr></thead><tbody>';

    vehicles.forEach(vehicle => {
        html += '<tr>';
        html += `<td>${vehicle._id}</td>`;
        html += `<td>${vehicle.make} ${vehicle.model}</td>`;
        html += `<td>${vehicle.year}</td>`;
        html += `<td>${vehicle.load_capacity}t</td>`;
        html += `<td>${vehicle.fuel_type}</td>`;
        html += `<td><span class="status-badge status-${vehicle.status}">${vehicle.status}</span></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('vehicles-content').innerHTML = html;
}

// Display shipments data
function displayShipments(shipments) {
    if (shipments.length === 0) {
        document.getElementById('shipments-content').innerHTML = '<p>No shipments found.</p>';
        return;
    }

    let html = '<div class="metrics">';
    html += '<div class="metric-card"><h3>Total Shipments</h3><div class="metric-value">' + shipments.length + '</div></div>';

    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    html += '<div class="metric-card"><h3>In Transit</h3><div class="metric-value">' + inTransit + '</div></div>';

    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    html += '<div class="metric-card"><h3>Total Weight</h3><div class="metric-value">' + totalWeight + '</div><div class="metric-unit">tons</div></div>';

    html += '</div>';

    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th>ID</th><th>Route</th><th>Weight</th><th>Priority</th><th>Vehicle</th><th>Status</th>';
    html += '</tr></thead><tbody>';

    shipments.forEach(shipment => {
        html += '<tr>';
        html += `<td>${shipment._id}</td>`;
        html += `<td>${shipment.origin} → ${shipment.destination}</td>`;
        html += `<td>${shipment.weight}t</td>`;
        html += `<td><span class="priority-${shipment.priority} status-badge">${shipment.priority}</span></td>`;
        html += `<td>${shipment.assigned_vehicle_id}</td>`;
        html += `<td><span class="status-badge status-${shipment.status.replace('-', '')}">${shipment.status}</span></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('shipments-content').innerHTML = html;
}

// Display telemetry data
function displayTelemetry(telemetry) {
    if (telemetry.length === 0) {
        document.getElementById('telemetry-content').innerHTML = '<p>No telemetry data found.</p>';
        return;
    }

    // Group by vehicle for better display
    const vehicleGroups = {};
    telemetry.forEach(record => {
        if (!vehicleGroups[record.vehicle_id]) {
            vehicleGroups[record.vehicle_id] = [];
        }
        vehicleGroups[record.vehicle_id].push(record);
    });

    let html = '<div class="metrics">';
    html += '<div class="metric-card"><h3>Total Records</h3><div class="metric-value">' + telemetry.length + '</div></div>';

    const uniqueVehicles = Object.keys(vehicleGroups).length;
    html += '<div class="metric-card"><h3>Vehicles Tracked</h3><div class="metric-value">' + uniqueVehicles + '</div></div>';

    const avgSpeed = telemetry.reduce((sum, t) => sum + t.metrics.speed, 0) / telemetry.length;
    html += '<div class="metric-card"><h3>Avg Speed</h3><div class="metric-value">' + avgSpeed.toFixed(1) + '</div><div class="metric-unit">km/h</div></div>';

    html += '</div>';

    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th>Vehicle ID</th><th>Timestamp</th><th>Location</th><th>Speed</th><th>Fuel Level</th><th>Engine Temp</th>';
    html += '</tr></thead><tbody>';

    // Sort by timestamp (most recent first) and take last 20 records
    const sortedTelemetry = telemetry
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);

    sortedTelemetry.forEach(record => {
        const timestamp = new Date(record.timestamp).toLocaleString();
        const location = `${record.gps.lat.toFixed(4)}, ${record.gps.lng.toFixed(4)}`;

        html += '<tr>';
        html += `<td>${record.vehicle_id}</td>`;
        html += `<td>${timestamp}</td>`;
        html += `<td>${location}</td>`;
        html += `<td>${record.metrics.speed} km/h</td>`;
        html += `<td>${record.metrics.fuel_level}%</td>`;
        html += `<td>${record.metrics.engine_temp}°C</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    if (telemetry.length > 20) {
        html += '<p style="text-align: center; margin-top: 1rem; color: #7f8c8d;">Showing latest 20 records out of ' + telemetry.length + ' total</p>';
    }

    document.getElementById('telemetry-content').innerHTML = html;
}
