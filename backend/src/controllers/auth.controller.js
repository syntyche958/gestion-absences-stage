const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {

    try {

        const { email_utilisateur, mot_de_passe } = req.body;

        // Vérifier si utilisateur existe
        const result = await pool.query(
            'SELECT * FROM "Utilisateur" WHERE email_utilisateur = $1',
            [email_utilisateur]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        const utilisateur = result.rows[0];

        // Vérification mot de passe
        const validPassword = await bcrypt.compare(
            mot_de_passe,
            utilisateur.mot_de_passe
        );

        if (!validPassword) {
            return res.status(401).json({
                message: 'Mot de passe incorrect'
            });
        }

        // Génération token JWT
        const token = jwt.sign(
            {
                id: utilisateur.id_utilisateur,
                role: utilisateur.id_role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            utilisateur: {
                id: utilisateur.id_utilisateur,
                nom: utilisateur.nom_utilisateur,
                prenom: utilisateur.prenom_utilisateur,
                role: utilisateur.id_role
            }
            
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    login
};