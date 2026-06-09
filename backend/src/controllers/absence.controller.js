const pool = require('../config/db');

const verifierSeuils = require('../services/seuil.service');


//Ajout d'une absence
const createAbsence = async(req, res) => {
    try {
        const {
            date_absence,
            duree,
            justifiee,
            motif,
            statut,
            id_etudiant
        } = req.body;

        const result = await pool.query(

            `INSERT INTO "Absence"
            (
                date_absence,
                duree,
                justifiee,
                motif,
                statut,
                id_etudiant
            )
            
            VALUES ($1, $2, $3, $4, $5, $6)

            RETURNING *`,
            [
                date_absence,
                duree,
                justifiee,
                motif,
                statut,
                id_etudiant
            ]
        );

        // ON verifie des seuils
        await verifierSeuils(id_etudiant);

        res.status(201).json({
            message: 'Absence ajoutée',
            absence: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

//Recuperer toute les absences
const getAllAbsences = async (req,res) => {
    try {

        const result = await pool.query(

            `SELECT
                a.*,
                e.nom_etudiant,
                e.prenom_etudiant

            FROM "Absence" a

            JOIN "Etudiant" e
            ON a.id_etudiant = e.id_etudiant

            ORDER BY date_absence DESC`
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
    createAbsence,
    getAllAbsences
};