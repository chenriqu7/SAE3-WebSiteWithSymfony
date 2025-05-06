<?php

namespace App\Form;

use App\Entity\AcquisitionSystemEntity;
use App\Entity\RoomEntity;
use App\Model\State;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AcquisitionAddFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        // Retrieve the currently selected room from options
        $currentRoom = $options['current_room'];

        $builder
            // Add a hidden field for the acquisition system ID (EDIT mode)
            ->add('id', HiddenType::class, [
                'mapped' => false, // Exclude the ID field from form data mapping
                'required' => false,
            ])
            // Add a reference field as an integer input
            ->add('reference', IntegerType::class, [
                'attr' => ['min' => '0', 'max' => '999'], // Define minimum and maximum values
                'label' => 'Référence : ',
            ])
            // Add a dropdown for selecting a room entity
            ->add('roomEntity', EntityType::class, [
                'class' => RoomEntity::class,
                'choice_label' => 'number',
                'choice_value' => 'id',
                'label' => 'Numéro de salle : ',
                'query_builder' => function (EntityRepository $er) use ($options): QueryBuilder {
                    // Build the query to fetch available rooms
                    $qb = $er->createQueryBuilder('room')
                        ->orWhere('room.state = :state') // Include rooms marked as "available"
                        ->setParameter('state', State::DISPONIBLE);

                    // Include the currently selected room in the query if specified
                    if ($options['current_room']) {
                        $qb->orWhere('room = :current_room')
                            ->setParameter('current_room', $options['current_room']);
                    }

                    return $qb;
                },
                'preferred_choices' => function (RoomEntity $room) use ($options) {
                    // Mark the current room as a preferred choice in the dropdown
                    return $room === $options['current_room'];
                },
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => AcquisitionSystemEntity::class, // Specify the form's data class
            'current_room' => null, // Default value for the current room option
        ]);
    }
}
