<?php

namespace App\Controller;

use App\Entity\RoomEntity;
use App\Form\RoomAddFormType;
use App\Form\RoomAssignASType;
use App\Model\State;
use App\Repository\RoomRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class RoomController extends AbstractController
{
    #[IsGranted('ROLE_MISSION_MANAGER', exceptionCode: 403)]
    // Index route for displaying room forms and list
    #[Route('/room', name: 'app_room', methods: ['GET'])]
    public function index(Request $request, EntityManagerInterface $entityManager): Response
    {
        $room = new RoomEntity();
        $form_room = $this->createForm(RoomAddFormType::class, $room);
        $form_room_as = $this->createForm(RoomAssignASType::class, $room);

        // Handle form requests for both room creation and assignment
        $form_room->handleRequest($request);
        $form_room_as->handleRequest($request);

        return $this->render('room/index.html.twig', [
            'form_room' => $form_room,
            'form_room_as' => $form_room_as,
        ]);
    }

    // Handle room creation or update based on form submission
    #[IsGranted('ROLE_MISSION_MANAGER', exceptionCode: 403)]
    #[Route('/room', name: 'app_room_post', methods: ['POST'])]
    public function postRoom(
        Request $request,
        RoomRepository $roomRepository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        $room = new RoomEntity();

        // Process room creation or update
        $this->handleRoomCreationOrUpdate($request, $room, $roomRepository, $entityManager);

        return new JsonResponse([
            'status' => 'success',
            'message' => 'Room saved successfully',
        ]);
    }

    // Fetch and return room details by its number
    #[Route('/room/{number}/details', name: 'app_room_edit', methods: ['GET'])]
    public function roomInfo(RoomRepository $roomRepository, string $number): JsonResponse
    {
        $room = $roomRepository->findOneBy(['number' => $number]);

        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        return new JsonResponse([
            'id' => $room->getId(),
            'type' => $room->getType(),
            'number' => $room->getNumber(),
            'orientation' => $room->getOrientation(),
            'nbWindow' => $room->getNbWindow(),
            'floor' => $room->getFloor(),
            'state' => $room->getState(),
        ]);
    }

    // List all rooms and their states
    #[Route('/room/list', name: 'app_room_list', methods: ['GET'])]
    public function list(RoomRepository $roomRepository): JsonResponse
    {
        $rooms = $roomRepository->findAllOrderedByCustomStateFloorNumber();
        $roomList = array_map(fn($room) => [
            'id' => $room->getId(),
            'type' => $room->getType(),
            'number' => $room->getNumber(),
            'orientation' => $room->getOrientation(),
            'nbWindow' => $room->getNbWindow(),
            'floor' => $room->getFloor(),
            'state' => $room->getState(),
            'as' => $room->getAcquisitionSystem()?->getReference(),
            'color' => $room->getState()?->getColor(),
        ], $rooms);

        return new JsonResponse([
            'status' => 'success',
            'rooms' => $roomList,
        ]);
    }

    // Dissociate a room from its acquisition system
    #[IsGranted('ROLE_MISSION_MANAGER', exceptionCode: 403)]
    #[Route('/room/{number}/dissociate', name: 'app_room_dissociate_AS', methods: ['POST'])]
    public function dissociateAS(RoomRepository $roomRepository,
                                 EntityManagerInterface $entityManager, string $number): JsonResponse
    {
        $room = $roomRepository->findOneBy(['number' => $number]);
        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        // Reset room state and acquisition system
        $room->setAcquisitionSystem(null);
        $room->setState(State::DISPONIBLE);
        $entityManager->persist($room);
        $entityManager->flush();

        return new JsonResponse([
            'status' => 'success',
        ]);
    }

    /**
     * Utility method to handle room creation or update based on form submission.
     * @param Request $request
     * @param RoomEntity $room
     * @param RoomRepository $roomRepository
     * @param EntityManagerInterface $entityManager
     */
    private function handleRoomCreationOrUpdate(Request $request, RoomEntity $room, RoomRepository $roomRepository, EntityManagerInterface $entityManager): void
    {
        if ($form_data = $request->get('room_add_form')) {
            if (is_array($form_data) && isset($form_data['id'])) {
                $room_find = $roomRepository->findOneBy(['id' => $form_data['id']]);
                if ($room_find) {
                    $room = $room_find;
                } else {
                    $room->setState(State::DISPONIBLE);
                }
            }
        }

        if ($form_as_data = $request->get('room_assign_as')) {
            if (is_array($form_as_data) && isset($form_as_data['number'])) {
                $room_find = $roomRepository->findOneBy(['number' => $form_as_data['number']]);
                if ($room_find) {
                    $room = $room_find;
                    $room->setState(State::EN_ATTENTE);
                }
            }
        }

        // Handle the forms and save the room
        $form_room = $this->createForm(RoomAddFormType::class, $room);
        $form_room_as = $this->createForm(RoomAssignASType::class, $room);
        $form_room->handleRequest($request);
        $form_room_as->handleRequest($request);

        if ($form_room->isSubmitted() && $form_room->isValid() || $form_room_as->isSubmitted() && $form_room_as->isValid()) {

            if($room->getAcquisitionSystem() == null) {
                $room->setState(State::DISPONIBLE);
            }

            $entityManager->persist($room);
            $entityManager->flush();
        }
    }
}
