if (typeof firebaseService === 'undefined') {
    
}

const ACTIVITY_JOINS_PATH = 'activityJoins/';

async function handleJoinButtonClick(event) {
    const userId = firebaseService.getCurrentUserId();
    if (!userId) {
        alert("Please log in to join activities!");
        return;
    }

    const activityElement = event.target.closest('[data-activity-id]');
    if (!activityElement) {
        
        return;
    }

    const activityId = activityElement.dataset.activityId;
    if (!activityId) {
        
        return;
    }

    const joinButton = event.target.closest('.join-activity-btn, .join-activity-modal-btn, .joined');

    if (!joinButton) {
        
        return;
    }

    const hasJoined = await checkUserJoined(activityId, userId);
    if (hasJoined) {
        updateJoinButtonUI(joinButton, true);
        return;
    }

    const originalButtonText = joinButton.textContent;
    joinButton.textContent = 'Joining...';
    joinButton.disabled = true;

    joinActivity(activityId, userId, joinButton, originalButtonText);
}

function joinActivity(activityId, userId, joinButton, originalText) {
    if (!firebase.database) {
        updateJoinButtonUI(joinButton, false);
        joinButton.textContent = originalText;
        alert("Firebase Database not available. Cannot join activity.");
        return;
    }

    const activityJoinRef = firebase.database().ref(`${ACTIVITY_JOINS_PATH}${activityId}/joiners/${userId}`);

    activityJoinRef.set(firebase.database.ServerValue.TIMESTAMP)
        .then(() => {
            updateJoinButtonUI(joinButton, true);
            updateJoinCountUI(activityId);
        })
        .catch((error) => {
            alert("Failed to join activity. Please try again.");
            updateJoinButtonUI(joinButton, false);
            joinButton.innerHTML = originalText;
        });
}

function updateJoinButtonUI(buttonElement, isJoined) {
    if (!buttonElement) return;

    if (isJoined) {
        buttonElement.textContent = 'Joined';
        buttonElement.disabled = true;
        buttonElement.classList.add('joined');
        buttonElement.classList.remove('join-activity-btn', 'join-activity-modal-btn');
    } else {
        buttonElement.disabled = false;
        buttonElement.classList.remove('joined');

        if (buttonElement.id === 'joinActivityModalBtn') {
            buttonElement.classList.add('join-activity-modal-btn');
            buttonElement.innerHTML = '<i class="fas fa-users"></i> Join this Activity';
        } else {
            buttonElement.classList.add('join-activity-btn');
            buttonElement.innerHTML = '<i class="fas fa-users"></i> Join Challenge';
        }
    }
}

function updateJoinCountUI(activityId) {
    if (!firebase.database || !activityId) {
        return;
    }

    const joinersRef = firebase.database().ref(`${ACTIVITY_JOINS_PATH}${activityId}/joiners`);

    joinersRef.once('value', (snapshot) => {
        const joiners = snapshot.val();
        const count = joiners ? Object.keys(joiners).length : 0;

        const activityElements = document.querySelectorAll(`[data-activity-id="${activityId}"]`);

        activityElements.forEach(element => {
            const countSpans = element.querySelectorAll('.count-number');
            countSpans.forEach(span => {
                span.textContent = count;
            });

            const userId = firebaseService.getCurrentUserId();
            const joinButton = element.querySelector('.join-activity-btn, .join-activity-modal-btn, .joined');

            if (joinButton && userId) {
                const userHasJoined = joiners && joiners.hasOwnProperty(userId);
                updateJoinButtonUI(joinButton, userHasJoined);
            } else if (joinButton && !userId) {
                updateJoinButtonUI(joinButton, false);
            }
        });

    }, (error) => {
        const activityElements = document.querySelectorAll(`[data-activity-id="${activityId}"]`);
        activityElements.forEach(element => {
            const countSpans = element.querySelectorAll('.count-number');
            countSpans.forEach(span => {
                span.textContent = '?';
            });
        });
    });
}

async function checkUserJoined(activityId, userId) {
    if (!firebase.database || !userId || !activityId) {
        
        return false;
    }
    const userJoinRef = firebase.database().ref(`${ACTIVITY_JOINS_PATH}${activityId}/joiners/${userId}`);
    try {
        const snapshot = await userJoinRef.once('value');
        return snapshot.exists();
    } catch (error) {
        
        return false;
    }
}

function loadAndDisplayJoinCountsForAllDisplayedActivities() {
    const activityElements = document.querySelectorAll('[data-activity-id]');
    const uniqueActivityIds = new Set();
    activityElements.forEach(element => {
        const activityId = element.dataset.activityId;
        if (activityId) {
            uniqueActivityIds.add(activityId);
        }
    });

    uniqueActivityIds.forEach(activityId => {
        updateJoinCountUI(activityId);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.querySelector('.content');
    if (contentArea) {
        contentArea.addEventListener('click', (event) => {
            if (event.target.matches('.join-activity-btn, .join-activity-modal-btn, .joined')) {
                handleJoinButtonClick(event);
            }
        });
    } else {
        
    }
});

window.activityJoiningService = {
    loadAndDisplayJoinCounts: loadAndDisplayJoinCountsForAllDisplayedActivities,
    updateJoinCountUI: updateJoinCountUI
};
