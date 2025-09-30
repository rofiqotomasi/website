// Google Sheets API configuration
const SPREADSHEET_ID = '1s4322CgyXo82YuT1BChDJX9lwV0ODcIOcUVpp0ew_5w';
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // You'll need to get this from Google Cloud Console

// Function to fetch data from Google Sheets
async function fetchSheetData() {
    try {
        // Fetch sensor data (A2:A5)
        const sensorResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A2:A5?key=${API_KEY}`
        );
        
        // Fetch actuator data (B2:B5)
        const actuatorResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!B2:B5?key=${API_KEY}`
        );

        const sensorData = await sensorResponse.json();
        const actuatorData = await actuatorResponse.json();

        // Update sensor values
        if (sensorData.values && sensorData.values.length >= 4) {
            document.getElementById('sensor1-value').textContent = sensorData.values[0][0] || '--';
            document.getElementById('sensor4-value').textContent = sensorData.values[3][0] || '--';
        }

        // Update actuator values
        if (actuatorData.values && actuatorData.values.length >= 4) {
            for (let i = 0; i < 4; i++) {
                const element = document.getElementById(`actuator${i+1}-value`);
                if (element) {
                    element.textContent = actuatorData.values[i][0] || '--';
                }
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initial data fetch
fetchSheetData();

// Update data every 5 seconds
setInterval(fetchSheetData, 5000);
