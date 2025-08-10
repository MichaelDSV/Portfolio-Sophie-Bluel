// === Lien vers l’API pour se connecter ===
const loginApi = "http://localhost:5678/api/users/login";

// === Quand le formulaire est soumis on déclenche handleSubmit ===
document.getElementById("loginform").addEventListener("submit", handleSubmit);

// === Fonction "Se connecter" ===
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  // === Si la connexion échoue (email ou mdp incorrect) ===
  if (response.status !== 200) {
    // Boîte d’erreur
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Veuillez vérifier votre email et/ou votre mot de passe";

    document.querySelector("form").prepend(errorBox);
  }
  // === Si la connexion réussit ===
  else {
    const result = await response.json();
    const token = result.token;

    // Token stocké dans la session
    sessionStorage.setItem("authToken", token);

    // Redirection vers la page d'accueil
    window.location.href = "index.html";
  }
}
