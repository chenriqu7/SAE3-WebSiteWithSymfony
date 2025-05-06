<?php

namespace App\Entity;

use App\Model\State;
use App\Repository\AcquisitionSystemRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: AcquisitionSystemRepository::class)]
#[UniqueEntity(
    fields: ['reference'],
    message: 'This reference is already used.'
    )]
class AcquisitionSystemEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null; // @phpstan-ignore property.unusedType

    #[ORM\Column]
    private ?int $reference = null;

    #[ORM\OneToOne(mappedBy: 'AcquisitionSystem', cascade: ['persist', 'remove'])]
    private ?RoomEntity $roomEntity = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?int
    {
        return $this->reference;
    }

    public function setReference(int $reference): static
    {
        $this->reference = $reference;

        return $this;
    }

    public function getRoomEntity(): ?RoomEntity
    {
        return $this->roomEntity;
    }

    public function setRoomEntity(?RoomEntity $roomEntity): static
    {
        // unset the owning side of the relation if necessary
        if ($roomEntity === null && $this->roomEntity !== null) {
            $this->roomEntity->setAcquisitionSystem(null);
        }

        // set the owning side of the relation if necessary
        if ($roomEntity !== null && $roomEntity->getAcquisitionSystem() !== $this) {
            $roomEntity->setAcquisitionSystem($this);
        }

        $this->roomEntity = $roomEntity;

        return $this;
    }

    public function getState(): ?State
    {
        if($this->roomEntity === null) {
            return State::DISPONIBLE;
        }

        return $this->roomEntity->getState();
    }

}
