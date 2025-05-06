import '../styles/app.css';
import '../app.js';
import { getSeason, getLimits } from "limitSeason";
import { ESPDevice } from "ESPDevice";

const HottestRoom = document.getElementById("hottestRoomValue");
const ColdestRoom = document.getElementById("coldestRoom");
const lastDataDateHot = document.getElementById("dateHot");
const lastDataDateCold = document.getElementById("dateCold");
const averageTempValue = document.getElementById("averageTemp");
const averageCO2Value = document.getElementById("averageCO2");
const averageHumValue = document.getElementById("averageHum");
const asInstalledList = document.getElementById("as_installed_list");

const asWarningList = document.getElementById("asWarningList");
const asWarningListContainer = document.getElementById("asWarningListContainer");
const warningListTitle = document.getElementById("warningListTitle");

const toggleListVisibility = (listId, buttonId) => {
    const list = document.getElementById(listId);
    const button = document.getElementById(buttonId);
    const isHidden = list.classList.contains("hidden");

    list.classList.toggle("hidden", !isHidden);
    list.classList.toggle("flex", isHidden);
    button.classList.toggle("rotate-0", !isHidden);
    button.classList.toggle("rotate-90", isHidden);
};
asInstalledList.addEventListener('click', () => toggleListVisibility("asInstalledList", "btnListInstalled"));

async function fetchDevices() {
    try {
        // Start fetching data
        console.log('Fetching device data...');

        // Send a GET request to '/room/list' to get the list of rooms
        const response = await fetch('/room/list');

        // Parse the JSON response
        const data = await response.json();
        console.log('Device data fetched:', data);

        // If the response indicates success
        if (data.status === 'success') {
            // Filter and format the rooms that are installed ('Installé')
            return data.rooms
                .filter(room => room.state === 'Installé') // Only rooms with state 'Installé'
                .map(room => ({
                    id: `ESP-${String(room.as).padStart(3, '0')}`, // Format ID (e.g., ESP-001)
                    localisation: room.number || 'Unknown Room', // Room number or fallback
                }));
        } else {
            // If the status is not 'success', log an error
            console.error('Failed to fetch device data', data);
        }
    } catch (error) {
        // Log any errors that occur during the fetch process
        console.error('Error fetching devices:', error);
    }
}



async function getDeviceData(device) {
    // Create an instance of ESPDevice using the device ID
    const esp = new ESPDevice(device.id);

    try {
        // Fetch the last captured data for temperature, humidity, and CO2 using Promise.all for parallel requests
        const [tempData, humData, co2Data] = await Promise.all([
            esp.last_capture('temp'), // Fetch temperature data
            esp.last_capture('hum'),  // Fetch humidity data
            esp.last_capture('co2'),  // Fetch CO2 data
        ]);

        // Extract and parse the values from the captured data, or return null if not available
        const temperature = tempData[0]?.valeur ? parseFloat(tempData[0].valeur) : null;
        const humidity = humData[0]?.valeur ? parseFloat(humData[0].valeur) : null;
        const co2 = co2Data[0]?.valeur ? parseFloat(co2Data[0].valeur).toFixed(0) : null;
        const date = co2Data[0]?.dateCapture || null;

        // Return the parsed values in an object
        return {
            temperature,
            humidity,
            co2,
            date
        };
    } catch (error) {
        // Log any errors that occur during data fetching
        console.error(`Error fetching data for device ${device.id}:`, error);

        // Return null for all values if an error occurs
        return {
            temperature: null,
            humidity: null,
            co2: null
        };
    }
}

const displayIndividualStats = (device, temp, co2, hum) => {
    // Clean the device ID by extracting the numeric part after the hyphen
    const cleanID = parseInt(device.id.split('-')[1], 10);

    // Select the room div based on the cleaned device ID
    const roomDiv = document.querySelector(`[data-reference="${cleanID}"]`);

    // Get the current season and the corresponding limits
    const season = getSeason();
    const limits = getLimits(season);

    if (roomDiv) {
        // Remove any previous border colors for a fresh start
        roomDiv.classList.remove('border-green-500');
        roomDiv.classList.remove('border-red-500');

        let hasWarning = false;  // Flag to track if there are any warnings
        roomDiv.classList.remove("hidden"); // Ensure the room is visible
        let borderColor = 'border-green-500'; // Default border color is green (no warnings)

        // Select elements to display each stat (temperature, CO2, humidity) and the warning icon/message
        const tempElement = roomDiv.querySelector('#eachRoomTemp');
        const co2Element = roomDiv.querySelector('#eachRoomCO2');
        const humElement = roomDiv.querySelector('#eachRoomHum');
        const warningLogo = roomDiv.querySelector('#warningLogo');
        const warningMessage = roomDiv.querySelector('#warningMessage');
        let warningReasons = []; // To store reasons for warnings

        // Handle the temperature display and check if it’s within the allowed range
        if (temp !== null && !isNaN(temp)) {
            tempElement.textContent = `${temp}°C`;
            if (temp < limits.temp.min) {
                warningReasons.push(`Temperature trop basse (< ${limits.temp.min}°C)`); // Warning for low temp
                hasWarning = true;
            } else if (temp > limits.temp.max) {
                warningReasons.push(`Temperature trop haute (> ${limits.temp.max}°C)`); // Warning for high temp
                hasWarning = true;
            }
        } else {
            tempElement.textContent = '❌';  // Display ❌ if the temperature is not valid
            hasWarning = true;  // Mark as a warning
        }

        // Handle the CO2 level display and check if it’s within the allowed range
        if (co2 !== null && !isNaN(co2)) {
            co2Element.textContent = `${co2}ppm`;
            if (co2 > limits.co2.max) {
                warningReasons.push(`Taux de CO2 (> ${limits.co2.max} ppm)`); // Warning for high CO2
                hasWarning = true;
            }
        } else {
            co2Element.textContent = '❌'; // Display ❌ if the CO2 data is not valid
            hasWarning = true; // Mark as a warning
        }

        // Handle the humidity display and check if it’s within the allowed range
        if (hum !== null && !isNaN(hum)) {
            humElement.textContent = `${hum}%`;
            if (hum < limits.hum.min) {
                warningReasons.push(`Humidité trop basse (< ${limits.hum.min}%)`); // Warning for low humidity
                hasWarning = true;
            } else if (hum > limits.hum.max) {
                warningReasons.push(`Humidité trop haute(> ${limits.hum.max}%)`); // Warning for high humidity
                hasWarning = true;
            }
        } else {
            humElement.textContent = '❌'; // Display ❌ if the humidity data is not valid
            hasWarning = true; // Mark as a warning
        }

        // If any warning exists, change border color to red and show the warning message
        if (hasWarning) {
            borderColor = 'border-red-500'; // Change border color to red
            warningLogo.classList.remove("hidden"); // Show the warning icon
            warningMessage.classList.remove("hidden"); // Show the warning message

            // Display the formatted warning reasons as a list
            warningMessage.innerHTML = warningReasons
                .map(reason => `<li>${reason}</li>`) // Format reasons as a list item
                .join('');
            warningMessage.style.listStyleType = 'disc';
            warningMessage.style.marginLeft = '20px';
            roomDiv.setAttribute("data-has-warning", "true"); // Set attribute to indicate the presence of a warning
        } else {
            // Hide warning elements if no warnings
            warningLogo.classList.add("hidden");
            warningMessage.classList.add("hidden");
            roomDiv.setAttribute("data-has-warning", "false"); // Set attribute to indicate no warning
        }

        // Apply the determined border color (green or red)
        roomDiv.classList.add(borderColor);
    }
};


async function processWarnings(devices) {
    // Clear the warnings list content
    asWarningList.innerHTML = "";

    // Hide the warning list container and title by default
    asWarningListContainer.classList.add("hidden");
    warningListTitle.classList.add("hidden");

    // Loop through each device to check for warnings
    for (const device of devices) {
        // Retrieve the list of warnings for the current device
        const errorsList = await wichWarning(device);

        // If there are warnings for the device, update the UI
        if (errorsList.length > 0) {
            // Unhide the warning list container and title
            asWarningListContainer.classList.remove("hidden");
            warningListTitle.classList.remove("hidden");

            // Combine the warnings into a single message
            const warningMessage = errorsList.join("\n");

            // Create the HTML for the warning list and append it to the container
            const warningHTML = createWarningList(device, warningMessage);
            asWarningList.innerHTML += warningHTML;
        }
    }
}

async function wichWarning(device) {
    // Initialize a new ESPDevice instance using the device ID
    const esp = new ESPDevice(device.id);

    // Fetch the last 50 captures for temperature, humidity, and CO2 in parallel
    const [tempData, humData, co2Data] = await Promise.all([
        esp.last_capture('temp', 50),
        esp.last_capture('hum', 50),
        esp.last_capture('co2', 50),
    ]);
    console.log('tab 30 val', [tempData, humData, co2Data]);

    // Function to calculate the average interval and standard deviation of capture timestamps
    const calculateAvg = (data) => {
        const timestamps = data.map(entry => new Date(entry.dateCapture).getTime()).sort((a, b) => a - b);
        const intervals = timestamps.slice(1).map((ts, index) => ts - timestamps[index]);
        const avg = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avg, 2), 0) / intervals.length;
        const stdDeviation = Math.sqrt(variance) + 60000;

        return { avg, stdDeviation };
    };

    // Extract the numerical ID from the device ID
    const cleanID = parseInt(device.id.split('-')[1], 10);

    // Locate the DOM element associated with the room
    const roomDiv = document.querySelector(`[data-reference="${cleanID}"]`);
    const tempElement = roomDiv.querySelector('#eachRoomTemp');
    const co2Element = roomDiv.querySelector('#eachRoomCO2');
    const humElement = roomDiv.querySelector('#eachRoomHum');

    // Calculate average intervals and deviations for each sensor type
    const tempAvg = calculateAvg(tempData);
    const humAvg = calculateAvg(humData);
    const co2Avg = calculateAvg(co2Data);

    const tempMeanInterval = tempAvg.avg + tempAvg.stdDeviation;
    const humMeanInterval = humAvg.avg + humAvg.stdDeviation;
    const co2MeanInterval = co2Avg.avg + co2Avg.stdDeviation;

    const currentDate = new Date();
    let errorsList = [];

    // Retrieve the latest captures for each sensor type
    const captureTemp = tempData[0];
    const dateTemp = new Date(captureTemp?.dateCapture);

    const captureHum = humData[0];
    const dateHum = new Date(captureHum?.dateCapture);

    const captureCo2 = co2Data[0];
    const dateCo2 = new Date(captureCo2?.dateCapture);

    let criticalError = false;

    // Check for disconnected sensors and log errors
    if (captureTemp === undefined) {
        errorsList.push("Capteur de température déconnecté");
        tempElement.textContent = '❌';
        criticalError = true;
    }
    if (captureHum === undefined) {
        errorsList.push("Capteur d'humidité déconnecté");
        humElement.textContent = '❌';
        criticalError = true;
    }
    if (captureCo2 === undefined) {
        errorsList.push("Capteur de CO2 déconnecté");
        co2Element.textContent = '❌';
        criticalError = true;
    }

    // Check if sensor data is outdated
    if (currentDate - dateTemp > tempMeanInterval) {
        errorsList.push("Capteur de température dysfonctionnel");
        tempElement.textContent = '❌';
        criticalError = true;
    }
    if (currentDate - dateHum > humMeanInterval) {
        errorsList.push("Capteur d'humidité dysfonctionnel");
        humElement.textContent = '❌';
        criticalError = true;
    }
    if (currentDate - dateCo2 > co2MeanInterval) {
        errorsList.push("Capteur de CO2 dysfonctionnel");
        co2Element.textContent = '❌';
        criticalError = true;
    }

    // Handle non-critical warnings if no critical errors are present
    if (!criticalError) {
        const hasWarning = roomDiv.getAttribute("data-has-warning") === "true";

        if (hasWarning) {
            const warningMessageList = roomDiv.querySelector("#warningMessage");
            const warnings = Array.from(warningMessageList.querySelectorAll("li"))
                .map(li => li.textContent.trim());
            errorsList.push(...warnings);
        }
    }

    // Return the list of errors and warnings for the device
    return errorsList;
}


function createWarningList(as, warningMessage) {
    // Extract the numerical ID from the device ID
    const cleanID = parseInt(as.id.split('-')[1], 10);

    // Replace newline characters with <br> for line breaks in the warning message
    const roomDiv = document.querySelector(`[data-reference="${cleanID}"]`);
    const warningLogo = roomDiv.querySelector('#warningLogo');
    const warningMessageList = roomDiv.querySelector('#warningMessage');

    // Update the room's border and show the warning icon
    roomDiv.classList.remove('border-green-500');
    roomDiv.classList.add('border-red-500');
    warningLogo.classList.remove('hidden');

    // Format the warning message to display line breaks
    const formattedWarningMessage = warningMessage.replace(/\n/g, "<br>");
    warningMessageList.innerHTML = formattedWarningMessage;
    warningMessageList.classList.remove('hidden');

    // Retrieve the user role from the DOM
    let userRole = document.getElementById('userRole').textContent;

    // Return the appropriate warning card based on the user's role
    if (userRole === 'Tech') {
        return `
        <div id="warningDiv" class="p-4 w-full sm:w-1/2 lg:w-1/4 h-52 bg-gray-50 rounded-lg border border-red-600 shadow-md shadow-red-600 hover:shadow-lg hover:bg-gray-200 transition duration-300 cursor-pointer flex flex-col justify-between flex-shrink-0 relative group">
            <a href="dashboard/${as.localisation}">
                <div class="z-20 absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 text-white text-sm px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Cliquez pour afficher les données précises
                </div>
            </a>
            <p class="text-xl font-semibold text-center text-gray-700">SA-${cleanID}</p>
            <div class="flex items-center justify-center mb-4 flex-col">
                <p class="text-gray-600 text-center">
                    <strong>${as.localisation}</strong><br>
                    <span class="text-sm text-gray-500 flex flex-col items-center">
                        Non résolu
                        <span id="warning_text" class="text-xs text-red-500 mt-2">${formattedWarningMessage}</span>
                    </span>
                </p>
            </div>
        </div>
        `;
    }

    return `
        <div id="warningDiv" class="p-4 w-full sm:w-1/2 lg:w-1/4 h-52 bg-gray-50 rounded-lg border border-red-600 shadow-md shadow-red-600 hover:shadow-lg hover:bg-gray-200 transition duration-300 cursor-pointer flex flex-col justify-between flex-shrink-0 relative group">
            <a href="dashboard/${as.localisation}">
                <div class="z-20 absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 text-white text-sm px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Cliquez pour afficher les données précises
                </div>
            </a>
            <p class="text-xl font-semibold text-center text-gray-700">${as.localisation}</p>
            <div class="flex items-center justify-center mb-4 flex-col">
                <p class="text-gray-600 text-center">
                    <strong>SA-${cleanID}</strong><br>
                    <span class="text-sm text-gray-500 flex flex-col items-center">
                        Non résolu
                        <span id="warning_text" class="text-xs text-red-500 mt-2">${formattedWarningMessage}</span>
                    </span>
                </p>
            </div>
        </div>
    `;
}

const displayStats = (
    hottestRoom,
    coldestRoom,
    totalTemp,
    totalHum,
    totalCo2,
    validDevicesTemp,
    validDevicesHum,
    validDevicesCO2
) => {
    // Remove previous color classes from elements
    HottestRoom.classList.remove('text-green-500', 'text-red-500');
    ColdestRoom.classList.remove('text-green-500', 'text-red-500');
    averageTempValue.classList.remove('text-green-500', 'text-red-500');
    averageHumValue.classList.remove('text-green-500', 'text-red-500');
    averageCO2Value.classList.remove('text-green-500', 'text-red-500');

    // Get the current season and temperature/humidity/CO2 limits for the season
    const season = getSeason();
    const limits = getLimits(season);

    // Display the hottest room
    if (hottestRoom) {
        HottestRoom.textContent = `${hottestRoom[0].localisation} (${hottestRoom[1]} °C)`;
        lastDataDateHot.textContent = hottestRoom[2];

        // Highlight the hottest room in red if out of limits, green otherwise
        HottestRoom.classList.add(hottestRoom[1] < limits.temp.min || hottestRoom[1] > limits.temp.max ? 'text-red-500' : 'text-green-500');
    } else {
        // Display default message if no data for the hottest room
        HottestRoom.textContent = 'No data available';
        lastDataDateHot.textContent = '';
    }

    // Display the coldest room
    if (coldestRoom) {
        ColdestRoom.textContent = `${coldestRoom[0].localisation} (${coldestRoom[1]} °C)`;
        lastDataDateCold.textContent = coldestRoom[2];

        // Highlight the coldest room in red if out of limits, green otherwise
        ColdestRoom.classList.add(coldestRoom[1] < limits.temp.min || coldestRoom[1] > limits.temp.max ? 'text-red-500' : 'text-green-500');
    } else {
        // Display default message if no data for the coldest room
        ColdestRoom.textContent = 'No data available';
        lastDataDateCold.textContent = '';
    }

    // Calculate and display average temperature
    const avgTemp = validDevicesTemp > 0 ? totalTemp / validDevicesTemp : 'N/A';
    averageTempValue.textContent = `${avgTemp.toFixed(2)} °C`;

    // Highlight the average temperature in red if out of limits, green otherwise
    averageTempValue.classList.add(avgTemp < limits.temp.min || avgTemp > limits.temp.max ? 'text-red-500' : 'text-green-500');

    // Calculate and display average humidity
    const avgHum = validDevicesHum > 0 ? totalHum / validDevicesHum : 'N/A';
    averageHumValue.textContent = `${avgHum.toFixed(2)} %`;

    // Highlight the average humidity in red if out of limits, green otherwise
    averageHumValue.classList.add(avgHum < limits.hum.min || avgHum > limits.hum.max ? 'text-red-500' : 'text-green-500');

    // Calculate and display average CO2 levels
    const avgCO2 = validDevicesCO2 > 0 ? totalCo2 / validDevicesCO2 : 'N/A';
    averageCO2Value.textContent = `${avgCO2.toFixed(0)} ppm`;

    // Highlight the average CO2 level in red if above the limit, green otherwise
    averageCO2Value.classList.add(avgCO2 > limits.co2.max ? 'text-red-500' : 'text-green-500');
};

function updateDeviceData() {
    fetchDevices().then(async devices => {
        // Initialize variables to store totals for temperature, CO2, and humidity
        let totalTemp = 0
        let totalCo2 = 0
        let totalHum = 0

        // Initialize counters for valid devices for each type of data
        let validDevicesTemp = 0
        let validDevicesHum = 0
        let validDevicesCO2 = 0


        let hottestRoom = null;
        let coldestRoom = null;

        // Map through the devices and fetch data for each one
        const fetchDevice = devices
            .map(device => {
                return getDeviceData(device).then(data => {

                    // Update the hottest room if the current temperature is higher
                    if (data.temperature !== null && !isNaN(data.temperature)) {
                        if (!hottestRoom || data.temperature > hottestRoom[1]) hottestRoom = [device, data.temperature, data.date];
                        if ((!coldestRoom || data.temperature < coldestRoom[1]) && data.temperature != null) coldestRoom = [device, data.temperature, data.date];

                        // Add to the total temperature and count valid devices
                        totalTemp += parseFloat(data.temperature);
                        validDevicesTemp += 1;
                    }

                    // If humidity data is valid, add it to the total and count valid devices
                    if (data.humidity !== null && !isNaN(data.humidity)) {
                        totalHum += parseFloat(data.humidity);
                        validDevicesHum += 1;
                    }

                    // If CO2 data is valid, add it to the total and count valid devices
                    if (data.co2 !== null && !isNaN(data.co2)) {
                        totalCo2 += parseFloat(data.co2);
                        validDevicesCO2 += 1;
                    }

                    // Display individual stats for the device
                    displayIndividualStats(device, data.temperature, data.co2, data.humidity);
                });
            });

        await Promise.all(fetchDevice);

        displayStats(
            hottestRoom,
            coldestRoom,
            totalTemp,
            totalHum,
            totalCo2,
            validDevicesTemp,
            validDevicesHum,
            validDevicesCO2
        );

        processWarnings(devices);
    })
}

setInterval(updateDeviceData, 120000);
updateDeviceData();

