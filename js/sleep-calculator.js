class SleepCalculator {
    constructor() {
        this.initializeTheme();
        this.bindEvents();
        this.initializeCalculator();
    }

    initializeTheme() {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const themeToggle = document.getElementById('theme-toggle');
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            this.updateTheme(true);
            localStorage.setItem('theme', 'dark');
        } else {
            this.updateTheme(false);
            localStorage.setItem('theme', 'light');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = !document.body.classList.contains('dark-mode');
                this.updateTheme(isDark);
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }
    }

    updateTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.querySelector('#theme-toggle i').className = 'fas fa-sun';
            document.getElementById('theme-toggle').setAttribute('data-tooltip', 'Switch to Light Mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('#theme-toggle i').className = 'fas fa-moon';
            document.getElementById('theme-toggle').setAttribute('data-tooltip', 'Switch to Dark Mode');
        }
    }

    bindEvents() {
        // Tab switching
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab, .tab-content').forEach(el => {
                    el.classList.remove('active');
                });
                tab.classList.add('active');
                const targetTab = tab.getAttribute('data-tab');
                document.getElementById(`${targetTab}-calc`).classList.add('active');
            });
        });

        // Calculator buttons
        const calcBedtimeBtn = document.getElementById('calc-bedtime');
        if (calcBedtimeBtn) {
            calcBedtimeBtn.addEventListener('click', () => {
                this.calculateBedtime();
                setActiveCalculatorButton('calc-bedtime', 'bedtime-results');
            });
        }

        const calcWakeupBtn = document.getElementById('calc-wakeup');
        if (calcWakeupBtn) {
            calcWakeupBtn.addEventListener('click', () => {
                this.calculateWakeup();
                setActiveCalculatorButton('calc-wakeup', 'wakeup-results');
            });
        }

        const calcSleepNowBtn = document.getElementById('calc-sleep-now');
        if (calcSleepNowBtn) {
            calcSleepNowBtn.addEventListener('click', () => {
                this.calculateSleepNow();
                setActiveCalculatorButton('calc-sleep-now', 'sleep-now-results');
            });
        }

        // Age sleep recommendation
        const calcAgeSleepBtn = document.getElementById('calc-age-sleep');
        if (calcAgeSleepBtn) {
            calcAgeSleepBtn.addEventListener('click', () => {
                this.calculateAgeSleep();
                setActiveCalculatorButton('calc-age-sleep', 'age-sleep-results');
            });
        }

        // Sleep quality analysis
        const analyzeSleepQualityBtn = document.getElementById('analyze-sleep-quality');
        if (analyzeSleepQualityBtn) {
            analyzeSleepQualityBtn.addEventListener('click', () => {
                this.analyzeSleepQuality();
                setActiveCalculatorButton('analyze-sleep-quality', 'sleep-quality-results');
            });
        }

        // Sleep cycles analysis
        const analyzeSleepCyclesBtn = document.getElementById('analyze-sleep-cycles');
        if (analyzeSleepCyclesBtn) {
            analyzeSleepCyclesBtn.addEventListener('click', () => {
                this.analyzeSleepCycles();
                setActiveCalculatorButton('analyze-sleep-cycles', 'sleep-cycles-results');
            });
        }

        // Sleep tracking analysis
        const analyzeSleepTrackingBtn = document.getElementById('analyze-sleep-tracking');
        if (analyzeSleepTrackingBtn) {
            analyzeSleepTrackingBtn.addEventListener('click', () => {
                this.analyzeSleepTracking();
                setActiveCalculatorButton('analyze-sleep-tracking', 'sleep-tracking-results');
            });
        }

        // Smart alarm type buttons
        document.querySelectorAll('.alarm-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.alarm-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Sleep debt
        const calcSleepDebtBtn = document.getElementById('calculate-sleep-debt');
        if (calcSleepDebtBtn) {
            calcSleepDebtBtn.addEventListener('click', () => {
                this.calculateSleepDebt();
                setActiveCalculatorButton('calculate-sleep-debt', 'sleep-debt-results');
            });
        }

        // Sleep schedule
        const optimizeScheduleBtn = document.getElementById('optimize-schedule');
        if (optimizeScheduleBtn) {
            optimizeScheduleBtn.addEventListener('click', () => {
                this.optimizeSchedule();
                setActiveCalculatorButton('optimize-schedule', 'schedule-results');
            });
        }
    }

    parseTime(hour, minute, ampm) {
        let hours = parseInt(hour);
        // Convert to 24-hour format
        if (ampm === 'PM' && hours !== 12) {
            hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }
        return hours * 60 + parseInt(minute);
    }

    formatTime(minutes) {
        if (minutes < 0) minutes += 1440;
        minutes = minutes % 1440;
        const hrs = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        const period = hrs >= 12 ? 'PM' : 'AM';
        const displayHrs = hrs % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    calculateCycles(baseTime, fallAsleep, isBedtimeCalc) {
        const cycleDuration = 90;
        const totalFallAsleep = parseInt(fallAsleep);
        const results = [];
        
        for (let cycles = 6; cycles >= 4; cycles--) {
            const totalMinutes = (cycles * cycleDuration) + totalFallAsleep;
            const targetTime = isBedtimeCalc ? 
                baseTime - totalMinutes : 
                baseTime + totalMinutes;
            results.push({
                time: this.formatTime(targetTime),
                cycles: cycles,
                quality: cycles >= 6 ? 'excellent' : cycles >= 5 ? 'good' : 'fair',
                totalMinutes: cycles * 90
            });
        }
        return results;
    }

    calculateBedtime() {
        const hour = document.getElementById('bedtime-hour').value;
        const minute = document.getElementById('bedtime-minute').value;
        const ampm = document.getElementById('bedtime-ampm').value;
        const fallAsleep = document.getElementById('fall-asleep-time').value;
        const wakeTime = this.parseTime(hour, minute, ampm);
        const results = this.calculateCycles(wakeTime, fallAsleep, true);
        this.displayResults(results, '#bedtime-list');
        document.getElementById('bedtime-results').classList.add('active');
        // this.updateVisualization(results);
    }

    calculateWakeup() {
        const hour = document.getElementById('wakeup-hour').value;
        const minute = document.getElementById('wakeup-minute').value;
        const ampm = document.getElementById('wakeup-ampm').value;
        const fallAsleep = document.getElementById('fall-asleep-time-wake').value;
        const bedTime = this.parseTime(hour, minute, ampm);
        const results = this.calculateCycles(bedTime, fallAsleep, false);
        this.displayResults(results, '#wakeup-list');
        document.getElementById('wakeup-results').classList.add('active');
        // this.updateVisualization(results);
    }

    calculateSleepNow() {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const fallAsleep = document.getElementById('fall-asleep-time-now').value;
        const results = this.calculateCycles(currentMinutes, fallAsleep, false);
        this.displayResults(results, '#sleep-now-list');
        document.getElementById('sleep-now-results').classList.add('active');
        // this.updateVisualization(results);
    }

    displayResults(results, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        container.innerHTML = '';
        results.forEach(res => {
            const qualityClass = `quality-${res.quality}`;
            const qualityIcon = {
                excellent: '<i class="fas fa-star"></i>',
                good: '<i class="fas fa-thumbs-up"></i>',
                fair: '<i class="fas fa-exclamation-triangle"></i>'
            }[res.quality];
            
            const timeCard = document.createElement('div');
            timeCard.className = 'time-card';
            timeCard.innerHTML = `
                <div class="quality-badge ${qualityClass}">${qualityIcon}</div>
                <div class="time-info">
                    <h4>${res.cycles} Cycles (${res.cycles * 1.5} hrs)</h4>
                    <p class="time">${res.time}</p>
                </div>
            `;
            container.appendChild(timeCard);
        });
    }

    initializeCalculator() {
        const defaultEvent = new Event('click');
        const calcBedtimeBtn = document.getElementById('calc-bedtime');
        if (calcBedtimeBtn) calcBedtimeBtn.dispatchEvent(defaultEvent);
    }

    // Sleep by Age
    calculateAgeSleep() {
        const ageGroup = document.getElementById('age-group').value;
        const recommendations = {
            'newborn': '14-17 hours (including naps)',
            'infant': '12-16 hours (including naps)',
            'toddler': '11-14 hours (including naps)',
            'preschool': '10-13 hours (including naps)',
            'school': '9-12 hours',
            'teen': '8-10 hours',
            'young-adult': '7-9 hours',
            'adult': '7-9 hours',
            'senior': '7-8 hours'
        };
        document.getElementById('age-recommendations').innerHTML = `<p>Recommended sleep: <strong>${recommendations[ageGroup]}</strong></p>`;
    }

    // Sleep Quality
    analyzeSleepQuality() {
        const hours = document.getElementById('sleep-hours').value;
        const quality = document.querySelector('.quality-rating .quality-btn.active')?.dataset.rating || '3';
        const wakeUps = document.getElementById('wake-ups').value;
        let msg = `You slept ${hours} hours. Sleep quality: ${quality}/5. Wake-ups: ${wakeUps}.`;
        document.getElementById('quality-analysis').innerHTML = `<p>${msg}</p>`;
    }

    // Sleep Cycles
    analyzeSleepCycles() {
        const duration = document.getElementById('typical-sleep-duration').value;
        const quality = document.querySelector('#sleep-cycles-calc .quality-btn.active')?.dataset.rating || '3';
        const wakeUps = document.getElementById('typical-wake-ups').value;
        const fallAsleep = document.getElementById('fall-asleep-time-cycles').value;
        let msg = `Typical duration: ${duration} hours, Quality: ${quality}/5, Wake-ups: ${wakeUps}, Fall asleep: ${fallAsleep} min.`;
        document.getElementById('cycle-analysis').innerHTML = `<p>${msg}</p>`;
    }

    // Sleep Tracking
    analyzeSleepTracking() {
        // For now, just show a placeholder
        document.getElementById('sleep-analysis').innerHTML = `<p>Sleep tracking analysis coming soon!</p>`;
    }

    // Smart Alarm
    setSmartAlarm() {
        const hour = document.getElementById('alarm-hour').value;
        const minute = document.getElementById('alarm-minute').value;
        const ampm = document.getElementById('alarm-ampm').value;
        const windowMin = parseInt(document.getElementById('wakeup-window').value, 10);
        
        // Convert to 24-hour format for calculations
        const targetWake = this.parseTime(hour, minute, ampm);
        const windowStart = targetWake - windowMin;
        
        // Assume user goes to bed now
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Find all cycle ends within the window
        let alarms = [];
        for (let t = windowStart; t <= targetWake; t += 1) {
            let cycles = Math.round((t - nowMinutes) / 90);
            if (cycles > 0 && Math.abs((nowMinutes + cycles * 90) - t) <= 2) {
                alarms.push(t);
            }
        }
        
        // Format times in 12-hour format
        alarms = alarms.map(m => this.formatTime(m));
        
        // Get selected alarm type
        const alarmType = document.querySelector('.alarm-option.active')?.getAttribute('data-type') || 'sound';
        
        // Display
        const container = document.getElementById('alarm-settings');
        if (alarms.length > 0) {
            container.innerHTML = `
                <p>Recommended alarm times (end of sleep cycle):</p>
                <ul class="alarm-times">
                    ${alarms.map(a => `<li><i class="fas fa-bell"></i> ${a}</li>`).join('')}
                </ul>
                <p>Alarm type: <strong>${alarmType.charAt(0).toUpperCase() + alarmType.slice(1)}</strong></p>
            `;
        } else {
            container.innerHTML = `
                <p>No optimal alarm times found in the selected window. Try a different window or bedtime.</p>
                <p>Alarm type: <strong>${alarmType.charAt(0).toUpperCase() + alarmType.slice(1)}</strong></p>
            `;
        }
    }

    // Sleep Debt
    calculateSleepDebt() {
        // For now, just show a placeholder
        document.getElementById('sleep-debt-analysis').innerHTML = `<p>Sleep debt analysis coming soon!</p>`;
    }

    // Sleep Schedule
    optimizeSchedule() {
        // For now, just show a placeholder
        document.getElementById('schedule-analysis').innerHTML = `<p>Optimized sleep schedule coming soon!</p>`;
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sleepCalculator = new SleepCalculator();
});

function restartAnimeSleepAnimation() {
    const animeContainer = document.querySelector('.anime-sleep-animation');
    const pillow = animeContainer?.querySelector('.pillow');
    const character = animeContainer?.querySelector('.sleeping-character');
    if (!animeContainer || !pillow || !character) return;

    // Remove animation classes
    pillow.style.animation = 'none';
    character.style.animation = 'none';
    // Force reflow
    void pillow.offsetWidth;
    void character.offsetWidth;
    // Re-add animation classes
    pillow.style.animation = '';
    character.style.animation = '';
}

// Attach to all button clicks
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            restartAnimeSleepAnimation();
        });
    });
});

function setActiveCalculatorButton(buttonId, resultId) {
    // Remove .active from all calculator action buttons
    document.querySelectorAll('.calculator-card button').forEach(btn => btn.classList.remove('active'));
    // Add .active to the clicked button
    const btn = document.getElementById(buttonId);
    if (btn) btn.classList.add('active');
    // Hide all result sections
    document.querySelectorAll('.calculator-card .results').forEach(res => res.classList.remove('active'));
    // Show only the relevant result section
    if (resultId) {
        const res = document.getElementById(resultId);
        if (res) res.classList.add('active');
    }
} 