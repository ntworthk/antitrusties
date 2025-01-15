// UI management for wager system
const WagerUI = {
    initialize() {
        this.container = document.querySelector('.container');
        this.setupUI();
        this.render();
    },

    setupUI() {
        // Clear existing content
        this.container.innerHTML = `
            <header class="header">
                <h1>HoustonKemp antitrusties 2025</h1>
                <p class="header-description">Track your predictions and points for competition economics in 2025</p>
            </header>
            <section class="section" id="assigned-section">
                <div class="section-header">
                    <h2>Assigned Picks</h2>
                </div>
                <div class="persons-grid">
                    <!-- Person containers will be added here dynamically -->
                </div>
            </section>
        `;

        this.personsGrid = document.querySelector('.persons-grid');
    },

    getStatusIcon(status) {
        const iconClass = status === 'correct' ? 'fa-check-circle' :
                         status === 'incorrect' ? 'fa-times-circle' :
                         'fa-question-circle';
        const colorClass = status === 'correct' ? 'text-success' :
                          status === 'incorrect' ? 'text-danger' :
                          'text-warning';
        return `<i class="fas ${iconClass} ${colorClass}"></i>`;
    },

    createPersonContainer(person) {
        const totalScore = WagerState.calculateTotalScore(person);
        const isCollapsed = localStorage.getItem(`collapsed_${person.name}`) === 'true';
        
        const container = document.createElement('div');
        container.className = 'person-container';
        container.innerHTML = `
            <div class="person-header" role="button" tabindex="0">
                <div class="header-content">
                    <h3 class="person-name">${person.name}</h3>
                    <span class="score">Score: ${totalScore}</span>
                </div>
                <i class="fas fa-chevron-down toggle-icon"></i>
            </div>
            <div class="person-predictions ${isCollapsed ? 'collapsed' : ''}">
                ${person.picks.map(pick => {
                    const prediction = WagerState.getPredictionById(pick.id);
                    return `
                        <div class="prediction-card">
                            <div class="status-indicator">
                                ${this.getStatusIcon(prediction?.status || 'pending')}
                            </div>
                            <div class="prediction-content">
                                <p class="prediction-text">${prediction?.text || 'Loading...'}</p>
                                ${prediction?.notes ? `<p class="prediction-notes">${prediction.notes}</p>` : ''}
                                <span class="points-badge">${pick.points} pts</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        if (isCollapsed) {
            container.classList.add('collapsed');
        }
        
        const header = container.querySelector('.person-header');
        const predictionsDiv = container.querySelector('.person-predictions');
        
        // Add click handler
        header.addEventListener('click', () => {
            const isCurrentlyCollapsed = predictionsDiv.classList.contains('collapsed');
            predictionsDiv.classList.toggle('collapsed');
            container.classList.toggle('collapsed');
            
            // Store state in localStorage
            localStorage.setItem(`collapsed_${person.name}`, !isCurrentlyCollapsed);
            
            // Rotate chevron
            const chevron = header.querySelector('.toggle-icon');
            chevron.style.transform = isCurrentlyCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
        });
        
        // Add keyboard handler for accessibility
        header.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
        
        return container;
    },

    render() {
        this.personsGrid.innerHTML = '';
        // Sort people by score in descending order
        const sortedPeople = [...WagerState.picks].sort((a, b) => {
            const scoreA = WagerState.calculateTotalScore(a);
            const scoreB = WagerState.calculateTotalScore(b);
            return scoreB - scoreA;
        });
        
        sortedPeople.forEach(person => {
            const personContainer = this.createPersonContainer(person);
            this.personsGrid.appendChild(personContainer);
        });
    }
};