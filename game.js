const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startButton = document.getElementById('startTimer');
const pauseButton = document.getElementById('pauseTimer');
const resetButton = document.getElementById('resetTimer');
const gameSelect = document.getElementById('gameSelect');

const todayTimeElement = document.getElementById('todayTime');
const totalTimeElement = document.getElementById('totalTime');
const lastSessionElement = document.getElementById('lastSession');
const statsDisplayElements = document.querySelectorAll('.game-stats p');

let seconds = 0, minutes = 0, hours = 0, timerInterval, isRunning = false;

let todayTime = 0, totalTime = 0, lastSessionTime = 0;

let currentGame = 'cube';

let unityInstance = null;

function updateStatsDisplay() {
    todayTimeElement.textContent = formatTime(todayTime);
    totalTimeElement.textContent = formatTime(totalTime);
    lastSessionElement.textContent = formatTime(lastSessionTime);
}

function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${padTime(hrs)}:${padTime(mins)}:${padTime(secs)}`;
}

function padTime(time) {
    return time.toString().padStart(2, '0');
}

function updateTimerDisplay() {
    hoursElement.textContent = padTime(hours);
    minutesElement.textContent = padTime(minutes);
    secondsElement.textContent = padTime(seconds);
}

function incrementTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }
    updateTimerDisplay();
}

function recordSession() {
    const currentSessionTime = hours * 3600 + minutes * 60 + seconds;
    const userId = firebaseService.getCurrentUserId();

    if (currentSessionTime > 0 && userId) {
        todayTime += currentSessionTime;
        totalTime += currentSessionTime;
        lastSessionTime = currentSessionTime;

        updateStatsDisplay();

        const statsToSave = {
            date: new Date().toDateString(),
            todayTime: todayTime,
            totalTime: totalTime,
            lastSessionTime: lastSessionTime
        };

        firebaseService.saveGameStats(userId, statsToSave);

        seconds = minutes = hours = 0;
        updateTimerDisplay();
    } else if (currentSessionTime > 0 && !userId) {
        seconds = minutes = hours = 0;
        updateTimerDisplay();
    }
}

function startTimer() {
    if (!firebaseService.getCurrentUserId()) {
        return;
    }
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(incrementTimer, 1000);
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startButton.disabled = false;
        pauseButton.disabled = true;
        recordSession();
    }
}

function resetTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        seconds = minutes = hours = 0;
        updateTimerDisplay();
    }
}

function loadGame(game) {
    pauseTimer();

    const userId = firebaseService.getCurrentUserId();
    if (userId) {
        firebaseService.trackGameSelection(userId, game);
    }

    if (typeof unityInstance !== 'undefined' && unityInstance !== null) {
        if (typeof unityInstance.Quit === 'function') {
            unityInstance.Quit();
        }
        unityInstance = null;
    }

    const container = document.querySelector("#unity-container");
    container.innerHTML = '<canvas id="unity-canvas"></canvas><div id="unity-loading-bar"><div id="unity-progress-bar-empty"></div><div id="unity-progress-bar-full"></div></div>';

    const canvas = document.querySelector("#unity-canvas");
    const loadingBar = document.querySelector("#unity-loading-bar");
    const progressBarFull = document.querySelector("#unity-progress-bar-full");

    if (game === 'cube') {
        loadUnityGame("Cube3x3", canvas, container, loadingBar, progressBarFull);
    } else if (game === 'pong') {
        loadUnityGame("GameWisePong", canvas, container, loadingBar, progressBarFull);
    } else if (game === 'flagguess') {
        loadUnityGame("FlagGuess", canvas, container, loadingBar, progressBarFull);
    }
}

function loadUnityGame(gameName, canvas, container, loadingBar, progressBarFull) {
    const buildUrl = "unity/";
    const loaderUrl = buildUrl + gameName + ".loader.js";
    const config = {
        dataUrl: buildUrl + gameName + ".data",
        frameworkUrl: buildUrl + gameName + ".framework.js",
        codeUrl: buildUrl + gameName + ".wasm",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: gameName,
        productVersion: "1.0"
    };

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        container.className = "unity-mobile";
        config.devicePixelRatio = 1;
    } else {
        canvas.style.width = "960px";
        canvas.style.height = "600px";
    }
    loadingBar.style.display = "block";

    const existingScript = document.querySelector(`script[src="${loaderUrl}"]`);
    if (existingScript) {
        existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
            progressBarFull.style.width = 100 * progress + "%";
        }).then((instance) => {
            unityInstance = instance;
            loadingBar.style.display = "none";
        }).catch((message) => {
            loadingBar.style.display = "none";
            container.innerHTML = `<div class="error-message">Failed to load ${gameName} game. See console for details.</div>`;
        });
    };
    script.onerror = () => {
        loadingBar.style.display = "none";
        container.innerHTML = `<div class="error-message">Failed to load ${gameName} game files. Make sure the 'unity' directory and its contents are correct.</div>`;
    };
    document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", function () {
    updateTimerDisplay();
    updateStatsDisplay();

    startButton.disabled = true;
    pauseButton.disabled = true;
    resetButton.disabled = true;

    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);

    gameSelect.addEventListener('change', function () {
        currentGame = this.value;
        loadGame(currentGame);
    });

    loadGame(currentGame);

    if (typeof firebaseService !== 'undefined') {
        firebaseService.initAuthStateListener((user) => {
            if (user) {
                firebaseService.loadGameStats(user.uid, (stats) => {
                    if (stats) {
                        todayTime = stats.todayTime;
                        totalTime = stats.totalTime;
                        lastSessionTime = stats.lastSessionTime;
                    } else {
                        todayTime = 0;
                        totalTime = 0;
                        lastSessionTime = 0;
                    }
                    updateStatsDisplay();
                });

                startButton.disabled = false;
                resetButton.disabled = false;

            } else {
                if (isRunning) {
                    clearInterval(timerInterval);
                    isRunning = false;
                }

                seconds = minutes = hours = 0;
                todayTime = 0;
                totalTime = 0;
                lastSessionTime = 0;

                updateTimerDisplay();
                updateStatsDisplay();

                startButton.disabled = true;
                pauseButton.disabled = true;
                resetButton.disabled = true;
            }
        });
    } else {
        startButton.disabled = true;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        statsDisplayElements.forEach(el => el.textContent = 'Error');
    }

    window.addEventListener('beforeunload', function () {
        recordSession();
    });
});
