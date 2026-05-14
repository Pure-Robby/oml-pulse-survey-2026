/**
 * Reusable Navigation Component for Pulse Survey Dashboard
 * This component provides consistent navigation across all main pages
 */

class PulseNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    /**
     * Get the current page name from the URL or data attribute
     */
    getCurrentPage() {
        // Check if there's a data attribute on the body
        const body = document.body;
        if (body && body.dataset.currentPage) {
            return body.dataset.currentPage;
        }

        // Fallback to URL path
        const path = window.location.pathname;
        if (path.includes('reports')) return 'reports';
        if (path.includes('progress')) return 'progress';
        
        // Default to overview (index.html is the main overview page)
        return 'overview';
    }

    /**
     * Initialize the navigation component
     */
    init() {
        this.createNavigation();
        
        // Set up event listeners for all pages
        // On index.html, we'll handle external navigation while letting app.js handle internal navigation
        this.setupEventListeners();
        
        this.setActiveTab();
    }

    /**
     * Create the navigation HTML structure
     */
    createNavigation() {
        const header = document.querySelector('header');
        if (!header) {
            console.error('Header element not found');
            return;
        }

        // Check if navigation already exists (for index.html)
        let nav = header.querySelector('.main-nav');
        if (!nav) {
            nav = document.createElement('nav');
            nav.className = 'main-nav';
            header.appendChild(nav);
            
            // Create navigation structure
            nav.innerHTML = `
                <div class="nav-container">
                    <ul class="nav-tabs">
                        <li class="nav-tab" data-section="overview" data-url="index.html">
                            <i class="material-icons">dashboard</i>
                            Overview
                        </li>
                        <li class="nav-tab" data-section="overview-ee" data-url="index.html" hidden>
                            <i class="material-icons">dashboard_customize</i>
                            Overview (EE only)
                        </li>
                        <li class="nav-tab" data-section="reports" data-url="reports.html">
                            <i class="material-icons">assessment</i>
                            Reports
                        </li>
                        <li class="nav-tab" data-section="progress" data-url="progress.html">
                            <i class="material-icons">trending_up</i>
                            Progress Tracker
                        </li>
                    </ul>
                </div>
            `;
        } else {
            // Navigation already exists, just update the URLs for external pages
            const navTabs = nav.querySelectorAll('.nav-tab');
            navTabs.forEach(tab => {
                const section = tab.dataset.section;
                if (section === 'reports') {
                    tab.dataset.url = 'reports.html';
                } else if (section === 'progress') {
                    tab.dataset.url = 'progress.html';
                } else if (section === 'overview' || section === 'overview-ee') {
                    tab.dataset.url = 'index.html';
                }
            });
        }
    }

        /**
     * Set up event listeners for navigation
     */
    setupEventListeners() {
        const navTabs = document.querySelectorAll('.nav-tab');
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetSection = tab.dataset.section;
                const targetUrl = tab.dataset.url;
                
                // On index.html, only handle external navigation (reports, progress)
                // Let app.js handle internal navigation (overview, overview-ee)
                if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
                    if (targetSection === 'reports' || targetSection === 'progress') {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent event bubbling to app.js
                        this.navigateToPage(targetSection, targetUrl);
                        return;
                    }
                    // For internal navigation, let app.js handle it
                    return;
                }
                
                // On other pages, handle all navigation
                e.preventDefault();
                e.stopPropagation();
                
                // Don't navigate if we're already on the target section
                if (targetSection === this.currentPage) {
                    return;
                }
    
                // Handle navigation
                this.navigateToPage(targetSection, targetUrl);
            });
        });
    
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.setActiveTab(e.state.section);
            }
        });
    }

    /**
     * Navigate to a specific page
     */
    navigateToPage(section, url) {
        // Special handling for overview pages that are both on index.html
        if (section === 'overview' || section === 'overview-ee') {
            // If we're already on index.html, just switch sections
            if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
                this.switchToSection(section);
                return;
            }
        }
        
        // For external pages (reports, progress), always navigate
        if (section === 'reports' || section === 'progress') {
            // Update browser history
            const state = { section: section };
            const title = `Pulse Survey - ${this.getPageTitle(section)}`;
            
            if (window.history && window.history.pushState) {
                window.history.pushState(state, title, url);
            }

            // Navigate to the page
            window.location.href = url;
            return;
        }
        
        // Fallback for other cases
        window.location.href = url;
    }

    /**
     * Switch to a different section within the current page (for index.html)
     */
    switchToSection(section) {
        // Use the existing switchToTab function from app.js if available
        if (typeof switchToTab === 'function') {
            switchToTab(section, false); // Don't update URL
        } else {
            // Fallback to manual section switching
            // Remove active from all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active to target section
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update navigation tabs
            const navTabs = document.querySelectorAll('.nav-tab');
            navTabs.forEach(tab => {
                const tabSection = tab.dataset.section;
                if (tabSection === section) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Update browser history without hash
            const state = { section: section };
            const title = `Pulse Survey - ${this.getPageTitle(section)}`;
            
            if (window.history && window.history.pushState) {
                window.history.pushState(state, title, `index.html`);
            }
        }
        
        // Trigger any necessary data loading or initialization
        this.initializeSectionData(section);
    }

    /**
     * Initialize data for a specific section
     */
    initializeSectionData(section) {
        // This can be expanded to load specific data for each section
        console.log(`Initializing data for section: ${section}`);
        
        // For now, just ensure the section is properly displayed
        if (section === 'overview' || section === 'overview-ee') {
            // The existing JavaScript should handle the data loading
            // We just need to make sure the section is visible
        }
    }

    /**
     * Get the display title for a page
     */
    getPageTitle(section) {
        const titles = {
            'overview': 'Overview',
            'overview-ee': 'Overview (EE only)',
            'reports': 'Reports',
            'progress': 'Progress Tracker'
        };
        return titles[section] || 'Dashboard';
    }

    /**
     * Set the active tab based on current page
     */
    setActiveTab(section = null) {
        const currentSection = section || this.currentPage;
        const navTabs = document.querySelectorAll('.nav-tab');
        
        navTabs.forEach(tab => {
            const tabSection = tab.dataset.section;
            if (tabSection === currentSection) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    /**
     * Update the current page (called when page loads)
     */
    updateCurrentPage(section) {
        this.currentPage = section;
        this.setActiveTab(section);
    }
}

/**
 * Header Actions Component
 */
class HeaderActions {
    constructor() {
        this.init();
    }

    init() {
        this.createHeaderActions();
    }

    createHeaderActions() {
        const header = document.querySelector('header');
        if (!header) return;

        // Find or create header actions
        let headerActions = header.querySelector('.header-actions');
        if (!headerActions) {
            headerActions = document.createElement('div');
            headerActions.className = 'header-actions';
            header.appendChild(headerActions);
        }

        // Link straight to survey landing (in survey/index.html)
        if (!headerActions.querySelector('#openSurvey')) {
            headerActions.innerHTML = `
                <a id="openSurvey" class="survey-button" href="survey/index.html" target="_blank" rel="noopener noreferrer">
                    <i class="material-icons">poll</i>
                    Open Survey (for demo only)
                </a>
            `;
        }
    }
}

/**
 * Logo Component
 */
class LogoComponent {
    constructor() {
        this.init();
    }

    init() {
        this.createLogo();
    }

    createLogo() {
        const header = document.querySelector('header');
        if (!header) return;

        // Find or create logo
        let logo = header.querySelector('.logo');
        if (!logo) {
            logo = document.createElement('div');
            logo.className = 'logo';
            header.insertBefore(logo, header.firstChild);
        }

        // Create logo content if it doesn't exist
        if (!logo.querySelector('img')) {
            logo.innerHTML = `
                <img src="images/pulse-logo.png" alt="Pulse Logo">
            `;
        }
    }
}

/**
 * Footer Component
 */
class FooterComponent {
    constructor() {
        this.init();
    }

    init() {
        this.createFooter();
    }

    createFooter() {
        // Check if footer already exists
        if (document.querySelector('.site-footer')) {
            return;
        }

        const footerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-copyright">
                            © 2025 Pulse Survey Dashboard. All rights reserved.
                        </div>
                        <div class="footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Contact Us</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

/**
 * Initialize all navigation components when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    window.pulseNavigation = new PulseNavigation();
    window.headerActions = new HeaderActions();
    window.logoComponent = new LogoComponent();
    window.footerComponent = new FooterComponent();

    // Set current page based on body data attribute or URL
    const body = document.body;
    if (body && body.dataset.currentPage) {
        window.pulseNavigation.updateCurrentPage(body.dataset.currentPage);
    }
    
    // Don't interfere with existing navigation system on index.html
    // The existing app.js will handle the navigation logic
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PulseNavigation,
        HeaderActions,
        LogoComponent,
        FooterComponent
    };
} 