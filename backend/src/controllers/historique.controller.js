const pool = require('../config/db');

// Récupérer tout l'historique
const getAllHistorique = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                h.*,
                d.niveau_alerte,
                e.nom_etudiant,
                e.prenom_etudiant,
                u.nom_utilisateur,
                u.prenom_utilisateur
            FROM "Historique" h
            JOIN "DossierAdministratif" d
            ON h.id_dossier = d.id_dossier
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            JOIN "Utilisateur" u
            ON h.id_utilisateur = u.id_utilisateur
            ORDER BY h.date_action DESC`
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

// Récupérer l'historique d'un dossier
const getHistoriqueByDossier = async (req, res) => {
    try {
        const { id_dossier } = req.params;

        const result = await pool.query(
            `SELECT 
                h.*,
                u.nom_utilisateur,
                u.prenom_utilisateur
            FROM "Historique" h
            JOIN "Utilisateur" u
            ON h.id_utilisateur = u.id_utilisateur
            WHERE h.id_dossier = $1
            ORDER BY h.date_action DESC`,
            [id_dossier]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getAllHistorique,
    getHistoriqueByDossier
};