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

const getSuiviAbsences = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                e.id_etudiant,
                e.nom_etudiant,
                e.prenom_etudiant,
                e.groupe_td,
                e.groupe_tp,
                e.semestre,

                COUNT(a.id_absence) AS total_absences,

                SUM(
                    CASE
                        WHEN a.justifiee = false THEN 1
                        ELSE 0
                    END
                ) AS total_injustifiees,

                d.id_dossier,
                d.niveau_alerte,
                d.statut_dossier

            FROM "Etudiant" e

            LEFT JOIN "Absence" a
            ON e.id_etudiant = a.id_etudiant

            LEFT JOIN "DossierAdministratif" d
            ON e.id_etudiant = d.id_etudiant
            AND d.statut_dossier = 'EN_COURS'

            GROUP BY
                e.id_etudiant,
                e.nom_etudiant,
                e.prenom_etudiant,
                e.groupe_td,
                e.groupe_tp,
                e.semestre,
                d.id_dossier,
                d.niveau_alerte,
                d.statut_dossier

            ORDER BY total_injustifiees DESC`
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

const getAbsencesByEtudiant = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM "Absence"
             WHERE id_etudiant = $1
             ORDER BY date_absence DESC`,
            [id]
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
    getAllAbsences,
    getSuiviAbsences,
    getAbsencesByEtudiant
};