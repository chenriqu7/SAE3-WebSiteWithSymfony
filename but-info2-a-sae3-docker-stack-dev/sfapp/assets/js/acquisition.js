import '../styles/app.css';
import '../app.js';

const acsContainer = document.getElementById('acquisitions-container');

// Fetch modal elements
const modal = document.getElementById("modal");
const addAS = document.getElementById("add_AS");
const buttonLeave = document.getElementById("modal-leave");
const form = document.querySelector('form[name="acquisition_add_form"]');

// Filters
const filters_room = document.getElementById("filters_room") ;
const searchBar = document.getElementById("searchBar") ;
const stateFilter = document.getElementById('stateFilter');
const clearFilters = document.getElementById("clearFilters") ;

// Fetch main content element
const mainPage = document.getElementById("main-content");

document.addEventListener('DOMContentLoaded', refreshAcquisitions);

// Close the modal and reset the form
buttonLeave.onclick = () => {
    modalClose();
    resetForm(); // Reset form fields when the modal is closed
};

// Reset form fields
function resetForm() {
    form.reset();
    form.querySelector('[name="acquisition_add_form[reference]"]').readOnly = false;
    form.querySelector('[name="acquisition_add_form[roomEntity]"]').innerHTML = '';
    form.querySelector('[name="acquisition_add_form[id]"]').value = '';
}

// Close modal
function modalClose() {
    modal.style.display = "none";
    mainPage.classList.remove("blur-sm", "pointer-events-none");
}

// Open modal
function modalOpen() {
    modal.style.display = "block";
    mainPage.classList.add("blur-sm", "pointer-events-none");
}

// Open modal and reset form when "Add AS" button is clicked
addAS.onclick = () => {
    document.getElementById("modal-title").textContent = "Ajout d'un nouveau SA";
    modalOpen();
    resetForm();
    loadRooms(); // Load available rooms via AJAX
};

// Load room options dynamically with AJAX
function loadRooms() {
    const roomSelect = form.querySelector('[name="acquisition_add_form[roomEntity]"]');

    fetch('/acquisition/rooms_available')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Erreur: ' + data.error);
                return;
            }

            roomSelect.innerHTML = '';
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Selectionner une salle';
            roomSelect.appendChild(option);

            Object.entries(data).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                roomSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur AJAX:', error));
}

// Add click event to edit acquisition button
function setASEditEvent(edit_as_btn) {
    edit_as_btn.addEventListener('click', (event) => {
        document.getElementById("modal-title").textContent = "Modifier un SA";
        const reference = event.target.closest('.as').querySelector('p').textContent.split('-')[1].trim();

        fetch(`/acquisition/info/${reference}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Erreur: ' + data.error);
                } else {
                    fillFormWithAcquisitionData(data); // Populate form with acquisition data
                }
            })
            .catch(error => console.error('Erreur AJAX:', error));
    });
}

// Populate form fields with acquisition data
function fillFormWithAcquisitionData(data) {
    const referenceInput = form.querySelector('[name="acquisition_add_form[reference]"]');
    referenceInput.readOnly = true;
    referenceInput.value = data.reference;
    form.querySelector('[name="acquisition_add_form[id]"]').value = data.id;

    const roomSelect = form.querySelector('[name="acquisition_add_form[roomEntity]"]');
    roomSelect.innerHTML = '';

    let selectedRoom = false;
    Object.entries(data.room_available).forEach(([key, value]) => {
        const isSelected = data.roomEntity && data.roomEntity === value;
        if (isSelected) selectedRoom = true;
        roomSelect.appendChild(new Option(value, key, isSelected, isSelected));
    });

    if (!selectedRoom) {
        roomSelect.appendChild(new Option('Selectionner une salle', '', true, true));
    }

    modalOpen(); // Reopen the modal
}

// Refresh the acquisition list via AJAX
function refreshAcquisitions() {
    fetch('/acquisition/list')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Erreur: ' + data.error);
            } else {
                const stateFilter = document.getElementById("stateFilter").value ;

                // Filtrer les salles selon les critères
                const filteredAcquisitionsState = data.acquisitions.filter(acquisition => {
                    return (
                        (stateFilter === "" || acquisition.state === stateFilter)
                    );
                })
                //updateFiltersOptions(filteredRoomsState);

                acsContainer.innerHTML = filteredAcquisitionsState.length === 0
                    ? `<div class="w-full p-6 bg-gray-100 flex justify-center items-center"><p class="text-center text-gray-600">Aucun SA n'a été trouvé</p></div>`
                    : filteredAcquisitionsState.map(ac => createAcquisitionElement(ac)).join('');

                // Reattach events to edit buttons after refresh
                document.querySelectorAll('.edit_AS').forEach(editAS => setASEditEvent(editAS));
            }
        })
        .catch(error => console.error('Erreur AJAX:', error));
}

// Create a single acquisition element
function createAcquisitionElement(ac) {
    return `
        <div class="p-4 w-1/4 h-52 bg-gray-50 rounded-lg border border-${ac.color} shadow-md shadow-${ac.color} hover:shadow-md hover:bg-gray-200 transition duration-300 cursor-pointer as flex flex-col justify-between">
            <p id="acquisition_number" class="text-xl font-semibold text-center text-gray-700">SA-${ac.reference}</p>
            <div class="flex items-center justify-center">
                <p class="text-gray-600 text-center"><strong>${ac.room ? `En ${ac.room.number}` : 'Pas de Salle'}</strong><br>${ac.state}</p>
            </div>
            <div class="flex justify-end justify-between mt-2">
            ${ac.state === 'Installé' ? '' : `
                <a class="edit_AS group/edit relative flex items-center whitespace-nowrap rounded-full py-1 pl-4 pr-3 text-sm text-slate-500 transition hover:bg-slate-300">
                    <span class="font-semibold transition group-hover/edit:text-gray-700">Modifier</span>
                </a>
            `}
                <a href="/acquisition/${ac.reference}/details" class="group/edit relative flex items-center whitespace-nowrap rounded-full py-1 pl-4 pr-3 text-sm text-slate-500 transition hover:bg-slate-300 invisible ">
                    <span class="font-semibold transition group-hover/edit:text-gray-700">Détails</span>
                    <svg class="mt-px h-5 w-5 text-slate-400 transition group-hover/edit:translate-x-0.5 group-hover/edit:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"></path>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

// Form submission handling with AJAX
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    fetch(form.action, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                modalClose();
                resetForm();
                refreshAcquisitions(); // Refresh acquisitions on success
            }
        })
        .catch(async (errorResponse) => {
            const errorData = await errorResponse.json();
            alert(`Erreur: ${errorData.message}`); // Display errors
        });
});

// Toggle visibility for filters
const toggleListVisibility = (listId, buttonId) => {
    const list = document.getElementById(listId);
    const button = document.getElementById(buttonId);
    const isHidden = list.classList.contains("hidden");

    list.classList.toggle("hidden", !isHidden);
    list.classList.toggle("flex", isHidden);
    button.classList.toggle("rotate-0", !isHidden);
    button.classList.toggle("rotate-90", isHidden);
};

filters_room.addEventListener('click', () => toggleListVisibility("filters", "btnFilters"));

searchBar.addEventListener('input', () => {
    const query = searchBar.value.toUpperCase();
    console.log("zizi") ;
    const acquisitions = acsContainer.getElementsByClassName('as');

    for (let i = 0; i < acquisitions.length; i++) {
        const acquisition = acquisitions[i];
        const acquisitionNumberElement = acquisition.querySelector('#acquisition_number') ;
        const searchedAcquisition = acquisitionNumberElement ? acquisitionNumberElement.textContent || acquisitionNumberElement.innerText : '';

        if (searchedAcquisition.toUpperCase().indexOf(query) > -1) {
            acquisition.style.display = "";
        } else {
            acquisition.style.display = "none";
        }
    }
});

stateFilter.addEventListener('input', refreshAcquisitions)

clearFilters.onclick = () => {
    searchBar.value = '' ;
    stateFilter.value = '' ;
    refreshAcquisitions() ;
}