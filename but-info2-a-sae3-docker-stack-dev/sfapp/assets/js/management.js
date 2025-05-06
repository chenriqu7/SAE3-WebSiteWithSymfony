import '../styles/app.css';
import '../app.js';
import {ESPDevice} from "./ESPDevice.js";

// Cache DOM elements
const modal = document.getElementById("modal");
const buttonLeave = document.getElementById("modal-leave");
const modalText = document.getElementById("modal-text");
const nextButton = document.getElementById("next");
const mainPage = document.getElementById("main-content");

const asInstallList = document.getElementById("as_install_list");
const asInstalledList = document.getElementById("as_installed_list");

document.addEventListener('DOMContentLoaded', () => {
    // Initialize install events
    document.querySelectorAll('.install_AS').forEach(installAS => {
        installAS.addEventListener('click', handleInstallClick);
    });
});

// Toggle visibility for lists
const toggleListVisibility = (listId, buttonId) => {
    const list = document.getElementById(listId);
    const button = document.getElementById(buttonId);
    const isHidden = list.classList.contains("hidden");

    list.classList.toggle("hidden", !isHidden);
    list.classList.toggle("flex", isHidden);
    button.classList.toggle("rotate-0", !isHidden);
    button.classList.toggle("rotate-90", isHidden);
};

asInstallList.addEventListener('click', () => toggleListVisibility("asList", "btnList"));
asInstalledList.addEventListener('click', () => toggleListVisibility("asInstalledList", "btnListInstalled"));

// Close the modal and reset the form
buttonLeave.addEventListener('click', () => location.reload());

// Open modal
function modalOpen() {
    modal.style.display = "block";
    mainPage.classList.add("blur-sm", "pointer-events-none");
    document.getElementById("modal-title").textContent = `Installation du SA n°${reference}`;
}

// Handle the installation button click event
let reference;

function handleInstallClick(event) {
    reference = event.target.closest('.as').querySelector('p').textContent.split('-')[1].trim();
    modalOpen();
}

// Handle Next Button Click (Next/Submit Installation)
nextButton.addEventListener('click', (event) => {
    if (event.target.innerText === "Suivant") {
        event.target.innerText = "Valider l'installation";
        event.target.classList.replace('hover:bg-slate-500', 'bg-green-400');
        event.target.disabled = true;
        modalText.innerHTML = generateInstallationDataHTML();
        fetchInstallationData().then(() => setInterval(fetchInstallationData, 5000));
    } else if (event.target.innerText === "Valider l'installation") {
        // POST the installation data
        fetch(`/management/${reference}/install`, {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Erreur: ' + data.error);
                } else {
                    location.reload();
                }
            });
    }
});

// Generate HTML for installation data table
function generateInstallationDataHTML() {

    return `
        <div class="p-4 bg-gray-100 rounded-lg shadow dark:bg-gray-800">
    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Données d'installation</h4>
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-4 py-2">Date</th>
                <th scope="col" class="px-4 py-2">CO2</th>
                <th scope="col" class="px-4 py-2">Humidité</th>
                <th scope="col" class="px-4 py-2">Température</th>
            </tr>
        </thead>
        <tbody class="animate-pulse" id="data-value">
         <tr class="border-b dark:border-gray-600">
             <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">...</td>
             <td id="co2-value" class="px-4 py-2">...</td>
             <td id="hum-value" class="px-4 py-2">...</td>
             <td id="temp-value" class="px-4 py-2">...</td>
        </tr>
        <tr class="border-b dark:border-gray-600">
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">...</td>
            <td id="co2-value" class="px-4 py-2">...</td>
            <td id="hum-value" class="px-4 py-2">...</td>
            <td id="temp-value" class="px-4 py-2">...</td>
        </tr>
        <tr class="border-b dark:border-gray-600">
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">...</td>
            <td id="co2-date" class="px-4 py-2">...</td>
            <td id="hum-date" class="px-4 py-2">...</td>
            <td id="temp-date" class="px-4 py-2">...</td>
        </tr>
        </tbody>
    </table>
</div>
    `;
}

// Fetch the installation data
async function fetchInstallationData() {


    const esp = `ESP-${reference.padStart(3, '0')}`;
    const espDevice = new ESPDevice(esp);

    // Options for formatting the date in Europe/Paris timezone
    const options = {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    // Date now
    const now = new Date();
    // Date 30 minutes before
    const minDate = formatDateToTimezone(new Date(now.getTime() - 5 * 60000), options).replace(' à ', ' ');


    const co2 = await espDevice.last_capture("co2", 3).then(datas => {//return list of values
        return datas.filter(data => data.dateCapture >= minDate)
            .map(data => {
                return {
                    date: removeDate(data.dateCapture),
                    value: data.valeur
                };
        });
    });

    const hum = await espDevice.last_capture("hum", 3).then(datas => {
        return datas.filter(data => data.dateCapture >= minDate)
            .map(data => {
                return {
                    date: removeDate(data.dateCapture),
                    value: data.valeur
                };
        });
    });

    const temp = await espDevice.last_capture("temp", 3).then(datas => {
        return datas.filter(data => data.dateCapture >= minDate)
            .map(data => {
                return {
                    date: removeDate(data.dateCapture),
                    value: data.valeur
                };
        });
    });

    console.log(co2, hum, temp);

    const datavalue = document.getElementById("data-value");

    if (co2.length !== 0 && hum.length !== 0 && temp.length !== 0) {
        nextButton.disabled = false;
        nextButton.classList.add('hover:bg-slate-500');
        datavalue.classList.remove('animate-pulse');
    }
    //add all the data to the table
    for (let i = 0; i < 3; i++) {
        const tr = datavalue.children[i];
        tr.children[0].textContent = co2[i] && hum[i] && temp[i] ? co2[i].date : "...";
        tr.children[1].textContent = co2[i] ? co2[i].value : "...";
        tr.children[2].textContent = hum[i] ? hum[i].value : "...";
        tr.children[3].textContent = temp[i] ? temp[i].value : "...";
    }

}

function formatDateToTimezone(date, options) {
    return new Intl.DateTimeFormat('fr-FR', options)
        .format(date)
        .replace(',', '') // Remove comma
        .replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'); // Convert DD/MM/YYYY to YYYY-MM-DD
}

function removeDate(date) {
    return date.split(' ')[1];
}
