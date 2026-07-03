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
  return props.convocation?.motif ||
    `Avertissement à la suite de ${totalAbsences.value} absences injustifiées.`
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
          {{ convocation.prenom_etudiant }} {{ convocation.nom_etudiant }}
        </p>
      </div>
    </div>

    <p><strong><u>Objet :</u></strong></p>

    <p>{{ objetCourrier }}</p>

    <p>Courrier recommandé avec AR.</p>

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
      Cette lettre recommandée avec avis de réception constitue un avertissement.
    </p>

    <p>
      Ainsi, à la prochaine absence non justifiée au cours du semestre, un courrier
      de la Direction de l’IUT vous informant que les moyennes des UE du semestre
      ne seront pas calculées vous sera envoyé.
    </p>

    <p>
      Je vous prie de croire, Madame, Monsieur, à l’expression de toute ma considération.
    </p>

    <p class="signature">Le Chef de département</p>
  </div>
</template>