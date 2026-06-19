-- ============================================================
-- FIXTURES - Comutitres
-- Jeu de données de développement / démonstration
--
-- Comptes       : 15 (2 admins + 11 users actifs + 1 banni + 1 non vérifié)
-- Profils       : 13
-- Forfaits      : 14 (couvre les 13 valeurs de l'enum type_forfait + tous les statuts)
-- Documents     :  7 (mix En attente / Validé / Refusé)
-- Paiements     : 15
-- Profils       : 14
-- Forfaits      : 15
-- Paiements     : 16
-- Notifications :  9 (couvre les 4 types, mix lu / non lu)
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │  Email                           Mdp          Situation                 │
-- ├─────────────────────────────────────────────────────────────────────────┤
-- │  admin@comutitres.fr             Admin1234!   Backoffice complet        │
-- │  jean.dupont@example.com         Test1234!    Navigo Annuel — actif     │
-- │  marie.martin@example.com        Test1234!    Imagine R Etudiant        │
-- │                                               doc en attente validation  │
-- │  robert.leclerc@example.com      Test1234!    Améthyste — à renouveler  │
-- │  fatima.benali@example.com       Test1234!    TST — en attente admin     │
-- │  lucas.moreau@example.com        Test1234!    Liberté+ — doc refusé     │
-- │                                               puis re-soumis             │
-- │  claire.dubois@example.com       Test1234!    Compte banni               │
-- │  thomas.petit@example.com        Test1234!    Email non vérifié          │
-- │  sophie.garnier@example.com      Test1234!    Imagine R Scolaire — actif │
-- │  nathan.petit@example.com        Test1234!    Imagine R Junior — actif   │
-- │  amadou.diallo@example.com       Test1234!    Handicap actif             │
-- │                                               (+ profil accompagnante)   │
-- │  henriette.dubreuil@example.com  Test1234!    Navigo Senior — actif      │
-- │  yasmine.cherif@example.com      Test1234!    Solidarité Gratuité        │
-- │  olivier.mensah@example.com      Test1234!    Réduction 50%             │
-- │                                               en attente validation       │
-- └─────────────────────────────────────────────────────────────────────────┘
-- ============================================================

SET NAMES 'utf8mb4';
USE `idfm_hackaton_2026`;

-- Vider dans l'ordre inverse des FK
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `trajet`;
TRUNCATE TABLE `notification`;
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

  -- Navigo Annuel actif
  (2, 'Jean',   'Dupont',     'jean.dupont@example.com',    '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-09-05 09:00:00', '2025-01-10 14:32:00'),

  -- Imagine R Etudiant — doc en attente de validation
  (3, 'Marie',  'Martin',     'marie.martin@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-09-10 10:15:00', '2025-02-03 11:00:00'),

  -- Améthyste expiré il y a 2 mois → statut "À renouveler"
  (4, 'Robert', 'Leclerc',    'robert.leclerc@example.com', '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-08-20 16:45:00', '2025-01-05 09:00:00'),

  -- TST en attente de validation admin (dossier déposé)
  (5, 'Fatima', 'Benali',     'fatima.benali@example.com',  '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2024-11-12 14:00:00', '2024-11-12 14:00:00'),

  -- Liberté+ actif — doc d'identité refusé puis re-soumis
  (6, 'Lucas',  'Moreau',     'lucas.moreau@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2025-01-20 08:30:00', '2025-03-01 17:00:00'),

  -- Compte banni — forfait suspendu d'office
  (7, 'Claire', 'Dubois',     'claire.dubois@example.com',  '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 1, '2024-10-01 11:00:00', '2025-02-14 09:00:00'),

  -- Email non vérifié (isVerified=0) — pas d'accès à l'espace
  (8, 'Thomas', 'Petit',      'thomas.petit@example.com',   '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 0, 0, '2025-03-10 19:00:00', '2025-03-10 19:00:00'),

  -- Imagine R Scolaire — collégienne/lycéenne (née en 2012)
  (9,  'Sophie',    'Garnier',    'sophie.garnier@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-02-01 10:00:00', '2025-02-01 10:00:00'),

  -- Imagine R Junior — enfant de 8 ans, géré par un parent
  (10, 'Nathan',    'Petit',      'nathan.petit@example.com',       '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-02-05 10:00:00', '2025-02-05 10:00:00'),

  -- Handicap actif — porte aussi le profil de son accompagnante (Camille)
  (11, 'Amadou',    'Diallo',     'amadou.diallo@example.com',      '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2024-12-01 09:00:00', '2024-12-01 09:00:00'),

  -- Navigo Senior actif (reçu proposition Senior à ses 62 ans)
  (12, 'Henriette', 'Dubreuil',   'henriette.dubreuil@example.com', '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2024-11-20 11:00:00', '2024-11-20 11:00:00'),

  -- Solidarité Gratuité — renouvellement trimestriel, rappel J-30 en attente
  (13, 'Yasmine',   'Cherif',     'yasmine.cherif@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user', 1, 1, 0, '2025-01-08 08:00:00', '2025-01-08 08:00:00'),

  -- Réduction 50% (AME) — dossier en attente de validation
  (14, 'Olivier',   'Mensah',     'olivier.mensah@example.com',     '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'user',  1, 1, 0, '2025-01-15 09:00:00', '2025-01-15 09:00:00'),

  -- Admin développeur — Imagine R Etudiant actif
  (15, 'Ludovic',   'Mak',        'ludovic93mak@gmail.com',         '$2b$10$b8/bOHLxoG6LbQfVxTHGlebuF4nQYfMiwwhXFuq0koImmpSQt4Seq', 'admin', 1, 1, 0, NOW(), NOW());

-- ────────────────────────────────────────────────────────────
-- 2. PROFILS
-- ────────────────────────────────────────────────────────────
INSERT INTO `profil`
  (id, compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city, createdAt)
VALUES
  (1,  2,  'Porteur-Payeur', 'Jean',      'Dupont',   '1985-03-15', 'actif',      '0612345678', '12 rue de Rivoli',        '75001', 'Paris',           '2024-09-05 09:05:00'),
  (2,  3,  'Porteur-Payeur', 'Marie',     'Martin',   '2001-09-22', 'etudiant',   '0698765432', '5 avenue des Gobelins',   '75013', 'Paris',           '2024-09-10 10:20:00'),
  (3,  4,  'Porteur-Payeur', 'Robert',    'Leclerc',  '1955-06-10', 'senior',     '0145678901', '8 boulevard Voltaire',    '75011', 'Paris',           '2024-08-20 16:50:00'),
  (4,  5,  'Porteur-Payeur', 'Fatima',    'Benali',   '1990-11-03', 'solidarite', '0754321098', '23 rue du Temple',        '75003', 'Paris',           '2024-11-12 14:05:00'),
  (5,  6,  'Porteur-Payeur', 'Lucas',     'Moreau',   '1998-02-28', 'actif',      '0623456789', '47 rue Lecourbe',         '75015', 'Paris',           '2025-01-20 08:35:00'),
  (6,  7,  'Porteur-Payeur', 'Claire',    'Dubois',   '1992-07-14', 'actif',      '0687654321', '3 rue de la Paix',        '75002', 'Paris',           '2024-10-01 11:05:00'),

  -- Sophie — collégienne (née 2012-03-12 → 14 ans, prochaine transition à 15 ans en mars 2027)
  (7,  9,  'Porteur-Payeur', 'Sophie',    'Garnier',  '2012-03-12', 'etudiant',   '0611112222', '10 rue de la Gare',       '94200', 'Ivry-sur-Seine',  '2025-02-01 10:05:00'),

  -- Nathan — enfant de 8 ans (né 2017-08-01, prochaine transition à 11 ans en août 2028)
  (8,  10, 'Porteur-Payeur', 'Nathan',    'Petit',    '2017-08-01', 'etudiant',   NULL,         '4 rue des Écoles',        '93100', 'Montreuil',       '2025-02-05 10:05:00'),

  -- Amadou — situation de handicap (compte 11, profil porteur-payeur)
  (9,  11, 'Porteur-Payeur', 'Amadou',    'Diallo',   '1980-04-22', 'mobilite',   '0633334444', '18 avenue Jean Jaurès',   '93300', 'Aubervilliers',   '2024-12-01 09:05:00'),

  -- Camille — accompagnante d'Amadou (même compte 11, profil Porteur distinct)
  (10, 11, 'Porteur',        'Camille',   'Diallo',   '1982-09-09', 'mobilite',   '0633335555', '18 avenue Jean Jaurès',   '93300', 'Aubervilliers',   '2024-12-01 09:06:00'),

  -- Henriette — senior 67 ans (a reçu proposition Senior à ses 62 ans)
  (11, 12, 'Porteur-Payeur', 'Henriette', 'Dubreuil', '1958-12-02', 'senior',     '0145556677', '2 rue Saint-Honoré',      '75008', 'Paris',           '2024-11-20 11:05:00'),

  -- Yasmine — bénéficiaire solidarité (renouvellement trimestriel)
  (12, 13, 'Porteur-Payeur', 'Yasmine',   'Cherif',   '1995-06-17', 'solidarite', '0766667788', '9 rue de Belleville',     '75020', 'Paris',           '2025-01-08 08:05:00'),

  -- Olivier — bénéficiaire AME (Aide Médicale d'État)
  (13, 14, 'Porteur-Payeur', 'Olivier',   'Mensah',   '1988-10-30', 'solidarite', '0677778899', '5 rue de la République',  '93000', 'Bobigny',         '2025-01-15 09:05:00'),

  -- Ludovic — admin développeur
  (14, 15, 'Porteur-Payeur', 'Ludovic',   'Mak',      '1993-01-01', 'etudiant',   NULL,         NULL,                      NULL,    NULL,              NOW());

-- ────────────────────────────────────────────────────────────
-- 3. FORFAITS
--
-- Valeurs type_forfait : 'Navigo Annuel' | 'Imagine R Etudiant' | 'Imagine R Junior' |
--   'Imagine R Scolaire' | 'Liberté+' | 'TST' | 'Améthyste' | 'Navigo Senior' |
--   'Réduction 50%' | 'Solidarité 75%' | 'Solidarité Gratuité' | 'Handicap' | 'Accompagnant Handicap'
-- Valeurs statut : 'Actif' | 'Suspendu' | 'A renouveler' | 'En attente de validation'
--
-- Les dates sont calculées par rapport à CURDATE() pour que les barres
-- de progression restent crédibles quelle que soit la date d'exécution.
-- ────────────────────────────────────────────────────────────
INSERT INTO `forfait`
  (id, porteur_id, payeur_id, type_forfait, statut, date_debut, date_fin)
VALUES
  -- Jean — Navigo Annuel actif (~17% écoulé, expire dans 10 mois)
  (1,  1,  1,  'Navigo Annuel',          'Actif',                    DATE_SUB(CURDATE(), INTERVAL 2  MONTH),  DATE_ADD(CURDATE(), INTERVAL 10 MONTH)),

  -- Marie — Imagine R Etudiant actif (~50% écoulé, expire dans 6 mois)
  (2,  2,  2,  'Imagine R Etudiant',     'Actif',                    DATE_SUB(CURDATE(), INTERVAL 6  MONTH),  DATE_ADD(CURDATE(), INTERVAL 6  MONTH)),

  -- Robert — Améthyste expiré il y a 2 mois → À renouveler
  -- (le scheduler a envoyé J-30, J-7, J-1 avant expiration → tous lus)
  (3,  3,  3,  'Améthyste',              'A renouveler',             DATE_SUB(CURDATE(), INTERVAL 14 MONTH),  DATE_SUB(CURDATE(), INTERVAL 2  MONTH)),

  -- Fatima — TST en attente de validation admin (dossier déposé)
  (4,  4,  4,  'TST',                    'En attente de validation', NULL,                                    NULL),

  -- Lucas — Liberté+ actif (~25% écoulé, expire dans 9 mois)
  (5,  5,  5,  'Liberté+',               'Actif',                    DATE_SUB(CURDATE(), INTERVAL 3  MONTH),  DATE_ADD(CURDATE(), INTERVAL 9  MONTH)),

  -- Claire — Navigo Annuel suspendu (compte banni en cours de période)
  (6,  6,  6,  'Navigo Annuel',          'Suspendu',                 DATE_SUB(CURDATE(), INTERVAL 4  MONTH),  DATE_ADD(CURDATE(), INTERVAL 8  MONTH)),

  -- Sophie — Imagine R Scolaire actif (~33% écoulé)
  (7,  7,  7,  'Imagine R Scolaire',     'Actif',                    DATE_SUB(CURDATE(), INTERVAL 4  MONTH),  DATE_ADD(CURDATE(), INTERVAL 8  MONTH)),

  -- Nathan — Imagine R Junior actif (~33% écoulé)
  (8,  8,  8,  'Imagine R Junior',       'Actif',                    DATE_SUB(CURDATE(), INTERVAL 4  MONTH),  DATE_ADD(CURDATE(), INTERVAL 8  MONTH)),

  -- Amadou — Handicap actif (~8% écoulé)
  (9,  9,  9,  'Handicap',               'Actif',                    DATE_SUB(CURDATE(), INTERVAL 1  MONTH),  DATE_ADD(CURDATE(), INTERVAL 11 MONTH)),

  -- Camille — Accompagnant Handicap payé par Amadou (porteur ≠ payeur)
  (10, 10, 9,  'Accompagnant Handicap',  'Actif',                    DATE_SUB(CURDATE(), INTERVAL 1  MONTH),  DATE_ADD(CURDATE(), INTERVAL 11 MONTH)),

  -- Henriette — Navigo Senior actif (~42% écoulé)
  (11, 11, 11, 'Navigo Senior',          'Actif',                    DATE_SUB(CURDATE(), INTERVAL 5  MONTH),  DATE_ADD(CURDATE(), INTERVAL 7  MONTH)),

  -- Yasmine — Solidarité Gratuité, cycle trimestriel (~33% écoulé, expire dans 2 mois)
  (12, 12, 12, 'Solidarité Gratuité',    'Actif',                    DATE_SUB(CURDATE(), INTERVAL 1  MONTH),  DATE_ADD(CURDATE(), INTERVAL 2  MONTH)),

  -- Olivier — Réduction 50% en attente de validation dossier AME
  (13, 13, 13, 'Réduction 50%',          'En attente de validation', NULL,                                    NULL),

  -- Fatima — dossier TST validé → passage au palier précis Solidarité 75%
  (14, 4,  4,  'Solidarité 75%',         'Actif',                    DATE_SUB(CURDATE(), INTERVAL 3  MONTH),  DATE_ADD(CURDATE(), INTERVAL 9  MONTH)),

  -- Ludovic — Imagine R Etudiant actif (~50% écoulé)
  (15, 14, 14, 'Imagine R Etudiant',     'Actif',                    DATE_SUB(CURDATE(), INTERVAL 6  MONTH),  DATE_ADD(CURDATE(), INTERVAL 6  MONTH));

-- ────────────────────────────────────────────────────────────
-- 4. DOCUMENTS
--
-- Valeurs type_document : "Pièce d'identité" | 'Attestation de bourse' |
--   'Justificatif TST' | "Photo d'identité"
-- Valeurs statut : 'En attente' | 'Validé' | 'Refusé'
-- ────────────────────────────────────────────────────────────
INSERT INTO `document`
  (id, profil_id, type_document, chemin_fichier, statut_verification, commentaire_admin, uploadedAt)
VALUES
  -- Jean — CNI validée
  (1, 1, 'Pièce d''identité',    '/documents/fixture-jean-cni.jpg',     'Validé',     NULL,                                                               '2024-09-05 09:10:00'),

  -- Marie — CNI validée + attestation de bourse en attente (bloque la réduction)
  (2, 2, 'Pièce d''identité',    '/documents/fixture-marie-cni.jpg',    'Validé',     NULL,                                                               '2024-09-10 10:25:00'),
  (3, 2, 'Attestation de bourse','/documents/fixture-marie-bourse.jpg', 'En attente', NULL,                                                               '2024-09-10 10:30:00'),

  -- Robert — photo d'identité validée (Améthyste)
  (4, 3, 'Photo d''identité',    '/documents/fixture-robert-photo.jpg',  'Validé',     NULL,                                                               '2024-08-20 16:55:00'),

  -- Fatima — justificatif TST en attente (bloque l'activation du forfait)
  (5, 4, 'Justificatif TST',     '/documents/fixture-fatima-tst.jpg',    'En attente', NULL,                                                               '2024-11-12 14:10:00'),

  -- Lucas — CNI refusée (mauvaise qualité) puis re-soumise (en attente)
  (6, 5, 'Pièce d''identité',    '/documents/fixture-lucas-cni-v1.jpg', 'Refusé',     'Document illisible, veuillez soumettre une version plus nette.',    '2025-01-20 08:40:00'),
  (7, 5, 'Pièce d''identité',    '/documents/fixture-lucas-cni-v2.jpg', 'En attente', NULL,                                                               '2025-01-22 10:00:00');

-- ────────────────────────────────────────────────────────────
-- 5. PAIEMENTS
--
-- Valeurs type_paiement   : 'Prélèvement automatique' | 'Paiement direct' | 'Virement'
-- Valeurs statut_paiement : 'Réussi' | 'Échoué' | 'En attente'
-- ────────────────────────────────────────────────────────────
INSERT INTO `paiement`
  (id, forfait_id, payeur_id, montant, type_paiement, statut_paiement, date_paiement)
VALUES
  -- Jean — Navigo Annuel 96,40 €
  (1,  1,  1,   96.40, 'Paiement direct',          'Réussi',     '2025-01-01 10:00:00'),

  -- Marie — Imagine R Etudiant 401,30 €
  (2,  2,  2,  401.30, 'Prélèvement automatique',  'Réussi',     '2024-09-01 10:00:00'),

  -- Robert — Améthyste 53,90 € (avant expiration)
  (3,  3,  3,   53.90, 'Prélèvement automatique',  'Réussi',     '2024-01-05 10:00:00'),

  -- Fatima — TST 0 € (en attente de validation, paiement suspendu)
  (4,  4,  4,    0.00, 'Paiement direct',          'En attente', '2024-11-12 14:15:00'),

  -- Lucas — Liberté+ (sans abonnement, montant symbolique)
  (5,  5,  5,    0.00, 'Paiement direct',          'Réussi',     '2025-01-20 08:45:00'),

  -- Claire — Navigo Annuel 96,40 € (compte banni après paiement)
  (6,  6,  6,   96.40, 'Paiement direct',          'Réussi',     '2024-10-01 11:10:00'),

  -- Jean — tentative échouée (carte refusée) puis paiement réussi
  (7,  1,  1,   96.40, 'Paiement direct',          'Échoué',     '2024-12-31 23:55:00'),

  -- Sophie — Imagine R Scolaire 401,30 €
  (8,  7,  7,  401.30, 'Prélèvement automatique',  'Réussi',     '2024-09-01 10:00:00'),

  -- Nathan — Imagine R Junior 25,20 €
  (9,  8,  8,   25.20, 'Prélèvement automatique',  'Réussi',     '2024-09-01 10:00:00'),

  -- Amadou — Handicap, gratuité
  (10, 9,  9,    0.00, 'Paiement direct',          'Réussi',     '2025-01-01 10:00:00'),

  -- Camille — Accompagnant Handicap, gratuité (payé par Amadou)
  (11, 10, 9,    0.00, 'Paiement direct',          'Réussi',     '2025-01-01 10:05:00'),

  -- Henriette — Navigo Senior 48,20 € (-50%)
  (12, 11, 11,  48.20, 'Prélèvement automatique',  'Réussi',     '2025-01-01 10:00:00'),

  -- Yasmine — Solidarité Gratuité, 0 €
  (13, 12, 12,   0.00, 'Paiement direct',          'Réussi',     '2025-04-01 09:00:00'),

  -- Olivier — Réduction 50% 48,20 €, en attente de validation dossier AME
  (14, 13, 13,  48.20, 'Paiement direct',          'En attente', '2025-01-15 09:10:00'),

  -- Fatima — Solidarité 75% 24,10 € (dossier validé)
  (15, 4,  4,   24.10, 'Prélèvement automatique',  'Réussi',     '2025-01-01 10:00:00'),

  -- Ludovic — Imagine R Etudiant 401,30 €
  (16, 15, 14, 401.30, 'Prélèvement automatique',  'Réussi',     DATE_SUB(NOW(), INTERVAL 6 MONTH));

-- ────────────────────────────────────────────────────────────
-- 6. NOTIFICATIONS
--
-- Valeurs type : 'renouvellement_1_mois' | 'renouvellement_1_semaine' |
--               'renouvellement_1_jour'  | 'changement_tranche_age'
--
-- 3 non lues  → badge rouge visible dès la connexion (Yasmine, Marie, Nathan)
-- 6 lues      → historique (Robert x3, Jean, Henriette, Sophie)
-- Couvre les 4 types et les 2 états UI.
-- ────────────────────────────────────────────────────────────
INSERT INTO `notification`
  (compte_id, type, titre, message, forfait_id, lu, createdAt)
VALUES

  -- ── Robert [4] — Améthyste expiré il y a 2 mois ────────────────────────
  -- Scheduler a généré les 3 rappels successifs, tous lus.
  (4,
   'renouvellement_1_mois',
   'Votre Améthyste expire dans 1 mois',
   'Votre abonnement Améthyste arrive à expiration dans 30 jours. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   3, 1, DATE_SUB(CURDATE(), INTERVAL 3 MONTH)),

  (4,
   'renouvellement_1_semaine',
   'Votre Améthyste expire dans 1 semaine',
   'Votre abonnement Améthyste arrive à expiration dans 7 jours. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   3, 1, DATE_SUB(CURDATE(), INTERVAL 10 WEEK)),

  (4,
   'renouvellement_1_jour',
   'Votre Améthyste expire demain',
   'Votre abonnement Améthyste arrive à expiration demain. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   3, 1, DATE_SUB(CURDATE(), INTERVAL 2 MONTH)),

  -- ── Jean [2] — Navigo Annuel ─────────────────────────────────────────────
  -- Rappel J-30 de l'année précédente, lu après renouvellement.
  (2,
   'renouvellement_1_mois',
   'Votre Navigo Annuel expire dans 1 mois',
   'Votre abonnement Navigo Annuel arrive à expiration dans 30 jours. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   1, 1, DATE_SUB(CURDATE(), INTERVAL 14 MONTH)),

  -- ── Yasmine [13] — Solidarité Gratuité ──────────────────────────────────
  -- Rappel J-7 du cycle trimestriel précédent, pas encore lu.
  (13,
   'renouvellement_1_semaine',
   'Votre Solidarité Gratuité expire dans 1 semaine',
   'Votre abonnement Solidarité Gratuité arrive à expiration dans 7 jours. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   12, 0, DATE_SUB(CURDATE(), INTERVAL 14 WEEK)),

  -- ── Marie [3] — Imagine R Etudiant ──────────────────────────────────────
  -- Rappel J-7 du cycle annuel précédent, pas encore lu.
  (3,
   'renouvellement_1_semaine',
   'Votre Imagine R Etudiant expire dans 1 semaine',
   'Votre abonnement Imagine R Etudiant arrive à expiration dans 7 jours. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.',
   2, 0, DATE_SUB(CURDATE(), INTERVAL 18 MONTH)),

  -- ── Henriette [12] — Navigo Senior ──────────────────────────────────────
  -- Proposition Senior reçue à ses 62 ans, lue et validée depuis.
  (12,
   'changement_tranche_age',
   'Proposition de passage au tarif Senior',
   'Henriette vient d''avoir 62 ans. Un passage automatique sur le Navigo Senior vous est proposé, avec les conditions tarifaires associées. Connectez-vous pour valider.',
   NULL, 1, DATE_SUB(CURDATE(), INTERVAL 5 YEAR)),

  -- ── Sophie [9] — Imagine R Scolaire ─────────────────────────────────────
  -- Notification de passage Scolaire à ses 11 ans, lue il y a 3 ans.
  (9,
   'changement_tranche_age',
   'Passage à l''Imagine R Scolaire',
   'Sophie vient d''avoir 11 ans. Son abonnement peut maintenant passer à l''Imagine R Scolaire. Pensez à renouveler son titre de transport.',
   NULL, 1, DATE_SUB(CURDATE(), INTERVAL 3 YEAR)),

  -- ── Nathan [10] — Imagine R Junior ──────────────────────────────────────
  -- Proposition Junior à ses 4 ans, pas encore lue (parent pas reconnecté).
  (10,
   'changement_tranche_age',
   'Votre enfant peut bénéficier de l''Imagine R Junior',
   'Nathan vient d''avoir 4 ans. Il peut désormais bénéficier de l''abonnement Imagine R Junior pour circuler en Île-de-France. Rendez-vous dans votre espace pour faire la demande.',
   NULL, 0, DATE_SUB(CURDATE(), INTERVAL 4 YEAR));

-- ────────────────────────────────────────────────────────────
-- 7. TRAJETS (scans de pass — mêmes 2 entrées pour tous les profils)
-- ────────────────────────────────────────────────────────────
INSERT INTO `trajet`
  (profil_id, station, ligne, direction, date_scan, type_scan)
VALUES
  (1,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (1,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (2,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (2,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (3,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (3,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (4,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (4,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (5,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (5,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (6,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (6,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (7,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (7,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (8,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (8,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (9,  'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (9,  'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (10, 'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (10, 'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (11, 'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (11, 'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (12, 'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (12, 'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (13, 'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (13, 'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree'),
  (14, 'Châtelet – Les Halles', 'RER A', 'Direction Marne-la-Vallée', DATE_SUB(NOW(), INTERVAL 1 DAY), 'entree'),
  (14, 'Gare du Nord',          'RER B', 'Direction Mitry-Claye',      DATE_SUB(NOW(), INTERVAL 3 DAY), 'entree');
