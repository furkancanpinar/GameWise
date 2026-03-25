const totalTimeDisplay = document.getElementById('totalTime');
const lastSessionDisplay = document.getElementById('monthTime');
const historyTableBody = document.getElementById('historyTableBody');
const timeChartCanvas = document.getElementById('timeChart');
const overallTimeChartCanvas = document.getElementById('overallTimeChart');

let timeChart = null;
let overallTimeChart = null;

function formatTime(totalSeconds) {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
        return '00:00:00';
    }
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${padTime(hrs)}:${padTime(mins)}:${padTime(secs)}`;
}

function formatTimeToHours(totalSeconds) {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
        return 0;
    }
    return (totalSeconds / 3600);
}

function padTime(time) {
    return time.toString().padStart(2, '0');
}

function renderGameTimeChart(stats) {
    if (timeChart) {
        timeChart.destroy();
    }

    const ctx = timeChartCanvas.getContext('2d');

    const gameLabels = [];
    const gameTimesHours = [];

    if (stats) {
        Object.keys(stats).forEach(key => {
            const gameData = stats[key];
            if (typeof gameData === 'object' && gameData !== null && gameData.name && typeof gameData.totalTime === 'number' && key !== 'totalTime' && key !== 'lastSessionTime' && key !== 'todayTime') {
                gameLabels.push(gameData.name);
                gameTimesHours.push(formatTimeToHours(gameData.totalTime));
            }
        });
    }

    if (gameLabels.length === 0) {
        ctx.clearRect(0, 0, timeChartCanvas.width, timeChartCanvas.height);
        return;
    }

    timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: gameLabels,
            datasets: [{
                label: 'Time Spent (Hours)',
                data: gameTimesHours,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Game'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Time Spent Per Game'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const hours = context.parsed.y;
                            const totalSeconds = Math.round(hours * 3600);
                            label += `${hours.toFixed(1)} hours (${formatTime(totalSeconds)})`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderOverallTimeChart(stats) {
    if (overallTimeChart) {
        overallTimeChart.destroy();
    }

    const ctx = overallTimeChartCanvas.getContext('2d');

    const labels = ['Total Time', 'Last Session'];
    const timeInSeconds = [stats?.totalTime || 0, stats?.lastSessionTime || 0];
    const timeInHours = timeInSeconds.map(formatTimeToHours);

    if (stats?.todayTime !== undefined && stats.todayTime !== null) {
        labels.push("Today's Time");
        timeInSeconds.push(stats.todayTime);
        timeInHours.push(formatTimeToHours(stats.todayTime));
    }

    if (timeInHours.every(time => time === 0)) {
        ctx.clearRect(0, 0, overallTimeChartCanvas.width, overallTimeChartCanvas.height);
        return;
    }

    overallTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time (Hours)',
                data: timeInHours,
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Time Metrics'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const hours = context.parsed.y;
                            const totalSeconds = Math.round(hours * 3600);
                            label += `${hours.toFixed(1)} hours (${formatTime(totalSeconds)})`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function populateHistoryTable(stats) {
    historyTableBody.innerHTML = '';

    if (!stats) {
        historyTableBody.innerHTML = '<tr><td colspan="3">No game sessions recorded yet.</td></tr>';
        return;
    }

    let hasGameData = false;
    Object.keys(stats).forEach(key => {
        const gameData = stats[key];
        if (typeof gameData === 'object' && gameData !== null && gameData.name && typeof gameData.totalTime === 'number' && key !== 'totalTime' && key !== 'lastSessionTime' && key !== 'todayTime') {
            hasGameData = true;
            const row = historyTableBody.insertRow();

            const dateCell = row.insertCell(0);
            dateCell.textContent = gameData.lastPlayedDate || stats.date || 'N/A';

            const gameCell = row.insertCell(1);
            gameCell.textContent = gameData.name;

            const timeSpentCell = row.insertCell(2);
            timeSpentCell.textContent = formatTime(gameData.totalTime);
        }
    });

    if (!hasGameData) {
        historyTableBody.innerHTML = '<tr><td colspan="3">No game sessions recorded yet.</td></tr>';
    }
}

function loadUserGameData(userId) {
    if (typeof firebaseService !== 'undefined' && firebaseService !== null && typeof firebaseService.loadGameStats === 'function') {
        firebaseService.loadGameStats(userId, (stats) => {
            if (stats) {
                totalTimeDisplay.textContent = formatTime(stats.totalTime || 0);
                lastSessionDisplay.textContent = formatTime(stats.lastSessionTime || 0);

                populateHistoryTable(stats);

                renderGameTimeChart(stats);

                renderOverallTimeChart(stats);

            } else {
                totalTimeDisplay.textContent = formatTime(0);
                lastSessionDisplay.textContent = formatTime(0);
                populateHistoryTable(null);
                renderGameTimeChart(null);
                renderOverallTimeChart(null);
            }
        });
    } else {
        if (totalTimeDisplay) totalTimeDisplay.textContent = 'Error';
        if (lastSessionDisplay) lastSessionDisplay.textContent = 'Error';
        if (historyTableBody) historyTableBody.innerHTML = '<tr><td colspan="3">Error loading data: Firebase service not fully available.</td></tr>';
        if (timeChart) {
            timeChart.destroy();
            timeChart = null;
        }
        if (overallTimeChart) {
            overallTimeChart.destroy();
            overallTimeChart = null;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(0);
    if (lastSessionDisplay) lastSessionDisplay.textContent = formatTime(0);
    if (historyTableBody) historyTableBody.innerHTML = '<tr><td colspan="3">Loading data...</td></tr>';

    if (typeof firebaseService !== 'undefined' && firebaseService !== null && typeof firebaseService.initAuthStateListener === 'function') {
        firebaseService.initAuthStateListener((user) => {
            if (user) {
                loadUserGameData(user.uid);
            } else {
                totalTimeDisplay.textContent = formatTime(0);
                lastSessionDisplay.textContent = formatTime(0);
                populateHistoryTable(null);
                if (timeChart) {
                    timeChart.destroy();
                    timeChart = null;
                }
                if (overallTimeChart) {
                    overallTimeChart.destroy();
                    overallTimeChart = null;
                }
                if (historyTableBody.innerHTML === '<tr><td colspan="3">Loading data...</td></tr>') {
                    historyTableBody.innerHTML = '<tr><td colspan="3">Please log in to see your time history.</td></tr>';
                }
            }
        });
    } else {
        if (totalTimeDisplay) totalTimeDisplay.textContent = 'Error';
        if (lastSessionDisplay) lastSessionDisplay.textContent = 'Error';
        if (historyTableBody) historyTableBody.innerHTML = '<tr><td colspan="3">Error: Firebase service not available. Check browser console.</td></tr>';
        if (timeChart) {
            timeChart.destroy();
            timeChart = null;
        }
        if (overallTimeChart) {
            overallTimeChart.destroy();
            overallTimeChart = null;
        }
    }
});
