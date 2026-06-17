const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Comutitres API',
            version: '1.0.0',
            description: 'API de gestion des titres de transport Île-de-France',
        },
        servers: [{ url: process.env.BACKEND_URL || 'http://localhost:3001' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id_user: { type: 'integer', example: 1 },
                        firstName: { type: 'string', example: 'Jean' },
                        lastName: { type: 'string', example: 'Dupont' },
                        email: { type: 'string', format: 'email', example: 'jean.dupont@example.com' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        isVerified: { type: 'integer', enum: [0, 1], example: 1 },
                        isBanned: { type: 'integer', enum: [0, 1], example: 0 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        consentement_rgpd: { type: 'integer', enum: [0, 1], example: 1 },
                    },
                },
                UserWithProfil: {
                    allOf: [
                        { $ref: '#/components/schemas/User' },
                        {
                            type: 'object',
                            properties: {
                                profil_id: { type: 'integer', nullable: true },
                                phoneNumber: { type: 'string', nullable: true, example: '0612345678' },
                                address: { type: 'string', nullable: true },
                                postalCode: { type: 'string', nullable: true, example: '75001' },
                                city: { type: 'string', nullable: true, example: 'Paris' },
                                profession: { type: 'string', nullable: true },
                                date_naissance: { type: 'string', format: 'date', nullable: true },
                                profilePicture: { type: 'string', nullable: true },
                            },
                        },
                    ],
                },
                Profil: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        compte_id: { type: 'integer' },
                        type_profil: { type: 'string', enum: ['Porteur', 'Payeur', 'Porteur-Payeur'], example: 'Porteur-Payeur' },
                        firstName: { type: 'string', example: 'Jean' },
                        lastName: { type: 'string', example: 'Dupont' },
                        date_naissance: { type: 'string', format: 'date' },
                        profession: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        address: { type: 'string' },
                        postalCode: { type: 'string' },
                        city: { type: 'string' },
                    },
                },
                Document: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        profil_id: { type: 'integer' },
                        type_document: {
                            type: 'string',
                            enum: ["Pièce d'identité", 'Attestation de bourse', 'Justificatif TST', "Photo d'identité"],
                        },
                        chemin_fichier: { type: 'string' },
                        statut_verification: { type: 'string', enum: ['En attente', 'Validé', 'Refusé'] },
                        commentaire_admin: { type: 'string', nullable: true },
                        uploadedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Forfait: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        porteur_id: { type: 'integer' },
                        payeur_id: { type: 'integer' },
                        type_forfait: {
                            type: 'string',
                            enum: ['Navigo Annuel', 'Imagine R Etudiant', 'Imagine R Junior', 'Imagine R Scolaire', 'Liberté+', 'TST', 'Améthyste'],
                        },
                        statut: {
                            type: 'string',
                            enum: ['Actif', 'Suspendu', 'A renouveler', 'En attente de validation'],
                        },
                        date_debut: { type: 'string', format: 'date', nullable: true },
                        date_fin: { type: 'string', format: 'date', nullable: true },
                    },
                },
                Paiement: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        forfait_id: { type: 'integer' },
                        payeur_id: { type: 'integer' },
                        montant: { type: 'number', format: 'float', example: 86.40 },
                        type_paiement: {
                            type: 'string',
                            enum: ['Prélèvement automatique', 'Paiement direct', 'Virement'],
                        },
                        statut_paiement: { type: 'string', enum: ['Réussi', 'Échoué', 'En attente'] },
                        date_paiement: { type: 'string', format: 'date-time' },
                    },
                },
                MessageResponse: {
                    type: 'object',
                    properties: { message: { type: 'string' } },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: { message: { type: 'string' } },
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
