// Main Game Class - Orchestrates all game components
class CandyCrush {
    constructor() {
        this.board = new Board();
        this.rules = new GameRules();
        this.uiManager = new UIManager();
        this.renderer3D = new Candy3DRenderer();
        this.handler = new GameHandler(this);
        this.musicManager = new MusicManager();
        this.notificationManager = new NotificationManager();
        this.specialCandyHandler = new SpecialCandyHandler(this);
        
        this.score = 0;
        this.moves = 20;
        this.maxMoves = 20;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.isProcessingMatches = false;
        this.mode = null;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.processingTimeoutId = null;
        this.goalLevels = [200, 300, 450];
        this.goalLevel = 1;
        this.goalTarget = this.goalLevels[0];
        this.clearancedCandies = 0;
        this.candyElements = {};
        this.lastRenderState = {};
        
        this.loadViewMode();
        this.loadWalletStatus();
        this.closeSettings();
        this.uiManager.showModes();
    }

    loadViewMode() {
        const savedViewMode = localStorage.getItem('cy-fur-view-mode') || 'mobile';
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        
        if (savedViewMode === 'desktop') {
            document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1200, initial-scale=1.0, user-scalable=no');
            if (toggleBtns[1]) toggleBtns[1].classList.add('active');
        } else if (toggleBtns[0]) {
            toggleBtns[0].classList.add('active');
        }
    }
    
    showModes() {
        this.renderer3D.hide();
        if (this.processingTimeoutId) clearInterval(this.processingTimeoutId);
        if (this.timerInterval) clearInterval(this.timerInterval);
        document.getElementById('resultScreen').style.display = 'none';
        this.closeSettings();
        this.uiManager.showGoalDisplay(false);
        this.uiManager.showModes();
        this.uiManager.showGoalSelection(false);
        this.updateBottomNav('home');
    }
    
    updateBottomNav(activeBtn) {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => btn.classList.remove('active'));
        
        if (activeBtn === 'home') {
            navBtns[0].classList.add('active');
        } else if (activeBtn === 'ranking') {
            navBtns[1].classList.add('active');
        } else if (activeBtn === 'settings') {
            navBtns[2].classList.add('active');
        }
    }
    
    closeSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'none';
        }
    }
    
    backToGame() {
        if (this.mode) {
            this.uiManager.showGame();
            this.renderer3D.show();
        }
    }
    
    showLeaderboard(mode) {
        this.renderer3D.hide();
        this.uiManager.showLeaderboard(mode);
        this.updateBottomNav('ranking');
    }
    
    switchLeaderboardMode(mode) {
        this.uiManager.switchLeaderboardMode(mode);
    }
    
    selectMode(mode) {
        if (mode === MODES.GOAL) {
            this.uiManager.showGoalSelection(true);
            return;
        }

        this.mode = mode;
        this.score = 0;
        this.moves = mode === MODES.CLASSIC ? 999999 : (mode === MODES.TIME_ATTACK ? 60 : 999);
        this.maxMoves = this.moves;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.timeLeft = 60;
        this.clearancedCandies = 0;
        
        this.closeSettings();
        this.uiManager.showGame();
        this.renderer3D.show();
        // Show stop button for infinity mode
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) stopBtn.style.display = mode === MODES.CLASSIC ? 'block' : 'none';
        this.updateUI();
        
        this.board.initialize();
        this.render();
        this.render3D();
        
        this.handler.setupTouchEvents();
        
        // Safety timeout
        this.processingTimeoutId = setInterval(() => {
            if (this.isProcessingMatches) {
                this.isProcessingMatches = false;
                this.isAnimating = false;
                this.render();
            }
        }, 2000);
        
        if (mode === MODES.TIME_ATTACK) {
            this.startTimer();
            this.uiManager.showGoalDisplay(false);
            this.uiManager.setMovesLabel('Time');
        } else {
            this.uiManager.showGoalDisplay(false);
            this.uiManager.setMovesLabel('Moves');
        }
    }

    startGoalMode(level) {
        this.mode = MODES.GOAL;
        this.score = 0;
        this.moves = 999;
        this.maxMoves = this.moves;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.timeLeft = 60;
        this.clearancedCandies = 0;
        this.goalLevel = level;
        this.goalTarget = this.goalLevels[level - 1] || this.goalLevels[0];

        this.closeSettings();
        this.uiManager.showGoalSelection(false);
        this.uiManager.showGame();
        this.renderer3D.show();
        this.updateUI();

        this.board.initialize();
        this.render();
        this.render3D();

        this.handler.setupTouchEvents();

        this.uiManager.showGoalDisplay(true);
        this.uiManager.setMovesLabel('Status');
        this.updateGoalDisplay();

        this.processingTimeoutId = setInterval(() => {
            if (this.isProcessingMatches) {
                this.isProcessingMatches = false;
                this.isAnimating = false;
                this.render();
            }
        }, 2000);
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.uiManager.updateMoves(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showGameOver();
            }
        }, 1000);
    }
    
    updateGoalDisplay() {
        this.uiManager.updateGoalDisplay(this.clearancedCandies, this.goalTarget, this.goalLevel);
    }

    advanceGoalLevel() {
        if (this.goalLevel < this.goalLevels.length) {
            this.goalLevel += 1;
            this.goalTarget = this.goalLevels[this.goalLevel - 1];
            this.clearancedCandies = 0;
            this.uiManager.showLevelUpToast(this.goalLevel, this.goalTarget);
            this.board.initialize();
            this.render();
            this.render3D();
            this.updateGoalDisplay();
            return true;
        }
        return false;
    }

    checkGoalProgress() {
        if (this.mode !== MODES.GOAL) return false;
        if (this.clearancedCandies < this.goalTarget) return false;
        return !this.advanceGoalLevel();
    }

    updateUI() {
        this.uiManager.updateScore(this.score);
        if (this.mode === MODES.TIME_ATTACK) {
            this.uiManager.updateMoves(this.timeLeft);
        } else if (this.mode === MODES.GOAL) {
            this.updateGoalDisplay();
        } else {
            this.uiManager.updateMoves(this.moves);
        }
        this.uiManager.updateBest(this.uiManager.loadBestScore());
    }
    
    render3D() {
        Object.keys(this.renderer3D.candyMeshes).forEach(idx => {
            this.renderer3D.removeCandyMesh(idx);
        });
        
        this.board.board.forEach((color, index) => {
            if (color) {
                this.renderer3D.addCandyToBoard(index, color);
            }
        });
    }
    
    render() {
        const gameBoard = document.getElementById('gameBoard');
        
        // Initialize grid only once with all 64 positions
        if (Object.keys(this.candyElements).length === 0) {
            const fragment = document.createDocumentFragment();
            this.candyElements = {};
            
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                const candy = document.createElement('div');
                candy.className = 'candy';
                candy.dataset.index = i;
                candy.onclick = () => this.selectCandy(i);
                fragment.appendChild(candy);
                this.candyElements[i] = candy;
                this.lastRenderState[i] = { color: null, special: null, selected: false };
            }
            
            gameBoard.innerHTML = '';
            gameBoard.appendChild(fragment);
        }
        
        // Force full update on every render - don't skip based on lastState
        this.board.board.forEach((color, index) => {
            const candy = this.candyElements[index];
            if (!candy) return;
            
            const special = this.board.getSpecial(index);
            if (special) {
                console.log(`Rendering special candy at ${index}: ${special} (color: ${color})`);
            }
            
            if (color === null) {
                candy.className = 'candy';
                candy.innerHTML = '';
                candy.style.visibility = 'hidden';
                candy.style.pointerEvents = 'none';
            } else {
                candy.className = 'candy';
                
                // Get the sprite source - use special candy asset if available
                let spriteSrc = '';
                let spriteAlt = color;
                
                if (special) {
                    if (special === 'bomb') {
                        // Bomb uses single image for all colors
                        spriteSrc = SPRITE_IMAGES['bomb'] || '';
                        spriteAlt = 'bomb';
                    } else {
                        // Striped and wrapped have color-specific images
                        const specialKey = `${special}-${color}`;
                        spriteSrc = SPRITE_IMAGES[specialKey] || SPRITE_IMAGES[color] || '';
                        spriteAlt = specialKey;
                    }
                } else {
                    // Regular candy
                    spriteSrc = SPRITE_IMAGES[color] || '';
                }
                
                let candyHTML = spriteSrc
                    ? `<img src="${spriteSrc}" alt="${spriteAlt}" class="candy-sprite" draggable="false">`
                    : EMOJIS[color] || EMOJIS[special] || '';
                
                candy.innerHTML = candyHTML;
                candy.style.visibility = 'visible';
                candy.style.pointerEvents = 'auto';
                if (special) candy.classList.add(special);
            }
            
            this.lastRenderState[index] = { color, special, selected: parseInt(index) === this.selectedCandy };
        });
        
        // Batch selection updates
        Object.keys(this.candyElements).forEach(index => {
            const candy = this.candyElements[index];
            const isSelected = parseInt(index) === this.selectedCandy;
            
            if (isSelected && this.board.getCandy(index) !== null) {
                candy.classList.add('selected');
                this.renderer3D.selectCandy(index);
            } else {
                candy.classList.remove('selected');
            }
        });
        
        this.updateUI();
    }
    
    selectCandy(index) {
        if (this.isProcessingMatches || this.isAnimating) return;
        if ((this.mode === MODES.CLASSIC && this.moves === 0) || (this.mode === MODES.TIME_ATTACK && this.timeLeft <= 0)) return;
        
        if (this.selectedCandy === null) {
            this.selectedCandy = index;
        } else if (this.selectedCandy === index) {
            this.selectedCandy = null;
        } else if (this.isAdjacent(this.selectedCandy, index)) {
            this.swapCandies(this.selectedCandy, index);
            this.selectedCandy = null;
        } else {
            this.selectedCandy = index;
        }
        this.render();
    }
    
    isAdjacent(index1, index2) {
        return this.rules.isValidSwap(index1, index2);
    }
    
    swapCandies(index1, index2, swipeDirection = null) {
        const origBoard1 = this.board.getCandy(index1);
        const origBoard2 = this.board.getCandy(index2);
        const origSpecial1 = this.board.getSpecial(index1);
        const origSpecial2 = this.board.getSpecial(index2);
        
        this.board.swapCandies(index1, index2);
        
        // 3D Animation
        const pos1 = this.renderer3D.indexToGridPosition(index1);
        const pos2 = this.renderer3D.indexToGridPosition(index2);
        
        this.renderer3D.updateCandyPosition(index1, pos2);
        this.renderer3D.updateCandyPosition(index2, pos1);
        
        if (this.mode === MODES.CLASSIC) {
            this.moves--;
        }
        
        // Check for special candy swaps BEFORE regular matches
        const specialCandyClear = [];
        if (origSpecial1 || origSpecial2) {
            const swappedSpecialClear = this.specialCandyHandler.handleSpecialSwap(index1, index2);
            if (swappedSpecialClear.length > 0) {
                specialCandyClear.push(...swappedSpecialClear);
            }
        }
        
        let matches = this.board.findMatches();
        
        // Combine special candy clears with regular matches
        if (specialCandyClear.length > 0) {
            const allClear = new Set([...matches, ...specialCandyClear]);
            matches = Array.from(allClear);
        }
        
        if (matches.length === 0) {
            this.board.setCandy(index1, origBoard1);
            this.board.setCandy(index2, origBoard2);
            this.board.setSpecial(index1, origSpecial1);
            this.board.setSpecial(index2, origSpecial2);
            if (this.mode === MODES.CLASSIC) {
                this.moves++;
            }
            
            this.renderer3D.updateCandyPosition(index1, pos1);
            this.renderer3D.updateCandyPosition(index2, pos2);
            
            this.render();
            return;
        }
        
        this.processMatches(matches, swipeDirection, index2);
    }
    
    processMatches(matches = null, swipeDirection = null, completingIndex = null) {
        this.isProcessingMatches = true;
        let matchesToRemove = matches || this.board.findMatches();
        
        if (!matchesToRemove || matchesToRemove.length === 0) {
            this.isProcessingMatches = false;
            if (this.shouldGameEnd()) {
                this.showGameOver();
            }
            return;
        }
        
        const matchSet = new Set(matchesToRemove);
        matchSet.forEach(index => {
            const candy = this.candyElements[index];
            if (candy) {
                candy.classList.add('match-animation');
            }
        });
        
        setTimeout(() => {
            this.removeCandies(matchesToRemove, swipeDirection, completingIndex);
        }, 100);
    }
    
    removeCandies(matches, swipeDirection = null, completingIndex = null) {
        let baseScore = 0;
        const matchSet = new Set(matches);
        
        // Check for special candy combos in matched candies
        const comboCheck = this.specialCandyHandler.checkForCombo(matches);
        if (comboCheck.shouldCombo) {
            console.log(`Combo detected: ${comboCheck.comboType}`);
            // Play combo sound
            this.musicManager.playComboSound();
            
            // Merge combo clears with regular matches
            const allClear = new Set([...matches, ...comboCheck.indicesToClear]);
            matches = Array.from(allClear);
        }
        
        // Track which candies ALREADY HAD special types (before creating new ones)
        const specialCandiesBeforeCreation = matches.filter(index => this.board.getSpecial(index));
        
        this.rules.createSpecialCandies(this.board, matches, matchSet, swipeDirection, completingIndex);
        
        // Render board to SHOW the special candies before they disappear
        this.render();
        this.render3D();
        
        // Small delay so player sees the special candy animation
        setTimeout(() => {
            // Apply special effects ONLY to candies that already had special types
            // Newly created striped candies will stay on the board
            this.rules.applySpecialEffects(this.board, specialCandiesBeforeCreation);
            
            matches.forEach(index => {
                // Don't remove striped candies - they stay on the board
                const special = this.board.getSpecial(index);
                if (special === 'striped-h' || special === 'striped-v') {
                    // Keep striped candies on the board
                    this.renderer3D.removeCandyMesh(index); // Remove 3D mesh but keep the 2D sprite
                } else {
                    // Remove other matched candies
                    this.board.removeCandy(index);
                    this.renderer3D.removeCandyMesh(index);
                }
                baseScore += 10;
            });
            
            this.score += baseScore;
            this.clearancedCandies += matches.length;
            
            // Play match sound effect
            this.musicManager.playMatchSound();
            
            if (matches.length >= 3) {
                const candyElement = this.candyElements[matches[0]];
                if (candyElement) {
                    const rect = candyElement.getBoundingClientRect();
                    this.uiManager.showScorePopup(baseScore, rect);
                    
                    // Show celebratory notification for 4+ gems
                    if (matches.length >= 4) {
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        this.notificationManager.showMatchNotification(matches.length, {
                            x: centerX,
                            y: centerY
                        });
                        
                        // Play wonderful voice for big combo (5+ matches)
                        if (matches.length >= 5) {
                            this.musicManager.playWonderfulSound();
                        }
                    }
                }
            }
            
            // Render again after effects to show final result
            this.render();
            this.render3D();
            
            // Apply gravity after a short delay
            setTimeout(() => this.applyGravity(), 120);
        }, 300);
    }
    
    applyGravity() {
        this.board.applyGravity();
        this.board.fillEmptySpaces();
        
        // Safety loop: keep filling until no nulls remain
        let attempts = 0;
        let hasNulls = this.board.board.some(cell => cell === null);
        while (hasNulls && attempts < 10) {
            console.log(`Safety fill attempt ${attempts + 1}, nulls found: ${this.board.board.filter(c => c === null).length}`);
            this.board.applyGravity();
            this.board.fillEmptySpaces();
            attempts++;
            hasNulls = this.board.board.some(cell => cell === null);
        }
        
        console.log(`After applyGravity: ${this.board.board.filter(c => c === null).length} nulls remain`);
        this.render();
        this.render3D();
        
        const newMatches = this.board.findMatches();
        if (newMatches.length > 0) {
            console.log(`Found ${newMatches.length} matches, cascading...`);
            this.processCascade(newMatches);
        } else {
            this.isAnimating = false;
            this.isProcessingMatches = false;
            this.updateGoalDisplay();
            if (this.checkGoalProgress()) {
                this.showGameOver();
            } else if (this.shouldGameEnd()) {
                this.showGameOver();
            }
        }
    }
    
    fillEmptySpaces() {
        // Kept for backward compatibility
    }

    processCascade(matches) {
        // Apply special effects FIRST (which removes candies and clears effects)
        this.rules.applySpecialEffects(this.board, matches);
        
        // Then remove other matched candies
        matches.forEach(index => {
            const special = this.board.getSpecial(index);
            // Only remove if not already removed by special effects
            if (this.board.getCandy(index) !== null) {
                this.board.removeCandy(index);
            }
        });
        this.score += matches.length * 5;
        this.clearancedCandies += matches.length;
        
        this.updateGoalDisplay();
        if (this.mode === MODES.GOAL && this.checkGoalProgress()) {
            this.showGameOver();
            return;
        }
        
        // Continuous cascade: gravity + fill + check for new matches
        this.board.applyGravity();
        this.board.fillEmptySpaces();
        
        // Safety loop: keep filling until no nulls remain
        let attempts = 0;
        while (this.board.board.some(cell => cell === null) && attempts < 10) {
            this.board.applyGravity();
            this.board.fillEmptySpaces();
            attempts++;
        }
        
        this.render();
        this.render3D();
        
        const nextMatches = this.board.findMatches();
        if (nextMatches.length > 0) {
            // Play combo sound for cascades
            this.musicManager.playComboSound();
            // Continue cascading without delay
            this.processCascade(nextMatches);
        } else {
            this.isAnimating = false;
            this.isProcessingMatches = false;
            this.updateGoalDisplay();
            if (this.shouldGameEnd()) {
                this.showGameOver();
            }
        }
    }
    
    shouldGameEnd() {
        if (this.mode === MODES.CLASSIC && this.moves <= 0) return true;
        if (this.mode === MODES.TIME_ATTACK && this.timeLeft <= 0) return true;
        if (this.mode === MODES.GOAL && this.goalLevel >= this.goalLevels.length && this.clearancedCandies >= this.goalTarget) return true;
        return false;
    }
    
    showGameOver() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.processingTimeoutId) clearInterval(this.processingTimeoutId);
        
        this.saveBestScore();
        this.uiManager.addScoreToLeaderboard(this.mode, this.score);
        
        let title = 'Game Over!';
        let message = 'Nice try!';
        let playSfx = 'success';
        
        if (this.mode === MODES.GOAL && this.clearancedCandies >= this.goalTarget) {
            title = '🎉 Goal Achieved!';
            message = 'You cleared the goal!';
            playSfx = 'clapping'; // Play applause for goal achievement
        } else if (this.score > parseInt(this.uiManager.loadBestScore())) {
            title = '🎉 New High Score!';
            message = 'Congratulations!';
            playSfx = 'wonderful'; // Play wonderful voice for high score
        }
        
        // Play appropriate sound effect
        if (playSfx === 'clapping') {
            this.musicManager.playClappingSound();
        } else if (playSfx === 'wonderful') {
            this.musicManager.playWonderfulSound();
        } else {
            this.musicManager.playSuccessSound();
        }
        
        this.uiManager.showResultPopup(title, message, this.score, this.uiManager.loadBestScore());
    }
    
    saveBestScore() {
        const best = this.uiManager.loadBestScore();
        if (this.score > best) {
            localStorage.setItem('candyCrushBest', this.score);
        }
    }
    
    playAgain() {
        this.uiManager.hideResultPopup();
        this.selectMode(this.mode);
    }

    stopGame() {
        // Save the current score to leaderboard
        if (this.mode === MODES.CLASSIC && this.score > 0) {
            this.uiManager.addScoreToLeaderboard('classic', this.score);
        }
        
        // Hide stop button
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) stopBtn.style.display = 'none';
        
        // Get best score from leaderboard
        const bestScore = this.uiManager.leaderboards['classic'] && this.uiManager.leaderboards['classic'].length > 0 
            ? this.uiManager.leaderboards['classic'][0].score 
            : this.score;
        
        // Show result with final score
        this.uiManager.showResultPopup('Game Stopped', 'You stopped the game!', this.score, bestScore);
        
        // Clear timers
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
    
    toggleSettings(event) {
        const settingsModal = document.getElementById('settingsModal');
        if (!settingsModal) return;
        
        // Stop event propagation to prevent auto-play listener from triggering
        if (event) {
            event.stopPropagation();
        }
        
        // Reset grace period so auto-play doesn't kick in immediately after closing
        if (this.musicManager) {
            this.musicManager.lastToggleTime = Date.now();
        }
        
        const isHidden = window.getComputedStyle(settingsModal).display === 'none';
        settingsModal.style.display = isHidden ? 'flex' : 'none';
        
        if (isHidden) {
            this.updateBottomNav('settings');
        } else {
            this.updateBottomNav('home');
        }
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

    // Wallet Connection Methods
    toggleWallet(event) {
        const walletModal = document.getElementById('walletModal');
        if (!walletModal) return;
        
        if (event) {
            event.stopPropagation();
        }
        
        const isHidden = window.getComputedStyle(walletModal).display === 'none';
        walletModal.style.display = isHidden ? 'flex' : 'none';
    }

    async connectMetaMask() {
        const walletStatus = document.getElementById('walletStatus');
        const walletAddress = document.getElementById('walletAddress');
        
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                walletStatus.textContent = '❌ MetaMask not installed. Please install it!';
                walletStatus.style.color = '#c03030';
                return;
            }

            walletStatus.textContent = '⏳ Connecting...';
            walletStatus.style.color = '#f39c12';

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts && accounts.length > 0) {
                const address = accounts[0];
                walletStatus.textContent = '✅ Connected!';
                walletStatus.style.color = '#27ae60';
                
                walletAddress.style.display = 'block';
                walletAddress.textContent = `Address: ${address}`;
                
                // Store wallet info
                localStorage.setItem('walletAddress', address);
                localStorage.setItem('walletType', 'metamask');
                
                // Update button
                const walletBtn = document.getElementById('walletBtn');
                if (walletBtn) {
                    walletBtn.textContent = `💳 ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                }

                console.log('MetaMask connected:', address);
            }
        } catch (error) {
            console.error('MetaMask connection error:', error);
            walletStatus.textContent = '❌ Connection failed. Please try again.';
            walletStatus.style.color = '#c03030';
        }
    }

    async connectWalletConnect() {
        const walletStatus = document.getElementById('walletStatus');
        const walletAddress = document.getElementById('walletAddress');
        
        try {
            walletStatus.textContent = '⏳ WalletConnect support coming soon!';
            walletStatus.style.color = '#f39c12';
            
            console.log('WalletConnect integration placeholder');
        } catch (error) {
            console.error('WalletConnect error:', error);
            walletStatus.textContent = '❌ WalletConnect not available yet';
            walletStatus.style.color = '#c03030';
        }
    }

    loadWalletStatus() {
        const storedAddress = localStorage.getItem('walletAddress');
        const storedType = localStorage.getItem('walletType');
        
        if (storedAddress && storedType) {
            const walletBtn = document.getElementById('walletBtn');
            if (walletBtn) {
                walletBtn.textContent = `💳 ${storedAddress.substring(0, 6)}...${storedAddress.substring(storedAddress.length - 4)}`;
            }
        }
    }
}

// Initialize game with loading screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
    }, 2800);
    
    window.game = new CandyCrush();
    // expose a quick test helper
    window.runFillSpaceTest = () => window.game.smokeTestFill();
});
