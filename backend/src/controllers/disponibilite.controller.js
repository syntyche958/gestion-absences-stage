const pool = require('../config/db');

//Ajouter une disponibilité
const createDisponibilite = async (req, res) => {
    try {
        const {
            date_disponibilite,
            heure_debut,
            heure_fin,
            disponible,
            id_utilisateur
        } = req.body;

        const result = await pool.query(
            `INSERT INTO "Disponibilite"
            (
                date_disponibilite,
                heure_debut,
                heure_fin,
                disponible,
                id_utilisateur
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                date_disponibilite,
                heure_debut,
                heure_fin,
                disponible,
                id_utilisateur
            ]
        );

        res.status(201).json({
            message: 'Disponibilité ajoutée',
            disponibilite: result.rows[0]
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

//Recuperation de toutes les disponibilités
const getAllDisponibilites = async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                d.*,
                u.nom_utilisateur,
                u.prenom_utilisateur
            FROM "Disponibilite" d
            JOIN "Utilisateur" u
            ON d.id_utilisateur = u.id_utilisateur
            ORDER BY d.date_disponibilite ASC, d.heure_debut ASC`
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
    createDisponibilite,
    getAllDisponibilites
};