<script setup>
import { computed } from 'vue'

const props = defineProps({
  convocation: Object
})

const totalAbsences = computed(() => {
  return (
    props.convocation?.seuil ||
    props.convocation?.total_injustifiees ||
    props.convocation?.total_absences_traitees ||
    'X'
  )
})

const objetCourrier = computed(() => {
  return (
    props.convocation?.motif ||
    `Avertissement à la suite de ${totalAbsences.value} absences injustifiées.`
  )
})
</script>

<template>
  <div class="courrier-officiel">
    <div class="header">
      <div>
        <strong>DOSSIER SUIVI PAR : Boursier Aline</strong>
        <p>Mail : aline.boursier@univ-fcomte.fr</p>
        <p>Tél : 03.84.58.77.82</p>
      </div>

      <div>
        <p>Belfort, le {{ new Date().toLocaleDateString('fr-FR') }}</p>
        <p>
          Monsieur / Madame<br>
          {{ convocation.prenom_etudiant }}
          {{ convocation.nom_etudiant }}
        </p>
      </div>
    </div>

    <p><strong><u>Objet :</u></strong></p>

    <p>{{ objetCourrier }}</p>

    <p>Madame, Monsieur,</p>

    <p>
      Vous êtes inscrit pour l’année universitaire 2025-2026 et vous êtes tenu
      d’assister à toutes les activités pédagogiques dispensées par votre département.
    </p>

    <p>
      Toutes vos absences doivent être justifiées selon les modalités décrites
      dans le Règlement Général des Examens et des Études 2025.
    </p>

    <p>
      Or, ce semestre vous avez cumulé
      <strong>{{ totalAbsences }} absences injustifiées</strong>.
    </p>

    <p>
      Cette lettre remise en main propre contre décharge constitue un avertissement.
    </p>

    <p>
      Ainsi, à la prochaine absence non justifiée au cours du semestre,
      un courrier de la Direction de l’IUT vous informant que les moyennes des UE
      du semestre ne seront pas calculées vous sera envoyé.
      Vous ne pourrez donc pas les valider.
    </p>

    <p>
      Je vous informe également que conformément au Règlement Général des Études
      et des Examens, en cas de non-respect des conditions d’assiduité,
      le CROUS peut suspendre le versement de la bourse.
    </p>

    <p>
      Je vous prie de croire, Madame, Monsieur,
      à l’expression de toute ma considération.
    </p>

    <p class="signature">
      Le Chef de département
    </p>
  </div>

  <div class="recours">
    <p><strong><u>Voies et délais de recours :</u></strong></p>

    <p>
      Si vous souhaitez contester la présente décision, vous pouvez :
    </p>

    <ul>
      <li>
        Former un recours gracieux adressé au service scolarité à l’adresse
        sae-iutnfc@univ-fcomte.fr dans un délai de 2 mois.
      </li>

      <li>
        Former un recours contentieux auprès du Tribunal Administratif de Besançon
        dans un délai de 2 mois.
      </li>
    </ul>
  </div>

  <div class="footer">
    Institut Universitaire de Technologie Nord Franche-Comté<br>
    Site Techn’hom – 19 avenue de Maréchal Juin<br>
    BP 527 – 90016 Belfort Cedex France<br>
    Tél. : 03 84 58 77 00 – www.iut-nfc.univ-fcomte.fr
  </div>
</template>

<style scoped>
.courrier-officiel {
  font-family: Arial, sans-serif;
  color: #111827;
  line-height: 1.6;
  font-size: 15px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 35px;
}

.header p {
  margin: 4px 0;
}

.signature {
  text-align: center;
  margin-top: 45px;
}

.recours {
  margin-top: 55px;
  font-size: 12px;
  line-height: 1.4;
}

.recours ul {
  padding-left: 18px;
}

.recours li {
  margin-bottom: 8px;
}

.footer {
  margin-top: 30px;
  text-align: right;
  font-size: 11px;
  color: #374151;
}
</style>