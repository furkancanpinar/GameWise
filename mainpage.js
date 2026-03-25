document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");
  const toggleIcon = document.getElementById("toggle-icon");
  const navItems = document.querySelectorAll(".nav-item a");
  const userMenu = document.getElementById("userMenu");
  const dropdown = document.getElementById("dropdownMenu");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const sliderImage = document.getElementById("sliderImage");

  const mainPageTotalPlayTimeElement = document.getElementById('totalPlayTime');
  const mainPageTotalGamesPlayedElement = document.getElementById('totalGames');
  const mainPageCurrentStreakElement = document.getElementById('currentStreak');

  let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

  function applySidebarState() {
      if (isCollapsed) {
          sidebar.classList.add("collapsed");
          content.classList.add("collapsed");
          toggleIcon.src = "Editables/expand.png";
          toggleIcon.alt = "Expand Menu";
      } else {
          sidebar.classList.remove("collapsed");
          content.classList.remove("collapsed");
          toggleIcon.src = "Editables/collapse.png";
          toggleIcon.alt = "Collapse Menu";
      }
  }

  applySidebarState();

  toggleBtn.addEventListener("click", () => {
      isCollapsed = !isCollapsed;
      localStorage.setItem('sidebarCollapsed', isCollapsed);
      applySidebarState();
  });

  userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", function (e) {
      if (!userMenu.contains(e.target)) {
          dropdown.style.display = "none";
      }
  });

  navItems.forEach(item => {
      item.addEventListener('click', () => {
          localStorage.setItem('sidebarCollapsed', isCollapsed);
      });
  });

  function formatTime(totalSeconds) {
      if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
          return '--:--:--';
      }
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      return `${padTime(hrs)}:${padTime(mins)}:${padTime(secs)}`;
  }

  function padTime(time) {
      return time.toString().padStart(2, '0');
  }

  function updateMainPageSummaryDisplay(stats, totalGamesPlayedCount, loginCount) {
      const defaultTimeText = '--:--:--';
      const defaultCountText = '--';
      const defaultStreakText = '--';

      if (mainPageTotalPlayTimeElement) {
          if (stats && typeof stats.totalTime === 'number') {
              mainPageTotalPlayTimeElement.textContent = formatTime(stats.totalTime);
          } else {
              mainPageTotalPlayTimeElement.textContent = defaultTimeText;
          }
      }

      if (mainPageTotalGamesPlayedElement) {
          if (totalGamesPlayedCount !== null && typeof totalGamesPlayedCount === 'number') {
              mainPageTotalGamesPlayedElement.textContent = totalGamesPlayedCount.toString();
          } else {
              mainPageTotalGamesPlayedElement.textContent = defaultCountText;
          }
      }

      if (mainPageCurrentStreakElement) {
          if (loginCount !== null && typeof loginCount === 'number') {
              mainPageCurrentStreakElement.innerHTML = `${loginCount} <img src="Editables/fire.gif" alt="Streak Fire" class="streak-icon">`;
          } else {
              mainPageCurrentStreakElement.textContent = defaultStreakText;
          }
      }
  }

  if (typeof firebaseService !== 'undefined' && firebaseService.initAuthStateListener) {
      firebaseService.initAuthStateListener((user) => {
          dropdown.innerHTML = '';
          if (user) {
              welcomeMessage.textContent = `Welcome, ${user.displayName || 'Gamer'}`;
              welcomeMessage.style.display = 'block';

              const profileLink = document.createElement("a");
              profileLink.href = "profile.html";
              profileLink.textContent = "Profile";

              const logoutLink = document.createElement("a");
              logoutLink.href = "#";
              logoutLink.textContent = "Logout";
              logoutLink.addEventListener("click", function (e) {
                  e.preventDefault();
                  if (firebase.auth() && firebase.auth().signOut) {
                      firebase.auth().signOut().then(() => {
                          localStorage.clear();
                          window.location.href = "https://gamewiseuow.netlify.app/index.html";
                      }).catch((error) => {
                          alert("Logout failed. Please try again.");
                      });
                  } else {
                      alert("Logout functionality is not available.");
                  }
              });

              dropdown.appendChild(profileLink);
              dropdown.appendChild(logoutLink);

              let fetchedStats = null;
              let fetchedGameCount = null;
              let fetchedLoginCount = null;
              const userId = user.uid;

              const checkAndDisplaySummary = () => {
                  if (fetchedStats !== null && fetchedGameCount !== null && typeof fetchedGameCount === 'number' && fetchedLoginCount !== null && typeof fetchedLoginCount === 'number') {
                      updateMainPageSummaryDisplay(fetchedStats, fetchedGameCount, fetchedLoginCount);
                  } else if (fetchedStats !== null && fetchedGameCount !== null && fetchedLoginCount !== null) {
                      updateMainPageSummaryDisplay(fetchedStats, fetchedGameCount, fetchedLoginCount);
                  }
              };

              firebaseService.loadGameStats(userId, (stats) => {
                  fetchedStats = stats;
                  checkAndDisplaySummary();
              });

              firebaseService.loadGameSelectionCounts(userId, (totalCount) => {
                  fetchedGameCount = totalCount;
                  checkAndDisplaySummary();
              });

              if (firebaseService.loadLoginCount) {
                  firebaseService.loadLoginCount(userId, (loginCount) => {
                      fetchedLoginCount = loginCount;
                      checkAndDisplaySummary();
                  });
              } else {
                  fetchedLoginCount = 0;
                  checkAndDisplaySummary();
              }

          } else {
              welcomeMessage.style.display = 'none';

              const loginLink = document.createElement("a");
              loginLink.href = "login.html";
              loginLink.textContent = "Login";

              const signupLink = document.createElement("a");
              signupLink.href = "signup.html";
              signupLink.textContent = "Sign Up";

              dropdown.appendChild(loginLink);
              dropdown.appendChild(signupLink);

              updateMainPageSummaryDisplay(null, null, null);
          }
      });
  } else {
      dropdown.innerHTML = '';
      const loginLink = document.createElement("a");
      loginLink.href = "login.html";
      loginLink.textContent = "Login";

      const signupLink = document.createElement("a");
      signupLink.href = "signup.html";
      signupLink.textContent = "Sign Up";

      dropdown.appendChild(loginLink);
      dropdown.appendChild(signupLink);

      updateMainPageSummaryDisplay(null, null, null);

      if (welcomeMessage) {
          welcomeMessage.style.display = 'none';
      }
  }

  if (sliderImage) {
      const images = [
          { src: 'Editables/cube.png', alt: 'Cube Game' },
          { src: 'Editables/flagguess.png', alt: 'Flag Guessing Game' },
          { src: 'Editables/flagguess2.png', alt: 'Advanced Flag Game' },
          { src: 'Editables/pingpong.png', alt: 'Ping Pong Game' }
      ];

      images.forEach(img => {
          const preload = new Image();
          preload.src = img.src;
      });

      let currentImageIndex = 0;
      const sliderInterval = 3000;

      function cycleImages() {
          sliderImage.style.opacity = 0;

          setTimeout(() => {
              currentImageIndex = (currentImageIndex + 1) % images.length;
              sliderImage.src = images[currentImageIndex].src;
              sliderImage.alt = images[currentImageIndex].alt;
              sliderImage.style.opacity = 1;
          }, 500);
      }

      if (images.length > 0) {
          sliderImage.src = images[currentImageIndex].src;
          sliderImage.alt = images[currentImageIndex].alt;
          sliderImage.style.opacity = 1;

          setInterval(cycleImages, sliderInterval);
      }
  }

  function handleResponsive() {
      if (window.innerWidth < 768) {
          if (localStorage.getItem('sidebarCollapsed') !== 'false') {
              sidebar.classList.add('collapsed');
              content.classList.add('collapsed');
              toggleIcon.src = "Editables/expand.png";
              toggleIcon.alt = "Expand Menu";
              isCollapsed = true;
          }
      } else {
          if (localStorage.getItem('sidebarCollapsed') !== 'true') {
              sidebar.classList.remove('collapsed');
              content.classList.remove('collapsed');
              toggleIcon.src = "Editables/collapse.png";
              toggleIcon.alt = "Collapse Menu";
              isCollapsed = false;
          } else {
              sidebar.classList.add('collapsed');
              content.classList.add('collapsed');
              toggleIcon.src = "Editables/expand.png";
              toggleIcon.alt = "Expand Menu";
              isCollapsed = true;
          }
      }
  }

  handleResponsive();
  window.addEventListener('resize', handleResponsive);
});
  