// Game Constants
const BOARD_ROWS = 8;
const BOARD_COLS = 6;
const COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];

const COLOR_MAP = {
    red: 0xff6b6b,
    blue: 0x4ecdc4,
    yellow: 0xffd93d,
    green: 0x6bcf7f,
    purple: 0xc77dff,
    orange: 0xff8c42
};

const SPRITE_IMAGES = {
    // Base candies
    red: 'assets/base-red.png',
    blue: 'assets/base-blue.png',
    yellow: 'assets/base-yellow.png',
    green: 'assets/base-green.png',
    purple: 'assets/base-purple.png',
    orange: 'assets/base-orange.png',
    
    // Horizontal Striped candies
    'striped-h-red': 'assets/horizontal-red.png',
    'striped-h-blue': 'assets/horizontal-blue.png',
    'striped-h-yellow': 'assets/horizontal-yellow.png',
    'striped-h-green': 'assets/horizontal-green.png',
    'striped-h-purple': 'assets/horizontal-purple.png',
    'striped-h-orange': 'assets/horizontal-orange.png',
    
    // Vertical Striped candies
    'striped-v-red': 'assets/vertical-red.png',
    'striped-v-blue': 'assets/vertical-blue.png',
    'striped-v-yellow': 'assets/vertical-yellow.png',
    'striped-v-green': 'assets/vertical-green.png',
    'striped-v-purple': 'assets/vertical-purple.png',
    'striped-v-orange': 'assets/vertical-orange.png',
    
    // Cygem Bomb (Color Bomb)
    'bomb': 'assets/cygembomb.png'
};

const EMOJIS = {
    // Base candies
    red: '🍎',
    blue: '🧊',
    yellow: '🍯',
    green: '🍏',
    purple: '🍇',
    orange: '🍊',
    
    // Special candy indicators
    'striped-h': 'S',
    'striped-v': 'S',
    'wrapped': 'W',
    'bomb': '💣'
};

const SPECIAL_CANDY_TYPES = {
    STRIPED_H: 'striped-h',
    STRIPED_V: 'striped-v',
    WRAPPED: 'wrapped',
    BOMB: 'bomb'
};

const AUDIO_ASSETS = {
    // Background music
    music: {
        mainMenu: 'assets/audio/menu-music.mp3',
        gamePlay: 'assets/audio/gameplay-music.mp3',
        endGame: 'assets/audio/end-game-music.mp3'
    },
    
    // Sound effects
    sfx: {
        match: 'assets/audio/match.mp3',
        combo: 'assets/audio/combo.mp3',
        swap: 'assets/audio/swap.mp3',
        striped: 'assets/audio/striped-activation.mp3',
        wrapped: 'assets/audio/wrapped-activation.mp3',
        bomb: 'assets/audio/bomb-activation.mp3',
        cascade: 'assets/audio/cascade.mp3',
        powerUp: 'assets/audio/power-up.mp3',
        levelComplete: 'assets/audio/level-complete.mp3',
        levelFail: 'assets/audio/level-fail.mp3',
        buttonClick: 'assets/audio/button-click.mp3'
    }
};

const UI_ASSETS = {
    buttons: {
        play: 'assets/ui/play-button.png',
        pause: 'assets/ui/pause-button.png',
        restart: 'assets/ui/restart-button.png',
        menu: 'assets/ui/menu-button.png',
        settings: 'assets/ui/settings-button.png'
    },
    
    backgrounds: {
        menu: 'assets/ui/menu-background.png',
        game: 'assets/ui/game-background.png',
        overlay: 'assets/ui/overlay.png'
    },
    
    icons: {
        score: 'assets/ui/score-icon.png',
        moves: 'assets/ui/moves-icon.png',
        timer: 'assets/ui/timer-icon.png',
        leaderboard: 'assets/ui/leaderboard-icon.png',
        settings: 'assets/ui/settings-icon.png'
    }
};

const EFFECT_ASSETS = {
    particles: {
        spark: 'assets/effects/spark.png',
        star: 'assets/effects/star.png',
        burst: 'assets/effects/burst.png'
    },
    
    explosions: {
        small: 'assets/effects/explosion-small.png',
        medium: 'assets/effects/explosion-medium.png',
        large: 'assets/effects/explosion-large.png'
    }
};

const MODES = {
    CLASSIC: 'classic',
    TIME_ATTACK: 'timeAttack',
    GOAL: 'goalMode'
};

const SWIPE_THRESHOLD = 25;

// Animation durations (in milliseconds)
const ANIMATION_DURATIONS = {
    match: 300,
    swap: 200,
    striped: 600,
    wrapped: 500,
    bomb: 700,
    cascade: 400,
    combo: 600,
    popup: 1000
};

// Game scoring
const SCORE_VALUES = {
    match3: 10,
    match4: 25,
    match5: 50,
    striped: 50,
    wrapped: 75,
    bomb: 100,
    combo: 150,
    cascade: 200
};

// Special candy creation thresholds
const SPECIAL_CANDY_THRESHOLDS = {
    striped: 4,      // 4-match creates striped
    wrapped: 5,      // 5-match creates wrapped
    bomb: 5          // 5+ match creates bomb
};
