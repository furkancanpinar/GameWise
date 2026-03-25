document.addEventListener('DOMContentLoaded', function () {
  firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
          window.location.href = 'login.html';
      } else {
          document.getElementById('welcomeMessage').textContent = `Welcome, ${user.displayName || 'User'}`;
          initializePage(user.uid);
      }
  });

  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  const toggleIcon = document.getElementById('toggle-icon');

  if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', function () {
          sidebar.classList.toggle('collapsed');
          content.classList.toggle('shifted');
          if (sidebar.classList.contains('collapsed')) {
              toggleIcon.src = 'Editables/expand.png';
              toggleIcon.alt = 'Expand Sidebar';
          } else {
              toggleIcon.src = 'Editables/collapse.png';
              toggleIcon.alt = 'Collapse Sidebar';
          }
      });
  }

  const userIcon = document.getElementById('userIcon');
  const dropdownMenu = document.getElementById('dropdownMenu');

  if (userIcon && dropdownMenu) {
      userIcon.addEventListener('click', function (event) {
          dropdownMenu.classList.toggle('show');
          event.stopPropagation();
      });

      document.addEventListener('click', function (event) {
          if (!userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
              dropdownMenu.classList.remove('show');
          }
      });
  }


  function initializePage(userId) {
      const db = firebase.database();

      const popularGames = {
          'rubiks-cube': {
              name: "3x3 Rubiks Cube",
              genre: "Puzzle",
              image: "Editables/cubecinematic.png"
          },
          'pong': {
              name: "Pong game",
              genre: "Classic Arcade",
              image: "Editables/cinematicpong.png"
          },
          'flagguess': {
              name: "Flag guessing game",
              genre: "Trivia",
              image: "Editables/cinematicflag.png"
          },
      };

      let currentTrackedGamesData = {};
      let currentGameSelectionsData = {};

      initializeChart();

      const assessmentForm = document.getElementById('assessmentForm');
      const assessmentResultsDiv = document.getElementById('assessmentResults');
      const retakeAssessmentBtn = document.getElementById('retakeAssessmentBtn');

      if (assessmentForm) assessmentForm.style.display = 'block';
      if (assessmentResultsDiv) assessmentResultsDiv.style.display = 'none';


      db.ref('users/' + userId + '/trackedGames').on('value', (snapshot) => {
          currentTrackedGamesData = snapshot.val() || {};
          updateTrackedGamesList(currentTrackedGamesData, popularGames, currentGameSelectionsData);
          updateAddButtons(currentTrackedGamesData);
      });

      db.ref('gameSelections/' + userId).on('value', (snapshot) => {
          currentGameSelectionsData = snapshot.val() || {};
          updateChart(currentGameSelectionsData, popularGames);
          updateTrackedGamesList(currentTrackedGamesData, popularGames, currentGameSelectionsData);
      });


      document.querySelectorAll('.add-game-btn').forEach(btn => {
          btn.addEventListener('click', function (e) {
              e.preventDefault();
              const gameCard = this.closest('.game-card');
              const gameId = gameCard.dataset.game;

              if (gameId && popularGames[gameId]) {
                  const gameRef = db.ref('users/' + userId + '/trackedGames/' + gameId);

                  gameRef.once('value').then((trackedSnapshot) => {
                      if (!trackedSnapshot.exists()) {
                          gameRef.set({
                              name: popularGames[gameId].name,
                              genre: popularGames[gameId].genre,
                              image: popularGames[gameId].image,
                              added: firebase.database.ServerValue.TIMESTAMP,
                              timePlayed: 0
                          }).catch((error) => {
                          });
                      }
                  });
              }
          });
      });


      document.getElementById('trackedGames').addEventListener('click', function (e) {
          if (e.target.classList.contains('remove-game')) {
              const gameId = e.target.dataset.game;
              db.ref('users/' + userId + '/trackedGames/' + gameId).remove().catch((error) => {
              });
          }
      });

      if (assessmentForm) {
          assessmentForm.addEventListener('submit', function (e) {
              e.preventDefault();
              const formData = new FormData(assessmentForm);
              let totalScore = 0;
              let allAnswered = true;
              const answers = {};

              for (let i = 1; i <= 4; i++) {
                  const answer = formData.get('q' + i);
                  if (answer === null) {
                      allAnswered = false;
                      break;
                  }
                  answers['q' + i] = parseInt(answer, 10);
                  totalScore += answers['q' + i];
              }

              if (!allAnswered) {
                  alert("Please answer all questions before submitting.");
                  return;
              }

              displayAssessmentResults(answers, totalScore);
              if (assessmentForm) assessmentForm.style.display = 'none';
              if (assessmentResultsDiv) assessmentResultsDiv.style.display = 'block';
          });
      }

      if (retakeAssessmentBtn) {
          retakeAssessmentBtn.addEventListener('click', function() {
              if (assessmentForm) assessmentForm.reset();
              if (assessmentForm) assessmentForm.style.display = 'block';
              if (assessmentResultsDiv) assessmentResultsDiv.style.display = 'none';
          });
      }


      function displayAssessmentResults(answers, score) {
          const resultsDiv = document.getElementById('assessmentResults');
          if (!resultsDiv) {
              return;
          }

          const resultQ1El = document.getElementById('resultQ1');
          if (resultQ1El) {
              resultQ1El.textContent = determineQuestionStatus(answers.q1);
          }

          const resultQ2El = document.getElementById('resultQ2');
          if (resultQ2El) {
              resultQ2El.textContent = determineQuestionStatus(answers.q2);
          }

          const resultQ3El = document.getElementById('resultQ3');
          if (resultQ3El) {
              resultQ3El.textContent = determineQuestionStatus(answers.q3);
          }

          const resultQ4El = document.getElementById('resultQ4');
          if (resultQ4El) {
              resultQ4El.textContent = determineQuestionStatus(answers.q4);
          }


          const addictionLevelEl = document.getElementById('addictionLevel');
          if (addictionLevelEl) {
              addictionLevelEl.textContent = calculateAddictionLevel(score);
          }
      }

      function determineQuestionStatus(answerValue) {
          const threshold = 1;
          return answerValue > threshold ? 'True' : 'False';
      }

      function calculateAddictionLevel(score) {
          if (score <= 4) {
              return "Low";
          } else if (score <= 8) {
              return "Moderate";
          } else if (score <= 12) {
              return "High";
          } else {
              return "Severe";
          }
      }
  }

  let gamesChart = null;

  function initializeChart() {
      const ctx = document.getElementById('gamesChart');
      if (!ctx) return;

      if (gamesChart) {
          gamesChart.destroy();
          gamesChart = null;
      }

      const chartConfig = {
          type: 'bar',
          data: {
              labels: [],
              datasets: [{
                  label: 'Number of Selections',
                  data: [],
                  backgroundColor: [
                      'rgba(173, 132, 255, 0.7)',
                      'rgba(141, 126, 255, 0.7)',
                      'rgba(109, 120, 255, 0.7)',
                      'rgba(77, 114, 255, 0.7)',
                      'rgba(45, 108, 255, 0.7)',
                  ],
                  borderColor: [
                      'rgba(173, 132, 255, 1)',
                      'rgba(141, 126, 255, 1)',
                      'rgba(109, 120, 255, 1)',
                      'rgba(77, 114, 255, 1)',
                      'rgba(45, 108, 255, 1)',
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: {
                      position: 'top',
                  },
                  title: {
                      display: true,
                      text: 'Game Selections Count'
                  }
              },
              scales: {
                  y: {
                      beginAtZero: true,
                      title: {
                          display: true,
                          text: 'Selections'
                      },
                      ticks: {
                          precision: 0
                      }
                  },
                  x: {
                      title: {
                          display: true,
                          text: 'Game'
                      }
                  }
              }
          }
      };

      gamesChart = new Chart(ctx, chartConfig);
  }

  function updateChart(gameSelectionsData, popularGames) {
      if (!gamesChart) return;

      const gameIds = Object.keys(gameSelectionsData);
      const gameNames = gameIds.map(id => {
          return popularGames[id] ? popularGames[id].name : id;
      });
      const selectionCounts = gameIds.map(id => gameSelectionsData[id]);

      gamesChart.data.labels = gameNames;
      gamesChart.data.datasets[0].data = selectionCounts;
      gamesChart.update();

      const resultsDiv = document.getElementById('results');
      if (resultsDiv && gameIds.length > 0) {
          resultsDiv.style.display = 'block';
      } else if (resultsDiv && gameIds.length === 0) {
          resultsDiv.style.display = 'none';
      }
  }

  function updateTrackedGamesList(trackedGames, popularGames, gameSelectionsData) {
      const trackedList = document.getElementById('trackedGames');
      trackedList.innerHTML = '';

      const gameIds = Object.keys(trackedGames);

      if (gameIds.length === 0) {
          trackedList.innerHTML = '<p class="empty-message">No games being tracked yet</p>';
          return;
      }

      gameIds.forEach(gameId => {
          const game = trackedGames[gameId];
          const gameInfo = game || popularGames[gameId] || { name: 'Unknown Game', genre: 'Unknown', image: 'https://via.placeholder.com/60' };

          const selectionCount = gameSelectionsData && gameSelectionsData[gameId] ? gameSelectionsData[gameId] : 0;

          const gameEl = document.createElement('div');
          gameEl.className = 'tracked-game';
          gameEl.innerHTML = `
              <img src="${gameInfo.image}" alt="${gameInfo.name}" class="tracked-game-image">
              <div class="tracked-game-info">
                  <h4>${gameInfo.name} <span class="selection-count">(${selectionCount})</span></h4>
                  <span class="game-genre">${gameInfo.genre}</span>
              </div>
              <button class="remove-game" data-game="${gameId}">×</button>
      `;
          trackedList.appendChild(gameEl);
      });
  }

  function updateAddButtons(trackedGames) {
      document.querySelectorAll('.add-game-btn').forEach(btn => {
          const gameCard = btn.closest('.game-card');
          const gameId = gameCard.dataset.game;

          if (trackedGames && trackedGames[gameId]) {
              btn.textContent = "Tracking ✓";
              btn.style.backgroundColor = "#4CAF50";
              btn.disabled = true;
          } else {
              btn.textContent = "Track Game";
              btn.style.backgroundColor = "#ad84ff";
              btn.disabled = false;
          }
      });
  }
});
