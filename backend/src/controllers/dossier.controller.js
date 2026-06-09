const pool = require('../config/db')

//Recuperation de tous les dossiers administraifs
const getAllDossiers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                d.*,
                e.nom_etudiant,
                e.groupe_td,
                e.groupe_tp,
                e.semestre
            FROM "DossierAdministratif" d
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            ORDER BY d.date_creation DESC`
        );

        res.status(200).json(result.rows);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });        
    }
};

//Recuperation d'un dossier par id
const getDossierById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                 d.*,
                e.nom_etudiant,
                e.prenom_etudiant,
                e.groupe_td,
                e.groupe_tp,
                e.semestre
            FROM "DossierAdministratif" d
            JOIN "Etudiant" e
            ON d.id_etudiant = e.id_etudiant
            WHERE d.id_dossier = $1`,
            [id]   
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Dossier introuvable'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error){
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getAllDossiers,
    getDossierById
};