<?php

namespace App\Controller;

use App\Entity\AcquisitionSystemEntity;
use App\Model\State;
use App\Repository\AcquisitionSystemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// This controller is for the technician to manage the installation of acquisition systems
#[IsGranted('ROLE_TECHNICIAN', exceptionCode: 403)]
class ManagementController extends AbstractController
{
    #[Route('/management', name: 'app_management', methods: ['GET'])]
    public function index(AcquisitionSystemRepository $acquisitionSystemRepository): Response
    {
        $acquisitions = $acquisitionSystemRepository->findAll();

        // Filter acquisitions by state
        $acquisitionsToInstall = array_filter($acquisitions, fn($ac) => $ac->getState() === State::EN_ATTENTE);
        $acquisitionsInstalled = array_filter($acquisitions, fn($ac) => $ac->getState() === State::INSTALLE);

        return $this->render('management/index.html.twig', [
            'acquisitionsToInstall' => $acquisitionsToInstall,
            'acquisitionsInstalled' => $acquisitionsInstalled,
        ]);
    }

    #[Route('/management/{reference}/install', name: 'app_management_install', methods: ['POST'])]
    public function install(EntityManagerInterface $entityManager, AcquisitionSystemRepository $acquisitionSystemRepository, int $reference): JsonResponse
    {

        // Find acquisition system by reference
        $acquisition = $acquisitionSystemRepository->findOneBy(['reference' => $reference]);
        if (!$acquisition) {
            return new JsonResponse(['error' => 'SA not found'], 404);
        }

        $room = $acquisition->getRoomEntity();
        if(!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        // Update acquisition system state
        $room->setState(State::INSTALLE) ;
        $entityManager->persist($room);
        $entityManager->flush();

        return new JsonResponse([
            'status' => 'success',
        ]);
    }
}
