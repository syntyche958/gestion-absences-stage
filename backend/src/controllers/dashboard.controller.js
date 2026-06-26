const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const etudiants = await pool.query(
            `SELECT COUNT(*) FROM "Etudiant"`
        );

        const absences = await pool.query(
            `SELECT COUNT(*) FROM "Absence"`
        );

        const absencesInjustifiees = await pool.query(
            `SELECT COUNT(*) FROM "Absence"
             WHERE justifiee = false`
        );

        const dossiersOuverts = await pool.query(
            `SELECT COUNT(*) FROM "DossierAdministratif"
             WHERE statut_dossier = 'EN_COURS'`
        );

        const dossiersClotures = await pool.query(
            `SELECT COUNT(*) FROM "DossierAdministratif"
             WHERE statut_dossier = 'CLOTURE'`
        );

        const actionsATraiter = await pool.query(
            `SELECT COUNT(*) FROM "ActionAdministrative"
             WHERE statut_action = 'A_TRAITER'`
        );

        const actionsTerminees = await pool.query(
            `SELECT COUNT(*) FROM "ActionAdministrative"
             WHERE statut_action = 'TERMINEE'`
        );

        const convocationsEnAttente = await pool.query(
            `SELECT COUNT(*) FROM "Convocation"
             WHERE statut_convoc IN ('GENEREE', 'A_PLANIFIER')`
        );

        const convocationsEnvoyees = await pool.query(
            `SELECT COUNT(*) FROM "Convocation"
             WHERE statut_convoc = 'ENVOYEE'`
        );

        const convocationsSignees = await pool.query(
            `SELECT COUNT(*) FROM "Convocation"
             WHERE signature = true
             OR statut_convoc = 'SIGNEE'`
        );

        const historique = await pool.query(
            `SELECT COUNT(*) FROM "Historique"`
        );

        res.status(200).json({
            etudiants: parseInt(etudiants.rows[0].count),
            absences: parseInt(absences.rows[0].count),
            absences_injustifiees: parseInt(absencesInjustifiees.rows[0].count),
            dossiers_ouverts: parseInt(dossiersOuverts.rows[0].count),
            dossiers_clotures: parseInt(dossiersClotures.rows[0].count),
            actions_a_traiter: parseInt(actionsATraiter.rows[0].count),
            actions_terminees: parseInt(actionsTerminees.rows[0].count),
            convocations_en_attente: parseInt(convocationsEnAttente.rows[0].count),
            convocations_envoyees: parseInt(convocationsEnvoyees.rows[0].count),
            convocations_signees: parseInt(convocationsSignees.rows[0].count),
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