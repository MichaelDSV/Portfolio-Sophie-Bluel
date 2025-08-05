// === Lien vers l’API pour se connecter ===
const loginApi = "http://localhost:5678/api/users/login";

// === Quand le formulaire est soumis, on déclenche handleSubmit ===
document.getElementById("loginform").addEventListener("submit", handleSubmit);

// === Fonction appelée au clic sur "Se connecter" ===
async function handleSubmit(event) {
  event.preventDefault(); // Empêche le formulaire de recharger la page

  // Récupération des valeurs saisies dans les champs
  const user = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  // Envoi de la requête POST à l'API avec les données de connexion
  const response = await fetch(loginApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Le corps de la requête sera au format JSON
    },
    body: JSON.stringify(user), // On convertit l'objet user en JSON
  });

  // === Si la connexion échoue (email ou mdp incorrect) ===
  if (response.status !== 200) {
    // On crée une boîte d’erreur à afficher
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Veuillez vérifier votre email et/ou votre mot de passe";

    // On ajoute cette erreur juste avant le formulaire
    document.querySelector("form").prepend(errorBox);
  } 
  // === Si la connexion réussit ===
  else {
    const result = await response.json(); // On récupère la réponse JSON
    const token = result.token; // Le token d'authentification est donné

    // On stocke ce token dans la session pour l'utiliser plus tard
    sessionStorage.setItem("authToken", token);

    // On redirige l'utilisateur vers la page d'accueil
    window.location.href = "index.html";
  }
}
