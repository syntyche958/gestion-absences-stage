const pool = require('../config/db')

/**
 * Récupère les actions administratives liées aux dossiers actifs.
 *
 * La requête utilise LEFT JOIN LATERAL pour récupérer la dernière action
 * associée à chaque dossier administratif en cours.
 */
const getAllActions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        d.id_dossier,
        d.niveau_alerte,
        d.statut_dossier,
        e.nom_etudiant,
        e.prenom_etudiant,
        a.id_action,
        a.type_action,
        a.seuil,
        a."moyenEnvoi",
        a."dateEnvoi",
        a.statut_action,
        a.commentaire_action,
        a.accuse_reception,
        a.remise_main_propre,
        a.signature_action
       FROM "DossierAdministratif" d
       JOIN "Etudiant" e
        ON d.id_etudiant = e.id_etudiant
       LEFT JOIN LATERAL (
        SELECT *
        FROM "ActionAdministrative"
        WHERE id_dossier = d.id_dossier
        ORDER BY "dateEnvoi" DESC
        LIMIT 1
       ) a ON true
       WHERE d.statut_dossier = 'EN_COURS'
       ORDER BY
        CASE
          WHEN d.niveau_alerte = 'SANCTION' THEN 1
          WHEN d.niveau_alerte = 'AVERTISSEMENT' THEN 2
          WHEN d.niveau_alerte = 'RAPPEL' THEN 3
          ELSE 4
        END`
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erreur récupération actions :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Récupère une action administrative précise.
 */
const getActionById = async (req, res) => {
  try {
    const { id } = req.params

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
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action introuvable' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Erreur récupération action :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Récupère toutes les actions d'un dossier administratif.
 * Utilisé notamment pour reconstruire la chronologie administrative.
 */
const getActionsByDossier = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM "ActionAdministrative"
       WHERE id_dossier = $1
       ORDER BY "dateEnvoi" DESC`,
      [id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erreur récupération actions du dossier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Met à jour le traitement d'une action administrative.
 */
const updateAction = async (req, res) => {
  try {
    const { id } = req.params

    const {
      statut_action,
      accuse_reception,
      remise_main_propre,
      signature_action,
      commentaire_action,
      moyenEnvoi
    } = req.body

    const result = await pool.query(
      `UPDATE "ActionAdministrative"
       SET
        statut_action = $1,
        accuse_reception = $2,
        remise_main_propre = $3,
        signature_action = $4,
        commentaire_action = $5,
        "moyenEnvoi" = $6
       WHERE id_action = $7
       RETURNING *`,
      [
        statut_action,
        accuse_reception,
        remise_main_propre,
        signature_action,
        commentaire_action,
        moyenEnvoi,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action introuvable' })
    }

    res.status(200).json({
      message: 'Action administrative mise à jour',
      action: result.rows[0]
    })
  } catch (error) {
    console.error('Erreur mise à jour action :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

module.exports = {
  getAllActions,
  getActionById,
  getActionsByDossier,
  updateAction
}
