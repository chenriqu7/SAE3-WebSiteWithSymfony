<?php

namespace App\Controller;

use App\Entity\AcquisitionSystemEntity;
use App\Entity\RoomEntity;
use App\Form\AcquisitionAddFormType;
use App\Model\State;
use App\Repository\AcquisitionSystemRepository;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_MISSION_MANAGER', exceptionCode: 403)]
class AcquisitionController extends AbstractController
{
    // Display the acquisition page with a form and a sorted list of acquisition systems
    #[Route('/acquisition', name: 'app_acquisition_system', methods: ['GET'])]
    public function index(): Response
    {
        $acquisitionSystem = new AcquisitionSystemEntity();
        $form = $this->createForm(AcquisitionAddFormType::class, $acquisitionSystem);

        return $this->render('acquisition/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    // Handle form submission to create or update an acquisition system
    #[Route('/acquisition', name: 'app_acquisition_system_post', methods: ['POST'])]
    public function postAcquisitionSystem(
        Request $request,
        AcquisitionSystemRepository $acquisitionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $acquisitionSystem = new AcquisitionSystemEntity();

        // Check and retrieve existing acquisition system if ID is provided
        $form_data = $request->get('acquisition_add_form');
        if (is_array($form_data) && isset($form_data['id'])) {
            $existingSystem = $acquisitionRepository->findOneBy(['id' => $form_data['id']]);
            if ($existingSystem) {
                $acquisitionSystem = $existingSystem;
            }
        }

        $currentRoom = $acquisitionSystem->getRoomEntity();

        // Process form data
        $form = $this->createForm(AcquisitionAddFormType::class, $acquisitionSystem, [
            'current_room' => $currentRoom,
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $newRoom = $acquisitionSystem->getRoomEntity();

            // Update the state of the old room if changed
            if ($currentRoom && $currentRoom !== $newRoom) {
                $currentRoom->setState(State::DISPONIBLE);
                $currentRoom->setAcquisitionSystem(null);
                $entityManager->persist($currentRoom);
            }

            // Update the new room's state and link it to the acquisition system
            if ($newRoom) {
                $newRoom->setState(State::EN_ATTENTE);
                $newRoom->setAcquisitionSystem($acquisitionSystem);
                $entityManager->persist($newRoom);
            }

            $entityManager->persist($acquisitionSystem);
            $entityManager->flush();

            return new JsonResponse(['status' => 'success', 'message' => 'Acquisition system saved successfully']);
        }

        return new JsonResponse(['status' => 'error', 'message' => 'Acquisition system not saved']);
    }

    // Retrieve information about a specific acquisition system
    #[Route('/acquisition/info/{reference}', name: 'app_acquisition_system_edit', methods: ['GET'])]
    public function acquisitionInfo(
        AcquisitionSystemRepository $acquisitionRepository,
        RoomRepository $roomRepository,
        string $reference
    ): JsonResponse {
        $acquisition = $acquisitionRepository->findOneBy(['reference' => $reference]);

        if (!$acquisition) {
            return new JsonResponse(['error' => 'SA not found'], 404);
        }

        // Use the utility method to retrieve the list of rooms
        $roomList = $this->getAvailableRooms($roomRepository, $acquisition->getRoomEntity());

        return new JsonResponse([
            'id' => $acquisition->getId(),
            'reference' => $acquisition->getReference(),
            'roomEntity' => $acquisition->getRoomEntity()?->getNumber(),
            'room_available' => $roomList,
        ]);
    }

    #[Route('/acquisition/rooms_available', name: 'app_acquisition_system_rooms_available', methods: ['GET'])]
    public function roomsAvailable(RoomRepository $roomRepository): JsonResponse
    {
        // Use the utility method to retrieve the list of rooms
        $roomList = $this->getAvailableRooms($roomRepository);

        return new JsonResponse($roomList);
    }

    // Retrieve and return a list of all acquisition systems
    #[Route('/acquisition/list', name: 'app_acquisition_system_list', methods: ['GET'])]
    public function list(AcquisitionSystemRepository $acquisitionRepository): JsonResponse
    {
        $acquisitions = $acquisitionRepository->sortByStateReference();

        // Map acquisitions to an array for JSON response
        $acquisitionList = array_map(function ($acquisition) {
            $room = $acquisition->getRoomEntity();
            return [
                'id' => $acquisition->getId(),
                'reference' => $acquisition->getReference(),
                'state' => $acquisition->getState(),
                'color' => $acquisition->getState()?->getColor(),
                'room' => $room ? ['number' => $room->getNumber()] : null,
            ];
        }, $acquisitions);

        return new JsonResponse([
            'status' => 'success',
            'acquisitions' => $acquisitionList,
        ]);
    }

    /**
     * Utility method to retrieve available rooms.
     *
     * @param RoomRepository $roomRepository
     * @param ?RoomEntity $currentRoom Optional, include a specific room even if unavailable.
     * @return array<int|string, string|null> List of room IDs mapped to their numbers.
     */
    private function getAvailableRooms(RoomRepository $roomRepository, RoomEntity $currentRoom = null): array
    {
        $rooms = $roomRepository->findBy(['state' => State::DISPONIBLE]);

        // Include the current room if provided and not already available
        if ($currentRoom && !in_array($currentRoom, $rooms, true)) {
            $rooms[] = $currentRoom;
        }

        // Map room IDs to their numbers
        $roomList = [];
        foreach ($rooms as $room) {
            $roomList[$room->getId()] = $room->getNumber();
        }

        return $roomList;
    }
}
