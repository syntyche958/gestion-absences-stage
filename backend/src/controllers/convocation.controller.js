const pool = require('../config/db')
const ajouterHistorique = require('../services/historique.service')

/**
 * Crée un courrier administratif.
 *
 * Remarque métier :
 * - Le module s'appelle encore "Convocation" dans la base pour des raisons historiques.
 * - Fonctionnellement, il sert maintenant à gérer les courriers administratifs.
 */
const createConvocation = async (req, res) => {
  try {
    const {
      date_heure,
      statut_convoc,
      motif,
      signature,
      commentaire_convoc,
      id_utilisateur,
      id_dossier,
      mode_envoi,
      type_courrier,
      responsable
    } = req.body

    const convocationExiste = await pool.query(
      `SELECT *
       FROM "Convocation" c
       JOIN "DossierAdministratif" d
       ON c.id_dossier = d.id_dossier
       WHERE d.id_etudiant = (
        SELECT id_etudiant
        FROM "DossierAdministratif"
        WHERE id_dossier = $1
       )
       AND c.statut_convoc != 'ANNULEE'`,
      [id_dossier]
    )

    if (convocationExiste.rows.length > 0) {
      return res.status(409).json({
        message: 'Un courrier existe déjà pour ce dossier.'
      })
    }

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
        id_dossier,
        mode_envoi,
        type_courrier,
        responsable
       )
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        date_heure,
        statut_convoc,
        motif,
        signature,
        commentaire_convoc,
        id_utilisateur,
        id_dossier,
        mode_envoi,
        type_courrier,
        responsable
      ]
    )

    res.status(201).json({
      message: 'Courrier créé',
      convocation: result.rows[0]
    })
  } catch (error) {
    console.error('Erreur création courrier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Récupère tous les courriers avec les informations étudiant, dossier et seuil.
 * Le champ a.seuil permet d'afficher le nombre total d'absences injustifiées dans le courrier.
 */
const getAllConvocation = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        c.*,
        d.niveau_alerte,
        e.nom_etudiant,
        e.prenom_etudiant,
        u.nom_utilisateur,
        u.prenom_utilisateur,
        a.seuil
       FROM "Convocation" c
       JOIN "DossierAdministratif" d
        ON c.id_dossier = d.id_dossier
       JOIN "Etudiant" e
        ON d.id_etudiant = e.id_etudiant
       JOIN "Utilisateur" u
        ON c.id_utilisateur = u.id_utilisateur
       LEFT JOIN "ActionAdministrative" a
        ON a.id_dossier = d.id_dossier
       ORDER BY c.date_envoi DESC NULLS LAST, c.date_heure DESC NULLS LAST`
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erreur récupération courriers :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Récupère un courrier précis.
 */
const getConvocationById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT
        c.*,
        d.niveau_alerte,
        e.nom_etudiant,
        e.prenom_etudiant,
        u.nom_utilisateur,
        u.prenom_utilisateur,
        a.seuil
       FROM "Convocation" c
       JOIN "DossierAdministratif" d
        ON c.id_dossier = d.id_dossier
       JOIN "Etudiant" e
        ON d.id_etudiant = e.id_etudiant
       JOIN "Utilisateur" u
        ON c.id_utilisateur = u.id_utilisateur
       LEFT JOIN "ActionAdministrative" a
        ON a.id_dossier = d.id_dossier
       WHERE c.id_convocation = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Courrier introuvable' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Erreur récupération courrier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Met à jour un courrier administratif.
 *
 * Si le courrier est signé, le dossier associé est automatiquement clôturé.
 */
const updateConvocation = async (req, res) => {
  try {
    const { id } = req.params

    const {
      date_heure,
      statut_convoc,
      motif,
      signature,
      commentaire_convoc,
      lieu,
      mode_envoi,
      commentaire_interne,
      responsable
    } = req.body

    const result = await pool.query(
      `UPDATE "Convocation"
       SET
        date_heure = $1,
        statut_convoc = $2,
        motif = $3,
        signature = $4,
        commentaire_convoc = $5,
        lieu = $6,
        mode_envoi = $7,
        commentaire_interne = $8,
        responsable = $9
       WHERE id_convocation = $10
       RETURNING *`,
      [
        date_heure,
        statut_convoc,
        motif,
        signature,
        commentaire_convoc,
        lieu,
        mode_envoi,
        commentaire_interne,
        responsable,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Courrier introuvable' })
    }

    const courrierModifie = result.rows[0]

    if (courrierModifie.signature === true || courrierModifie.statut_convoc === 'SIGNEE') {
      await pool.query(
        `UPDATE "DossierAdministratif"
         SET statut_dossier = 'CLOTURE',
             date_cloture = NOW()
         WHERE id_dossier = $1`,
        [courrierModifie.id_dossier]
      )

      await ajouterHistorique(
        courrierModifie.id_dossier,
        courrierModifie.id_utilisateur,
        'CLOTURE_DOSSIER',
        'Dossier clôturé automatiquement après signature du courrier.'
      )
    }

    await ajouterHistorique(
      courrierModifie.id_dossier,
      courrierModifie.id_utilisateur,
      'MODIFICATION_COURRIER',
      `Courrier mis à jour avec le statut ${courrierModifie.statut_convoc}.`
    )

    res.status(200).json({
      message: 'Courrier mis à jour',
      convocation: courrierModifie
    })
  } catch (error) {
    console.error('Erreur mise à jour courrier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Supprime un courrier administratif.
 */
const deleteConvocation = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM "Convocation"
       WHERE id_convocation = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Courrier introuvable' })
    }

    res.status(200).json({
      message: 'Courrier supprimé',
      convocation: result.rows[0]
    })
  } catch (error) {
    console.error('Erreur suppression courrier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Récupère les courriers rattachés à un dossier administratif.
 */
const getConvocationsByDossier = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM "Convocation"
       WHERE id_dossier = $1
       ORDER BY date_envoi DESC NULLS LAST, date_heure DESC NULLS LAST`,
      [id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Erreur récupération courriers du dossier :', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

module.exports = {
  createConvocation,
  getAllConvocation,
  getConvocationById,
  updateConvocation,
  deleteConvocation,
  getConvocationsByDossier
}
