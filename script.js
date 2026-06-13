const BOARD_SIZE = 8;
const COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
const COLOR_MAP = {
    red: 0xff6b6b,
    blue: 0x4ecdc4,
    yellow: 0xffd93d,
    green: 0x6bcf7f,
    purple: 0xc77dff,
    orange: 0xff8c42
};
const EMOJIS = {
    red: '🍎',
    blue: '🧊',
    yellow: '🍯',
    green: '🍏',
    purple: '🍇',
    orange: '🍊'
};

const MODES = {
    CLASSIC: 'classic',
    TIME_ATTACK: 'timeAttack',
    GOAL: 'goalMode'
};

// 3D Renderer Class
class Candy3DRenderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        this.camera.position.z = 12;
        this.candyMeshes = {};
        this.particles = [];
        this.selectedCandyIndex = null;
        
        this.setupLighting();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, 15);
        this.scene.add(pointLight);
    }
    
    createCandyMesh(color, position) {
        const candyGeometry = new THREE.SphereGeometry(0.45, 32, 32);
        const candyMaterial = new THREE.MeshStandardMaterial({
            color: COLOR_MAP[color],
            metalness: 0.3,
            roughness: 0.4,
            emissive: COLOR_MAP[color],
            emissiveIntensity: 0.1
        });
        
        const candy = new THREE.Mesh(candyGeometry, candyMaterial);
        candy.position.set(position.x, position.y, position.z);
        candy.castShadow = true;
        candy.receiveShadow = true;
        candy.userData = { color, originalPosition: { ...position }, rotation: { x: 0, y: 0, z: 0 } };
        
        this.scene.add(candy);
        return candy;
    }
    
    addCandyToBoard(index, color) {
        const gridPos = this.indexToGridPosition(index);
        const mesh = this.createCandyMesh(color, gridPos);
        this.candyMeshes[index] = mesh;
    }
    
    indexToGridPosition(index) {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        const x = (col - BOARD_SIZE / 2) * 1.2 + 0.6;
        const y = (BOARD_SIZE / 2 - row - 1) * 1.2 + 0.6;
        return { x, y, z: 0 };
    }
    
    updateCandyPosition(index, targetPos, duration = 300) {
        const mesh = this.candyMeshes[index];
        if (!mesh) return;
        
        const startPos = { ...mesh.position };
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            mesh.position.x = startPos.x + (targetPos.x - startPos.x) * this.easeOutCubic(progress);
            mesh.position.y = startPos.y + (targetPos.y - startPos.y) * this.easeOutCubic(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    selectCandy(index) {
        if (this.selectedCandyIndex !== null) {
            const oldMesh = this.candyMeshes[this.selectedCandyIndex];
            if (oldMesh) {
                oldMesh.userData.selected = false;
            }
        }
        
        this.selectedCandyIndex = index;
        const mesh = this.candyMeshes[index];
        if (mesh) {
            mesh.userData.selected = true;
        }
    }
    
    createShatterEffect(index) {
        const mesh = this.candyMeshes[index];
        if (!mesh) return;
        
        const position = mesh.position;
        const color = new THREE.Color(COLOR_MAP[mesh.userData.color]);
        
        for (let i = 0; i < 12; i++) {
            const geometry = new THREE.TetrahedronGeometry(0.15, 0);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.4,
                emissive: color,
                emissiveIntensity: 0.3
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            const velocity = {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8 + 3,
                z: (Math.random() - 0.5) * 6
            };
            
            const rotation = {
                x: (Math.random() - 0.5) * 0.3,
                y: (Math.random() - 0.5) * 0.3,
                z: (Math.random() - 0.5) * 0.3
            };
            
            this.scene.add(particle);
            this.particles.push({
                mesh: particle,
                velocity,
                rotation,
                life: 1,
                maxLife: 1
            });
        }
        
        mesh.material.emissiveIntensity = 0.8;
        setTimeout(() => {
            mesh.material.emissiveIntensity = 0.1;
        }, 100);
    }
    
    removeCandyMesh(index) {
        const mesh = this.candyMeshes[index];
        if (mesh) {
            this.scene.remove(mesh);
            delete this.candyMeshes[index];
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.02;
            
            p.velocity.y -= 0.15;
            p.mesh.position.x += p.velocity.x * 0.016;
            p.mesh.position.y += p.velocity.y * 0.016;
            p.mesh.position.z += p.velocity.z * 0.016;
            
            p.mesh.rotation.x += p.rotation.x;
            p.mesh.rotation.y += p.rotation.y;
            p.mesh.rotation.z += p.rotation.z;
            
            p.mesh.material.opacity = Math.max(0, p.life);
            
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.selectedCandyIndex !== null) {
            const mesh = this.candyMeshes[this.selectedCandyIndex];
            if (mesh) {
                mesh.rotation.x += 0.05;
                mesh.rotation.y += 0.05;
            }
        }
        
        Object.values(this.candyMeshes).forEach((mesh, idx) => {
            if (mesh) {
                const time = Date.now() * 0.001;
                mesh.position.z = Math.sin(time + idx * 0.2) * 0.15;
            }
        });
        
        this.updateParticles();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    show() {
        document.getElementById('canvas-container').style.display = 'block';
    }
    
    hide() {
        document.getElementById('canvas-container').style.display = 'none';
    }
}

class CandyCrush {
    constructor() {
        this.board = [];
        this.specialCandies = {};
        this.score = 0;
        this.moves = 20;
        this.maxMoves = 20;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.isProcessingMatches = false;
        this.mode = null;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.goalTarget = 200;
        this.clearancedCandies = 0;
        this.leaderboards = {
            classic: [],
            timeAttack: [],
            goalMode: []
        };
        this.currentLeaderboardMode = 'classic';
        this.candyElements = {};
        this.lastRenderState = {};
        
        this.renderer3D = new Candy3DRenderer();
        
        this.loadBestScore();
        this.loadLeaderboards();
        this.showModes();
    }

    showModes() {
        this.renderer3D.hide();
        if (this.processingTimeoutId) clearInterval(this.processingTimeoutId);
        document.getElementById('modeScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'none';
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    backToGame() {
        if (this.mode) {
            document.getElementById('modeScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            document.getElementById('leaderboardScreen').style.display = 'none';
            this.renderer3D.show();
        }
    }

    showLeaderboard(mode) {
        this.renderer3D.hide();
        this.currentLeaderboardMode = mode || 'classic';
        document.getElementById('modeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('leaderboardScreen').style.display = 'flex';
        document.getElementById('backToGameBtn').style.display = this.mode ? 'flex' : 'none';
        this.updateLeaderboardDisplay();
        this.setActiveLeaderboardTab(mode);
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
        const modeKey = mode;
        if (!this.leaderboards[modeKey]) {
            this.leaderboards[modeKey] = [];
        }

        const playerName = localStorage.getItem('cyFurPlayerName') || 'Player';
        this.leaderboards[modeKey].push({
            name: playerName,
            score: score,
            date: new Date().toLocaleDateString()
        });

        // Sort by score descending and keep top 10
        this.leaderboards[modeKey].sort((a, b) => b.score - a.score);
        this.leaderboards[modeKey] = this.leaderboards[modeKey].slice(0, 10);

        this.saveLeaderboards();
    }

    updateLeaderboardDisplay() {
        const leaderboard = this.leaderboards[this.currentLeaderboardMode] || [];
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';

        if (leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #a0aec0;">No scores yet. Play to get on the board!</td></tr>';
            return;
        }

        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            const rank = index + 1;
            const badgeClass = rank <= 3 ? `rank-badge rank-${rank}` : 'rank-badge';
            
            row.innerHTML = `
                <td><div class="${badgeClass}">${rank}</div></td>
                <td><strong>${entry.name || 'Player'}</strong><div style="font-weight:600">${entry.score}</div></td>
                <td>${entry.date}</td>
            `;
            tbody.appendChild(row);
        });
    }

    selectMode(mode) {
        this.mode = mode;
        this.score = 0;
        this.moves = mode === MODES.CLASSIC ? 20 : (mode === MODES.TIME_ATTACK ? 60 : 999);
        this.maxMoves = this.moves;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.timeLeft = 60;
        this.clearancedCandies = 0;

        document.getElementById('modeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        
        this.renderer3D.show();
        this.updateUI();
        this.initializeBoard();
        this.render();
        this.render3D();
        this.setupTouchEvents();
        
        // Safety timeout to prevent game lockup if processing gets stuck
        this.processingTimeoutId = setInterval(() => {
            if (this.isProcessingMatches) {
                // If processing for more than 2 seconds, force reset
                this.isProcessingMatches = false;
                this.isAnimating = false;
                this.render();
            }
        }, 2000);

        if (mode === MODES.TIME_ATTACK) {
            this.startTimer();
        }

        if (mode === MODES.GOAL) {
            document.getElementById('goalDisplay').style.display = 'block';
            document.getElementById('movesLabel').textContent = 'Status';
            this.updateGoalDisplay();
        } else {
            document.getElementById('goalDisplay').style.display = 'none';
            document.getElementById('movesLabel').textContent = mode === MODES.TIME_ATTACK ? 'Time' : 'Moves';
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('moves').textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showGameOver();
            }
        }, 1000);
    }

    updateGoalDisplay() {
        const progress = Math.min((this.clearancedCandies / this.goalTarget) * 100, 100);
        document.getElementById('goalBar').style.width = progress + '%';
        document.getElementById('goalText').textContent = `Clear ${this.goalTarget} Candies: ${this.clearancedCandies}/${this.goalTarget}`;
    }

    loadBestScore() {
        const best = localStorage.getItem('candyCrushBest') || 0;
        document.getElementById('best').textContent = best;
    }

    saveBestScore() {
        const current = parseInt(document.getElementById('best').textContent);
        if (this.score > current) {
            localStorage.setItem('candyCrushBest', this.score);
            document.getElementById('best').textContent = this.score;
        }
    }

    initializeBoard() {
        this.board = [];
        this.specialCandies = {};
        this.candyElements = {};
        this.lastRenderState = {};
        this.renderer3D.candyMeshes = {};
        this.renderer3D.scene.children = this.renderer3D.scene.children.filter(child => !child.userData.color);
        
        for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            this.board[i] = this.getRandomColor();
        }
        while (this.findMatches().length > 0) {
            this.board = this.board.map(() => this.getRandomColor());
        }
    }

    render3D() {
        Object.keys(this.renderer3D.candyMeshes).forEach(idx => {
            this.renderer3D.removeCandyMesh(idx);
        });
        
        this.board.forEach((color, index) => {
            this.renderer3D.addCandyToBoard(index, color);
        });
    }

    getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        if (this.mode === MODES.TIME_ATTACK) {
            document.getElementById('moves').textContent = this.timeLeft;
        } else if (this.mode === MODES.GOAL) {
            this.updateGoalDisplay();
        } else {
            document.getElementById('moves').textContent = this.moves;
        }
    }

    render() {
        const gameBoard = document.getElementById('gameBoard');
        
        if (Object.keys(this.candyElements).length === 0) {
            gameBoard.innerHTML = '';
            this.candyElements = {};
            
            this.board.forEach((color, index) => {
                const candy = document.createElement('div');
                candy.className = `candy ${color}`;
                candy.textContent = EMOJIS[color];
                candy.dataset.index = index;
                candy.onclick = () => this.selectCandy(index);
                gameBoard.appendChild(candy);
                this.candyElements[index] = candy;
                this.lastRenderState[index] = { color, special: this.specialCandies[index], selected: false };
            });
        } else {
            this.board.forEach((color, index) => {
                const candy = this.candyElements[index];
                if (!candy) return;
                const special = this.specialCandies[index];
                const lastState = this.lastRenderState[index];
                
                if (!lastState || lastState.color !== color || lastState.special !== special) {
                    candy.className = `candy ${color}`;
                    candy.textContent = EMOJIS[color];
                    if (special) candy.classList.add(special);
                    this.lastRenderState[index] = { color, special, selected: lastState?.selected || false };
                }
            });
        }

        Object.keys(this.candyElements).forEach(index => {
            const candy = this.candyElements[index];
            const isSelected = parseInt(index) === this.selectedCandy;
            const wasSelected = this.lastRenderState[index].selected;
            
            if (isSelected !== wasSelected) {
                if (isSelected) {
                    candy.classList.add('selected');
                    this.renderer3D.selectCandy(index);
                } else {
                    candy.classList.remove('selected');
                }
                this.lastRenderState[index].selected = isSelected;
            }
        });

        this.updateUI();
    }

    selectCandy(index) {
        // Prevent moves while processing matches or animating
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

    setupTouchEvents() {
        const gameBoard = document.getElementById('gameBoard');
        
        // **FIX: Better click detection for desktop/mobile**
        let touchStartIndex = null;
        let startX = 0;
        let startY = 0;
        const SWIPE_THRESHOLD = 10;
        
        const getTouchIndex = (clientX, clientY) => {
            // Find the candy directly from board's children using geometric calculation
            const boardRect = gameBoard.getBoundingClientRect();
            const relX = clientX - boardRect.left;
            const relY = clientY - boardRect.top;
            
            // Get all candies and find which one was clicked
            const candies = Array.from(gameBoard.children);
            for (let i = 0; i < candies.length; i++) {
                const candyRect = candies[i].getBoundingClientRect();
                const candyRelX = candyRect.left - boardRect.left;
                const candyRelY = candyRect.top - boardRect.top;
                const candySize = candyRect.width;
                
                if (relX >= candyRelX && relX <= candyRelX + candySize &&
                    relY >= candyRelY && relY <= candyRelY + candySize) {
                    return parseInt(candies[i].dataset.index);
                }
            }
            return null;
        };
        
        // **Desktop mouse support**
        gameBoard.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            startX = e.clientX;
            startY = e.clientY;
            touchStartIndex = getTouchIndex(e.clientX, e.clientY);
        });
        
        gameBoard.addEventListener('mouseup', (e) => {
            if (touchStartIndex === null) return;
            
            const endX = e.clientX;
            const endY = e.clientY;
            const distX = endX - startX;
            const distY = endY - startY;
            
            const touchEndIndex = getTouchIndex(endX, endY);
            
            if (touchEndIndex !== null) {
                if (touchEndIndex === touchStartIndex) {
                    // Click on same candy
                    this.selectCandy(touchStartIndex);
                } else if (Math.abs(distX) < SWIPE_THRESHOLD && Math.abs(distY) < SWIPE_THRESHOLD) {
                    // Very small movement, might be a click-and-drag
                    if (this.isAdjacent(touchStartIndex, touchEndIndex)) {
                        this.swapCandies(touchStartIndex, touchEndIndex);
                    }
                }
            }
            
            touchStartIndex = null;
        });
        
        // **Mobile touch support**
        gameBoard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            touchStartIndex = getTouchIndex(touch.clientX, touch.clientY);
        }, { passive: true });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (touchStartIndex === null || e.changedTouches.length === 0) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const distX = endX - startX;
            const distY = endY - startY;
            
            const touchEndIndex = getTouchIndex(endX, endY);
            
            if (touchEndIndex !== null) {
                if (touchEndIndex === touchStartIndex) {
                    // Tap on same candy
                    this.selectCandy(touchStartIndex);
                } else if (this.isAdjacent(touchStartIndex, touchEndIndex)) {
                    // Swipe to adjacent candy
                    const isSwipeVertical = Math.abs(distY) > Math.abs(distX);
                    const isSwipeHorizontal = Math.abs(distX) > Math.abs(distY);
                    
                    // Check if swipe direction matches the adjacent position
                    const row1 = Math.floor(touchStartIndex / BOARD_SIZE);
                    const col1 = touchStartIndex % BOARD_SIZE;
                    const row2 = Math.floor(touchEndIndex / BOARD_SIZE);
                    const col2 = touchEndIndex % BOARD_SIZE;
                    
                    const isValidVerticalSwipe = isSwipeVertical && Math.abs(distY) > 5;
                    const isValidHorizontalSwipe = isSwipeHorizontal && Math.abs(distX) > 5;
                    
                    if (isValidVerticalSwipe || isValidHorizontalSwipe || 
                        (Math.abs(distX) < 20 && Math.abs(distY) < 20)) {
                        this.swapCandies(touchStartIndex, touchEndIndex);
                    }
                }
            }
            
            touchStartIndex = null;
        }, { passive: true });
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / BOARD_SIZE);
        const col1 = index1 % BOARD_SIZE;
        const row2 = Math.floor(index2 / BOARD_SIZE);
        const col2 = index2 % BOARD_SIZE;

        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);

        return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
    }

    swapCandies(index1, index2) {
        const origBoard1 = this.board[index1];
        const origBoard2 = this.board[index2];
        const origSpecial1 = this.specialCandies[index1];
        const origSpecial2 = this.specialCandies[index2];

        [this.board[index1], this.board[index2]] = [this.board[index2], this.board[index1]];

        const temp = this.specialCandies[index1];
        this.specialCandies[index1] = this.specialCandies[index2];
        this.specialCandies[index2] = temp;

        // 3D Animation
        const pos1 = this.renderer3D.indexToGridPosition(index1);
        const pos2 = this.renderer3D.indexToGridPosition(index2);
        
        this.renderer3D.updateCandyPosition(index1, pos2);
        this.renderer3D.updateCandyPosition(index2, pos1);

        if (this.mode === MODES.CLASSIC) {
            this.moves--;
        }

        let matches = this.findMatches();
        
        if (matches.length === 0) {
            this.board[index1] = origBoard1;
            this.board[index2] = origBoard2;
            this.specialCandies[index1] = origSpecial1;
            this.specialCandies[index2] = origSpecial2;
            if (this.mode === MODES.CLASSIC) {
                this.moves++;
            }
            
            this.renderer3D.updateCandyPosition(index1, pos1);
            this.renderer3D.updateCandyPosition(index2, pos2);
            
            this.render();
            return;
        }

        this.processMatches();
    }

    processMatches() {
        this.isProcessingMatches = true;
        let matches = this.findMatches();

        if (matches.length === 0) {
            this.isProcessingMatches = false;
            if (this.shouldGameEnd()) {
                this.showGameOver();
            }
            return;
        }

        const matchSet = new Set(matches);
        matchSet.forEach(index => {
            const candy = document.querySelector(`[data-index="${index}"]`);
            if (candy) {
                candy.classList.add('match-animation');
            }
        });

        // Use shorter timeout for mobile performance
        setTimeout(() => {
            this.removeCandies(matches);
        }, 100);
    }

    findMatches() {
        const matches = new Set();

        for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;

            // Horizontal check
            if (col <= BOARD_SIZE - 3) {
                if (this.board[i] === this.board[i + 1] && this.board[i] === this.board[i + 2]) {
                    matches.add(i);
                    matches.add(i + 1);
                    matches.add(i + 2);
                    // Check for 4+ in a row
                    if (col <= BOARD_SIZE - 4 && this.board[i] === this.board[i + 3]) {
                        matches.add(i + 3);
                    }
                }
            }

            // Vertical check
            if (row <= BOARD_SIZE - 3) {
                if (this.board[i] === this.board[i + BOARD_SIZE] && this.board[i] === this.board[i + 2 * BOARD_SIZE]) {
                    matches.add(i);
                    matches.add(i + BOARD_SIZE);
                    matches.add(i + 2 * BOARD_SIZE);
                    // Check for 4+ in a row
                    if (row <= BOARD_SIZE - 4 && this.board[i] === this.board[i + 3 * BOARD_SIZE]) {
                        matches.add(i + 3 * BOARD_SIZE);
                    }
                }
            }
        }

        return Array.from(matches);
    }

    removeCandies(matches) {
        let baseScore = 0;
        const matchSet = new Set(matches);

        matches.forEach(index => {
            // Create shatter 3D effect
            this.renderer3D.createShatterEffect(index);
            
            if (!this.specialCandies[index]) {
                const row = Math.floor(index / BOARD_SIZE);
                const col = index % BOARD_SIZE;
                const color = this.board[index];

                let hCount = 0;
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (matchSet.has(row * BOARD_SIZE + c) && this.board[row * BOARD_SIZE + c] === color) {
                        hCount++;
                    }
                }

                let vCount = 0;
                for (let r = 0; r < BOARD_SIZE; r++) {
                    if (matchSet.has(r * BOARD_SIZE + col) && this.board[r * BOARD_SIZE + col] === color) {
                        vCount++;
                    }
                }

                if (hCount >= 5 || vCount >= 5) {
                    this.specialCandies[index] = 'wrapped';
                } else if (hCount >= 4 || vCount >= 4) {
                    this.specialCandies[index] = 'striped';
                }
            }

            this.board[index] = null;
            this.renderer3D.removeCandyMesh(index);
            baseScore += 10;
        });

        this.applySpecialEffects(matches);

        this.score += baseScore;
        this.clearancedCandies += matches.length;

        if (matches.length >= 3) {
            this.showScorePopup(baseScore, matches[0]);
        }

        this.applyGravity();
    }

    applySpecialEffects(matches) {
        matches.forEach(index => {
            if (this.specialCandies[index] === 'striped') {
                // Clear entire row and column
                const row = Math.floor(index / BOARD_SIZE);
                const col = index % BOARD_SIZE;

                for (let i = 0; i < BOARD_SIZE; i++) {
                    this.board[row * BOARD_SIZE + i] = null;
                    this.board[i * BOARD_SIZE + col] = null;
                }
            } else if (this.specialCandies[index] === 'wrapped') {
                // Clear 3x3 area
                const row = Math.floor(index / BOARD_SIZE);
                const col = index % BOARD_SIZE;

                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                            this.board[r * BOARD_SIZE + c] = null;
                        }
                    }
                }
            }

            delete this.specialCandies[index];
        });
    }

    showScorePopup(points, index) {
        const gameBoard = document.getElementById('gameBoard');
        const rect = gameBoard.getBoundingClientRect();
        const candyIndex = Array.from(gameBoard.children).findIndex(child => child.dataset.index == index);
        
        if (candyIndex === -1) return;

        const candyRect = gameBoard.children[candyIndex].getBoundingClientRect();

        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = candyRect.left + candyRect.width / 2 - 15 + 'px';
        popup.style.top = candyRect.top + 'px';

        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 800);
    }

    applyGravity() {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const column = [];
            const colSpecial = {};
            let currentRow = 0;

            for (let row = 0; row < BOARD_SIZE; row++) {
                const index = row * BOARD_SIZE + col;
                if (this.board[index] !== null) {
                    column.push(this.board[index]);
                    if (this.specialCandies[index]) {
                        colSpecial[currentRow] = this.specialCandies[index];
                    }
                    currentRow++;
                }
            }

            const nulls = BOARD_SIZE - column.length;
            for (let row = 0; row < BOARD_SIZE; row++) {
                const index = row * BOARD_SIZE + col;
                if (row < nulls) {
                    this.board[index] = null;
                    delete this.specialCandies[index];
                } else {
                    this.board[index] = column[row - nulls];
                    if (colSpecial[row - nulls]) {
                        this.specialCandies[index] = colSpecial[row - nulls];
                    } else {
                        delete this.specialCandies[index];
                    }
                }
            }
        }

        this.render();
        this.render3D();
        requestAnimationFrame(() => this.fillEmptySpaces());
    }

    fillEmptySpaces() {
        // Fill empty spaces and prevent pre-matched candies
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                let newColor;
                let attempts = 0;
                do {
                    newColor = this.getRandomColor();
                    this.board[i] = newColor;
                    attempts++;
                } while (this.findMatches().length > 0 && attempts < 100);
            }
        }

        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            this.render();
            requestAnimationFrame(() => this.processCascade(newMatches));
        } else {
            this.isAnimating = false;
            this.isProcessingMatches = false;
            this.render();
            if (this.shouldGameEnd()) {
                this.showGameOver();
            }
        }
    }

    processCascade(matches) {
        const matchSet = new Set(matches);
        let baseScore = 0;

        matches.forEach(index => {
            this.board[index] = null;
            baseScore += 5;
        });

        this.applySpecialEffects(matches);
        this.score += baseScore;
        this.clearancedCandies += matches.length;
        
        // Update goal display and check if goal is reached
        this.updateGoalDisplay();
        if (this.mode === MODES.GOAL && this.shouldGameEnd()) {
            this.showGameOver();
            return;
        }

        this.applyGravity();
    }

    shouldGameEnd() {
        if (this.mode === MODES.CLASSIC && this.moves <= 0) return true;
        if (this.mode === MODES.TIME_ATTACK && this.timeLeft <= 0) return true;
        if (this.mode === MODES.GOAL && this.clearancedCandies >= this.goalTarget) return true;
        return false;
    }

    showGameOver() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.processingTimeoutId) clearInterval(this.processingTimeoutId);
        this.saveBestScore();
        this.addScoreToLeaderboard(this.mode, this.score);
        
        // Show result popup
        this.showResultPopup();
    }

    showResultPopup() {
        const resultScreen = document.getElementById('resultScreen');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const resultScore = document.getElementById('resultScore');
        const resultBest = document.getElementById('resultBest');
        
        let title = 'Game Over!';
        let message = 'Nice try!';
        
        if (this.mode === MODES.GOAL && this.clearancedCandies >= this.goalTarget) {
            title = '🎉 Goal Achieved!';
            message = 'You cleared the goal!';
        } else if (this.score > parseInt(document.getElementById('best').textContent)) {
            title = '🎉 New High Score!';
            message = 'Congratulations!';
        }
        
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        resultScore.textContent = this.score;
        resultBest.textContent = document.getElementById('best').textContent;
        
        resultScreen.style.display = 'flex';
    }

    playAgain() {
        document.getElementById('resultScreen').style.display = 'none';
        this.selectMode(this.mode);
    }

    toggleSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal.style.display === 'none') {
            settingsModal.style.display = 'flex';
        } else {
            settingsModal.style.display = 'none';
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
}

// Initialize game with loading screen
document.addEventListener('DOMContentLoaded', () => {
    // Load saved view mode preference
    const savedViewMode = localStorage.getItem('cy-fur-view-mode') || 'mobile';
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    if (savedViewMode === 'desktop') {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1200, initial-scale=1.0, user-scalable=no');
        toggleBtns[1].classList.add('active');
    } else {
        toggleBtns[0].classList.add('active');
    }
    
    // Simulate loading
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
    }, 2800);
    
    window.game = new CandyCrush();
});
