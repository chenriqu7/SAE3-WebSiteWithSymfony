<?php

namespace App\Form;

use App\Entity\AcquisitionSystemEntity;
use App\Entity\RoomEntity;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RoomAssignASType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('number', HiddenType::class, [
                'mapped' => false,
                'required' => false,
            ])
            ->add('AcquisitionSystem', EntityType::class, [
                'label' => 'Système d\'acquisition',
                'class' => AcquisitionSystemEntity::class,
                'choice_label' => 'reference',
                'choice_value' => 'id',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => RoomEntity::class,
        ]);
    }
}