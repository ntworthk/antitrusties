const WagerState = {
    picks: [],
    predictions: [],
    unpickedPredictions: [],

    async initialize() {
        await Promise.all([
            this.loadPicks(),
            this.loadPredictions(),
            this.loadUnpickedPredictions()
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
            const response = await fetch('https://cardioid.co.nz/api/predictions');
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

    async loadUnpickedPredictions() {
        try {
            const response = await fetch('https://cardioid.co.nz/api/unpicked');
            if (!response.ok) throw new Error('Failed to fetch unpicked predictions');
            
            const data = await response.json();
            this.unpickedPredictions = data.picks || [];
            return true;
        } catch (error) {
            console.error('Error loading unpicked predictions:', error);
            this.unpickedPredictions = [];
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

    calculateScore(prediction, pick) {
        if (!prediction) return 0;
        
        if (pick.risky) {
            if (prediction.status === 'correct') {
                return pick.points * 2;
            } else if (prediction.status === 'incorrect') {
                return -pick.points;
            }
        } else {
            if (prediction.status === 'correct') {
                return pick.points;
            }
        }
        return 0;
    },

    calculateTotalScore(personPicks) {
        return personPicks.picks.reduce((total, pick) => {
            const prediction = this.getPredictionById(pick.id);
            return total + this.calculateScore(prediction, pick);
        }, 0);
    }
};