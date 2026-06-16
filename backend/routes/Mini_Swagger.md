# Documentation API (Comutitres Hackathon 2026)

Cette documentation liste tous les points de terminaison (endpoints) de notre backend.
**Base URL:** `http://localhost:<BACKEND_PORT>`

---

## 1. Authentification (`auth.routes.js`)

*Gestion des comptes de connexion (Compte_Connect), des mots de passe et de la vérification email.*

| Méthode | Route | Body / Query | Description |
| --- | --- | --- | --- |
| `POST` | `/api/login` | **Body:** `{ email, password }` | Connecte un utilisateur et retourne un token JWT. |
| `POST` | `/api/add/user` | **Body:** `{ firstName, lastName, email, password }` | Crée un nouveau `compte_connect` (Inscription). |
| `POST` | `/api/auth/google` | **Body:** `{ token }` | Connexion ou inscription via Google OAuth. |
| `POST` | `/api/verify-email` | **Query:** `?token=...` | Valide l'email d'un compte suite à l'inscription. |
| `POST` | `/api/send-verification-email` | **Body:** `{ email }` | Envoie le mail contenant le code de vérification. |
| `POST` | `/api/resend-verification-email` | **Body:** `{ email }` | Renvoie un nouveau code de vérification. |
| `POST` | `/api/forgot-password` | **Body:** `{ email }` | Envoie un lien de réinitialisation de mot de passe. |
| `GET` | `/api/reset-password` | **Query:** `?token=...&uid=...` | Vérifie si le token de réinitialisation est valide. |
| `POST` | `/api/reset-password` | **Query:** `?token=...` <br>

<br> **Body:** `{ password }` | Enregistre le nouveau mot de passe. |

---

## 2. Utilisateurs & RGPD (`user.routes.js`)

*Gestion des données du compte principal et actions d'administration.*

| Méthode | Route | Body / Paramètres | Description |
| --- | --- | --- | --- |
| `GET` | `/api/get/user/:id` | **Params:** `id` | Récupère toutes les infos d'un compte ET de son profil. |
| `PUT` | `/api/update/user/:id` | **Format:** `multipart/form-data` <br>

<br> **Body:** `password`, `address`, `postalCode`, `city`, `phoneNumber`, `images` (Fichier) | Met à jour le compte et le profil associé (accepte les uploads d'images). |
| `DELETE` | `/api/user/:id` | **Params:** `id` | **[RGPD]** Supprime définitivement un compte et toutes ses données associées en cascade. |
| `GET` | `/api/get/user` | - | *(Admin)* Récupère tous les comptes. |
| `GET` | `/api/get/user/admin` | **Query:** `?limit=20&offset=0&q=...&role=...&status=...` | *(Admin)* Liste les utilisateurs avec filtres et pagination. |
| `PUT` | `/api/ban/user/:id` | **Params:** `id` | *(Admin)* Banni un compte (et lui envoie un mail). |
| `PUT` | `/api/unban/user/:id` | **Params:** `id` | *(Admin)* Rétabli un compte (et lui envoie un mail). |
| `PUT` | `/api/user/:id/role` | **Body:** `{ role: "admin" ou "user" }` | *(Admin)* Change le rôle d'un compte. |

---

## 3. Profils (Porteur / Payeur) (`profil.routes.js`)

*Gestion des sous-profils rattachés à un compte principal.*

| Méthode | Route | Body / Paramètres | Description |
| --- | --- | --- | --- |
| `GET` | `/api/profils/compte/:compte_id` | **Params:** `compte_id` | Récupère tous les profils (enfants, conjoints, etc.) rattachés à un compte parent. |
| `POST` | `/api/profils` | **Body:** `{ compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city }` | Crée un nouveau profil (Type: `Porteur`, `Payeur` ou `Porteur-Payeur`). |

---

## 4. Documents & Justificatifs (`document.routes.js`)

*Upload des attestations et validation par le backoffice.*

| Méthode | Route | Body / Paramètres | Description |
| --- | --- | --- | --- |
| `POST` | `/api/documents/upload` | **Format:** `multipart/form-data`<br>

<br>**Body:** `profil_id`, `type_document`<br>

<br>**Fichier:** `images` | Upload un justificatif (ex: Attestation de bourse, Pièce d'identité). |
| `GET` | `/api/documents/profil/:profil_id` | **Params:** `profil_id` | Liste l'historique des documents uploadés par un profil. |
| `GET` | `/api/admin/documents/pending` | - | *(Admin)* Récupère tous les documents en attente de vérification. |
| `PUT` | `/api/admin/documents/:id/status` | **Body:** `{ statut_verification: "Validé" ou "Refusé", commentaire_admin: "Optionnel" }` | *(Admin)* Valide ou refuse un document justificatif. |

---

## 5. Forfaits & Abonnements (`forfait.routes.js`)

*Gestion de la souscription aux titres de transport.*

| Méthode | Route | Body / Paramètres | Description |
| --- | --- | --- | --- |
| `POST` | `/api/forfaits` | **Body:** `{ porteur_id, payeur_id, type_forfait }` | Initie une demande d'abonnement (Navigo, Imagine R, TST, etc.). Crée en statut `En attente`. |
| `GET` | `/api/forfaits/porteur/:id` | **Params:** `porteur_id` | Récupère tous les forfaits d'un porteur donné. |
| `GET` | `/api/admin/forfaits` | - | *(Admin)* Récupère l'intégralité des forfaits avec les noms des porteurs et payeurs. |
| `PUT` | `/api/admin/forfaits/:id/status` | **Body:** `{ statut, date_debut, date_fin }` | *(Admin)* Active ou suspend un forfait (définit les dates de validité). |

---

## 6. Paiements (`paiement.routes.js`)

*Historique de facturation et gestion des encaissements.*

| Méthode | Route | Body / Paramètres | Description |
| --- | --- | --- | --- |
| `POST` | `/api/paiements` | **Body:** `{ forfait_id, payeur_id, montant, type_paiement }` | Enregistre une tentative de paiement. |
| `GET` | `/api/paiements/payeur/:id` | **Params:** `payeur_id` | Récupère l'historique des paiements / factures d'un payeur. |
| `PUT` | `/api/paiements/:id/status` | **Body:** `{ statut_paiement: "Réussi" ou "Échoué" }` | *(Admin/Webhook)* Met à jour le statut d'un paiement. |