const pool = require('../config/db');
const ajouterHistorique = require('./historique.service');

const verifierSeuils = async (id_etudiant) => {

    try{
        //compter absences injustifiées
        const result = await pool.query(

            `SELECT COUNT(*) AS total
            FROM "Absence"
            WHERE id_etudiant = $1
            AND justifiee = false`,
            [id_etudiant]
        );

        const total = parseInt(result.rows[0].total);

        let niveauAlerte = null;

        // Seuil 2
        if (total === 2) {
            niveauAlerte = 'RAPPEL';
        } else if (total === 4) {
            niveauAlerte = 'AVERTISSEMENT';
        } else if (total === 5) {
            niveauAlerte = 'SANCTION';
        }

        if (!niveauAlerte) {
            return;
        }

        const dossierExiste = await pool.query(
            `SELECT *
            FROM "DossierAdministratif"
            WHERE id_etudiant = $1
            AND niveau_alerte = $2
            AND statut_dossier = 'EN_COURS'
            `,
            [id_etudiant,niveauAlerte]
        );

        if (dossierExiste.rows.length > 0) {
            console.log(`Dossier ${niveauAlerte} déjà existant`);
            return;
        }

        //creer le dossier administratif
        const nouveauDossier = await pool.query(
            `INSERT INTO "DossierAdministratif"
            (
                statut_dossier,
                niveau_alerte,
                date_creation,
                commentaire_dossier,
                id_etudiant
            )
            VALUES ($1, $2, NOW(), $3, $4)
            RETURNING *`,
            [
                'EN_COURS',
                niveauAlerte,
                `Dossier créé automatiquement après ${total} absences injustifiées.`, id_etudiant
            ]
        );

        console.log('Dossier crée :', nouveauDossier.rows[0]);

        let typeAction = null;
        let moyenEnvoi = null;

        if (niveauAlerte === 'RAPPEL') {
            typeAction = "Rappel d'assiduité";
            moyenEnvoi = 'Mail';
        } else if (niveauAlerte === 'AVERTISSEMENT') {
            typeAction = "Avertissement";
            moyenEnvoi = 'Courrier recommandé ou remise en main propre';
        } else if (niveauAlerte === 'SANCTION') {
            typeAction = "Convocation direction / sanction à traiter";
            moyenEnvoi = 'Lettre recommandée avec accusé de réception';
        }

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
            VALUES ($1, $2, $3, Now(), $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                typeAction,
                total,
                moyenEnvoi,
                false,
                false,
                false,
                `Action crée automatiquement pour le seuil ${niveauAlerte}`,
                'A_TRAITER',
                nouveauDossier.rows[0].id_dossier
            ]
        );

        console.log('Action Administrative crée :', action.rows[0]);

        await ajouterHistorique(
            nouveauDossier.rows[0].id_dossier,
            1,
            'CREATION_DOSSIER',
            `Dossier ${niveauAlerte} crée automatiquement après ${total} absences injustifiées.`
        );

        await ajouterHistorique(
            nouveauDossier.rows[0].id_dossier,
            1,
            'CREATION_DOSSIER',
            `Dossier administrative ${typeAction} crée automatiquement.`
        );

        if (niveauAlerte === 'SANCTION'){
            const convocation = await pool.query(
                `INSERT INTO "Convocation"
                (
                    date_heure,
                    statut_convoc,
                    motif,
                    signature,
                    commentaire_convoc,
                    date_envoi,
                    id_utilisateur,
                    id_dossier
                )
                VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
                RETURNING *`,
                [
                    null,
                    'A_PLANIFIER',
                    "Convocation automatique suite au seuil de 5 absences injustifiées.",
                    false,
                    "Convocation créée automatiquement en attente de planification.",
                    1,
                    nouveauDossier.rows[0].id_dossier
                ]
            );

            console.log('Convocation automatique créée :', convocation.rows[0]);

            await ajouterHistorique(
            nouveauDossier.rows[0].id_dossier,
            1,
            'CREATION_CONVOCATION',
            'Convocation créée automatiquement suite au seuil SANCTION.'
        );
    }
    
    } catch (error){
        console.error('Erreur vérification seuils :', error);
    }
};

module.exports = verifierSeuils