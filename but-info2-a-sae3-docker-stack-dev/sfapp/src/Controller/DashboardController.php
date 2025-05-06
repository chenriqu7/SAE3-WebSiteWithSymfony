<?php

namespace App\Controller;

use App\Model\State;
use App\Repository\AcquisitionSystemRepository;
use App\Repository\RoomRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    // Redirect to the dashboard main page
    #[Route('/', name: 'app_index')]
    public function index(): Response
    {
        return $this->redirectToRoute('app_dashboard_main');
    }


    // Display the dashboard for a specific room
    #[Route('/dashboard/{number}', name: 'app_dashboard',methods: ['GET'])]
    public function room(RoomRepository $roomRepository,string $number): Response
    {
        // Fetch the room by its number
        $room = $roomRepository->findOneBy(['number' => $number]);
        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        return $this->render('dashboard/index.html.twig', [
            'room' => $room,
        ]);

    }

    // Display the main dashboard
    #[Route('/dashboard', name: 'app_dashboard_main',methods: ['GET'])]
    public function dashboard(AcquisitionSystemRepository $acquisitionSystemRepository): Response
    {
        // Fetch all acquisition systems
        $acquisitions = $acquisitionSystemRepository->findAll();
        $acquisitionsInstalled = array_filter($acquisitions, fn($ac) => $ac->getState() === State::INSTALLE);


        return $this->render('dashboard/dashboard.html.twig', [
            'acquisitionsInstalled' => $acquisitionsInstalled,
        ]);

    }
}
