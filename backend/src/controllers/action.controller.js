const pool = require('../config/db');

//Tous les actions administratives
const getAllActions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                a.*,
                d.niveau_alerte,
                e.nom_etudiant,
                e.prenom_etudiant 
            FROM "ActionAdministrative" a
            JOIN "DossierAdministratif" d
            ON a.id_dossier = d.id_dossier 
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            WHERE d.statut_dossier = 'EN_COURS' 
            ORDER BY a."dateEnvoi" DESC`
        );

        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });
        
    }
};

//Une action id
const getActionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                a.*,
                d.niveau_alerte,
                e.nom_etudiant,
                e.prenom_etudiant
            FROM "ActionAdministrative" a
            JOIN "DossierAdministratif" d
            ON a.id_dossier = d.id_dossier
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant  
            WHERE a.id_action = $1`,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: 'Action introuvable'
            });
        }

        res.status(200).json(result.rows[0]);
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });
        
    }
};

const getActionsByDossier = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM "ActionAdministrative"
            WHERE id_dossier = $1
            ORDER BY "dateEnvoi" DESC
            `,
            [id]
        );

        res.status(200).json(result.rows);

    } catch(error) {

        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

const updateAction = async (req, res) =>{
    try {
        const { id } = req.params;

        const {
            statut_action,
            accuse_reception,
            remise_main_propre,
            signature_action,
            commentaire_action
        } = req.body;

        const result = await pool.query(
            `UPDATE "ActionAdministrative"
            SET
                statut_action = $1,
                accuse_reception = $2,
                remise_main_propre = $3,
                signature_action = $4,
                commentaire_action = $5
            WHERE id_action = $6
            RETURNING *`,
            [
                statut_action,
                accuse_reception,
                remise_main_propre,
                signature_action,
                commentaire_action,
                id
            ]
        );

        if (result.rows.length === 0){
            return res.status(404).json ({
                message: 'Action introuvable'
            });
        }

        res.status(200).json({
            message: 'Action administrative mise à jour',
            action: result.rows[0]
        });
        
    } catch (error) {

        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });        
    }
};

module.exports = {
    getAllActions,
    getActionById,
    getActionsByDossier,
    updateAction
};