<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UserFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // $product = new Product();
        // $manager->persist($product);

        $missionManager = new User();
        $missionManager->setUsername('Manager');
        $missionManager->setFirstname('Pierre');
        $missionManager->setLastname('Dubois');
        $missionManager->setPassword(password_hash('password', PASSWORD_BCRYPT));
        $missionManager->setRoles(['ROLE_MISSION_MANAGER']);
        $manager->persist($missionManager);

        $technician = new User();
        $technician->setUsername('Tech');
        $technician->setFirstname('Marc');
        $technician->setLastname('Lefèvre');
        $technician->setPassword(password_hash('password', PASSWORD_BCRYPT));
        $technician->setRoles(['ROLE_TECHNICIAN']);
        $manager->persist($technician);

        $manager->flush();
    }
}
