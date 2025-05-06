<?php

namespace App\Model;

/**
 * Enum class representing the states for rooms or acquisition systems.
 *
 * - DISPONIBLE: Indicates the room or system is available.
 * - EN_ATTENTE: Indicates the system is waiting for installation.
 * - INSTALLE: Indicates the system is installed.
 */
enum State : string
{
    case DISPONIBLE = 'En stock'; // State for available rooms/systems
    case EN_ATTENTE = 'En attente d\'installation'; // State for pending installation
    case INSTALLE = 'Installé'; // State for installed systems

    function getColor(): string
    {
        return match ($this) {
            State::DISPONIBLE => 'gray-500',
            State::EN_ATTENTE => 'orange-500',
            State::INSTALLE => 'green-700',
        };
    }
}