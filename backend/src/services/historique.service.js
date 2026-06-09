const pool = require('../config/db');

const ajoutHistorique = async (id_dossier, id_utilisateur, action_effectuee, description) => {
    try {
        await pool.query (
            `INSERT INTO "Historique"
            (
                action_effectuee,
                description,
                date_action,
                id_dossier,
                id_utilisateur
            )
            VALUES ($1, $2, NOW(), $3, $4)`,
            [
                action_effectuee,
                description,
                id_dossier,
                id_utilisateur
            ]
        );

        console.log('Historique ajouté');
    } catch (error) {
        console.error('Erreur ajout historique :', error);
    }
};

module.exports = ajoutHistorique;