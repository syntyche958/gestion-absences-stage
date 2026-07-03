const pool = require('../config/db')
const ajouterHistorique = require('./historique.service')

/**
 * Vérifie les seuils d'absences injustifiées d'un étudiant.
 *
 * Logique métier :
 * - À partir de 2 absences injustifiées : création d'un RAPPEL.
 * - À partir de 4 absences injustifiées après un rappel : création d'un AVERTISSEMENT.
 * - À partir de 5 absences injustifiées après un avertissement : création d'une SANCTION.
 *
 * La colonne total_absences_traitees permet de garder une trace du total
 * d'absences au moment où le dossier administratif a été créé.
 */
const verifierSeuils = async (id_etudiant) => {
  try {
    /**
     * 1. Calcul du nombre total d'absences injustifiées.
     */
    const result = await pool.query(
      `SELECT COUNT(*) AS total
       FROM "Absence"
       WHERE id_etudiant = $1
       AND justifiee = false`,
      [id_etudiant]
    )

    const total = parseInt(result.rows[0].total)

    if (total < 2) return

    /**
     * 2. Récupération du dernier dossier administratif de l'étudiant.
     * Il permet de savoir à quelle étape se trouve déjà l'étudiant.
     */
    const dernierDossierResult = await pool.query(
      `SELECT *
       FROM "DossierAdministratif"
       WHERE id_etudiant = $1
       ORDER BY date_creation DESC
       LIMIT 1`,
      [id_etudiant]
    )

    const dernierDossier = dernierDossierResult.rows[0]

    let niveauAlerte = null
    let nouvellesAbsences = total

    /**
     * 3. Détermination du niveau d'alerte à créer.
     */
    if (!dernierDossier) {
      niveauAlerte = 'RAPPEL'
      nouvellesAbsences = total
    } else {
      const dernierTotal = Number(dernierDossier.total_absences_traitees || 0)
      nouvellesAbsences = total - dernierTotal

      if (dernierDossier.niveau_alerte === 'RAPPEL' && total >= 4) {
        niveauAlerte = 'AVERTISSEMENT'
      }

      if (dernierDossier.niveau_alerte === 'AVERTISSEMENT' && total >= 5) {
        niveauAlerte = 'SANCTION'
      }

      if (dernierDossier.niveau_alerte === 'SANCTION') {
        return
      }
    }

    if (!niveauAlerte) return

    /**
     * 4. Vérification pour éviter de créer deux fois le même dossier actif.
     */
    const dossierActif = await pool.query(
      `SELECT *
       FROM "DossierAdministratif"
       WHERE id_etudiant = $1
       AND statut_dossier = 'EN_COURS'
       ORDER BY date_creation DESC
       LIMIT 1`,
      [id_etudiant]
    )

    if (
      dossierActif.rows.length > 0 &&
      dossierActif.rows[0].niveau_alerte === niveauAlerte
    ) {
      return
    }

    /**
     * 5. Clôture de l'ancien dossier actif avant création du nouveau.
     */
    await pool.query(
      `UPDATE "DossierAdministratif"
       SET statut_dossier = 'CLOTURE',
           date_cloture = NOW()
       WHERE id_etudiant = $1
       AND statut_dossier = 'EN_COURS'`,
      [id_etudiant]
    )

    /**
     * 6. Création du nouveau dossier administratif.
     */
    const nouveauDossier = await pool.query(
      `INSERT INTO "DossierAdministratif"
       (
        statut_dossier,
        niveau_alerte,
        date_creation,
        commentaire_dossier,
        id_etudiant,
        annee_universitaire,
        total_absences_traitees
       )
       VALUES ($1, $2, NOW(), $3, $4, $5, $6)
       RETURNING *`,
      [
        'EN_COURS',
        niveauAlerte,
        `Dossier ${niveauAlerte} créé après ${nouvellesAbsences} nouvelle(s) absence(s). Total cumulé : ${total}.`,
        id_etudiant,
        '2025-2026',
        total
      ]
    )

    const idDossier = nouveauDossier.rows[0].id_dossier

    /**
     * 7. Définition de l'action administrative selon le niveau.
     */
    let typeAction = ''
    let moyenEnvoi = ''

    if (niveauAlerte === 'RAPPEL') {
      typeAction = "Rappel à l'obligation d'assiduité"
      moyenEnvoi = 'Mail ou oral par le Directeur des études'
    }

    if (niveauAlerte === 'AVERTISSEMENT') {
      typeAction = 'Avertissement'
      moyenEnvoi = 'Courrier recommandé avec AR ou remise en main propre'
    }

    if (niveauAlerte === 'SANCTION') {
      typeAction = 'Sanction direction'
      moyenEnvoi = 'Direction / scolarité'
    }

    /**
     * 8. Création de l'action administrative.
     */
    const action = await pool.query(
      `INSERT INTO "ActionAdministrative"
       (
        "type_action",
        "seuil",
        "moyenEnvoi",
        "dateEnvoi",
        "accuse_reception",
        "remise_main_propre",
        "signature_action",
        "commentaire_action",
        "statut_action",
        "id_dossier"
       )
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        typeAction,
        total,
        moyenEnvoi,
        false,
        false,
        false,
        `Action créée automatiquement : ${niveauAlerte}. ${nouvellesAbsences} nouvelle(s) absence(s), total cumulé ${total}.`,
        'A_TRAITER',
        idDossier
      ]
    )

    /**
     * 9. Historique du dossier et de l'action.
     */
    await ajouterHistorique(
      idDossier,
      1,
      'CREATION_DOSSIER',
      `Dossier ${niveauAlerte} créé. ${nouvellesAbsences} nouvelle(s) absence(s) depuis le dernier traitement. Total cumulé : ${total}.`
    )

    await ajouterHistorique(
      idDossier,
      1,
      'CREATION_ACTION',
      `Action administrative créée : ${typeAction}.`
    )

    /**
     * 10. Création d'une notification métier.
     */
    await pool.query(
      `INSERT INTO "Notification"
       (
        type_notif,
        message_notif,
        date_envoi,
        statut_notif,
        id_dossier
       )
       VALUES ($1, $2, NOW(), $3, $4)`,
      [
        niveauAlerte,
        `${niveauAlerte} à traiter : ${nouvellesAbsences} nouvelle(s) absence(s) depuis le dernier traitement. Total actuel : ${total} absences injustifiées.`,
        'NON_LUE',
        idDossier
      ]
    )

    await ajouterHistorique(
      idDossier,
      1,
      'CREATION_NOTIFICATION',
      `Notification créée : ${niveauAlerte} avec ${nouvellesAbsences} nouvelle(s) absence(s). Total : ${total}.`
    )

    /**
     * 11. Génération automatique du courrier pour l'avertissement.
     */
    if (niveauAlerte === 'AVERTISSEMENT') {
      await pool.query(
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
          null,
          'GENEREE',
          `Avertissement à la suite de ${total} absences injustifiées.`,
          false,
          `Courrier d'avertissement généré automatiquement après ${nouvellesAbsences} nouvelle(s) absence(s). Total cumulé : ${total}.`,
          1,
          idDossier,
          'Courrier recommandé avec AR',
          'Avertissement',
          'Chef de département'
        ]
      )

      await ajouterHistorique(
        idDossier,
        1,
        'CREATION_COURRIER',
        `Courrier d'avertissement généré automatiquement. Total cumulé : ${total} absences injustifiées.`
      )
    }

    console.log('Dossier créé :', nouveauDossier.rows[0])
    console.log('Action créée :', action.rows[0])
  } catch (error) {
    console.error('Erreur vérification seuils :', error)
  }
}

module.exports = verifierSeuils