const pool = require('../config/db')

const getNotificationsByDossier = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT *
       FROM "Notification"
       WHERE id_dossier = $1
       ORDER BY date_envoi DESC`,
      [id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

module.exports = {
  getNotificationsByDossier
}