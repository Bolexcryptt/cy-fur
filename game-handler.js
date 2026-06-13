// Game Handler - Manages user input and events
class GameHandler {
    constructor(game) {
        this.game = game;
        this.firstTouchPos = null;
        this.firstSelected = null;
        this.startX = 0;
        this.startY = 0;
        this.currentHoverIndex = null;
        this._onMouseMove = (e) => {
            if (this.firstSelected === null) return;
            const gameBoard = document.getElementById('gameBoard');
            const boardRect = gameBoard.getBoundingClientRect();
            const relX = e.clientX - boardRect.left;
            const relY = e.clientY - boardRect.top;
            const candies = Array.from(gameBoard.children);
            for (let i = 0; i < candies.length; i++) {
                const candyRect = candies[i].getBoundingClientRect();
                const candyRelX = candyRect.left - boardRect.left;
                const candyRelY = candyRect.top - boardRect.top;
                const candySize = candyRect.width;
                if (relX >= candyRelX && relX <= candyRelX + candySize &&
                    relY >= candyRelY && relY <= candyRelY + candySize) {
                    this.currentHoverIndex = parseInt(candies[i].dataset.index);
                    return;
                }
            }
            this.currentHoverIndex = null;
        };
    }
    
    setupTouchEvents() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.style.touchAction = 'manipulation';

        const getTouchIndex = (clientX, clientY) => {
            const boardRect = gameBoard.getBoundingClientRect();
            const relX = clientX - boardRect.left;
            const relY = clientY - boardRect.top;

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

        const getSwipeTarget = (startIndex, vector) => {
            if (startIndex === null) return null;
            const row = Math.floor(startIndex / BOARD_COLS);
            const col = startIndex % BOARD_COLS;
            let dx = 0;
            let dy = 0;
            if (Math.abs(vector.x) > Math.abs(vector.y)) {
                dx = vector.x > 0 ? 1 : -1;
            } else {
                dy = vector.y > 0 ? 1 : -1;
            }
            const newRow = row + dy;
            const newCol = col + dx;
            if (newRow < 0 || newRow >= BOARD_ROWS || newCol < 0 || newCol >= BOARD_COLS) {
                return null;
            }
            return newRow * BOARD_COLS + newCol;
        };

        const handleEnd = (endX, endY) => {
            if (this.firstSelected === null) return;
            const distX = endX - this.startX;
            const distY = endY - this.startY;
            const swipeVector = { x: distX, y: distY };

            if (Math.abs(distX) < SWIPE_THRESHOLD && Math.abs(distY) < SWIPE_THRESHOLD) {
                this.game.selectCandy(this.firstSelected);
            } else {
                const secondIndex = getSwipeTarget(this.firstSelected, swipeVector);
                if (secondIndex !== null && this.game.isAdjacent(this.firstSelected, secondIndex)) {
                    // Determine swipe direction
                    const swipeDirection = Math.abs(distX) > Math.abs(distY) ? 'horizontal' : 'vertical';
                    console.log(`Swipe detected: ${swipeDirection} (distX: ${distX}, distY: ${distY})`);
                    // Play swipe sound effect
                    this.game.musicManager.playSwipeSound();
                    this.game.swapCandies(this.firstSelected, secondIndex, swipeDirection);
                }
            }

            this.firstSelected = null;
            this.currentHoverIndex = null;
        };

        const beginInput = (clientX, clientY) => {
            this.startX = clientX;
            this.startY = clientY;
            this.firstTouchPos = { x: clientX, y: clientY };
            this.firstSelected = getTouchIndex(clientX, clientY);
        };

        const updateHover = (clientX, clientY) => {
            if (this.firstSelected === null) return;
            const boardRect = gameBoard.getBoundingClientRect();
            const relX = clientX - boardRect.left;
            const relY = clientY - boardRect.top;
            const candies = Array.from(gameBoard.children);
            for (let i = 0; i < candies.length; i++) {
                const candyRect = candies[i].getBoundingClientRect();
                const candyRelX = candyRect.left - boardRect.left;
                const candyRelY = candyRect.top - boardRect.top;
                const candySize = candyRect.width;
                if (relX >= candyRelX && relX <= candyRelX + candySize &&
                    relY >= candyRelY && relY <= candyRelY + candySize) {
                    this.currentHoverIndex = parseInt(candies[i].dataset.index);
                    return;
                }
            }
            this.currentHoverIndex = null;
        };

        const pointerMove = (e) => {
            updateHover(e.clientX, e.clientY);
        };

        if (window.PointerEvent) {
            gameBoard.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                beginInput(e.clientX, e.clientY);
                gameBoard.setPointerCapture(e.pointerId);
                gameBoard.addEventListener('pointermove', pointerMove);
            });

            gameBoard.addEventListener('pointerup', (e) => {
                handleEnd(e.clientX, e.clientY);
                gameBoard.removeEventListener('pointermove', pointerMove);
            });

            gameBoard.addEventListener('pointercancel', () => {
                this.firstSelected = null;
                this.currentHoverIndex = null;
                gameBoard.removeEventListener('pointermove', pointerMove);
            });

            return;
        }

        gameBoard.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            beginInput(e.clientX, e.clientY);
            gameBoard.addEventListener('mousemove', pointerMove);
        });

        gameBoard.addEventListener('mouseup', (e) => {
            handleEnd(e.clientX, e.clientY);
            gameBoard.removeEventListener('mousemove', pointerMove);
        });

        gameBoard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            beginInput(touch.clientX, touch.clientY);
        }, { passive: true });

        gameBoard.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            updateHover(touch.clientX, touch.clientY);
        }, { passive: true });

        gameBoard.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 0) return;
            const touch = e.changedTouches[0];
            handleEnd(touch.clientX, touch.clientY);
        }, { passive: true });
    }
}
