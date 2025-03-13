<template>
  <div>
    <div id="publication-table"></div>
  </div>
</template>

<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import axios from "axios";
import { onMounted } from "vue";



// Définir un événement pour émettre l'ID du groupe sélectionné
const emit = defineEmits(["publication-selected"]);
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
async function fetchPublications() {
  try {
    const response = await axios.get(`${VITE_API_BASE_URL}/api/publications`);
    console.log("Données récupérées :", response.data);

    const today = new Date();
    const publications = response.data.map((pub) => {
      const startingDate = new Date(pub.startingDate);
      const endDate = new Date(pub.endDate);

      // Ajouter une mention de statut en fonction de la date
      let status = "Coming";
      if (today >= startingDate && today <= endDate) {
        status = "Open";
      } else if (today > endDate) {
        status = "Close";
      }

      return {
        ...pub,
        status, // Ajouter le statut dans chaque élément
      };
    });

    createTable(publications);
  } catch (error) {
    console.error("Erreur lors de la récupération des publications :", error);
  }
}

async function deletePublication(publicationId) {
  if (!confirm("Are you sure you want to delete this publication?")) return;

  try {
    await axios.delete(`${VITE_API_BASE_URL}/api/publications/${publicationId}`);
    alert("Publication deleted successfully!");
    fetchPublications(); // Rafraîchir la table après suppression
  } catch (error) {
    console.error("Error deleting publication:", error.response?.data || error.message);
    alert("An error occurred while deleting the publication.");
  }
}


function createTable(data) {
  const table = new Tabulator("#publication-table", {
    data,
    layout: "fitColumns",
    columns: [
      { title: "Publication Name", field: "publicationName", widthGrow: 2 },
      { title: "Status", field: "status", widthGrow: 1 }, // Affiche Coming, Open ou Close
      { title: "Group", field: "groupId.groupName", widthGrow: 1 }, // Affiche Coming, Open ou Close
      { title: "Test", field: "testId.title", widthGrow: 1 }, // Affiche Coming, Open ou Close
      { title:"startingDate", field:"startingDate"},
      { title:"enDate", field:"endDate"},
      {
        title: "Reports",
        field: "reports",
        formatter: (cell) => {
          const reports = cell.getValue();
          if (!reports) return "";
          return `
            ${reports.studentReport ? '<i class="icon-download" title="Student Report">Stud</i>' : ""}
            ${reports.groupReport ? '<i class="icon-download" title="Group Report">Group</i>' : ""}
            ${reports.statisticReport ? '<i class="icon-download" title="Statistic Report">Stat</i>' : ""}
          `;
        },
        widthGrow: 1,
        headerSort: false,
      },
      {
        title: "Actions",
        field: "actions",
        formatter: (cell, formatterParams, onRendered) => {
          const button = document.createElement("button");
          button.innerText = "🗑️ Delete";
          button.classList.add("btn", "btn-danger", "btn-sm");
          button.addEventListener("click", (e) => {
            e.stopPropagation(); // Empêcher l'événement de clic sur la ligne
            const rowData = cell.getRow().getData();
            deletePublication(rowData._id);
          });
          return button;
        },
        width: 120,
        headerSort: false,
      },
    ],
  }
);

  // Ajoutez l'écouteur pour les clics sur une ligne
  table.on("rowClick", (e, row) => {
  const publicationId = row.getData()._id; // Récupérer l'ID du groupe cliqué
  console.log("Ligne cliquée :", publicationId); // Debug : affiche l'ID du groupe
  emit("publication-selected", publicationId); // Émet l'événement au composant parent
});
}

// Appeler fetchPublications lorsque le composant est monté
onMounted(fetchPublications);
</script>

<style scoped>
.icon-download {
  cursor: pointer;
  margin: 0 5px;
  color: #007bff;
}
.icon-download:hover {
  color: #0056b3;
}
</style>
