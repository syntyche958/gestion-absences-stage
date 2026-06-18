const pool = require('../config/db');
const ajoutHostorique = require('../services/historique.service');
//creer une convocation
const createConvocation = async (req, res) =>{
    try {
        const {
            date_heure,
            statut_convoc,
            motif,
            signature,
            commentaire_convoc,
            id_utilisateur,
            id_dossier
        } = req.body;

        const result = await pool.query(
            `INSERT INTO "Convocation"
            (
                date_heure,
                statut_convoc,
                motif,
                signature,
                commentaire_convoc,
                date_envoi,
                id_utilisateur,
                id_dossier
            )
            VALUES ($1, $2, $3, $4, $5, Now(), $6, $7)
            RETURNING *`,
            [
                date_heure,
                statut_convoc,
                motif,
                signature,
                commentaire_convoc,
                id_utilisateur,
                id_dossier
            ]
        );

        res.status(201).json({
            message: 'Convocation créée',
            convocation: result.rows[0]
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

//Récupérer toutes les convocation

const getAllConvocation = async (req, res) =>{
    try {
        const result = await pool.query(
            `SELECT
                c.*,
                d.niveau_alerte,
                e.nom_etudiant,
                e.prenom_etudiant,
                u.nom_utilisateur,
                u.prenom_utilisateur
            FROM "Convocation" c
            JOIN "DossierAdministratif" d
            ON c.id_dossier = d.id_dossier
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            JOIN "Utilisateur" u
            ON c.id_utilisateur = u.id_utilisateur
            ORDER BY c.date_heure DESC`
        );

        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

const getConvocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                c.*,
                d.niveau_alerte,
                e.nom_etudiant,
                e.prenom_etudiant,
                u.nom_utilisateur,
                u.prenom_utilisateur
            FROM "Convocation" c
            JOIN "DossierAdministratif" d
            ON c.id_dossier = d.id_dossier
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            JOIN "Utilisateur" u
            ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_convocation = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Convocation introuvable'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
}

//Modifier une convocation
const updateConvocation = async (req, res) =>{
    try {
        const { id } = req.params;

        const {
            date_heure,
            statut_convoc,
            motif,
            signature,
            commentaire_convoc
        } = req.body;

        const result = await pool.query(
            `UPDATE "Convocation"
            SET 
                date_heure = $1,
                statut_convoc = $2,
                motif = $3,
                signature = $4,
                commentaire_convoc = $5
            WHERE id_convocation = $6
            RETURNING *`,
        [
            date_heure,
            statut_convoc,motif,
            signature,
            commentaire_convoc,
            id
        ]
    );

    if (result.rows.length === 0){
        return res.status(404).json({
            message: 'Convocation introuvable'
        });
    }

    const convocationModiffee = result.rows[0]

    await ajoutHostorique(
        convocationModiffee.id_dossier,
        convocationModiffee.id_utilisateur,
        'Modification_convocation',
        `Convocation mise à jour avec le statut ${convocationModiffee.statut_convoc}.`
    );

    res.status(200).json({
        message: 'Convocation mise à jour',
        convocation: result.rows[0]
    });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

const deleteConvocation = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM "Convocation"
            WHERE id_convocation = $1
            RETURNING *`,
            [id]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                message: 'Convocation introuvable'
            });
        }

        res.status(200).json({
            message: 'Convocation supprimée',
            convocation: result.rows[0]
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};


module.exports = {
    createConvocation,
    getAllConvocation,
    getConvocationById,
    updateConvocation,
    deleteConvocation
};