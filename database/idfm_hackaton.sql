SET NAMES 'utf8mb4';

-- Initialisation de la base
CREATE DATABASE IF NOT EXISTS `idfm_hackaton_2026` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `idfm_hackaton_2026`;

DROP TABLE IF EXISTS `paiement`;
DROP TABLE IF EXISTS `document`;
DROP TABLE IF EXISTS `forfait`;
DROP TABLE IF EXISTS `profil`;
DROP TABLE IF EXISTS `compte_connect`;

-- 1. Table Compte_Connect 
CREATE TABLE `compte_connect` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `firstName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `lastName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, 
    `role` enum('user','admin') NOT NULL DEFAULT 'user',
    `consentement_rgpd` tinyint(1) NOT NULL DEFAULT '1',
    `isVerified` tinyint(1) NOT NULL DEFAULT '0',
    `verificationToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `passwordResetToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `isBanned` tinyint(1) NOT NULL DEFAULT '0',
    `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Table Profil
CREATE TABLE `profil` (
    `id` int NOT NULL AUTO_INCREMENT,
    `compte_id` int NOT NULL,
    `type_profil` enum('Porteur','Payeur','Porteur-Payeur') NOT NULL DEFAULT 'Porteur-Payeur',
    `firstName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `lastName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `date_naissance` date NOT NULL,
    `profession` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `phoneNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `profilePicture` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `postalCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_profil_compte` FOREIGN KEY (`compte_id`) REFERENCES `compte_connect` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Table Abonnement 
CREATE TABLE `abonnement` (
    `id` int NOT NULL AUTO_INCREMENT,
    `porteur_id` int NOT NULL,
    `payeur_id` int NOT NULL,
    `type_forfait` enum('Navigo Annuel','Imagine R Etudiant','Imagine R Junior','Imagine R Scolaire','Liberté+','TST','Améthyste') NOT NULL,
    `statut` enum('Actif','Suspendu','A renouveler', 'En attente de validation') NOT NULL DEFAULT 'En attente de validation',
    `date_debut` date DEFAULT NULL,
    `date_fin` date DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_forfait_porteur` FOREIGN KEY (`porteur_id`) REFERENCES `profil` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_forfait_payeur` FOREIGN KEY (`payeur_id`) REFERENCES `profil` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Table Document
CREATE TABLE `document` (
    `id` int NOT NULL AUTO_INCREMENT,
    `profil_id` int NOT NULL,
    `type_document` enum('Pièce d''identité','Attestation de bourse','Justificatif TST','Photo d''identité') NOT NULL,
    `chemin_fichier` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `statut_verification` enum('En attente','Validé','Refusé') NOT NULL DEFAULT 'En attente',
    `commentaire_admin` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
    `uploadedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_document_profil` FOREIGN KEY (`profil_id`) REFERENCES `profil` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Table Paiement
CREATE TABLE `paiement` (
    `id` int NOT NULL AUTO_INCREMENT,
    `forfait_id` int NOT NULL,
    `payeur_id` int NOT NULL,
    `montant` decimal(10,2) NOT NULL,
    `type_paiement` enum('Prélèvement automatique','Paiement direct','Virement') NOT NULL,
    `statut_paiement` enum('Réussi','Échoué','En attente') NOT NULL DEFAULT 'En attente',
    `date_paiement` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_paiement_forfait` FOREIGN KEY (`forfait_id`) REFERENCES `forfait` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_paiement_payeur` FOREIGN KEY (`payeur_id`) REFERENCES `profil` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;