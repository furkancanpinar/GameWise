document.addEventListener('DOMContentLoaded', () => {
    const ideaInput = document.getElementById('newIdea');
    const submitButton = document.getElementById('submitIdea');
    const communityGrid = document.getElementById('communityGrid');
    const ideaForm = document.querySelector('.community-ideas .idea-submission');

    if (!ideaInput || !submitButton || !communityGrid || !ideaForm || !firebase || !firebase.database || !firebaseService) {
        if (communityGrid) {
            communityGrid.innerHTML = '<p>Error loading community ideas functionality. Please check the console.</p>';
        }
        return;
    }

    const communityIdeasRef = firebase.database().ref('communityIdeas');

    function createIdeaElement(idea) {
        const ideaElement = document.createElement('div');
        ideaElement.classList.add('community-idea');
        ideaElement.dataset.ideaId = idea.id;

        const authorDisplayName = idea.authorDisplayName || (idea.authorUid ? `@${idea.authorUid.substring(0, 6)}...` : 'Anonymous');

        ideaElement.innerHTML = `
            <div class="idea-content">
                <h3>${idea.title || 'Community Idea'}</h3> <p>${idea.text}</p>
                <div class="idea-meta">
                    <span class="idea-author">${authorDisplayName}</span>
                    <span class="idea-likes">
                        <span class="count-number">${idea.likes || 0}</span>
                        <i class="fas fa-heart like-icon"></i>
                    </span>
                </div>
            </div>
        `;

        const likeIcon = ideaElement.querySelector('.like-icon');
        if (likeIcon) {
            likeIcon.style.cursor = 'pointer';
            likeIcon.addEventListener('click', () => {
                toggleLike(idea.id, likeIcon);
            });
        }

        return ideaElement;
    }

    function displayIdeas(ideasData) {
        communityGrid.innerHTML = '';

        if (!ideasData) {
            communityGrid.innerHTML = '<p>No community ideas yet. Be the first to share!</p>';
            return;
        }

        const ideasArray = Object.keys(ideasData).map(key => ({
            id: key,
            ...ideasData[key]
        }));

        ideasArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        ideasArray.forEach(idea => {
            const ideaElement = createIdeaElement(idea);
            communityGrid.appendChild(ideaElement);
        });

        updateLikedStatusForCurrentUser();
    }

    function toggleLike(ideaId, likeIconElement) {
        const userId = firebaseService.getCurrentUserId();

        if (!userId) {
            alert("Please log in to like ideas.");
            return;
        }

        const ideaLikesRef = communityIdeasRef.child(ideaId).child('likes');
        const userLikedRef = firebase.database().ref(`users/${userId}/likedIdeas/${ideaId}`);

        userLikedRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                userLikedRef.remove().then(() => {
                    ideaLikesRef.transaction(currentValue => {
                        return (typeof currentValue === 'number' ? currentValue : 0) - 1;
                    }).catch(error => { /* Handle error gracefully */ });
                }).catch(error => { /* Handle error gracefully */ });
            } else {
                userLikedRef.set(true).then(() => {
                    ideaLikesRef.transaction(currentValue => {
                        return (typeof currentValue === 'number' ? currentValue : 0) + 1;
                    }).catch(error => { /* Handle error gracefully */ });
                }).catch(error => { /* Handle error gracefully */ });
            }
        }).catch(error => { /* Handle error gracefully */ });
    }

    function updateLikedStatusForCurrentUser() {
        const userId = firebaseService.getCurrentUserId();
        if (!userId) {
            communityGrid.querySelectorAll('.like-icon').forEach(icon => {
                icon.classList.remove('liked');
            });
            return;
        }

        const userLikedIdeasRef = firebase.database().ref(`users/${userId}/likedIdeas`);
        userLikedIdeasRef.once('value', (snapshot) => {
            const likedIdeas = snapshot.val() || {};

            communityGrid.querySelectorAll('.community-idea').forEach(ideaElement => {
                const ideaId = ideaElement.dataset.ideaId;
                const likeIcon = ideaElement.querySelector('.like-icon');

                if (likeIcon) {
                    if (likedIdeas[ideaId]) {
                        likeIcon.classList.add('liked');
                    } else {
                        likeIcon.classList.remove('liked');
                    }
                }
            });
        }, (error) => { /* Handle error gracefully */ });
    }

    function submitNewIdea(event) {
        event.preventDefault();

        const ideaText = ideaInput.value.trim();

        if (ideaText === '') {
            alert('Please enter an idea before submitting.');
            return;
        }

        ideaInput.disabled = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        const userId = firebaseService.getCurrentUserId();
        const user = firebase.auth().currentUser;
        const authorDisplayName = (user && user.displayName && user.displayName !== '') ? user.displayName : (userId ? `User-${userId.substring(0, 6)}` : 'Anonymous');

        const newIdeaData = {
            text: ideaText,
            authorUid: userId,
            authorDisplayName: authorDisplayName,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likes: 0
        };

        communityIdeasRef.push(newIdeaData)
            .then(() => {
                ideaInput.value = '';
                ideaInput.disabled = false;
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus"></i> Submit';
            })
            .catch((error) => {
                alert("Failed to submit idea. Please try again.");
                ideaInput.disabled = false;
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus"></i> Submit';
            });
    }

    communityIdeasRef.on('value', (snapshot) => {
        const ideasData = snapshot.val();
        displayIdeas(ideasData);
    }, (error) => {
        communityGrid.innerHTML = '<p>Error loading community ideas.</p>';
    });

    ideaForm.addEventListener('submit', submitNewIdea);
});
