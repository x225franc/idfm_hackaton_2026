# Comutitres — Hackathon IDFM 2026

Plateforme de gestion des titres de transport Île-de-France.

---

## Démarrage rapide

```bash
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3002 |
| API Backend | http://localhost:3001 |
| Swagger (doc API) | http://localhost:3001/api-docs |
| PhpMyAdmin | http://localhost:8080 |
| Adminer | http://localhost:8081 |

---

## Charger le jeu de données de test

> A faire après le premier `docker compose up -d`, une fois la BDD démarrée.

```bash
docker exec -i idfm_db mysql -u root idfm_hackaton_2026 < database/fixtures.sql
```

Pour repartir de zéro (réinitialise la BDD **et** recharge les fixtures) :

```bash
docker exec -i idfm_db mysql -u root idfm_hackaton_2026 < database/idfm_hackaton.sql
docker exec -i idfm_db mysql -u root idfm_hackaton_2026 < database/fixtures.sql
```

---

## Comptes de test

| Email | Mot de passe | Rôle | Situation |
|---|---|---|---|
| `admin@comutitres.fr` | `Admin1234!` | Admin | Accès backoffice complet |
| `jean.dupont@example.com` | `Test1234!` | User | Navigo Annuel — actif |
| `marie.martin@example.com` | `Test1234!` | User | Imagine R Etudiant — doc en attente de validation |
| `robert.leclerc@example.com` | `Test1234!` | User | Améthyste — à renouveler |
| `fatima.benali@example.com` | `Test1234!` | User | TST — en attente de validation admin |
| `lucas.moreau@example.com` | `Test1234!` | User | Liberté+ — doc refusé puis re-soumis |
| `claire.dubois@example.com` | `Test1234!` | User | **Compte banni** |
| `thomas.petit@example.com` | `Test1234!` | User | **Email non vérifié** |

---

## Ce que couvre le jeu de données

- Tous les **types de forfait** : Navigo Annuel, Imagine R Etudiant, Améthyste, TST, Liberté+
- Tous les **statuts de forfait** : Actif, Suspendu, A renouveler, En attente de validation
- 3 **documents en attente** visibles dans le backoffice (onglet Justificatifs)
- Des **paiements** avec statuts variés : Réussi, Échoué, En attente
- Des cas limites : compte banni, compte non vérifié, document refusé et re-soumis

---

## Architecture

```
backend/
├── api.js               # Point d'entrée Express
├── config/              # DB, mailer, swagger
├── models/              # Requêtes SQL (promisifiées)
├── controllers/         # Logique métier + HTTP
└── routes/              # Déclaration des endpoints

frontend/
├── src/views/           # Pages React
│   ├── onboarding/      # Tunnel de souscription (7 étapes)
│   └── admin/           # Backoffice
└── src/components/      # Composants réutilisables

database/
├── idfm_hackaton.sql    # Schéma (CREATE TABLE)
└── fixtures.sql         # Jeu de données de test
```

---

## Production (Docker Swarm)

```bash
docker swarm init
docker stack deploy -c docker-compose-prod.yml idfm_app
```
