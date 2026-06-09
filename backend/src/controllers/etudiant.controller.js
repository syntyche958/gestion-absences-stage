const pool = require('../config/db');


// Récupérer tous les étudiants
const getAllEtudiants = async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM "Etudiant" ORDER BY nom_etudiant ASC'
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });

    }
};


// Récupérer un étudiant par id
const getEtudiantById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM "Etudiant" WHERE id_etudiant = $1',
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: 'Étudiant introuvable'
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

module.exports = {
    getAllEtudiants,
    getEtudiantById
};