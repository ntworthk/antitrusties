// State management for wager system
const WagerState = {
    picks: [],
    predictions: [],
    owner: 'ntworthk',
    repo: 'antitrusties-data',
    dataPath: 'data/predictions.json',

    async initialize() {
        await Promise.all([
            this.loadPicks(),
            this.loadPredictions()
        ]);
        
        if (this.onDataChange) {
            this.onDataChange();
        }
    },

    async loadPicks() {
        try {
            const response = await fetch('https://cardioid.co.nz/api/latest_picks');
            if (!response.ok) throw new Error('Failed to fetch picks');
            
            const data = await response.json();
            this.picks = this.groupPicksByPerson(data.picks || []);
            return true;
        } catch (error) {
            console.error('Error loading picks:', error);
            this.picks = [];
            return false;
        }
    },

    async loadPredictions() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(
                `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${this.dataPath}?_=${timestamp}`
            );
            if (!response.ok) throw new Error('Failed to fetch predictions');
            
            const data = await response.json();
            this.predictions = data.predictions || [];
            return true;
        } catch (error) {
            console.error('Error loading predictions:', error);
            this.predictions = [];
            return false;
        }
    },

    groupPicksByPerson(picks) {
        const groupedPicks = {};
        
        picks.forEach(pick => {
            if (!groupedPicks[pick.name]) {
                groupedPicks[pick.name] = {
                    name: pick.name,
                    picks: []
                };
            }
            groupedPicks[pick.name].picks.push(pick);
        });

        return Object.values(groupedPicks);
    },

    getPredictionById(id) {
        return this.predictions.find(p => p.id === id);
    },

    calculateScore(prediction, points) {
        if (prediction?.status === 'correct') {
            return points;
        }
        return 0;
    },

    calculateTotalScore(personPicks) {
        return personPicks.picks.reduce((total, pick) => {
            const prediction = this.getPredictionById(pick.id);
            return total + this.calculateScore(prediction, pick.points);
        }, 0);
    }
};