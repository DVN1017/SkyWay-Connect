document.addEventListener("DOMContentLoaded", () => {
  console.log("SkyWay Connect script chargé avec succès.");

  // Simulation de connexion utilisateur
  const loginForm = document.querySelector("form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Connexion réussie !");
      window.location.href = "destinations.html";
    });
  }

  // Ajout d'un événement sur les boutons de réservation
  const reservationButtons = document.querySelectorAll(".destination button");
  reservationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Réservation confirmée ! Vous recevrez un email avec les détails.");
    });
  });
});
