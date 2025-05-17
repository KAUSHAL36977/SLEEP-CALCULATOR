class NapCalculator {
    constructor() {
        this.bindEvents();
        this.initializeWatch();
        this.initializeEnergySlider();
        this.lastSleepHours = 8; // Default value
        this.energyLevel = 5; // Default value
    }

    bindEvents() {
        const calcNapBtn = document.getElementById('calc-nap');
        if (calcNapBtn) {
            calcNapBtn.addEventListener('click', () => this.calculateNap());
        }

        // Add event listeners for sleep duration and energy level changes
        const lastSleepSelect = document.getElementById('last-sleep');
        if (lastSleepSelect) {
            lastSleepSelect.addEventListener('change', (e) => {
                this.lastSleepHours = parseFloat(e.target.value);
                this.updateRecommendations();
            });
        }

        const energySlider = document.getElementById('energy-level');
        if (energySlider) {
            energySlider.addEventListener('input', (e) => {
                this.energyLevel = parseInt(e.target.value);
                this.updateEnergyDisplay();
            });
        }
    }

    initializeWatch() {
        this.updateWatch();
        setInterval(() => this.updateWatch(), 1000);
    }

    initializeEnergySlider() {
        const energySlider = document.getElementById('energy-level');
        if (energySlider) {
            this.updateEnergyDisplay();
        }
    }

    updateEnergyDisplay() {
        const energySlider = document.getElementById('energy-level');
        const energyValue = document.createElement('div');
        energyValue.className = 'energy-value';
        energyValue.textContent = this.energyLevel;

        // Remove existing energy value display if any
        const existingValue = document.querySelector('.energy-value');
        if (existingValue) {
            existingValue.remove();
        }

        // Add new energy value display
        if (energySlider) {
            energySlider.parentNode.appendChild(energyValue);
        }
    }

    updateWatch() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        
        const watchDisplay = document.querySelector('.watch-display');
        if (watchDisplay) {
            watchDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${period}`;
            watchDisplay.style.textShadow = `0 0 10px ${this.getTimeBasedColor(now.getHours())}`;
        }
    }

    getTimeBasedColor(hours) {
        const hour = parseInt(hours);
        if (hour >= 5 && hour < 12) {
            return 'rgba(255, 200, 0, 0.3)'; // Morning - warm yellow
        } else if (hour >= 12 && hour < 17) {
            return 'rgba(0, 150, 255, 0.3)'; // Afternoon - bright blue
        } else if (hour >= 17 && hour < 21) {
            return 'rgba(255, 100, 0, 0.3)'; // Evening - orange
        } else {
            return 'rgba(138, 43, 226, 0.3)'; // Night - purple
        }
    }

    calculateNap() {
        // Get user input
        const napTime = document.getElementById('nap-time').value;
        const lastSleep = parseInt(document.getElementById('last-sleep').value, 10);
        const energyLevel = parseInt(document.getElementById('energy-level').value, 10);

        // Determine nap type
        let napType = '';
        let duration = 0;
        let reason = '';
        if (energyLevel >= 6 && lastSleep >= 7) {
            napType = 'Power Nap';
            duration = 20;
            reason = 'You are well-rested or moderately energized. A short power nap will boost alertness.';
        } else if (energyLevel <= 4 || lastSleep < 6) {
            napType = 'Full Cycle Nap';
            duration = 90;
            reason = 'You are sleep deprived or low on energy. A full sleep cycle nap is recommended.';
        } else {
            napType = 'Recovery Nap';
            duration = 45;
            reason = 'A moderate nap will help you recover without grogginess.';
        }

        // Calculate nap end time
        const [napHour, napMinute] = napTime.split(':').map(Number);
        const napStart = new Date();
        napStart.setHours(napHour, napMinute, 0, 0);
        const napEnd = new Date(napStart.getTime() + duration * 60000);
        
        // Format times in 12-hour format
        const formatTime = (date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
        };

        const startTime = formatTime(napStart);
        const endTime = formatTime(napEnd);

        // Display recommendation
        const container = document.getElementById('nap-recommendations');
        container.innerHTML = `
            <div class="nap-recommendation">
                <h4>Recommended Nap: <span>${napType}</span> (${duration} min)</h4>
                <p>${reason}</p>
                <div class="nap-times">
                    <p><i class="fas fa-clock"></i> Start: <strong>${startTime}</strong></p>
                    <p><i class="fas fa-clock"></i> End: <strong>${endTime}</strong></p>
                </div>
            </div>
        `;
        container.classList.add('active');
    }

    getNapRecommendations(napTime) {
        const recommendations = [];
        const currentTime = new Date();
        const [hours, minutes] = napTime.split(':').map(Number);
        const napDateTime = new Date(currentTime);
        napDateTime.setHours(hours, minutes, 0, 0);

        // If nap time is earlier than current time, assume it's for tomorrow
        if (napDateTime < currentTime) {
            napDateTime.setDate(napDateTime.getDate() + 1);
        }

        // Calculate time until nap
        const timeUntilNap = (napDateTime - currentTime) / (1000 * 60); // in minutes
        const circadianPhase = this.calculateCircadianPhase(hours);
        const sleepPressure = this.calculateSleepPressure(this.lastSleepHours, this.energyLevel);

        // Power nap (20-30 minutes)
        if (this.energyLevel >= 7 || this.lastSleepHours >= 7) {
            recommendations.push({
                type: 'power-nap',
                duration: 20,
                description: 'Quick energy boost without entering deep sleep',
                benefits: ['Improved alertness', 'Enhanced mood', 'Reduced fatigue'],
                timing: this.getOptimalTiming(circadianPhase, 'power'),
                effectiveness: this.calculateEffectiveness('power', sleepPressure, circadianPhase),
                tips: this.getNapTips('power', timeUntilNap)
            });
        }

        // Recovery nap (30-60 minutes)
        if (this.energyLevel <= 6 || this.lastSleepHours < 7) {
            recommendations.push({
                type: 'recovery-nap',
                duration: 45,
                description: 'Complete one sleep cycle for better recovery',
                benefits: ['Improved memory', 'Better physical recovery', 'Enhanced creativity'],
                timing: this.getOptimalTiming(circadianPhase, 'recovery'),
                effectiveness: this.calculateEffectiveness('recovery', sleepPressure, circadianPhase),
                tips: this.getNapTips('recovery', timeUntilNap)
            });
        }

        // Emergency nap (90 minutes)
        if (this.energyLevel <= 4 || this.lastSleepHours < 6) {
            recommendations.push({
                type: 'emergency-nap',
                duration: 90,
                description: 'Complete sleep cycle for significant recovery',
                benefits: ['Full sleep cycle completion', 'Maximum recovery', 'Improved cognitive function'],
                timing: this.getOptimalTiming(circadianPhase, 'emergency'),
                effectiveness: this.calculateEffectiveness('emergency', sleepPressure, circadianPhase),
                tips: this.getNapTips('emergency', timeUntilNap)
            });
        }

        // Sort recommendations by effectiveness
        recommendations.sort((a, b) => b.effectiveness - a.effectiveness);

        return recommendations;
    }

    calculateCircadianPhase(hour) {
        // Simplified circadian rhythm calculation
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    calculateSleepPressure(lastSleep, energyLevel) {
        // Calculate sleep pressure based on last sleep and current energy
        const sleepDeficit = Math.max(0, 8 - lastSleep);
        const energyDeficit = 10 - energyLevel;
        return (sleepDeficit * 0.6) + (energyDeficit * 0.4);
    }

    calculateEffectiveness(napType, sleepPressure, circadianPhase) {
        let baseEffectiveness = 0;
        
        // Base effectiveness by nap type
        switch (napType) {
            case 'power':
                baseEffectiveness = 0.7;
                break;
            case 'recovery':
                baseEffectiveness = 0.8;
                break;
            case 'emergency':
                baseEffectiveness = 0.9;
                break;
        }

        // Adjust for circadian phase
        const phaseMultiplier = {
            morning: 0.9,
            afternoon: 1.0,
            evening: 0.8,
            night: 0.6
        }[circadianPhase];

        // Adjust for sleep pressure
        const pressureMultiplier = Math.min(1.2, 0.8 + (sleepPressure * 0.4));

        return Math.min(1, baseEffectiveness * phaseMultiplier * pressureMultiplier);
    }

    getOptimalTiming(circadianPhase, napType) {
        const timing = {
            power: {
                morning: 'Early morning (6-9 AM)',
                afternoon: 'Early afternoon (1-3 PM)',
                evening: 'Early evening (5-7 PM)',
                night: 'Not recommended'
            },
            recovery: {
                morning: 'Late morning (9-11 AM)',
                afternoon: 'Mid-afternoon (2-4 PM)',
                evening: 'Early evening (5-7 PM)',
                night: 'Not recommended'
            },
            emergency: {
                morning: 'Late morning (10 AM-12 PM)',
                afternoon: 'Late afternoon (3-5 PM)',
                evening: 'Early evening (6-8 PM)',
                night: 'Only if necessary'
            }
        };

        return timing[napType][circadianPhase];
    }

    getNapTips(napType, timeUntilNap) {
        const tips = [];

        // General tips
        tips.push('Find a quiet, dark environment');
        tips.push('Set an alarm to avoid oversleeping');

        // Timing-specific tips
        if (timeUntilNap < 30) {
            tips.push('Consider taking your nap soon to maximize effectiveness');
        } else if (timeUntilNap > 180) {
            tips.push('Stay active until your nap time to build sleep pressure');
        }

        // Nap type specific tips
        if (napType === 'power') {
            tips.push('Keep the nap short to avoid sleep inertia');
            tips.push('Best for quick energy boost');
        } else if (napType === 'recovery') {
            tips.push('Allow time to complete a full sleep cycle');
            tips.push('Good for memory consolidation');
        } else if (napType === 'emergency') {
            tips.push('Ensure you have enough time for deep sleep');
            tips.push('Best for significant sleep debt recovery');
        }

        return tips;
    }

    updateRecommendations() {
        const napTime = document.getElementById('nap-time').value;
        if (napTime) {
            const recommendations = this.getNapRecommendations(napTime);
            this.displayRecommendations(recommendations);
        }
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('nap-recommendations');
        if (!container) return;

        container.innerHTML = '';
        recommendations.forEach(rec => {
            const effectiveness = Math.round(rec.effectiveness * 100);
            const card = document.createElement('div');
            card.className = `nap-card ${rec.type}`;
            
            const icon = {
                'power-nap': 'fa-bolt',
                'recovery-nap': 'fa-heart',
                'emergency-nap': 'fa-exclamation-triangle'
            }[rec.type];

            card.innerHTML = `
                <div class="nap-card-header">
                    <i class="fas ${icon}"></i>
                    <h3>${rec.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
                    <span class="duration">${rec.duration} minutes</span>
                    <span class="effectiveness" style="background: ${this.getEffectivenessColor(effectiveness)}">
                        ${effectiveness}% Effective
                    </span>
                </div>
                <div class="nap-card-body">
                    <p class="description">${rec.description}</p>
                    <div class="benefits">
                        <h4>Benefits:</h4>
                        <ul>
                            ${rec.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="timing">
                        <h4>Optimal Timing:</h4>
                        <p>${rec.timing}</p>
                    </div>
                    <div class="tips">
                        <h4>Tips:</h4>
                        <ul>
                            ${rec.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.classList.add('active');
    }

    getEffectivenessColor(effectiveness) {
        if (effectiveness >= 80) return 'linear-gradient(135deg, #00b09b, #96c93d)';
        if (effectiveness >= 60) return 'linear-gradient(135deg, #4cc9f0, #4361ee)';
        return 'linear-gradient(135deg, #f72585, #b5179e)';
    }

    animateResults() {
        const cards = document.querySelectorAll('.nap-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.2}s forwards`;
            card.style.opacity = '0';
        });
    }
}

// Initialize the nap calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.napCalculator = new NapCalculator();
}); 