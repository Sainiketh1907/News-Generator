
const API_KEY = 'a6bd71c8ce7e4138b0af79f7edfb44f7';


//   Main NewsApp class that handles all the functionality
 
class NewsApp {
    constructor() {
        this.init();
    }

    /**
     * Initialize the application
     * Check authentication and set up event listeners
     */
    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    /**
     * Check user authentication status
     * Show appropriate screens based on auth state
     */
    checkAuth() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            // No user found - show login
            this.showAuthModal();
        } else if (!user.preferences) {
            // User exists but no preferences - show preferences
            this.showPreferencesModal();
        } else {
            // User exists with preferences - show news
            this.showUserInfo(user);
            this.showNews();
        }
    }

   
    //   Set up all event listeners for the application
     
    setupEventListeners() {
        // Auth related listeners
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('preferencesForm').addEventListener('submit', (e) => this.handlePreferences(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Modal navigation listeners
        document.getElementById('showSignup').addEventListener('click', (e) => this.toggleAuthModals(e, 'signup'));
        document.getElementById('showLogin').addEventListener('click', (e) => this.toggleAuthModals(e, 'login'));
    }

    /**
     * Toggle between login and signup modals
     * @param {Event} e - Event object
     * @param {string} mode - Modal to show ('login' or 'signup')
     */
    toggleAuthModals(e, mode) {
        e.preventDefault();
        const authContainer = document.getElementById('authContainer');
        const signupContainer = document.getElementById('signupContainer');

        if (mode === 'signup') {
            authContainer.classList.add('hidden');
            signupContainer.classList.remove('hidden');
        } else {
            signupContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
        }
    }

    /**
     * Handle user login
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // Note: In production, implement proper authentication
        const user = { email, name: email.split('@')[0] };
        this.loginUser(user);
    }

    /**
     * Handle user signup
     * @param {Event} e - Form submit event
     */
    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        // Note: In production, implement proper user creation
        const user = { name, email };
        this.loginUser(user);
    }

    /**
     * Save user data and proceed to preferences
     * @param {Object} user - User data object
     */
    loginUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.showUserInfo(user);
        this.showPreferencesModal();
    }

    /**
     * Update UI with user information
     * @param {Object} user - User data object
     */
    showUserInfo(user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('signupContainer').classList.add('hidden');
    }

    /**
     * Handle user preferences selection
     * @param {Event} e - Form submit event
     */
    async handlePreferences(e) {
        e.preventDefault();
        const preferences = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (preferences.length === 0) {
            alert('Please select at least one preference.');
            return;
        }

        // Save preferences and show news
        const user = JSON.parse(localStorage.getItem('user'));
        user.preferences = preferences;
        localStorage.setItem('user', JSON.stringify(user));
        
        document.getElementById('preferencesContainer').classList.add('hidden');
        this.showNews();
    }
    
    //  Handle user logout
     
    handleLogout() {
        localStorage.removeItem('user');
        location.reload();
    }
 
    //   Display authentication modal    
    showAuthModal() {
        document.getElementById('authContainer').classList.remove('hidden');
    }
    
    //   Display preferences selection modal 
    showPreferencesModal() {
        document.getElementById('preferencesContainer').classList.remove('hidden');
    }
    
    //   Fetch and display news based on user preferences
    async showNews() {
        const user = JSON.parse(localStorage.getItem('user'));
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.classList.remove('hidden');
        newsContainer.innerHTML = '<p class="text-center">Loading news...</p>';

        try {
            // Fetch news for each preferred category
            const newsPromises = user.preferences.map(category =>
                fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`)
                    .then(res => res.json())
            );

            const newsResults = await Promise.all(newsPromises);
            const articles = newsResults.flatMap(result => result.articles || []);
            this.renderNews(articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            this.showErrorMessage('Failed to fetch news. Please try again later.');
        }
    }

    /**
     * Render news articles to the DOM
     * @param {Array} articles - Array of news articles
     */
    renderNews(articles) {
        const container = document.getElementById('newsContainer');
        if (articles.length === 0) {
            container.innerHTML = '<p class="text-center">No news articles found. Try selecting different preferences.</p>';
            return;
        }
        container.innerHTML = articles.map(article => `
            <div class="news-card fade-in">
                <img src="${article.urlToImage || 'placeholder.jpg'}" alt="${article.title}" onerror="this.src='placeholder.jpg'">
                <div class="content">
                    <h3>${article.title}</h3>
                    <p>${article.description || 'No description available.'}</p>
                    <a href="${article.url}" target="_blank" class="btn-secondary">Read More</a>
                </div>
            </div>
        `).join('');
    }

    /**
     * Display error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const container = document.getElementById('newsContainer');
        container.innerHTML = `<p class="text-center" style="color: var(--error);">${message}</p>`;
    }
}
// Initialize the application
new NewsApp();
