const searchBar = document.getElementById('search-bar');
const searchResults = document.getElementById('searchResults');

if (searchBar && searchResults) {
    const searchData = [
        { title: "Home Page", description: "Main landing page", link: "index.html", icon: "Editables/Home.png", keywords: ["home", "main", "landing", "start"] },
        { title: "Games", description: "Play educational games", link: "game.html", icon: "Editables/game.png", keywords: ["game", "games", "play", "fun", "learn"] },
        { title: "Ideas", description: "Explore learning ideas", link: "ideas.html", icon: "Editables/lamp.png", keywords: ["idea", "ideas", "explore", "learn"] },
        { title: "Self Assessment", description: "Test your knowledge", link: "self-assessment.html", icon: "Editables/selfassesment.png", keywords: ["test", "assessment", "quiz", "self"] },
        { title: "Time Tracker", description: "Track your learning time", link: "clock.html", icon: "Editables/clock.png", keywords: ["time", "track", "clock", "timer"] },
        { title: "GameWAi", description: "AI learning assistant", link: "ai.html", icon: "Editables/ai.png", keywords: ["ai", "assistant", "bot", "help"] },
        { title: "Support", description: "Get help and support", link: "support.html", icon: "Editables/support.png", keywords: ["help", "support", "faq"] },
        { title: "Settings", description: "Account and app settings", link: "settings.html", icon: "Editables/gear.png", keywords: ["settings", "preferences", "account"] },
        { title: "Login", description: "Sign in to your account", link: "login.html", icon: "Editables/user.png", keywords: ["login", "signin", "auth"] },
        { title: "Sign Up", description: "Create a new account", link: "signup.html", icon: "Editables/user.png", keywords: ["signup", "register", "create"] }
    ];

    function performSearch(query) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = searchData.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.keywords.some(keyword => keyword.includes(lowerQuery))
        );

        displayResults(results);
    }

    function displayResults(results) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No results found';
            searchResults.appendChild(noResults);
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <img src="${result.icon}" alt="${result.title}" class="result-icon">
                    <div class="result-text">
                        <div class="result-title">${result.title}</div>
                        <div class="result-description">${result.description}</div>
                    </div>
                `;
                resultItem.addEventListener('click', () => {
                    window.location.href = result.link;
                });
                searchResults.appendChild(resultItem);
            });
        }

        searchResults.classList.add('active');
    }

    searchBar.addEventListener('input', () => {
        performSearch(searchBar.value);
    });

    searchBar.addEventListener('focus', () => {
        if (searchBar.value.trim()) {
            performSearch(searchBar.value);
        }
    });

    document.body.addEventListener('click', (e) => {
        const isClickInsideSearchArea = searchBar.parentElement.contains(e.target) || searchResults.contains(e.target);

        if (!isClickInsideSearchArea) {
            searchResults.classList.remove('active');
        }
    });

    searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
            const results = searchResults.querySelectorAll('.result-item');
            if (results.length === 0) return;

            let currentIndex = -1;
            results.forEach((result, index) => {
                if (result.classList.contains('highlighted')) {
                    currentIndex = index;
                    result.classList.remove('highlighted');
                }
            });

            if (e.key === 'ArrowDown') {
                currentIndex = (currentIndex + 1) % results.length;
            } else if (e.key === 'ArrowUp') {
                currentIndex = (currentIndex - 1 + results.length) % results.length;
            } else if (e.key === 'Enter' && currentIndex >= 0) {
                e.preventDefault();
                results[currentIndex].click();
                return;
            }

            if (results[currentIndex]) {
                results[currentIndex].classList.add('highlighted');
                results[currentIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    });

}
