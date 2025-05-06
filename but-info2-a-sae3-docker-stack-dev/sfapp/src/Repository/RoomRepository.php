<?php

namespace App\Repository;

use App\Entity\RoomEntity;
use App\Model\State;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RoomEntity>
 */
class RoomRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RoomEntity::class);
    }

//    /**
//     * @return RoomEntity[] Returns an array of RoomEntity objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?RoomEntity
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

    /**
     * @return RoomEntity[] An array of RoomEntity objects
     */
    public function findAllOrderedByCustomStateFloorNumber(): array
    {
        /** @var RoomEntity[] $results */
        $results =  $this->createQueryBuilder('r')
            ->addSelect(
                "CASE 
            WHEN r.state = :disponible THEN 1
            WHEN r.state = :en_attente THEN 2
            WHEN r.state = :installe THEN 3
            ELSE 4
        END AS HIDDEN stateOrder"
            )
            ->setParameter('disponible', State::DISPONIBLE->value)
            ->setParameter('en_attente', State::EN_ATTENTE->value)
            ->setParameter('installe', State::INSTALLE->value)
            ->orderBy('stateOrder', 'ASC') // Order by stateOrder first
            ->addOrderBy('r.floor', 'ASC') // Then by floor
            ->addOrderBy('r.number', 'ASC') // Finally by number
            ->getQuery()
            ->getResult(); // This returns an array of RoomEntity objects

        return $results;
    }





}
