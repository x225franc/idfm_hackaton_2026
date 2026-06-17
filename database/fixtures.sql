-- ============================================================
-- FIXTURES - Comutitres
-- Jeu de données de développement / démonstration
--
-- Comptes      : 8 (1 admin + 5 users actifs + 1 banni + 1 non vérifié)
-- Profils      : 6
-- Forfaits     : 6 (couvrant tous les types + statuts)
-- Documents    : 6 (mix En attente / Validé / Refusé)
-- Paiements    : 7
--
-- Mots de passe :
--   admin@comutitres.fr → Admin1234!
--   tous les autres     → Test1234!
-- ============================================================

SET NAMES 'utf8mb4';
USE `idfm_hackaton_2026`;

-- Vider dans l'ordre inverse des FK
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `paiement`;
TRUNCATE TABLE `document`;
TRUNCATE TABLE `forfait`;
TRUNCATE TABLE `profil`;
TRUNCATE TABLE `compte_connect`;
SET FOREIGN_KEY_CHECKS = 1;

-- ────────────────────────────────────────────────────────────
-- 1. COMPTES
-- ────────────────────────────────────────────────────────────
INSERT INTO `compte_connect`
  (id, firstName, lastName, email, password, role, consentement_rgpd, isVerified, isBanned, createdAt, updatedAt)
VALUES
  -- Admin
  (1, 'Admin', 'Comutitres',  'admin@comutitres.fr',        '$2b$10$8jm14opDZtPAckk8Tsg.kuaBN7V/PtV5xqtwuNnePa/B1hxaFUrJu', 'admin', 1, 1, 0, '2024-09-01 08:00:00', '2024-09-01 08:00:00'),

  -- Actif — Navigo Annuel
  (2, 'Jean',   'Dupont',     'jean.dupont@example.com',    '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-09-05 09:00:00', '2025-01-10 14:32:00'),

  -- Étudiante — Imagine R Etudiant
  (3, 'Marie',  'Martin',     'marie.martin@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-09-10 10:15:00', '2025-02-03 11:00:00'),

  -- Senior — Améthyste (forfait à renouveler)
  (4, 'Robert', 'Leclerc',    'robert.leclerc@example.com', '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-08-20 16:45:00', '2025-01-05 09:00:00'),

  -- Solidarité — TST (en attente de validation)
  (5, 'Fatima', 'Benali',     'fatima.benali@example.com',  '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-11-12 14:00:00', '2024-11-12 14:00:00'),

  -- Actif occasionnel — Liberté+
  (6, 'Lucas',  'Moreau',     'lucas.moreau@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2025-01-20 08:30:00', '2025-03-01 17:00:00'),

  -- Compte banni — forfait suspendu
  (7, 'Claire', 'Dubois',     'claire.dubois@example.com',  '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 1, '2024-10-01 11:00:00', '2025-02-14 09:00:00'),

  -- Compte non vérifié (isVerified=0)
  (8, 'Thomas', 'Petit',      'thomas.petit@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 0, 0, '2025-03-10 19:00:00', '2025-03-10 19:00:00');

-- ────────────────────────────────────────────────────────────
-- 2. PROFILS
-- ────────────────────────────────────────────────────────────
INSERT INTO `profil`
  (id, compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city, createdAt)
VALUES
  (1, 2, 'Porteur-Payeur', 'Jean',   'Dupont',  '1985-03-15', 'actif',      '0612345678', '12 rue de Rivoli',      '75001', 'Paris',      '2024-09-05 09:05:00'),
  (2, 3, 'Porteur-Payeur', 'Marie',  'Martin',  '2001-09-22', 'etudiant',   '0698765432', '5 avenue des Gobelins', '75013', 'Paris',      '2024-09-10 10:20:00'),
  (3, 4, 'Porteur-Payeur', 'Robert', 'Leclerc', '1955-06-10', 'senior',     '0145678901', '8 boulevard Voltaire',  '75011', 'Paris',      '2024-08-20 16:50:00'),
  (4, 5, 'Porteur-Payeur', 'Fatima', 'Benali',  '1990-11-03', 'solidarite', '0754321098', '23 rue du Temple',      '75003', 'Paris',      '2024-11-12 14:05:00'),
  (5, 6, 'Porteur-Payeur', 'Lucas',  'Moreau',  '1998-02-28', 'actif',      '0623456789', '47 rue Lecourbe',       '75015', 'Paris',      '2025-01-20 08:35:00'),
  (6, 7, 'Porteur-Payeur', 'Claire', 'Dubois',  '1992-07-14', 'actif',      '0687654321', '3 rue de la Paix',      '75002', 'Paris',      '2024-10-01 11:05:00');

-- ────────────────────────────────────────────────────────────
-- 3. FORFAITS
-- Valeurs type_forfait : 'Navigo Annuel' | 'Imagine R Etudiant' |
--   'Imagine R Junior' | 'Imagine R Scolaire' | 'Liberté+' | 'TST' | 'Améthyste'
-- Valeurs statut       : 'Actif' | 'Suspendu' | 'A renouveler' | 'En attente de validation'
-- ────────────────────────────────────────────────────────────
INSERT INTO `forfait`
  (id, porteur_id, payeur_id, type_forfait, statut, date_debut, date_fin)
VALUES
  -- Jean — Navigo Annuel actif
  (1, 1, 1, 'Navigo Annuel',        'Actif',                    '2025-01-01', '2025-12-31'),

  -- Marie — Imagine R Etudiant actif
  (2, 2, 2, 'Imagine R Etudiant',   'Actif',                    '2024-09-01', '2025-08-31'),

  -- Robert — Améthyste expiré, à renouveler
  (3, 3, 3, 'Améthyste',            'A renouveler',             '2024-01-01', '2024-12-31'),

  -- Fatima — TST en attente de validation admin
  (4, 4, 4, 'TST',                  'En attente de validation', NULL,         NULL),

  -- Lucas — Liberté+ actif
  (5, 5, 5, 'Liberté+',             'Actif',                    '2025-01-20', '2026-01-20'),

  -- Claire — Navigo Annuel suspendu (compte banni)
  (6, 6, 6, 'Navigo Annuel',        'Suspendu',                 '2024-10-01', '2025-09-30');

-- ────────────────────────────────────────────────────────────
-- 4. DOCUMENTS
-- Valeurs type_document : "Pièce d'identité" | 'Attestation de bourse' |
--   'Justificatif TST' | "Photo d'identité"
-- Valeurs statut        : 'En attente' | 'Validé' | 'Refusé'
-- ────────────────────────────────────────────────────────────
INSERT INTO `document`
  (id, profil_id, type_document, chemin_fichier, statut_verification, commentaire_admin, uploadedAt)
VALUES
  -- Jean — carte d'identité validée
  (1, 1, 'Pièce d''identité',    '/images/fixture-jean-cni.jpg',        'Validé',     NULL,                             '2024-09-05 09:10:00'),

  -- Marie — carte d'identité validée
  (2, 2, 'Pièce d''identité',    '/images/fixture-marie-cni.jpg',       'Validé',     NULL,                             '2024-09-10 10:25:00'),

  -- Marie — attestation de bourse en attente (visible dans le backoffice)
  (3, 2, 'Attestation de bourse','/images/fixture-marie-bourse.jpg',    'En attente', NULL,                             '2024-09-10 10:30:00'),

  -- Robert — photo d'identité validée (pour carte Améthyste)
  (4, 3, 'Photo d''identité',    '/images/fixture-robert-photo.jpg',    'Validé',     NULL,                             '2024-08-20 16:55:00'),

  -- Fatima — justificatif TST en attente (bloque l'activation du forfait)
  (5, 4, 'Justificatif TST',     '/images/fixture-fatima-tst.jpg',      'En attente', NULL,                             '2024-11-12 14:10:00'),

  -- Lucas — carte d'identité refusée (mauvaise qualité) puis re-soumise
  (6, 5, 'Pièce d''identité',    '/images/fixture-lucas-cni-v1.jpg',    'Refusé',     'Document illisible, veuillez soumettre une version plus nette.', '2025-01-20 08:40:00'),
  (7, 5, 'Pièce d''identité',    '/images/fixture-lucas-cni-v2.jpg',    'En attente', NULL,                             '2025-01-22 10:00:00');

-- ────────────────────────────────────────────────────────────
-- 5. PAIEMENTS
-- Valeurs type_paiement   : 'Prélèvement automatique' | 'Paiement direct' | 'Virement'
-- Valeurs statut_paiement : 'Réussi' | 'Échoué' | 'En attente'
-- ────────────────────────────────────────────────────────────
INSERT INTO `paiement`
  (id, forfait_id, payeur_id, montant, type_paiement, statut_paiement, date_paiement)
VALUES
  -- Jean — Navigo Annuel 96,40 € (paiement direct)
  (1, 1, 1,  96.40, 'Paiement direct',          'Réussi',    '2025-01-01 10:00:00'),

  -- Marie — Imagine R Etudiant 78,70 € (prélèvement)
  (2, 2, 2,  78.70, 'Prélèvement automatique',  'Réussi',    '2024-09-01 10:00:00'),

  -- Robert — Améthyste 53,90 € (prélèvement) — année précédente
  (3, 3, 3,  53.90, 'Prélèvement automatique',  'Réussi',    '2024-01-05 10:00:00'),

  -- Fatima — TST 0 € (en attente de validation admin, donc paiement en attente)
  (4, 4, 4,   0.00, 'Paiement direct',          'En attente','2024-11-12 14:15:00'),

  -- Lucas — Liberté+ 0 € (pas d'abonnement annuel, paiement symbolique)
  (5, 5, 5,   0.00, 'Paiement direct',          'Réussi',    '2025-01-20 08:45:00'),

  -- Claire — Navigo Annuel 96,40 € (suspendu après paiement)
  (6, 6, 6,  96.40, 'Paiement direct',          'Réussi',    '2024-10-01 11:10:00'),

  -- Jean — tentative de paiement échouée (carte refusée) avant le paiement réussi
  (7, 1, 1,  96.40, 'Paiement direct',          'Échoué',    '2024-12-31 23:55:00');
