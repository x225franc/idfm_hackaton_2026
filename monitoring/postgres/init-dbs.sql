-- Création des bases de données pour Umami et GlitchTip
-- Ce script est exécuté automatiquement au premier démarrage du conteneur postgres.

CREATE DATABASE umami;
GRANT ALL PRIVILEGES ON DATABASE umami TO monitoring;

CREATE DATABASE glitchtip;
GRANT ALL PRIVILEGES ON DATABASE glitchtip TO monitoring;
