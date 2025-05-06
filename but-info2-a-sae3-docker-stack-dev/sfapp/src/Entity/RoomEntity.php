<?php

namespace App\Entity;

use App\Model\State;
use App\Repository\RoomRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: RoomRepository::class)]
#[UniqueEntity(
    fields: ['number'],
    message: 'This number already exists',
)]
class RoomEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null; // @phpstan-ignore property.unusedType

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    private ?string $number = null;

    #[ORM\Column(length: 1)]
    private ?string $orientation = null;

    #[ORM\Column]
    private ?int $nbWindow = null;

    #[ORM\Column]
    private ?int $floor = null;

    #[ORM\Column(length: 255, enumType: State::class)]
    private ?State $state = null;

    #[ORM\OneToOne(inversedBy: 'roomEntity', cascade: ['persist', 'remove'])]
    private ?AcquisitionSystemEntity $AcquisitionSystem = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getNumber(): ?string
    {
        return $this->number;
    }

    public function setNumber(string $number): static
    {
        $this->number = $number;

        return $this;
    }

    public function getOrientation(): ?string
    {
        return $this->orientation;
    }

    public function setOrientation(string $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    public function getNbWindow(): ?int
    {
        return $this->nbWindow;
    }

    public function setNbWindow(int $nbWindow): static
    {
        $this->nbWindow = $nbWindow;

        return $this;
    }

    public function getFloor(): ?int
    {
        return $this->floor;
    }

    public function setFloor(int $floor): static
    {
        $this->floor = $floor;

        return $this;
    }

    public function getState(): ?State
    {
        return $this->state;
    }

    public function setState(?State $state): static
    {
        $this->state = $state;

        return $this;
    }

    public function getAcquisitionSystem(): ?AcquisitionSystemEntity
    {
        return $this->AcquisitionSystem;
    }

    public function setAcquisitionSystem(?AcquisitionSystemEntity $AcquisitionSystem): static
    {
        $this->AcquisitionSystem = $AcquisitionSystem;

        return $this;
    }
}
