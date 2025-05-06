import '../styles/app.css';
import '../app.js';
import { ESPDevice } from "ESPDevice";
import { getSeason, getLimits } from "limitSeason";
import { Chart, LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, Filler, LineController, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';

Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, Filler, LineController, TimeScale);

const esp = `ESP-${window.currentSA.toString().padStart(3, '0')}`;
const DEVICE = new ESPDevice(esp);

const ctxTemp = document.getElementById('tempChart');
const ctxHumidity = document.getElementById('humidityChart');
const ctxCo2 = document.getElementById('co2Chart');
const timeScaleSelector = document.getElementById('timeScale');
const dataCards = document.querySelectorAll('.data-card'); // Sélectionne les cartes des données

let tempChartInstance = null;
let humidityChartInstance = null;
let co2ChartInstance = null;
let currentTimeScale = '24h';

const fetchSensorData = async (sensorType, timeScale) => {
    const now = new Date();
    let startDate, endDate = now, sensorValues = [];

    // Defind the start date and end date based on the time scale
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    if (timeScale === 'week' || timeScale === 'lastWeek') {
        startDate.setDate(startDate.getDate() - diffToMonday - (timeScale === 'week' ? 0 : 7));
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    if (isNaN(startDate.getTime())) {
        return { sensorValues: [] };
    }

    const data = await DEVICE.interval_capture(startDate.toISOString(), endDate.toISOString(), sensorType);

    // Format the data to be used in the chart
    data.forEach(entry => {
        const date = new Date(entry["dateCapture"]);

        sensorValues.push({ time: date, value: parseFloat(entry["valeur"]) });
    });

    return { sensorValues };
};

const updateChart = async (sensorType, ctx, chartInstance, label, color, unit, timeScale) => {
    chartInstance?.destroy();

    // Fetch the sensor data based on the sensor type and time scale
    const { sensorValues } = await fetchSensorData(sensorType, timeScale);
    const limit = getLimits(getSeason())[sensorType];
    const dataPoints = sensorValues.map(({ time, value }) => ({ x: time, y: value }));
    const values = dataPoints.map(({ y }) => y);
    const range = Math.max(...values) - Math.min(...values);

    // Adjust the min and max values based on the sensor type
    const roundedValue = (value, factor) =>
        Math[value > 0 ? 'ceil' : 'floor'](value / factor) * factor;

    let [adjustedMin, adjustedMax] = [
        roundedValue(Math.min(limit.min, ...values) - range * 0.8, 1),
        roundedValue(Math.max(limit.max, ...values) + range * 0.2, 1),
    ];

    if (sensorType === 'co2') adjustedMin = Math.max(350, adjustedMin);

    // Create the threshold lines for the chart
    const thresholds = ['max', 'min']
        .filter(type => type === 'max' || sensorType !== 'co2')
        .map(type => ({
            label: `Seuil ${type} : ${limit[type]}`,
            data: dataPoints.map(({ x }) => ({ x, y: limit[type] })),
            borderColor: type === 'max' ? 'red' : 'blue',
            borderDash: [10, 5],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
        }));

    // Hide the chart if there is no data
    const isEmpty = sensorValues.length === 0;
    ctx.classList.toggle('hidden', isEmpty);
    document.getElementById('chartError').style.display = isEmpty ? 'block' : 'none';

    if (isEmpty) return null;

    // Create the chart instance
    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    // Main data line
                    label,
                    data: dataPoints,
                    borderColor: color,
                    backgroundColor: `${color}1a`,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
                ...thresholds,
            ],
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    filter: ({ datasetIndex }) => datasetIndex === 0,
                },
                title: { display: true, text: `${label} (${timeScale === '24h' ? '24h' : 'Semaine'})` },
                legend: {
                    labels: {
                        usePointStyle: true,
                        // Generate custom labels for the legend
                        generateLabels: chart =>
                            chart.data.datasets.map((dataset, i) => ({
                                text: dataset.label,
                                fillStyle: !dataset.label.includes('Seuil') ? dataset.borderColor : undefined,
                                strokeStyle: dataset.label.includes('Seuil') ? dataset.borderColor : undefined,
                                lineWidth: dataset.label.includes('Seuil') ? 2 : 0,
                                lineDash: dataset.label.includes('Seuil') ? [5, 5] : [],
                                datasetIndex: i,
                                pointStyle: dataset.label.includes('Seuil') ? 'line' : 'rect',
                            })),
                    },
                },
            },
            interaction: { mode: 'nearest', intersect: false },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeScale === '24h' ? 'hour' : 'day',
                        displayFormats: { hour: 'HH:mm', day: 'EEEE d MMMM' },
                        tooltipFormat: 'PPPP HH:mm',
                    },
                    adapters: { date: { locale: fr } },
                    title: { display: true, text: timeScale === '24h' ? 'Heures' : 'Jours' },
                },
                y: {
                    min: roundedValue(adjustedMin, 0.5),
                    max: roundedValue(adjustedMax, 0.5),
                    title: { display: true, text: `${label} (${unit})` },
                    beginAtZero: true,
                },
            },
        },
    });
};



    function formatDate(date) {
    const units = [
        { label: 'an', value: 12 * 30 * 24 * 60 * 60 },
        { label: 'mois', value: 30 * 24 * 60 * 60 },
        { label: 'jour', value: 24 * 60 * 60 },
        { label: 'heure', value: 60 * 60 },
        { label: 'minute', value: 60 },
        { label: 'seconde', value: 1 },
    ];

    // Calculate the difference in seconds
    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    // Find the latest unit that fits the time difference
    for (const { label, value } of units) {
        const unitAmount = Math.floor(diff / value);
        if (unitAmount > 0) {
            return `il y a ${unitAmount} ${label}${unitAmount > 1 && label !== 'mois' ? 's' : ''}`;
        }
    }
    return "il y a moins d'une seconde";
}

function setRecommendation(datas, limits) {
    const messageStatus = document.getElementById('messageStatus');
    // Messages of recommendations for each sensor type
    const sensorMessages = {
        temp: {
            low: 'La température est trop basse. Augmentez le chauffage ou isolez mieux la pièce.',
            high: 'La température est trop élevée. Diminuez le chauffage ou ouvrez les fenêtres pour aérer.',
        },
        hum: {
            low: 'L\'humidité est trop faible. Utilisez un humidificateur ou placez un récipient d\'eau près d\'une source de chaleur.',
            high: 'L\'humidité est trop élevée. Utilisez un déshumidificateur ou aérez la pièce.',
        },
        co2: {
            high: 'Le niveau de CO2 est trop élevé. Aérez immédiatement en ouvrant les fenêtres.',
        },
    };

    // Get the recommendations based on the sensor values
    const recommendations = datas.reduce((acc, data) => {
        const { valeur: value, nom: sensorType } = data[0];
        const limit = limits[sensorType];
        if (!limit) return acc;

        if (value < limit.min && sensorMessages[sensorType]?.low) {
            acc.push(sensorMessages[sensorType].low);
        } else if (value > limit.max && sensorMessages[sensorType]?.high) {
            acc.push(sensorMessages[sensorType].high);
        }
        return acc;
    }, []);

    // Display the recommendations or the status message
    messageStatus.innerHTML = recommendations.length ?
        `<div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-md shadow-md">
             <p class="font-semibold">Recommandations :</p>
             <ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
         </div>`:
        `<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md">
             <p class="font-semibold">Tout est en ordre</p>
             <p>Les valeurs des capteurs sont dans les limites acceptables.</p>
         </div>`;
}

const updateRecommandations = async () => {
    const sensorTypes = ['temp', 'hum', 'co2'];

    // Get the last capture for each sensor type
    const deviceDatas = Promise.all(sensorTypes.map(async sensorType => {
        return await DEVICE.last_capture(sensorType);
    }));

    deviceDatas.then(datas => {

        // Get the current season and the limits for the sensors
        const currentSeason = getSeason();
        const limits = getLimits(currentSeason);

        // Update the sensor values and the recommendations
        datas.map((value) => {
            const sensorType = value[0]["nom"];
            const span = document.getElementById(sensorType);

            const unit = sensorType === 'temp' ? '°C' : (sensorType === 'hum' ? '%' : 'ppm');
            const limit = limits[sensorType];

            let val = parseFloat(value[0]["valeur"]).toFixed(2);
            if(sensorType === 'co2') val = Math.round(val);

            span.textContent = `${val} ${unit}`;
            if (val < limit.min || val > limit.max) {
                span.classList.replace('text-green-600', 'text-red-600');
            } else {
                span.classList.replace('text-red-600', 'text-green-600');
            }
        });

        setRecommendation(datas, limits);
    });

    // Get the last capture date
    DEVICE.last_capture().then(data => {
        document.getElementById('date').textContent = `${formatDate(data[0]["dateCapture"])}`;
    }).catch(error => {
        document.getElementById('date').textContent = 'Erreur de récupération';
    });

};

const updateData = async () => {
    await updateRecommandations();

    // Update the charts with the new data
    tempChartInstance = await updateChart('temp', ctxTemp, tempChartInstance, 'Température', '#00bcd4', '°C', currentTimeScale);
    humidityChartInstance = await updateChart('hum', ctxHumidity, humidityChartInstance, 'Humidité', '#ff9800', '%', currentTimeScale);
    co2ChartInstance = await updateChart('co2', ctxCo2, co2ChartInstance, 'CO2', '#4caf50', 'ppm', currentTimeScale);
};

// Function to hide all charts
const hideCharts = () => {
    document.querySelectorAll('.chart-container').forEach(chart => {
        chart.style.display = 'none';
    });
};

// Function to show the selected chart
const showSelectedChart = (chartId) => {
    hideCharts();
    document.getElementById(chartId).style.display = 'block';
    messageInstruction.style.display = 'none';
    timeScaleSelector.style.display = 'block';
};

// Add event listeners to the data cards to show the selected chart
dataCards.forEach((card) => {
    card.addEventListener('click', () => {
        const chartId = card.dataset.chart;
        showSelectedChart(chartId);
    });
});

// Add event listener to the details button to toggle the room details
document.getElementById('toggleDetails').addEventListener('click', function () {
    const details = document.getElementById('roomDetails');
    const isHidden = details.classList.contains('hidden');

    details.classList.toggle('hidden', !isHidden);
    this.textContent = isHidden ? 'Masquer les détails' : 'Afficher les détails';
});

// Add event listener to time scale selector
timeScaleSelector.addEventListener('change', async () => {
    currentTimeScale = timeScaleSelector.value;

    await updateData();
});

// Update the data every 2 minutes
if(window.currentSA) {
    updateData().then(() => setInterval(updateData, 120000));
}
