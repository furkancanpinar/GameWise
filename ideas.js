let isIdeasPageFullyInitialized = false;

document.addEventListener('DOMContentLoaded', function () {
    firebaseService.initAuthStateListener(function (user) {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('welcomeMessage').textContent = `Welcome, ${user.displayName || 'User'}`;

            if (!isIdeasPageFullyInitialized) {
                initializeIdeasPage(user.uid);
                isIdeasPageFullyInitialized = true;
            }
        }
    });

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    if (toggleSidebarBtn && sidebar && content) {
        toggleSidebarBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
    }

    const userIcon = document.getElementById('userIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (userIcon && dropdownMenu) {
        userIcon.addEventListener('click', function () {
            dropdownMenu.classList.toggle('show');
        });

        window.addEventListener('click', function (event) {
            if (!event.target.matches('#userIcon')) {
                if (dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                }
            }
        });
    }
});

function generateActivityId(activity) {
    return activity.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function initializeIdeasPage(userId) {
    const db = firebase.database();

    const activities = {
        "energetic": [
            {
                id: "energetic-quick-hiit",
                title: "Quick HIIT Workout",
                description: "Perform short bursts of intense exercise followed by brief rest periods.",
                time: 15,
                energy: "High",
                social: "Solo",
                category: "outdoor",
                image: "/Editables/Images/HIIT.png"
            },
            {
                id: "energetic-go-for-a-run",
                title: "Go for a Run/Jog",
                description: "Lace up your shoes and head outside for a brisk run or a steady jog.",
                time: 30,
                energy: "High",
                social: "Solo",
                category: "outdoor",
                image: "/Editables/Images/run.png"
            },
            {
                id: "energetic-dance-workout",
                title: "Dance Workout",
                description: "Put on some music and move your body freely or follow along with a routine.",
                time: 30,
                energy: "Medium",
                social: "Solo",
                category: "creative",
                image: "/Editables/Images/dance.png"
            },
            {
                id: "energetic-parkour-basics",
                title: "Parkour Basics",
                description: "Learn basic parkour movements by practicing simple vaults, jumps, and landings in a safe environment.",
                time: 60,
                energy: "High",
                social: "Solo or Group",
                category: "outdoor",
                image: "/Editables/Images/parcour.png"
            },
            {
                id: "energetic-sports-match",
                title: "Sports Match/Practice",
                description: "Join friends or a local group for a casual game or practice session of a sport like soccer, basketball, or tennis.",
                time: 120,
                energy: "High",
                social: "Group",
                category: "social",
                image: "/Editables/Images/sports.png"
            }
        ],
        "creative": [
            {
                id: "creative-quick-sketching",
                title: "Quick Sketching",
                description: "Grab a pen and paper and spend a few minutes drawing anything that inspires you.",
                time: 15,
                energy: "Low",
                social: "Solo",
                category: "creative",
                image: "/Editables/Images/sketch.png"
            },
            {
                id: "creative-write-short-story",
                title: "Write a Short Story",
                description: "Sit down with a notebook or computer and let your imagination flow to create a short narrative.",
                time: 30,
                energy: "Medium",
                social: "Solo",
                category: "creative",
                image: "/Editables/Images/writing.png"
            },
            {
                id: "creative-digital-painting",
                title: "Digital Painting",
                description: "Use digital tools and software to create artwork on a computer or tablet.",
                time: 120,
                energy: "Medium",
                social: "Solo",
                category: "creative",
                image: "/Editables/Images/painting.png"
            },
            {
                id: "creative-learn-instrument",
                title: "Learn an Instrument (Beginner)",
                description: "Pick up a simple instrument and learn the basic notes and chords.",
                time: 60,
                energy: "Low",
                social: "Solo",
                category: "creative",
                image: "/Editables/Images/instrument.png"
            },
        ],
        "relaxed": [
            {
                id: "relaxed-meditate",
                title: "Meditate",
                description: "Find a quiet space, sit comfortably, and focus on your breath to calm your mind.",
                time: 15,
                energy: "Very Low",
                social: "Solo",
                category: "learning",
                image: "/Editables/Images/meditate.png"
            },
            {
                id: "relaxed-read-a-book",
                title: "Read a Book",
                description: "Settle into a comfortable spot and immerse yourself in the pages of a book.",
                time: 30,
                energy: "Low",
                social: "Solo",
                category: "learning",
                image: "/Editables/Images/reading.png"
            },
            {
                id: "relaxed-gentle-yoga",
                title: "Gentle Yoga or Stretching",
                description: "Move through a series of gentle poses or stretches to relax your body.",
                time: 60,
                energy: "Low",
                social: "Solo",
                category: "outdoor",
                image: "/Editables/Images/yoga.png"
            },
            {
                id: "relaxed-podcast-audiobook",
                title: "Listen to a Podcast or Audiobook",
                description: "Put on headphones or speakers and enjoy listening to an interesting story or topic.",
                time: 120,
                energy: "Very Low",
                social: "Solo",
                category: "learning",
                image: "/Editables/Images/podcast.png"
            }
        ],
        "social": [
            {
                id: "social-call-a-friend",
                title: "Call or Text a Friend",
                description: "Pick up your phone and reach out to someone you care about for a chat.",
                time: 15,
                energy: "Low",
                social: "Group",
                category: "social",
                image: "/Editables/Images/call.png"
            },
            {
                id: "social-board-game",
                title: "Play a Board Game or Card Game",
                description: "Gather with others and enjoy some friendly competition with a game.",
                time: 30,
                energy: "Medium",
                social: "Group",
                category: "social",
                image: "/Editables/Images/board.png"
            },
            {
                id: "social-local-meetup",
                title: "Join a Local Meetup",
                description: "Look for local groups that share your interests and attend one of their gatherings to meet new people.",
                time: 60,
                energy: "Medium",
                social: "Group",
                category: "social",
                image: "/Editables/Images/meet.png"
            },
            {
                id: "social-volunteer",
                title: "Volunteer",
                description: "Dedicate some time to help out a local organization or cause you believe in.",
                time: 120,
                energy: "Medium",
                social: "Group",
                category: "social",
                image: "/Editables/Images/volunteer.png"
            }
        ]
    };

    let selectedMood = null;
    let selectedTime = null;

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedMood = this.dataset.mood;
        });
    });

    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedTime = parseInt(this.dataset.time);
        });
    });

    document.getElementById('findActivities').addEventListener('click', function () {
        if (!selectedMood || !selectedTime) {
            alert("Please select both your mood and available time");
            return;
        }

        displayActivities(selectedMood, selectedTime);
    });

    document.getElementById('activityFilter').addEventListener('change', function () {
        filterActivities(this.value);
    });

    function displayActivities(mood, time) {
        const activitiesGrid = document.getElementById('activitiesGrid');
        activitiesGrid.innerHTML = '';

        const moodActivities = activities[mood] || [];
        const filteredActivities = moodActivities.filter(activity => activity.time <= time);

        if (filteredActivities.length === 0) {
            activitiesGrid.innerHTML = '<p class="no-results">No activities match your criteria. Try different options!</p>';
            document.getElementById('activitiesResults').style.display = 'block';
            if (window.activityJoiningService) {
                window.activityJoiningService.loadAndDisplayJoinCounts();
            }
            return;
        }

        filteredActivities.forEach(activity => {
            const activityId = activity.id || generateActivityId(activity);

            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            activityCard.dataset.category = activity.category;
            activityCard.dataset.activityId = activityId;
            activityCard.dataset.activity = JSON.stringify(activity);

            activityCard.innerHTML = `
                <div class="activity-image" style="background-image: url('${activity.image}')"></div>
                <div class="activity-info">
                    <h3>${activity.title}</h3>
                    <p>${activity.description.substring(0, 80)}${activity.description.length > 80 ? '...' : ''}</p>
                    <div class="activity-meta">
                        <span><i class="fas fa-clock"></i> ${activity.time} min</span>
                        <span>${activity.category}</span>
                        <span class="activity-join-count" data-activity-id="${activityId}"><i class="fas fa-users"></i> <span class="count-number">0</span></span>
                    </div>
                </div>
            `;

            activityCard.addEventListener('click', function () {
                const activityData = JSON.parse(this.dataset.activity);
                showActivityDetails(activityData);
            });

            activitiesGrid.appendChild(activityCard);
        });

        document.getElementById('activitiesResults').style.display = 'block';

        if (window.activityJoiningService) {
            window.activityJoiningService.loadAndDisplayJoinCounts();
        }
    }

    function filterActivities(category) {
        const activityCards = document.querySelectorAll('.activity-card');

        activityCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    const activityModal = document.getElementById('activityModal');
    const closeModalBtn = activityModal ? activityModal.querySelector('.close-modal') : null;
    const saveActivityBtn = document.getElementById('saveActivity');
    const modalJoinButton = document.getElementById('joinActivityModalBtn');

    function showActivityDetails(activity) {
        if (!activityModal) return;

        const activityId = activity.id || generateActivityId(activity);

        document.getElementById('modalActivityTitle').textContent = activity.title;
        document.getElementById('modalTime').textContent = `${activity.time} minutes`;
        document.getElementById('modalEnergy').textContent = activity.energy;
        document.getElementById('modalSocial').textContent = activity.social;
        document.getElementById('modalDescription').textContent = activity.description;

        const resourcesList = document.getElementById('modalResources');
        if (resourcesList) {
            resourcesList.innerHTML = '<li>Explore available tools or guides based on your preference.</li>';
        }

        activityModal.dataset.currentActivity = JSON.stringify(activity);
        activityModal.dataset.activityId = activityId;

        if (modalJoinButton) {
            modalJoinButton.dataset.activityId = activityId;
        }

        activityModal.style.display = 'block';

        if (window.activityJoiningService && typeof window.activityJoiningService.updateJoinCountUI === 'function') {
            window.activityJoiningService.updateJoinCountUI(activityId);
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            activityModal.style.display = 'none';
            activityModal.dataset.currentActivity = '';
            activityModal.dataset.activityId = '';
            if (modalJoinButton) {
                modalJoinButton.dataset.activityId = '';
            }
        });
    }

    window.addEventListener('click', function (event) {
        if (event.target === activityModal) {
            activityModal.style.display = 'none';
            activityModal.dataset.currentActivity = '';
            activityModal.dataset.activityId = '';
            if (modalJoinButton) {
                modalJoinButton.dataset.activityId = '';
            }
        }
    });

    if (saveActivityBtn) {
        saveActivityBtn.addEventListener('click', function () {
            const activityToSaveData = activityModal.dataset.currentActivity;

            if (!activityToSaveData) {
                alert("An error occurred. Cannot save activity.");
                return;
            }

            const activityToSave = JSON.parse(activityToSaveData);
            const currentUserId = userId;

            if (!currentUserId) {
                alert("You must be logged in to save activities.");
                return;
            }

            const savedActivitiesRef = db.ref('users/' + currentUserId + '/savedActivities');

            const queryField = activityToSave.id ? 'id' : 'title';
            const queryValue = activityToSave.id || activityToSave.title;

            savedActivitiesRef.orderByChild(queryField).equalTo(queryValue).once('value', (snapshot) => {
                if (snapshot.exists()) {
                    alert(`"${activityToSave.title}" is already in your saved activities.`);
                    activityModal.style.display = 'none';
                } else {
                    const activityDataForSave = { ...activityToSave };
                    delete activityDataForSave.resources;

                    savedActivitiesRef.push({
                        ...activityDataForSave,
                        savedAt: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => {
                        alert(`"${activityToSave.title}" saved to your list!`);
                        activityModal.style.display = 'none';
                    }).catch(error => {
                        alert("Failed to save activity. Please try again.");
                    });
                }
            }, (error) => {
                alert("An error occurred while checking your saved activities. Please try again.");
            });
        });
    }

    const savedActivitiesList = document.getElementById('savedActivitiesList');
    if (savedActivitiesList) {
        const savedActivitiesRef = db.ref('users/' + userId + '/savedActivities');

        savedActivitiesRef.on('value', (snapshot) => {
            savedActivitiesList.innerHTML = '';

            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const activityKey = childSnapshot.key;
                    const activity = childSnapshot.val();

                    const savedActivityEl = document.createElement('div');
                    savedActivityEl.className = 'saved-activity-item';
                    savedActivityEl.dataset.key = activityKey;
                    if(activity.id) {
                        savedActivityEl.dataset.activityId = activity.id;
                    }

                    savedActivityEl.innerHTML = `
                        <div class="saved-activity-info">
                            <h3>${activity.title}</h3>
                            <p>${activity.description ? activity.description.substring(0, 100) + (activity.description.length > 100 ? '...' : '') : 'No description.'}</p>
                            <div class="saved-activity-meta">
                                <span><i class="fas fa-clock"></i> ${activity.time || 'N/A'} min</span>
                                <span>${activity.category || 'N/A'}</span>
                            </div>
                        </div>
                        <button class="remove-saved-activity" title="Remove"><i class="fas fa-times"></i></button>
                    `;

                    savedActivityEl.querySelector('.remove-saved-activity').addEventListener('click', function () {
                        db.ref('users/' + userId + '/savedActivities/' + activityKey).remove()
                            .then(() => {
                            })
                            .catch(error => {
                                alert("Failed to remove activity. Please try again.");
                            });
                    });

                    savedActivitiesList.appendChild(savedActivityEl);
                });
            } else {
                savedActivitiesList.innerHTML = '<p class="no-results">You have no saved activities yet.</p>';
            }
        }, (error) => {
            savedActivitiesList.innerHTML = '<p class="no-results">Failed to load saved activities.</p>';
        });
    } else {
    }

    const newIdeaInput = document.getElementById('newIdea');
    const submitIdeaBtn = document.getElementById('submitIdea');
    const communityGrid = document.getElementById('communityGrid');

    if (submitIdeaBtn && newIdeaInput && communityGrid) {
        submitIdeaBtn.addEventListener('click', function () {
            const ideaText = newIdeaInput.value.trim();
            if (ideaText === '') return;

            const currentUser = firebase.auth().currentUser;
            const authorName = currentUser && currentUser.displayName ? currentUser.displayName : `User ${userId.substring(0, 6)}`;

            db.ref('communityIdeas').push({
                text: ideaText,
                authorId: userId,
                authorName: authorName,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                likes: 0
            }).then(() => {
                newIdeaInput.value = '';
            }).catch(error => {
                alert("Failed to submit idea. Please try again.");
            });
        });

        db.ref('communityIdeas').limitToLast(20).on('value', (snapshot) => {
            communityGrid.innerHTML = '';

            if (snapshot.exists()) {
                const ideas = [];
                snapshot.forEach(childSnapshot => {
                    ideas.push({
                        key: childSnapshot.key,
                        val: childSnapshot.val()
                    });
                });

                ideas.reverse().forEach(ideaItem => {
                    const idea = ideaItem.val;
                    const ideaKey = ideaItem.key;

                    const ideaEl = document.createElement('div');
                    ideaEl.className = 'community-idea';
                    ideaEl.innerHTML = `
                        <div class="idea-content">
                            <h3>${idea.text ? idea.text.substring(0, 50) + (idea.text.length > 50 ? '...' : '') : 'No Title'}</h3>
                            <p>"${idea.text || 'No content.'}"</p>
                            <div class="idea-meta">
                                <span class="idea-author">${idea.authorName || 'Anonymous'}</span>
                                <span class="idea-likes" data-idea-key="${ideaKey}" data-likes="${idea.likes || 0}">${idea.likes || 0} <i class="fas fa-heart"></i></span>
                            </div>
                        </div>
                    `;

                    const likeSpan = ideaEl.querySelector('.idea-likes');
                    if (likeSpan) {
                        likeSpan.addEventListener('click', function () {
                            const currentLikes = parseInt(this.dataset.likes);
                            const key = this.dataset.ideaKey;
                            if (key) {
                                db.ref('communityIdeas/' + key + '/likes').transaction((currentValue) => {
                                    return (currentValue || 0) + 1;
                                });
                            }
                        });
                    }

                    communityGrid.appendChild(ideaEl);
                });
            } else {
                communityGrid.innerHTML = '<p class="no-results">No community ideas yet. Be the first to share!</p>';
            }
        }, (error) => {
            communityGrid.innerHTML = '<p class="no-results">Failed to load community ideas.</p>';
        });
    } else {
    }

    setTimeout(() => {
        if (window.activityJoiningService && typeof window.activityJoiningService.loadAndDisplayJoinCounts === 'function') {
            window.activityJoiningService.loadAndDisplayJoinCounts();
        } else {
        }
    }, 100);
}
