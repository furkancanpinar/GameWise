firebase.auth().onAuthStateChanged(function(user) {
  const dropdown = document.querySelector(".dropdown");

  if (user) {
      dropdown.innerHTML = '';

      const profileLink = document.createElement("a");
      profileLink.textContent = "Profile";
      profileLink.href = "profile.html";

      const logoutLink = document.createElement("a");
      logoutLink.textContent = "Logout";
      logoutLink.href = "#";

      logoutLink.addEventListener("click", function (e) {
          e.preventDefault();
          firebase.auth().signOut().then(() => {
              localStorage.clear();
              location.reload();
          });
      });

      dropdown.appendChild(profileLink);
      dropdown.appendChild(logoutLink);
  }
});
