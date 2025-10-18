document.addEventListener("DOMContentLoaded", () => {
  const historiqueContainer = document.querySelector(".historique-list");
  const filterStatus = document.getElementById("filter-status");
  const filterDate = document.getElementById("filter-date");
  const resetFiltersButton = document.getElementById("reset-filters");
  const exportCSVButton = document.getElementById("export-csv");
  const exportPDFButton = document.getElementById("export-pdf");

  // Fonction pour afficher les réservations
  function afficherReservations(filtreStatut = "all", filtreDate = "") {
    historiqueContainer.innerHTML = "";

    const reservations = JSON.parse(localStorage.getItem("reservations")) || [];

    if (!reservations.length) {
      historiqueContainer.innerHTML = "<p>Aucune réservation effectuée.</p>";
      return;
    }

    const maintenant = new Date();

    let filteredReservations = reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);

      if (
        filtreStatut === "upcoming" &&
        (reservationDate < maintenant || reservation.annule)
      )
        return false;
      if (
        filtreStatut === "past" &&
        (reservationDate >= maintenant || reservation.annule)
      )
        return false;
      if (filtreStatut === "cancelled" && !reservation.annule) return false;
      if (
        filtreDate &&
        reservationDate.toISOString().slice(0, 10) !== filtreDate
      )
        return false;

      return true;
    });

    if (!filteredReservations.length) {
      historiqueContainer.innerHTML = "<p>Aucune réservation trouvée.</p>";
      return;
    }

    filteredReservations.forEach((reservation, index) => {
      const div = document.createElement("div");
      div.classList.add("historique-item");
      div.innerHTML = `
        <h3>${reservation.destination}</h3>
        <p><strong>Date :</strong> ${new Date(
          reservation.date
        ).toLocaleString()}</p>
        <p><strong>Statut :</strong> ${
          reservation.annule ? "Annulé ❌" : "Confirmé ✅"
        }</p>
      `;
      historiqueContainer.appendChild(div);
    });
  }

  // Exporter en CSV
  function exporterCSV() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    if (!reservations.length) {
      alert("Aucune réservation à exporter.");
      return;
    }

    const entete = "Destination,Date,Statut\n";
    const lignes = reservations.map(
      (r) =>
        `${r.destination},${new Date(r.date).toLocaleString()},${
          r.annule ? "Annulé" : "Confirmé"
        }`
    );

    const contenu = entete + lignes.join("\n");
    const blob = new Blob([contenu], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "historique_reservations.csv";
    a.click();
  }

  // Exporter en PDF avec Logo plus grand et Infos entreprise à droite
  function exporterPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    if (!reservations.length) {
      alert("Aucune réservation à exporter.");
      return;
    }

    const logo = new Image();
    logo.src = "../images/logo_skyway.png"; // ton logo ici

    logo.onload = () => {
      // Logo à gauche (agrandi pour correspondre au texte)
      doc.addImage(logo, "PNG", 10, 8, 60, 25);

      // Infos entreprise à droite
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SkyWay Connect", 200, 12, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Email : contact@skywayconnect.com", 200, 18, {
        align: "right",
      });
      doc.text("Téléphone : +33 1 23 45 67 89", 200, 23, { align: "right" });
      doc.text("Adresse : 10 rue de l'Aviation, Paris, France", 200, 28, {
        align: "right",
      });

      // Ligne séparatrice
      doc.setLineWidth(0.5);
      doc.line(10, 33, 200, 33);

      // Tableau des réservations
      const headers = [["#", "Destination", "Date", "Statut"]];
      const data = reservations.map((reservation, index) => [
        index + 1,
        reservation.destination,
        new Date(reservation.date).toLocaleString(),
        reservation.annule ? "Annulé" : "Confirmé",
      ]);

      doc.autoTable({
        startY: 40,
        head: headers,
        body: data,
        theme: "grid",
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: [255, 255, 255],
        },
        styles: {
          halign: "center",
          valign: "middle",
        },
      });

      doc.save("historique_reservations.pdf");
    };

    logo.onerror = () => {
      alert("Erreur lors du chargement du logo. Vérifie le chemin de l'image.");
    };
  }

  // Boutons
  exportCSVButton.addEventListener("click", exporterCSV);
  exportPDFButton.addEventListener("click", exporterPDF);

  // Filtres
  filterStatus.addEventListener("change", () =>
    afficherReservations(filterStatus.value, filterDate.value)
  );
  filterDate.addEventListener("change", () =>
    afficherReservations(filterStatus.value, filterDate.value)
  );
  resetFiltersButton.addEventListener("click", () => {
    filterStatus.value = "all";
    filterDate.value = "";
    afficherReservations();
  });

  // Affichage initial
  afficherReservations();
});
