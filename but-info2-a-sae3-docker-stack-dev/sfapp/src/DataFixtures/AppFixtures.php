<?php

namespace App\DataFixtures;

use App\Entity\AcquisitionSystemEntity;
use App\Entity\RoomEntity;
use App\Model\State;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $d205 = new RoomEntity();
        $d205->setNumber('D205');
        $d205->setState(State::INSTALLE);
        $d205->setType('Salle de cours');
        $d205->setFloor(2);
        $d205->setNbWindow(6);
        $d205->setOrientation('N');
        $manager->persist($d205);

        $sa4 = new AcquisitionSystemEntity();
        $sa4->setReference(4);
        $sa4->setRoomEntity($d205);
        $manager->persist($sa4);
        
        $d207 = new RoomEntity();
        $d207->setNumber('D207');
        $d207->setState(State::INSTALLE);
        $d207->setType('Salle de cours');
        $d207->setFloor(2);
        $d207->setNbWindow(6);
        $d207->setOrientation("N");
        $manager->persist($d207);
        
        $sa6 = new AcquisitionSystemEntity();
        $sa6->setReference(6);
        $sa6->setRoomEntity($d207);
        $manager->persist($sa6);
        
        $d204 = new RoomEntity();
        $d204->setNumber('D204');
        $d204->setState(State::INSTALLE);
        $d204->setType('Salle de cours');
        $d204->setFloor(2);
        $d204->setNbWindow(6);
        $d204->setOrientation("N");
        $manager->persist($d204);
        
        $sa14 = new AcquisitionSystemEntity();
        $sa14->setReference(14);
        $sa14->setRoomEntity($d204);
        $manager->persist($sa14);
        
        $d203 = new RoomEntity();
        $d203->setNumber('D203');
        $d203->setState(State::INSTALLE);
        $d203->setType('Salle de cours');
        $d203->setFloor(2);
        $d203->setNbWindow(6);
        $d203->setOrientation("N");
        $manager->persist($d203);
        
        $sa12 = new AcquisitionSystemEntity();
        $sa12->setReference(12);
        $sa12->setRoomEntity($d203);
        $manager->persist($sa12);
        
        $d303 = new RoomEntity();
        $d303->setNumber('D303');
        $d303->setState(State::INSTALLE);
        $d303->setType('Salle de cours');
        $d303->setFloor(3);
        $d303->setNbWindow(6);
        $d303->setOrientation("N");
        $manager->persist($d303);
        
        $sa5 = new AcquisitionSystemEntity();
        $sa5->setReference(5);
        $sa5->setRoomEntity($d303);
        $manager->persist($sa5);
        
        $d304 = new RoomEntity();
        $d304->setNumber('D304');
        $d304->setState(State::INSTALLE);
        $d304->setType('Salle de cours');
        $d304->setFloor(3);
        $d304->setNbWindow(6);
        $d304->setOrientation("N");
        $manager->persist($d304);
        
        $sa11 = new AcquisitionSystemEntity();
        $sa11->setReference(11);
        $sa11->setRoomEntity($d304);
        $manager->persist($sa11);
        
        $c101 = new RoomEntity();
        $c101->setNumber('C101');
        $c101->setState(State::INSTALLE);
        $c101->setType('Salle de cours');
        $c101->setFloor(1);
        $c101->setNbWindow(6);
        $c101->setOrientation("N");
        $manager->persist($c101);
        
        $sa7 = new AcquisitionSystemEntity();
        $sa7->setReference(7);
        $sa7->setRoomEntity($c101);
        
        $d109 = new RoomEntity();
        $d109->setNumber('D109');
        $d109->setState(State::INSTALLE);
        $d109->setType('Salle de cours');
        $d109->setFloor(1);
        $d109->setNbWindow(6);
        $d109->setOrientation("N");
        $manager->persist($d109);
        
        $sa24 = new AcquisitionSystemEntity();
        $sa24->setReference(24);
        $sa24->setRoomEntity($d109);
        $manager->persist($sa24);
            
        $d001 = new RoomEntity();
        $d001->setNumber('D001');
        $d001->setState(State::INSTALLE);
        $d001->setType('Salle de cours');
        $d001->setFloor(0);
        $d001->setNbWindow(6);
        $d001->setOrientation("N");
        $manager->persist($d001);
        
        $sa30 = new AcquisitionSystemEntity();
        $sa30->setReference(30);
        $sa30->setRoomEntity($d001);
        $manager->persist($sa30);
        
        $d002 = new RoomEntity();
        $d002->setNumber('D002');   
        $d002->setState(State::INSTALLE);
        $d002->setType('Salle de cours');
        $d002->setFloor(0);
        $d002->setNbWindow(6);
        $d002->setOrientation("N");
        $manager->persist($d002);
        
        $sa28 = new AcquisitionSystemEntity();
        $sa28->setReference(28);
        $sa28->setRoomEntity($d002);
        $manager->persist($sa28);

        $d004 = new RoomEntity();
        $d004->setNumber('D004');
        $d004->setState(State::INSTALLE);
        $d004->setType('Salle de cours');
        $d004->setFloor(0);
        $d004->setNbWindow(6);
        $d004->setOrientation("N");
        $manager->persist($d004);

        $sa20 = new AcquisitionSystemEntity();
        $sa20->setReference(20);
        $sa20->setRoomEntity($d004);
        $manager->persist($sa20);

        $c004 = new RoomEntity();
        $c004->setNumber('C004');
        $c004->setState(State::INSTALLE);
        $c004->setType('Salle de cours');
        $c004->setFloor(0);
        $c004->setNbWindow(6);
        $c004->setOrientation("N");
        $manager->persist($c004);

        $sa21 = new AcquisitionSystemEntity();
        $sa21->setReference(21);
        $sa21->setRoomEntity($c004);
        $manager->persist($sa21);

        $c007 = new RoomEntity();
        $c007->setNumber('C007');
        $c007->setState(State::INSTALLE);
        $c007->setType('Salle de cours');
        $c007->setFloor(0);
        $c007->setNbWindow(6);
        $c007->setOrientation("N");
        $manager->persist($c007);

        $sa22 = new AcquisitionSystemEntity();
        $sa22->setReference(22);
        $sa22->setRoomEntity($c007);
        $manager->persist($sa22);

        $secretariat = new RoomEntity();
        $secretariat->setNumber('Secrétariat');
        $secretariat->setState(State::INSTALLE);
        $secretariat->setType('Bureau');
        $secretariat->setFloor(0);
        $secretariat->setNbWindow(2);
        $secretariat->setOrientation("N");
        $manager->persist($secretariat);

        $sa26 = new AcquisitionSystemEntity();
        $sa26->setReference(26);
        $sa26->setRoomEntity($secretariat);

        $manager->flush();
    }
}
