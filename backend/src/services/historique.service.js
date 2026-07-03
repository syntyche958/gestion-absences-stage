const pool = require('../config/db')

/**
 * Ajoute une entrée dans l'historique administratif d'un dossier.
 *
 * Cette fonction centralise la traçabilité des actions importantes :
 * - création de dossier ;
 * - création d'action ;
 * - génération ou modification de courrier ;
 * - clôture d'un dossier.
 */
const ajouterHistorique = async (
  id_dossier,
  id_utilisateur,
  action_effectuee,
  description
) => {
  try {
    await pool.query(
      `INSERT INTO "Historique"
       (
        action_effectuee,
        description,
        date_action,
        id_dossier,
        id_utilisateur
       )
       VALUES ($1, $2, NOW(), $3, $4)`,
      [
        action_effectuee,
        description,
        id_dossier,
        id_utilisateur
      ]
    )
  } catch (error) {
    console.error('Erreur ajout historique :', error)
  }
}

module.exports = ajouterHistorique
