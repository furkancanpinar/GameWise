const firebaseService = {
    currentUserUid: null,
    authStateChangeCallbacks: [],

    initAuthStateListener: function (callback) {
        if (!firebase.auth) {
            if (callback) callback(null);
            return;
        }

        if (callback) {
            this.authStateChangeCallbacks.push(callback);
        }

        firebase.auth().onAuthStateChanged((user) => {
            this.currentUserUid = user ? user.uid : null;

            if (user) {
                const today = new Date();
                const todayDateString = today.toISOString().split('T')[0];

                const loginDateRef = firebase.database().ref(`users/${user.uid}/loginDates/${todayDateString}`);

                loginDateRef.set(firebase.database.ServerValue.TIMESTAMP)
                    .then(() => {
                    })
                    .catch((error) => {
                    });

                this.authStateChangeCallbacks.forEach(cb => cb(user));

            } else {
                this.authStateChangeCallbacks.forEach(cb => cb(null));
            }
        });
    },

    getCurrentUserId: function () {
        return this.currentUserUid;
    },

    loadGameStats: function (userId, callback) {
        if (!userId) {
            if (callback) callback(null);
            return;
        }
        if (!firebase.database) {
            if (callback) callback(null);
            return;
        }

        const userStatsRef = firebase.database().ref(`users/${userId}/gameStats`);

        userStatsRef.once('value', (snapshot) => {
            const data = snapshot.val();
            const today = new Date().toDateString();
            let stats = null;

            if (data) {
                stats = {
                    date: data.date || null,
                    todayTime: data.date === today ? data.todayTime || 0 : 0,
                    totalTime: data.totalTime || 0,
                    lastSessionTime: data.lastSessionTime || 0
                };
            } else {
                stats = { date: null, todayTime: 0, totalTime: 0, lastSessionTime: 0 };
            }

            if (callback) {
                callback(stats);
            }

        }, (error) => {
            if (callback) {
                callback(null);
            }
        });
    },

    saveGameStats: function (userId, statsData) {
        if (!userId) {
            return;
        }
        if (!firebase.database) {
            return;
        }
        if (!statsData || typeof statsData !== 'object') {
            return;
        }

        const userStatsRef = firebase.database().ref(`users/${userId}/gameStats`);

        userStatsRef.update(statsData).then(() => {
        }).catch((error) => {
        });
    },

    loadGameSelectionCounts: function (userId, callback) {
        if (!userId) {
            if (callback) callback(0);
            return;
        }
        if (!firebase.database) {
            if (callback) callback(0);
            return;
        }

        const gameSelectionsRef = firebase.database().ref(`gameSelections/${userId}`);

        gameSelectionsRef.once('value', (snapshot) => {
            const gameCounts = snapshot.val();
            let totalCount = 0;

            if (gameCounts) {
                for (const gameName in gameCounts) {
                    if (gameCounts.hasOwnProperty(gameName) && typeof gameCounts[gameName] === 'number') {
                        totalCount += gameCounts[gameName];
                    }
                }
            } else {
            }

            if (callback) {
                callback(totalCount);
            }

        }, (error) => {
            if (callback) {
                callback(0);
            }
        });
    },

    trackGameSelection: function (userId, gameName) {
        if (!userId) {
            return;
        }
        if (!firebase.database) {
            return;
        }
        if (!gameName) {
            return;
        }

        const db = firebase.database();
        const userGameRef = db.ref(`gameSelections/${userId}/${gameName}`);

        userGameRef.transaction((currentValue) => {
            return (currentValue || 0) + 1;
        }).then(() => {
        }).catch((error) => {
        });
    },

    loadLoginCount: function (userId, callback) {
        if (!userId) {
            if (callback) callback(0);
            return;
        }
        if (!firebase.database) {
            if (callback) callback(0);
            return;
        }

        const loginDatesRef = firebase.database().ref(`users/${userId}/loginDates`);

        loginDatesRef.once('value', (snapshot) => {
            const data = snapshot.val();
            let count = 0;
            if (data && typeof data === 'object') {
                count = Object.keys(data).length;
            } else {
            }
            if (callback) {
                callback(count);
            }
        }, (error) => {
            if (callback) {
                callback(0);
            }
        });
    },
};
