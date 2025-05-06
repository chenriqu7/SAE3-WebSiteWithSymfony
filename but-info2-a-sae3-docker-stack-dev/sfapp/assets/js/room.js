import '../styles/app.css';
import '../app.js';

const roomContainer = document.getElementById('rooms-container');

// Modal and related elements
const mainPage = document.getElementById("roomMainPage");
const addRoom = document.getElementById("add_room");
const modal = document.getElementById("crud-modal");
const modalAssign = document.getElementById("crud-modal-assign");
const form = document.querySelector('form[name="room_add_form"]');
const formAssign = document.querySelector('form[name="room_assign_as"]');

// Modal control buttons
const buttonLeave = document.getElementById("modal-leave");
const buttonLeaveAssign = document.getElementById("modal-leave-assign");

// Filters
const filters_room = document.getElementById("filters_room") ;
const searchBar = document.getElementById("searchBar") ;
const stateFilter = document.getElementById('stateFilter');
const orientationFilter = document.getElementById("orientationFilter") ;
const nbWindowsFilter = document.getElementById("nbWindowsFilter") ;
const floorFilter = document.getElementById("floorFilter") ;
const clearFilters = document.getElementById("clearFilters") ;

// Refresh rooms on page load
document.addEventListener('DOMContentLoaded', refreshRooms);

buttonLeaveAssign.onclick = () => {
    modalAssign.style.display = "none";
    mainPage.classList.remove("blur-sm", "pointer-events-none");
}

buttonLeave.onclick = () => {
    modalClose();
    resetForm();
};

// Close modal and reset the form
function modalClose() {
    modal.style.display = "none";
    mainPage.classList.remove("blur-sm", "pointer-events-none");
}

// Open modal and apply background blur
function modalOpen() {
    modal.style.display = "block";
    mainPage.classList.add("blur-sm", "pointer-events-none");

}

// Reset form fields
function resetForm() {
    form.reset();
    const numberInput = form.querySelector('[name="room_add_form[number]"]');
    numberInput.readOnly = false;
    form.querySelector('[name="room_add_form[id]"]').value = '';
}

// Open modal for adding a new room
addRoom.onclick = () => {
    document.getElementById('RoomFormTitle').textContent = 'Ajouter une salle';
    modalOpen();
    resetForm();
};

function setRoomAssignEvent(assign_AS_btn) {
    assign_AS_btn.addEventListener('click', (event) => {
        formAssign.querySelector('[name="room_assign_as[number]"]').value = event.target.closest('.room').querySelector('p').textContent.replaceAll(" ", "");

        fetch(`/acquisition/list`)
            .then(response => response.json())
            .then(data => data.error ? alert('Erreur: ' + data.error) : fillFormAssignWithRoomData(data.acquisitions))
            .catch(error => console.error('Erreur AJAX:', error));

        modalAssign.style.display = "block";
        mainPage.classList.add("blur-sm","pointer-events-none");
    });
}

function setDissociateASEvent(dissociate_AS_btn) {
    dissociate_AS_btn.addEventListener('click', (event) => {
        if (!confirm("Voulez vous vraiment dissocier le SA de cette salle ?")) return;
        const number = event.target.closest('.room').querySelector('p').textContent.replaceAll(" ", "");

        fetch(`/room/${number}/dissociate`, { method: "POST" })
            .then(response => response.json())
            .then(data => data.error ? alert('Erreur: ' + data.error) : refreshRooms())
            .catch(error => console.error('Erreur AJAX:', error));
    });
}

function fillFormAssignWithRoomData(data) {
    const select = formAssign.querySelector('[name="room_assign_as[AcquisitionSystem]"]');
    select.innerHTML = '';
    select.appendChild(new Option('Selectionner un SA', '', true, true));

    data.forEach(as => {
        if (!as.room) {
            const option = document.createElement('option');
            option.value = as.id;
            option.textContent = `SA-${as.reference}`;
            select.appendChild(option);
        }
    });
}

// Handle room editing logic
function setRoomEditEvent(edit_room_btn) {
    edit_room_btn.addEventListener('click', (event) => {
        document.getElementById('RoomFormTitle').textContent = 'Modifier la salle';
        const number = event.target.closest('.room').querySelector('p').textContent.replaceAll(" ", "");

        fetch(`/room/${number}/details`)
            .then(response => response.json())
            .then(data => data.error ? alert('Erreur: ' + data.error) : fillFormWithRoomData(data))
            .catch(error => console.error('Erreur AJAX:', error));
    });
}

// Fill the form with fetched room data
function fillFormWithRoomData(data) {
    const numberInput = form.querySelector('[name="room_add_form[number]"]');
    numberInput.readOnly = true;
    numberInput.value = data.number;
    form.querySelector('[name="room_add_form[id]"]').value = data.id;
    form.querySelector('[name="room_add_form[type]"]').value = data.type;
    form.querySelector('[name="room_add_form[orientation]"]').value = data.orientation;
    form.querySelector('[name="room_add_form[nbWindow]"]').value = data.nbWindow;
    form.querySelector('[name="room_add_form[floor]"]').value = data.floor;

    modalOpen(); // Open modal with pre-filled data
}

// Refresh the room list dynamicallyroom_number
function refreshRooms() {
    fetch('/room/list')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Erreur: ' + data.error);
            } else {
                // Récupérer les filtres
                const orientationFilter = document.getElementById('orientationFilter').value; // Orientation
                const nbWindowsFilter = document.getElementById('nbWindowsFilter').value; // Nombre de fenêtres
                const floorFilter = document.getElementById('floorFilter').value; // Étage
                const stateFilter = document.getElementById("stateFilter").value ;

                // Filtrer les salles selon les critères
                const filteredRoomsState = data.rooms.filter(room => {
                    return (
                        (stateFilter === "" || room.state === stateFilter)
                    );
                })

                const filteredRooms = filteredRoomsState.filter(room => {
                    return (
                        (orientationFilter === "" || room.orientation == orientationFilter) &&
                        (nbWindowsFilter === "" || room.nbWindow == nbWindowsFilter) &&
                        (floorFilter === "" || room.floor == floorFilter)
                    );
                });
                updateFiltersOptions(filteredRoomsState);



                // Générer et insérer le contenu filtré
                roomContainer.innerHTML = filteredRooms.length === 0
                    ? `<div class="w-full p-6 bg-gray-100 flex justify-center items-center"><p class="text-center text-gray-600">Aucune salle n'a été trouvée</p></div>`
                    : filteredRooms.map(room => createRoomElement(room)).join('');

                // Attacher les événements nécessaires
                document.querySelectorAll('.edit_room').forEach(setRoomEditEvent);
                document.querySelectorAll('.assign_AS').forEach(setRoomAssignEvent);
                document.querySelectorAll('.dissociate_AS').forEach(setDissociateASEvent);
            }
        })
        .catch(error => console.error('Erreur AJAX:', error));
}


// Create room element from room data
function createRoomElement(room) {
    return `
        <div class="p-4 w-1/4 h-52 bg-gray-50 rounded-lg border border-${room.color} shadow-md shadow-${room.color} hover:shadow-md hover:bg-gray-200 transition duration-300 cursor-pointer room flex flex-col justify-between" data-orientation="${room.orientation}">
            <p id="room_number" class="text-xl font-semibold text-center text-gray-700">${room.number}</p>
            <div class="flex items-center justify-center">
                <p id="room_state" class="text-gray-600 text-center"><strong>${room.as ? `SA-${room.as}` : 'Pas de SA'}</strong>${room.state === 'En stock' ? '' : `<br>${room.state}`}</p>
            </div>
            <div class="flex justify-end justify-between mt-2">
                <a class="edit_room group/edit relative flex items-center whitespace-nowrap rounded-full py-1 pl-4 pr-3 text-sm text-slate-500 transition hover:bg-slate-300">
                    <span class="font-semibold transition group-hover/edit:text-gray-700">Modifier</span>
                </a>
                ${room.state === "En stock" ? `<a class="assign_AS group/edit relative flex items-center whitespace-nowrap rounded-full py-1 p-3 text-sm text-slate-500 transition hover:bg-slate-300" title="Ajouter un SA à la salle"><span class="font-semibold transition group-hover/edit:text-gray-700">Attibuer SA</span></a>` : ''}
                ${room.state === "En attente d'installation" ? `<a class="dissociate_AS group/edit relative flex items-center whitespace-nowrap rounded-full py-1 p-3 text-sm text-slate-500 transition hover:bg-slate-300" title="Supprimer le SA attribué"><span class="font-semibold transition group-hover/edit:text-gray-700">Désattribuer</span></a>` : ''}
                <a href='/dashboard/${room.number}' class="details_room group/edit relative flex items-center whitespace-nowrap rounded-full py-1 pl-4 pr-3 text-sm text-slate-500 transition hover:bg-slate-300">
                    <span class="font-semibold transition group-hover/edit:text-gray-700">Détails</span>
                    <svg class="mt-px h-5 w-5 text-slate-400 transition group-hover/edit:translate-x-0.5 group-hover/edit:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"></path>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

function updateFiltersOptions(rooms) {
    const previousOrientationValue = document.getElementById('orientationFilter').value;
    const previousNbWindowsValue = document.getElementById('nbWindowsFilter').value;
    const previousFloorValue = document.getElementById('floorFilter').value;

    const uniqueOrientations = [...new Set(rooms.map(room => room.orientation))];
    const uniqueNbWindows = [...new Set(rooms.map(room => room.nbWindow))].sort() ;
    const uniqueFloors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);


    orientationFilter.innerHTML = '<option value="">...</option>' +
        uniqueOrientations.map(orientation => `<option value="${orientation}">${orientation}</option>`).join('');
    orientationFilter.value = previousOrientationValue;

    nbWindowsFilter.innerHTML = '<option value="">...</option>' +
        uniqueNbWindows.map(nbWindow => `<option value="${nbWindow}">${nbWindow}</option>`).join('') ;
    nbWindowsFilter.value = previousNbWindowsValue ;

    floorFilter.innerHTML = '<option value="">...</option>' +
        uniqueFloors.map(floor => `<option value="${floor}">${floor}</option>`).join('');
    floorFilter.value = previousFloorValue;
}


// Handle form submissions
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    fetch(form.action, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                modalClose();
                resetForm();
                refreshRooms();
            }
        })
        .catch(error => alert(`Erreur: ${error}`));
});

formAssign.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formAssign);
    fetch(formAssign.action, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                modalAssign.style.display = "none";
                mainPage.classList.remove("blur-sm","pointer-events-none");
                refreshRooms();
            }
        })
        .catch(error => alert(`Erreur: ${error}`));
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
    const rooms = roomContainer.getElementsByClassName('room');

    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const roomNumberElement = room.querySelector('#room_number') ;
        const searchedRoom = roomNumberElement ? roomNumberElement.textContent || roomNumberElement.innerText : '';

        if (searchedRoom.toUpperCase().indexOf(query) > -1) {
            room.style.display = "";
        } else {
            room.style.display = "none";
        }
    }
});

stateFilter.addEventListener('input', refreshRooms)
orientationFilter.addEventListener('input', refreshRooms)
nbWindowsFilter.addEventListener('input', refreshRooms)
floorFilter.addEventListener('input', refreshRooms)

clearFilters.onclick = () => {
    searchBar.value = '' ;
    stateFilter.value = '' ;
    orientationFilter.value = '' ;
    nbWindowsFilter.value = '' ;
    floorFilter.value = '' ;
    refreshRooms() ;
}