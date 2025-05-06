<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ErrorController extends AbstractController
{
    #[Route('/error', name: 'app_error')]
    public function show(): Response
    {
        return $this->render('exception/index.html.twig');
    }

    #[Route('/error/403', name: 'app_error_403')]
    public function show404(): Response
    {
        return $this->render('exception/access_denied.html.twig');
    }

}
