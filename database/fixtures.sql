-- ============================================================
-- FIXTURES - Comutitres
-- Jeu de données de développement / démonstration
--
-- Comptes      : 14 (1 admin + 11 users actifs + 1 banni + 1 non vérifié)
-- Profils      : 13
-- Forfaits     : 14 (couvre les 13 valeurs de l'enum type_forfait + tous les statuts)
-- Documents    : 7 (mix En attente / Validé / Refusé)
-- Paiements    : 15
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
  (8, 'Thomas', 'Petit',      'thomas.petit@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 0, 0, '2025-03-10 19:00:00', '2025-03-10 19:00:00'),

  -- Jeune scolarisée (collège/lycée) — Imagine R Scolaire
  (9,  'Sophie',    'Garnier',    'sophie.garnier@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-02-01 10:00:00', '2025-02-01 10:00:00'),

  -- Enfant — Imagine R Junior (compte simplifié, géré en pratique par un parent)
  (10, 'Nathan',    'Petit',      'nathan.petit@example.com',       '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-02-05 10:00:00', '2025-02-05 10:00:00'),

  -- Situation de handicap — porte aussi le profil de son accompagnante (Camille)
  (11, 'Amadou',    'Diallo',     'amadou.diallo@example.com',      '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2024-12-01 09:00:00', '2024-12-01 09:00:00'),

  -- Senior — Navigo Annuel Tarification Senior
  (12, 'Henriette', 'Dubreuil',   'henriette.dubreuil@example.com', '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2024-11-20 11:00:00', '2024-11-20 11:00:00'),

  -- Solidarité — Gratuité (renouvelée tous les 3 mois)
  (13, 'Yasmine',   'Cherif',     'yasmine.cherif@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-01-08 08:00:00', '2025-01-08 08:00:00'),

  -- Solidarité — Réduction 50% (Aide Médicale d'État)
  (14, 'Olivier',   'Mensah',     'olivier.mensah@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-01-15 09:00:00', '2025-01-15 09:00:00');

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
  (6, 7, 'Porteur-Payeur', 'Claire', 'Dubois',  '1992-07-14', 'actif',      '0687654321', '3 rue de la Paix',      '75002', 'Paris',      '2024-10-01 11:05:00'),

  -- Sophie — collégienne/lycéenne (Imagine R Scolaire)
  (7,  9,  'Porteur-Payeur', 'Sophie',    'Garnier',  '2012-03-12', 'etudiant',   '0611112222', '10 rue de la Gare',       '94200', 'Ivry-sur-Seine', '2025-02-01 10:05:00'),

  -- Nathan — enfant de moins de 11 ans (Imagine R Junior)
  (8,  10, 'Porteur-Payeur', 'Nathan',    'Petit',    '2017-08-01', 'etudiant',   NULL,         '4 rue des Écoles',        '93100', 'Montreuil',       '2025-02-05 10:05:00'),

  -- Amadou — situation de handicap (Forfait Handicap)
  (9,  11, 'Porteur-Payeur', 'Amadou',    'Diallo',   '1980-04-22', 'mobilite',   '0633334444', '18 avenue Jean Jaurès',   '93300', 'Aubervilliers',   '2024-12-01 09:05:00'),

  -- Camille — accompagnante d'Amadou (même compte, profil distinct : Accompagnant Handicap payé par Amadou)
  (10, 11, 'Porteur',        'Camille',   'Diallo',   '1982-09-09', 'mobilite',   '0633335555', '18 avenue Jean Jaurès',   '93300', 'Aubervilliers',   '2024-12-01 09:06:00'),

  -- Henriette — senior (Navigo Annuel Tarification Senior)
  (11, 12, 'Porteur-Payeur', 'Henriette', 'Dubreuil', '1958-12-02', 'senior',     '0145556677', '2 rue Saint-Honoré',      '75008', 'Paris',           '2024-11-20 11:05:00'),

  -- Yasmine — bénéficiaire d'aides sociales (Solidarité Gratuité)
  (12, 13, 'Porteur-Payeur', 'Yasmine',   'Cherif',   '1995-06-17', 'solidarite', '0766667788', '9 rue de Belleville',     '75020', 'Paris',           '2025-01-08 08:05:00'),

  -- Olivier — bénéficiaire de l'Aide Médicale d'État (Réduction 50%)
  (13, 14, 'Porteur-Payeur', 'Olivier',   'Mensah',   '1988-10-30', 'solidarite', '0677778899', '5 rue de la République', '93000', 'Bobigny',         '2025-01-15 09:05:00');

-- ────────────────────────────────────────────────────────────
-- 3. FORFAITS
-- Valeurs type_forfait : 'Navigo Annuel' | 'Imagine R Etudiant' | 'Imagine R Junior' |
--   'Imagine R Scolaire' | 'Liberté+' | 'TST' | 'Améthyste' | 'Navigo Senior' |
--   'Réduction 50%' | 'Solidarité 75%' | 'Solidarité Gratuité' | 'Handicap' | 'Accompagnant Handicap'
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

  -- Fatima — TST (palier générique historique) en attente de validation admin
  (4, 4, 4, 'TST',                  'En attente de validation', NULL,         NULL),

  -- Lucas — Liberté+ actif
  (5, 5, 5, 'Liberté+',             'Actif',                    '2025-01-20', '2026-01-20'),

  -- Claire — Navigo Annuel suspendu (compte banni)
  (6, 6, 6, 'Navigo Annuel',        'Suspendu',                 '2024-10-01', '2025-09-30'),

  -- Sophie — Imagine R Scolaire actif
  (7,  7,  7,  'Imagine R Scolaire',    'Actif',                    '2024-09-01', '2025-08-31'),

  -- Nathan — Imagine R Junior actif
  (8,  8,  8,  'Imagine R Junior',      'Actif',                    '2024-09-01', '2025-08-31'),

  -- Amadou — Handicap actif
  (9,  9,  9,  'Handicap',              'Actif',                    '2025-01-01', '2025-12-31'),

  -- Camille (accompagnante d'Amadou) — Accompagnant Handicap, payé par Amadou (porteur ≠ payeur)
  (10, 10, 9,  'Accompagnant Handicap', 'Actif',                    '2025-01-01', '2025-12-31'),

  -- Henriette — Navigo Annuel Tarification Senior actif
  (11, 11, 11, 'Navigo Senior',         'Actif',                    '2025-01-01', '2025-12-31'),

  -- Yasmine — Solidarité Gratuité actif (renouvelée tous les 3 mois)
  (12, 12, 12, 'Solidarité Gratuité',   'Actif',                    '2025-04-01', '2025-06-30'),

  -- Olivier — Réduction 50% en attente de validation du dossier AME
  (13, 13, 13, 'Réduction 50%',         'En attente de validation', NULL,         NULL),

  -- Fatima — dossier validé : palier précis Solidarité 75% (vient compléter son ancien TST générique)
  (14, 4,  4,  'Solidarité 75%',        'Actif',                    '2025-01-01', '2025-12-31');

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

  -- Marie — Imagine R Etudiant 401,30 € (prélèvement)
  (2, 2, 2, 401.30, 'Prélèvement automatique',  'Réussi',    '2024-09-01 10:00:00'),

  -- Robert — Améthyste 53,90 € (prélèvement) — année précédente
  (3, 3, 3,  53.90, 'Prélèvement automatique',  'Réussi',    '2024-01-05 10:00:00'),

  -- Fatima — TST 0 € (en attente de validation admin, donc paiement en attente)
  (4, 4, 4,   0.00, 'Paiement direct',          'En attente','2024-11-12 14:15:00'),

  -- Lucas — Liberté+ 0 € (pas d'abonnement annuel, paiement symbolique)
  (5, 5, 5,   0.00, 'Paiement direct',          'Réussi',    '2025-01-20 08:45:00'),

  -- Claire — Navigo Annuel 96,40 € (suspendu après paiement)
  (6, 6, 6,  96.40, 'Paiement direct',          'Réussi',    '2024-10-01 11:10:00'),

  -- Jean — tentative de paiement échouée (carte refusée) avant le paiement réussi
  (7, 1, 1,  96.40, 'Paiement direct',          'Échoué',    '2024-12-31 23:55:00'),

  -- Sophie — Imagine R Scolaire 401,30 €
  (8,  7,  7,  401.30, 'Prélèvement automatique', 'Réussi',     '2024-09-01 10:00:00'),

  -- Nathan — Imagine R Junior 25,20 €
  (9,  8,  8,   25.20, 'Prélèvement automatique', 'Réussi',     '2024-09-01 10:00:00'),

  -- Amadou — Handicap, gratuité
  (10, 9,  9,    0.00, 'Paiement direct',         'Réussi',     '2025-01-01 10:00:00'),

  -- Camille — Accompagnant Handicap, gratuité, payé par Amadou
  (11, 10, 9,    0.00, 'Paiement direct',         'Réussi',     '2025-01-01 10:05:00'),

  -- Henriette — Navigo Senior 48,20 € (-50% sur les 96,40 € du Navigo Annuel)
  (12, 11, 11,  48.20, 'Prélèvement automatique', 'Réussi',     '2025-01-01 10:00:00'),

  -- Yasmine — Solidarité Gratuité, 0 €
  (13, 12, 12,   0.00, 'Paiement direct',         'Réussi',     '2025-04-01 09:00:00'),

  -- Olivier — Réduction 50% (48,20 €), en attente de validation du dossier AME
  (14, 13, 13,  48.20, 'Paiement direct',         'En attente', '2025-01-15 09:10:00'),

  -- Fatima — Solidarité 75% (24,10 €), dossier validé
  (15, 4,  4,   24.10, 'Prélèvement automatique', 'Réussi',     '2025-01-01 10:00:00');
