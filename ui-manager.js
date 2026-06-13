// UI Manager - Handles all UI updates and screen management
class UIManager {
    constructor() {
        this.leaderboards = {
            classic: [],
            timeAttack: [],
            goalMode: []
        };
        this.currentLeaderboardMode = 'classic';
        this.resultImageSrc = 'assets/game-over.png';
        this.loadLeaderboards();
        this.initializeCultivationPath();
        this.initializeCartoonUIToggle();
    }

    initializeCartoonUIToggle() {
        // Setup panel toggle buttons if they exist in the DOM
        document.querySelectorAll('[data-open]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelId = btn.getAttribute('data-open');
                this.togglePanel(panelId);
            });
        });

        // Setup panel close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelId = btn.getAttribute('data-close');
                this.closePanel(panelId);
            });
        });
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        // Close all other panels first
        document.querySelectorAll('[id^="panel-"]').forEach(p => {
            if (p.id !== panelId) {
                p.style.display = 'none';
            }
        });

        // Toggle the target panel
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'none';
        }
    }

    initializeCultivationPath() {
        // Initialize vertical path for goal selection screen
        this.initializeVerticalCultivationPath();
    }

    initializeVerticalCultivationPath() {
        // Generate vertical cultivation realm path from bottom to top
        const svg = document.getElementById('cultivationPathVertical');
        const pathElement = document.getElementById('cultivationRibbon');
        const container = document.getElementById('goalNodesVertical');
        
        if (!svg || !pathElement || !container) return;

        // Create vertical ribbon-like path from bottom to top
        // The path flows upward with curves creating a road-like appearance
        const centerX = 100;
        const startY = 1350;  // Bottom
        const endY = 50;      // Top
        const curveWidth = 40; // Width of the ribbon curves
        const numLevels = 12;  // Number of levels
        
        // Generate smooth vertical path with zig-zag pattern
        let path = `M ${centerX} ${startY}`;
        
        // Add vertical path with wavy curves creating a snake-like road
        for (let i = 1; i <= numLevels; i++) {
            const y = startY - ((startY - endY) * (i / numLevels));
            const x = i % 2 === 0 ? centerX + curveWidth : centerX - curveWidth;
            
            if (i === 1) {
                path += ` Q ${x} ${startY - (startY - endY) * 0.08} ${centerX} ${y}`;
            } else {
                const prevY = startY - ((startY - endY) * ((i - 1) / numLevels));
                path += ` Q ${x} ${(prevY + y) / 2} ${centerX} ${y}`;
            }
        }
        
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('stroke-width', '20');
        pathElement.setAttribute('stroke-linejoin', 'round');
        
        // Store node positions for cultivation realms (vertical layout)
        this.nodePositionsVertical = [
            { x: 100, y: 1320, level: 1 },
            { x: 140, y: 1170, level: 2 },
            { x: 60, y: 1020, level: 3 },
            { x: 140, y: 870, level: 4 },
            { x: 60, y: 720, level: 5 },
            { x: 140, y: 570, level: 6 },
            { x: 60, y: 420, level: 7 },
            { x: 140, y: 270, level: 8 },
            { x: 100, y: 150, level: 9 },
            { x: 140, y: 100, level: 10 },
            { x: 60, y: 75, level: 11 },
            { x: 100, y: 50, level: 12 }
        ];
        
        // Render nodes at path positions
        this.renderVerticalGoalNodes();
    }

    renderVerticalGoalNodes() {
        const container = document.getElementById('goalNodesVertical');
        const svg = document.getElementById('cultivationPathVertical');
        
        if (!container || !svg) return;
        
        container.innerHTML = '';
        
        if (!this.nodePositionsVertical) return;
        
        this.nodePositionsVertical.forEach(pos => {
            const node = document.createElement('div');
            node.className = 'goal-node';
            node.setAttribute('data-goal', pos.level);
            node.textContent = pos.level;
            
            // Convert SVG coordinates to percentage-based positioning
            // SVG viewBox is 0 0 200 1400 (vertical layout)
            const xPercent = (pos.x / 200) * 100;
            const yPercent = (pos.y / 1400) * 100;
            
            node.style.left = xPercent + '%';
            node.style.top = yPercent + '%';
            node.style.transform = 'translate(-50%, -50%)';
            node.style.cursor = 'pointer';
            
            // Make node clickable to start level
            node.addEventListener('click', () => {
                if (window.game && window.game.startGoalMode) {
                    window.game.startGoalMode(pos.level);
                }
            });
            
            container.appendChild(node);
        });
    }
    
    showModes() {
        document.getElementById('modeScreen').style.display = 'flex';
        document.getElementById('goalSelectScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'none';
    }
    
    showGame() {
        document.getElementById('modeScreen').style.display = 'none';
        document.getElementById('goalSelectScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('leaderboardScreen').style.display = 'none';
    }
    
    showLeaderboard(mode) {
        this.currentLeaderboardMode = mode || 'classic';
        document.getElementById('modeScreen').style.display = 'none';
        document.getElementById('goalSelectScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'flex';
        this.updateLeaderboardDisplay();
        this.setActiveLeaderboardTab(mode);
    }

    showGoalSelection(show) {
        const goalSelect = document.getElementById('goalSelectScreen');
        if (!goalSelect) return;

        if (show) {
            document.getElementById('modeScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('leaderboardScreen').style.display = 'none';
            document.getElementById('resultScreen').style.display = 'none';
            goalSelect.style.display = 'flex';
        } else {
            goalSelect.style.display = 'none';
        }
    }
    
    switchLeaderboardMode(mode) {
        this.currentLeaderboardMode = mode;
        this.setActiveLeaderboardTab(mode);
        this.updateLeaderboardDisplay();
    }
    
    setActiveLeaderboardTab(mode) {
        document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
        const tabs = document.querySelectorAll('.mode-tab');
        const modeIndex = { 'classic': 0, 'timeAttack': 1, 'goalMode': 2 }[mode];
        if (tabs[modeIndex]) {
            tabs[modeIndex].classList.add('active');
        }
    }
    
    updateScore(score) {
        document.getElementById('score').textContent = score;
    }
    
    updateMoves(moves) {
        document.getElementById('moves').textContent = moves;
    }
    
    updateBest(best) {
        document.getElementById('best').textContent = best;
    }
    
    updateGoalDisplay(cleared, target, level) {
        const progress = Math.min((cleared / target) * 100, 100);
        document.getElementById('goalBar').style.width = progress + '%';
        const levelLabel = document.getElementById('goalLevelLabel');
        if (levelLabel) {
            levelLabel.textContent = `Goal Level ${level}`;
        }
        document.getElementById('goalText').textContent = `Clear ${target} Candies — ${cleared}/${target}`;

        const goalMap = document.getElementById('goalMap');
        if (goalMap) {
            Array.from(goalMap.querySelectorAll('.goal-node')).forEach(node => {
                const nodeGoal = parseInt(node.getAttribute('data-goal'), 10);
                if (nodeGoal <= level) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
                if (nodeGoal === level) {
                    node.classList.add('current');
                } else {
                    node.classList.remove('current');
                }
            });
        }

        const goalMapLabel = document.getElementById('goalMapLabel');
        if (goalMapLabel) {
            goalMapLabel.textContent = `Goal progression map — Level ${level}`;
        }
    }
    
    showGoalDisplay(show) {
        const goalDisplay = document.getElementById('goalDisplay');
        if (!goalDisplay) return;
        goalDisplay.style.display = show ? 'block' : 'none';

        if (!show) {
            const goalMap = document.getElementById('goalMap');
            if (goalMap) {
                Array.from(goalMap.querySelectorAll('.goal-node')).forEach(node => {
                    node.classList.remove('active', 'current');
                });
            }
        }
    }
    
    setMovesLabel(label) {
        document.getElementById('movesLabel').textContent = label;
    }
    
    showScorePopup(points, rect) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = rect.left + rect.width / 2 - 15 + 'px';
        popup.style.top = rect.top + 'px';
        
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 800);
    }

    showLevelUpToast(level, target) {
        const toast = document.createElement('div');
        toast.className = 'level-toast';
        toast.textContent = `Level ${level} unlocked! Clear ${target} candies to advance.`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1400);
    }
    
    setResultImage(src) {
        if (src) {
            this.resultImageSrc = src;
        }
    }

    showResultPopup(title, message, score, best) {
        const resultImage = document.getElementById('resultImage');
        if (resultImage) {
            resultImage.src = this.resultImageSrc;
        }
        document.getElementById('resultTitle').textContent = title;
        document.getElementById('resultMessage').textContent = message;
        document.getElementById('resultScore').textContent = score;
        document.getElementById('resultBest').textContent = best;
        document.getElementById('resultScreen').style.display = 'flex';
    }
    
    hideResultPopup() {
        document.getElementById('resultScreen').style.display = 'none';
    }
    
    toggleSettings() {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.style.display = settingsModal.style.display === 'none' ? 'flex' : 'none';
    }
    
    setViewMode(mode) {
        const viewport = document.querySelector('meta[name="viewport"]');
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        
        toggleBtns.forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'mobile') {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
            document.querySelector('.toggle-btn:nth-child(1)').classList.add('active');
            localStorage.setItem('cy-fur-view-mode', 'mobile');
        } else if (mode === 'desktop') {
            viewport.setAttribute('content', 'width=1200, initial-scale=1.0, user-scalable=no');
            document.querySelector('.toggle-btn:nth-child(2)').classList.add('active');
            localStorage.setItem('cy-fur-view-mode', 'desktop');
        }
    }
    
    loadLeaderboards() {
        const stored = localStorage.getItem('cy-fur-leaderboards');
        if (stored) {
            this.leaderboards = JSON.parse(stored);
        }
    }
    
    saveLeaderboards() {
        localStorage.setItem('cy-fur-leaderboards', JSON.stringify(this.leaderboards));
    }
    
    addScoreToLeaderboard(mode, score) {
        if (!this.leaderboards[mode]) {
            this.leaderboards[mode] = [];
        }
        const playerName = localStorage.getItem('cyFurPlayerName') || 'Player';

        this.leaderboards[mode].push({
            name: playerName,
            score: score,
            date: new Date().toLocaleDateString()
        });
        
        this.leaderboards[mode].sort((a, b) => b.score - a.score);
        this.leaderboards[mode] = this.leaderboards[mode].slice(0, 10);
        
        this.saveLeaderboards();
    }
    
    updateLeaderboardDisplay() {
        const leaderboard = this.leaderboards[this.currentLeaderboardMode] || [];
        const chain = document.getElementById('leaderboardChain');
        chain.innerHTML = '';

        if (leaderboard.length === 0) {
            const emptyNode = document.createElement('div');
            emptyNode.className = 'leaderboard-node center';
            emptyNode.innerHTML = `
                <div class="leader-node-badge">?</div>
                <div class="leader-node-content">
                    <div class="leader-node-title">No scores yet</div>
                    <div class="leader-node-meta">Play to unlock the leaderboard chain</div>
                </div>
            `;
            chain.appendChild(emptyNode);
            return;
        }

        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const node = document.createElement('div');
            node.className = `leaderboard-node ${rank % 2 === 0 ? 'right' : 'left'}`;
            node.innerHTML = `
                <div class="leader-node-badge ${rank <= 3 ? 'top-rank' : ''}">${rank}</div>
                <div class="leader-node-content">
                    <div class="leader-node-title"><strong>${entry.name || 'Player'}</strong> — ${entry.score}</div>
                    <div class="leader-node-meta">${entry.date}</div>
                </div>
            `;
            chain.appendChild(node);
        });
    }
    
    loadBestScore() {
        return parseInt(localStorage.getItem('candyCrushBest') || 0);
    }
    
    saveBestScore(score) {
        const current = this.loadBestScore();
        if (score > current) {
            localStorage.setItem('candyCrushBest', score);
            return true;
        }
        return false;
    }
}
