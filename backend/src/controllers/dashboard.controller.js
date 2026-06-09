const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const etudiants = await pool.query(`SELECT COUNT(*) FROM "Etudiant"`);
        const absences = await pool.query(`SELECT COUNT(*) FROM "Absence"`);
        const dossiers = await pool.query(`SELECT COUNT(*) FROM "DossierAdministratif"`);
        const actions = await pool.query(`SELECT COUNT(*) FROM "ActionAdministrative"`);
        const convocations = await pool.query(`SELECT COUNT(*) FROM "Convocation"`);
        const historique = await pool.query(`SELECT COUNT(*) FROM "Historique"`);

        res.status(200).json({
            etudiants: parseInt(etudiants.rows[0].count),
            absences: parseInt(absences.rows[0].count),
            dossiers: parseInt(dossiers.rows[0].count),
            actions: parseInt(actions.rows[0].count),
            convocations: parseInt(convocations.rows[0].count),
            historique: parseInt(historique.rows[0].count)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getDashboardStats
};