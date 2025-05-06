<?php

namespace App\Form;

use App\Entity\AcquisitionSystemEntity;
use App\Entity\RoomEntity;
use App\Model\State;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Validator\Constraints\Regex;

class RoomAddFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('id', HiddenType::class, [
                'mapped' => false, // Exclude the ID field from form data mapping
                'required' => false, // Field is optional
            ])

            ->add('type',TextType::class,[
                'label' => 'Type :',
                'attr' => array('placeholder'=>'Salle de cours')

               ])
            ->add('number', TextType::class, [
                'label' => 'Numéro :',
                'attr' => [
                    'placeholder' => 'D206',
                    'pattern' => '^[CD][0-3]0[0-9]$',
                ],
                'constraints' => [
                    new Regex([
                        'pattern' => '/^[CD][0-3]0[0-9]$/',
                        'message' => 'Le numéro n\'est pas valide.',
                    ]),
                ],
            ])
            ->add('orientation',ChoiceType::class,[
                'label' => 'Orientation :',
                'choices' => ['Nord' => 'N',
                    'Sud' => 'S',
                    'Est' => 'E',
                    'Ouest' => 'O']


            ])
            ->add('nbWindow', IntegerType::class, ['attr' => ['min' => '0', 'max' => '999'],
                'label' => 'Fenêtre :',


            ])
            ->add('floor',IntegerType::class,['attr' => ['min' => '0', 'max' => '3'],
                'label' => 'Étage :',

            ]);

        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => RoomEntity::class,
        ]);
    }
}
