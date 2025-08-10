// === URL de base de l'API ===
const url = "http://localhost:5678/api";

// === Appels des fonctions principales ===
getWorks(); // travaux
getCategories(); // filtres
displayAdminMode(); // mode admin
handlePictureSubmit(); // formulaire

// === Switch entre les deux modales ===
const addPhotoButton = document.querySelector(".add-photo-button");
const backButton = document.querySelector(".js-modal-back");
addPhotoButton.addEventListener("click", toggleModal);
backButton.addEventListener("click", toggleModal);

// === Fonction pour récupérer les travaux ===
async function getWorks(filter) {
  document.querySelector(".gallery").innerHTML = "";
  document.querySelector(".modal-gallery").innerHTML = "";

  try {
    const response = await fetch(`${url}/works`);
    if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

    const works = await response.json();

    const worksToDisplay = filter
      ? works.filter((item) => item.categoryId === filter)
      : works;

    // Images dans la galerie principale et la modale
    worksToDisplay.forEach((work) => {
      setFigure(work);
      setFigureModal(work);
    });

    document.querySelectorAll(".fa-trash-can").forEach((icon) => {
      icon.addEventListener("click", (event) => deleteWork(event));
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error.message);
  }
}

// === Fonction pour ajouter une image + légende dans la galerie principale ===
function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <figcaption>${data.title}</figcaption>
  `;
  document.querySelector(".gallery").appendChild(figure);
}

// === Fonction pour afficher l'image dans la modale avec icône "supprimer" ===
function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
    <div class="image-container">
      <img src="${data.imageUrl}" alt="${data.title}">
      <figcaption>${data.title}</figcaption>
      <i id="${data.id}" class="fa-solid fa-trash-can overlay-icon"></i>
    </div>
  `;
  document.querySelector(".modal-gallery").appendChild(figure);
}

// === Fonction pour récupérer les catégories et créer les filtres ===
async function getCategories() {
  try {
    const response = await fetch(`${url}/categories`);
    if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

    const categories = await response.json();
    categories.forEach((category) => setFilter(category));
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error.message);
  }
}

// === Création d'un filtre pour chaque catégorie ===
function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  div.textContent = data.name;

  div.addEventListener("click", () => getWorks(data.id));
  div.addEventListener("click", toggleFilter);

  document.querySelector(".tous").addEventListener("click", toggleFilter);
  document.querySelector(".div-container").append(div);
}

// === Style actif sur le filtre sélectionné ===
function toggleFilter(event) {
  const container = document.querySelector(".div-container");
  Array.from(container.children).forEach((child) =>
    child.classList.remove("active-filter")
  );
  event.target.classList.add("active-filter");
}

// === Afficher tous les projets (filtre "Tous") ===
document.querySelector(".tous").addEventListener("click", () => getWorks());

// === Affiche les éléments du mode admin si token ===
function displayAdminMode() {
  if (sessionStorage.authToken) {
    // Cacher les filtres
    document.querySelector(".div-container").style.display = "none";

    // Afficher le bouton "modifier"
    document.querySelector(".js-modal-2").style.display = "block";

    document.querySelector(".gallery").style.margin = "30px 0 0 0";

    // Bannière noire "Mode édition"
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML = `
      <p>
        <a href="#modal1" class="js-modal">
          <i class="fa-regular fa-pen-to-square"></i> Mode édition
        </a>
      </p>`;
    document.body.prepend(editBanner);

    // Remplace "login" par "logout" et gère la déconnexion
    const logBtn = document.querySelector(".log-button");
    logBtn.textContent = "logout";
    logBtn.addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
    });
  }
}

// === Variables pour la modale ===
let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];

// === Ouvre une modale ===
const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href")); // Cible la modale
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  focusables[0].focus();

  // Affiche la modale
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

  // Ferme la modale si clic en dehors ou sur bouton "fermer"
  modal.addEventListener("click", closeModal);
  modal.querySelectorAll(".js-modal-close").forEach((btn) =>
    btn.addEventListener("click", closeModal)
  );
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
};

// === Ferme la modale ===
const closeModal = function (e) {
  if (!modal) return;
  e.preventDefault();

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
  modal = null;
};

// === Empêche la fermeture de la modale quand on clique à l'intérieur ===
const stopPropagation = function (e) {
  e.stopPropagation();
};

// === Empêche le focus de sortir de la modale avec la touche Tab ===
const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  index = e.shiftKey ? index - 1 : index + 1;

  if (index >= focusables.length) index = 0;
  if (index < 0) index = focusables.length - 1;

  focusables[index].focus();
};

// === Gestion clavier ===
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") closeModal(e);
  if (e.key === "Tab" && modal !== null) focusInModal(e);
});

// === Active la modale ===
document.querySelectorAll(".js-modal").forEach((a) =>
  a.addEventListener("click", openModal)
);

// === Supprime un projet quand on clique sur la corbeille ===
async function deleteWork(event) {
  event.stopPropagation();
  const id = event.srcElement.id;
  const token = sessionStorage.authToken;

  try {
    const response = await fetch(`${url}/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.status === 401 || response.status === 500) {
      // Si erreur, affiche une alerte dans la modale
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.textContent = "Il y a eu une erreur";
      document.querySelector(".modal-button-container").prepend(errorBox);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
}

// === Bascule entre les 2 modales ===
function toggleModal() {
  const galleryModal = document.querySelector(".gallery-modal");
  const addModal = document.querySelector(".add-modal");

  const isGalleryVisible = galleryModal.style.display === "block" || galleryModal.style.display === "";
  galleryModal.style.display = isGalleryVisible ? "none" : "block";
  addModal.style.display = isGalleryVisible ? "block" : "none";
}

// === Fonction d'ajout d'images ===
function handlePictureSubmit() {
  const img = document.createElement("img");
  const fileInput = document.getElementById("file");
  fileInput.style.display = "none";
  
  let file;

  // === Quand l'utilisateur choisit un fichier ===
  fileInput.addEventListener("change", function (event) {
    file = event.target.files[0];
    const maxFileSize = 4 * 1024 * 1024; // 4 Mo

    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      if (file.size > maxFileSize) {
        alert("L'image ne doit pas dépasser 4 Mo.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.alt = "Uploaded Photo";
        document.getElementById("photo-container").appendChild(img);
      };

      // Convertit l’image en URL
      reader.readAsDataURL(file);
      document.querySelectorAll(".picture-loaded").forEach(el => el.style.display = "none");

    } else {
      alert("Format invalide. JPG ou PNG uniquement.");
    }
  });

  // === Gestion du formulaire de texte ===
  const titleInput = document.getElementById("title");
  let titleValue = "";
  let selectedValue = "1";

  // Changements de catégorie
  document.getElementById("category").addEventListener("change", function () {
    selectedValue = this.value;
  });

  // Texte du titre
  titleInput.addEventListener("input", function () {
    titleValue = titleInput.value;
  });

  // === Envoi du formulaire ===
  const addPictureForm = document.getElementById("picture-form");
  addPictureForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const hasImage = document.querySelector("#photo-container").firstChild;
    if (!hasImage || !titleValue) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", titleValue);
    formData.append("category", selectedValue);

    const token = sessionStorage.authToken;
    if (!token) {
      console.error("Token d'authentification manquant.");
      return;
    }

    // Envoie vers l'API
    const response = await fetch(`${url}/works`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (response.status !== 201) {
      const errorText = await response.text();
      console.error("Erreur : ", errorText);
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.innerHTML = `Il y a eu une erreur : ${errorText}`;
      document.querySelector("form").prepend(errorBox);
    }
  });
}