const WagerUI = {
    initialize() {
        this.container = document.querySelector('.container');
        this.collapseStates = this.loadCollapseStates();
        this.setupUI();
        this.attachEventListeners();
        this.render();
    },

    loadCollapseStates() {
        const stored = localStorage.getItem('personCollapseStates');
        return stored ? JSON.parse(stored) : {};
    },

    saveCollapseStates() {
        localStorage.setItem('personCollapseStates', JSON.stringify(this.collapseStates));
    },

    setupUI() {
        this.container.innerHTML = `
            <header class="header">
                <h1>HoustonKemp antitrusties 2025</h1>
                <p class="header-description">Track our predictions and points for competition economics in 2025</p>
            </header>
            <div class="rules-section">
                <button class="rules-toggle btn">Show rules</button>
                <div class="rules-content hidden">
                    <p>Players had ten points to wager on what they thought will happen in the field of competition economics in Australia (any beyond) in 2025 (these are called their 'picks').</p>
                    <p>They could wager up to three points per prediction from a predetermined list.</p>
                    <p>When we score the results at the end of 2025, they will receive points equal to their wager for correct picks, ie, predictions that come true in 2025. No points are lost for incorrect picks.</p>
                    <p>However, players could designate one of their picks to be 'Risky'. A correct 'Risky' pick scores double if correct, but loses the wagered points if incorrect.</p>
                </div>
            </div>
            <section class="section" id="assigned-section">
                <div class="section-header">
                    <h2>Scores</h2>
                </div>
                <div class="persons-grid">
                    <!-- Person containers will be added here dynamically -->
                </div>
            </section>
            <section class="section" id="unpicked-section">
                <div class="section-header">
                    <h2>Unpicked predictions</h2>
                </div>
                <div class="unpicked-predictions">
                    <!-- Unpicked predictions will be added here dynamically -->
                </div>
            </section>
        `;

        this.personsGrid = document.querySelector('.persons-grid');
        this.unpickedGrid = document.querySelector('.unpicked-predictions');
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
        const isCollapsed = this.collapseStates[person.name] || false;
        
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
                    const statusText = prediction?.status === 'correct' ? 'Correct prediction' :
                    prediction?.status === 'incorrect' ? 'Incorrect prediction' :
                    'Pending prediction';
                    return `
                        <div class="prediction-card">
                            <div class="status-indicator" title="${statusText}">
                                ${this.getStatusIcon(prediction?.status || 'pending')}
                            </div>
                            <div class="prediction-content">
                                <p class="prediction-text">${prediction?.text || 'Loading...'}</p>
                                ${prediction?.notes ? `<p class="prediction-notes">${prediction.notes}</p>` : ''}
                                <div class="prediction-badges">
                                    ${pick.risky ? '<span class="risky-badge" title="Prediction is Risky - worth double or negative"><i class="fas fa-bolt"></i> Risky</span>' : ''}
                                    <span class="points-badge">${pick.points} pts</span>
                                </div>
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
        
        header.addEventListener('click', () => {
            const isCurrentlyCollapsed = predictionsDiv.classList.contains('collapsed');
            predictionsDiv.classList.toggle('collapsed');
            container.classList.toggle('collapsed');
            
            this.collapseStates[person.name] = !isCurrentlyCollapsed;
            this.saveCollapseStates();
            
            const chevron = header.querySelector('.toggle-icon');
            chevron.style.transform = isCurrentlyCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
        });
        
        header.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
        
        return container;
    },

    createUnpickedPredictionCard(prediction) {
        const card = document.createElement('div');
        card.className = 'prediction-card';
        card.innerHTML = `
            <div class="status-indicator" title="Pending prediction">
                ${this.getStatusIcon('pending')}
            </div>
            <div class="prediction-content">
                <p class="prediction-text">${prediction.text || 'Loading...'}</p>
                ${prediction.notes ? `<p class="prediction-notes">${prediction.notes}</p>` : ''}
            </div>
        `;
        return card;
    },

    render() {
        this.personsGrid.innerHTML = '';
        const sortedPeople = [...WagerState.picks].sort((a, b) => {
            const scoreA = WagerState.calculateTotalScore(a);
            const scoreB = WagerState.calculateTotalScore(b);
            return scoreB - scoreA;
        });
        
        sortedPeople.forEach(person => {
            const personContainer = this.createPersonContainer(person);
            this.personsGrid.appendChild(personContainer);
        });

        this.unpickedGrid.innerHTML = '';
        WagerState.unpickedPredictions.forEach(prediction => {
            const fullPrediction = WagerState.getPredictionById(prediction.id);
            if (fullPrediction) {
                const card = this.createUnpickedPredictionCard(fullPrediction);
                this.unpickedGrid.appendChild(card);
                }
        });
    },

    attachEventListeners() {

        document.querySelector('.rules-toggle').addEventListener('click', (e) => {
            const content = document.querySelector('.rules-content');
            content.classList.toggle('hidden');
            e.target.textContent = content.classList.contains('hidden') ? 'Show rules' : 'Hide rules';
        });

    }
};