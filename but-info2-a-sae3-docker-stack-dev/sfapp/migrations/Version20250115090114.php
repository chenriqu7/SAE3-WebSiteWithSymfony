<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250115090114 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE acquisition_system_entity (id INT AUTO_INCREMENT NOT NULL, reference INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE room_entity (id INT AUTO_INCREMENT NOT NULL, acquisition_system_id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, number VARCHAR(255) NOT NULL, orientation VARCHAR(1) NOT NULL, nb_window INT NOT NULL, floor INT NOT NULL, state VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_4F6682A9331785FF (acquisition_system_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(180) NOT NULL, firstname VARCHAR(60) NOT NULL, lastname VARCHAR(60) NOT NULL, roles JSON NOT NULL COMMENT \'(DC2Type:json)\', password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE room_entity ADD CONSTRAINT FK_4F6682A9331785FF FOREIGN KEY (acquisition_system_id) REFERENCES acquisition_system_entity (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE room_entity DROP FOREIGN KEY FK_4F6682A9331785FF');
        $this->addSql('DROP TABLE acquisition_system_entity');
        $this->addSql('DROP TABLE room_entity');
        $this->addSql('DROP TABLE user');
    }
}
