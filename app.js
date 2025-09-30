// Google Sheets API configuration
const SPREADSHEET_ID = '1s4322CgyXo82YuT1BChDJX9lwV0ODcIOcUVpp0ew_5w';
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual Google API key

// Global variables
let isConnected = false;
let lastUpdateTime = null;

// Function to update status indicators
function updateStatusIndicators(connected) {
    const sensorStatus = document.getElementById('sensor-status');
    const actuatorStatus = document.getElementById('actuator-status');
    
    if (connected) {
        sensorStatus.classList.remove('offline');
        actuatorStatus.classList.remove('offline');
    } else {
        sensorStatus.classList.add('offline');
        actuatorStatus.classList.add('offline');
    }
}

// Function to show/hide error message
function showError(show, message = '') {
    const errorElement = document.getElementById('error-message');
    if (show) {
        errorElement.style.display = 'block';
        if (message) {
            errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        }
    } else {
        errorElement.style.display = 'none';
    }
}

// Function to update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('last-update-time').textContent = timeString;
    lastUpdateTime = now;
}

// Function to format sensor/actuator values
function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '--';
    }
    
    // Check if it's a number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
        return numValue.toFixed(2);
    }
    
    return value;
}

// Function to remove loading indicators
function removeLoadingIndicators() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.remove();
    });
}

// Function to fetch data from Google Sheets
async function fetchSheetData() {
    // Check if API key is configured
    if (API_KEY === 'YOUR_GOOGLE_API_KEY') {
        showError(true, 'Please configure your Google API key in app.js');
        updateStatusIndicators(false);
        return;
    }

    try {
        // Fetch sensor data (A2:A5)
        const sensorResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A2:A5?key=${API_KEY}`
        );
        
        // Fetch actuator data (B2:B5)
        const actuatorResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!B2:B5?key=${API_KEY}`
        );

        // Check if responses are ok
        if (!sensorResponse.ok || !actuatorResponse.ok) {
            throw new Error(`HTTP error! Sensor: ${sensorResponse.status}, Actuator: ${actuatorResponse.status}`);
        }

        const sensorData = await sensorResponse.json();
        const actuatorData = await actuatorResponse.json();

        // Check for API errors
        if (sensorData.error || actuatorData.error) {
            throw new Error(sensorData.error?.message || actuatorData.error?.message || 'API Error');
        }

        // Remove loading indicators on first successful load
        if (!isConnected) {
            removeLoadingIndicators();
        }

        // Update sensor values
        if (sensorData.values && sensorData.values.length >= 1) {
            const sensor1Value = sensorData.values[0] ? sensorData.values[0][0] : '--';
            const sensor4Value = sensorData.values.length >= 4 && sensorData.values[3] ? sensorData.values[3][0] : '--';
            
            document.getElementById('sensor1-value').textContent = formatValue(sensor1Value);
            document.getElementById('sensor4-value').textContent = formatValue(sensor4Value);
        }

        // Update actuator values
        if (actuatorData.values && actuatorData.values.length >= 1) {
            for (let i = 0; i < 4; i++) {
                const element = document.getElementById(`actuator${i+1}-value`);
                if (element) {
                    const value = actuatorData.values[i] ? actuatorData.values[i][0] : '--';
                    element.textContent = formatValue(value);
                }
            }
        }

        // Update connection status
        isConnected = true;
        updateStatusIndicators(true);
        showError(false);
        updateLastUpdateTime();

    } catch (error) {
        console.error('Error fetching data:', error);
        
        // Update connection status
        isConnected = false;
        updateStatusIndicators(false);
        
        // Show appropriate error message
        if (error.message.includes('API key')) {
            showError(true, 'Invalid API key. Please check your Google API configuration.');
        } else if (error.message.includes('403')) {
            showError(true, 'Access denied. Please check your Google Sheets permissions.');
        } else if (error.message.includes('404')) {
            showError(true, 'Spreadsheet not found. Please check the spreadsheet ID.');
        } else {
            showError(true, `Connection error: ${error.message}`);
        }
    }
}

// Initialize the dashboard
function initDashboard() {
    console.log('Initializing IoT Dashboard...');
    fetchSheetData();
}

// Initial data fetch when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Update data every 5 seconds
setInterval(fetchSheetData, 5000);

// Add visibility change handler to refresh when tab becomes active
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        fetchSheetData();
    }
});
