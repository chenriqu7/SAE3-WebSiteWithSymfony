<?php

namespace App\Repository;

use App\Entity\AcquisitionSystemEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AcquisitionSystemEntity>
 */
class AcquisitionSystemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AcquisitionSystemEntity::class);
    }

    /**
     * @return AcquisitionSystemEntity[] An array of AcquisitionSystem objects
     */
    public function sortByStateReference(): array
    {
        /** @var AcquisitionSystemEntity[] $results */
        $results = $this->createQueryBuilder('a')
            ->select('a')
            ->leftJoin('a.roomEntity', 'r')
            ->orderBy('r.state', 'ASC')
            ->addOrderBy('a.reference', 'ASC')
            ->getQuery()
            ->getResult();

        return $results;
    }

    //    /**
    //     * @return AcquisitionSystem[] Returns an array of AcquisitionSystem objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('a.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?AcquisitionSystem
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
