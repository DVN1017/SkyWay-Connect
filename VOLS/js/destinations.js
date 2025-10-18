async function obtenirToken() {
  const clientId = "jkGqbjNYgEs0UJeNKRBffvCZxRy0U2CC";
  const clientSecret = "M5j4kCe8Xqt43DtB";
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });

    const data = await response.json();
    console.log("✅ Token Amadeus :", data);

    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("❌ Impossible d'obtenir le token :", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token :", error);
    return null;
  }
}

// ✅ Fonction améliorée pour récupérer le code IATA d'une ville
async function obtenirCodeIATA(ville, token) {
  const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(
    ville
  )}&max=1`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    console.log(`🔍 Résultat API Amadeus pour ${ville} :`, data);

    if (data.errors) {
      console.error("❌ Erreur API :", data.errors);
      return null;
    }

    if (data.data && data.data.length > 0) {
      console.log(`✅ Code IATA trouvé : ${data.data[0].iataCode}`);
      return data.data[0].iataCode;
    } else {
      console.warn(`⚠️ Aucun code IATA trouvé pour ${ville}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du code IATA :", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const containerVols = document.querySelector(".vols-container");
  const btnRechercher = document.getElementById("btn-rechercher");

  btnRechercher.addEventListener("click", async () => {
    const villeDepart = document.getElementById("depart").value.trim();
    const villeArrivee = document.getElementById("arrivee").value.trim();
    const dateVol = document.getElementById("date-vol").value;

    if (!villeDepart || !villeArrivee || !dateVol) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    containerVols.innerHTML = "🔍 Recherche en cours...";

    const token = await obtenirToken();

    if (!token) {
      containerVols.innerHTML = "<p>Impossible d'obtenir un jeton d'accès.</p>";
      return;
    }

    const codeDepart = await obtenirCodeIATA(villeDepart, token);
    const codeArrivee = await obtenirCodeIATA(villeArrivee, token);

    if (!codeDepart || !codeArrivee) {
      containerVols.innerHTML =
        "<p>Impossible de trouver les villes saisies. Vérifiez l'orthographe.</p>";
      return;
    }

    rechercherVolsAmadeus(codeDepart, codeArrivee, dateVol, token);
  });

  async function rechercherVolsAmadeus(depIATA, arrIATA, date, token) {
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${depIATA}&destinationLocationCode=${arrIATA}&departureDate=${date}&adults=1&max=5`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        containerVols.innerHTML = "<p>Aucun vol trouvé pour ces critères.</p>";
        return;
      }

      containerVols.innerHTML = "";

      data.data.forEach((vol) => {
        const prixTotal = vol.price.total;
        const monnaie = vol.price.currency;
        const segments = vol.itineraries[0].segments;
        const heureDepart = segments[0].departure.at;
        const heureArrivee = segments[segments.length - 1].arrival.at;
        const compagnie = segments[0].carrierCode;

        const divVol = document.createElement("div");
        divVol.classList.add("vol-item");

        divVol.innerHTML = `
          <h3>${depIATA} ➡️ ${arrIATA}</h3>
          <p><strong>Départ :</strong> ${new Date(
            heureDepart
          ).toLocaleString()}</p>
          <p><strong>Arrivée :</strong> ${new Date(
            heureArrivee
          ).toLocaleString()}</p>
          <p><strong>Compagnie :</strong> ${compagnie}</p>
          <p><strong>Prix :</strong> ${prixTotal} ${monnaie}</p>
          <button class="btn-reserver">Réserver</button>
        `;

        containerVols.appendChild(divVol);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des vols:", error);
      containerVols.innerHTML = "<p>Erreur de récupération des vols.</p>";
    }
  }

  containerVols.innerHTML =
    "<p>Effectuez une recherche pour afficher les vols disponibles.</p>";
});
