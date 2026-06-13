// Music Manager - Handles background music and sound effects
class MusicManager {
    constructor() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        // Restore user's previous music preference, default to enabled if no preference exists
        this.isMusicEnabled = localStorage.getItem('cy-fur-music-enabled') !== 'false';
        this.musicVolume = parseFloat(localStorage.getItem('cy-fur-music-volume')) || 0.3;
        this.sfxVolume = parseFloat(localStorage.getItem('cy-fur-sfx-volume')) || 0.5;
        this.hasUserInteracted = false;
        this.lastToggleTime = 0; // Grace period after manual toggle
        
        // Sound effect audio elements
        this.sfxSounds = {};
        this.initializeSoundEffects();
        this.initializeAudio();
        this.setupUserInteractionListener();
        this.updateMusicUI();
    }

    initializeSoundEffects() {
        // Initialize sound effect audio objects with generated WAV files
        this.sfxSounds = {
            match: new Audio('assets/audio/match.wav'),      // Bubble pop descending tone
            swipe: new Audio('assets/audio/swipe.wav'),      // Ascending swoosh
            combo: new Audio('assets/audio/combo.wav'),      // Rising notes cascade
            success: new Audio('assets/audio/success.wav'),  // Happy chord progression
            wonderful: new Audio('assets/audio/wonderful.wav'), // Wonderful voice-like sound
            clapping: new Audio('assets/audio/clapping.wav')    // Applause/clapping
        };
        
        // Set volumes
        Object.values(this.sfxSounds).forEach(sound => {
            sound.volume = this.sfxVolume;
        });
    }

    initializeAudio() {
        if (!this.backgroundMusic) return;
        
        this.backgroundMusic.volume = this.musicVolume;
        this.backgroundMusic.loop = true;
        
        // Handle audio autoplay restrictions
        this.backgroundMusic.addEventListener('play', () => {
            this.updateMusicUI();
        });
        
        this.backgroundMusic.addEventListener('pause', () => {
            this.updateMusicUI();
        });
        
        // Attempt to play music
        if (this.isMusicEnabled) {
            this.playMusic();
        }
    }

    setupUserInteractionListener() {
        // Keep trying to play music on user interactions until it actually plays
        // This helps bypass mobile autoplay restrictions that may fail silently
        const handleUserInteraction = () => {
            // Skip if user just manually toggled (within 500ms grace period)
            if (Date.now() - this.lastToggleTime < 500) return;
            
            // Keep trying to play if enabled but not actually playing yet
            if (this.isMusicEnabled && this.backgroundMusic && this.backgroundMusic.paused) {
                this.playMusic();
            }
        };

        // Don't remove listeners - keep retrying on every tap/click until music plays
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
    }

    playMusic() {
        if (!this.backgroundMusic) return;
        
        const playPromise = this.backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay was prevented, will need user interaction
                console.log('Autoplay prevented. User interaction required to play music.');
            });
        }
        this.isMusicEnabled = true;
        localStorage.setItem('cy-fur-music-enabled', 'true');
        this.updateMusicUI();
    }

    pauseMusic() {
        if (!this.backgroundMusic) return;
        this.backgroundMusic.pause();
        this.isMusicEnabled = false;
        localStorage.setItem('cy-fur-music-enabled', 'false');
        this.updateMusicUI();
    }

    toggleMusic(event) {
        // Stop event propagation to prevent auto-play listener interference
        if (event) {
            event.stopPropagation();
        }
        
        // Set grace period to prevent auto-play listener from interfering
        this.lastToggleTime = Date.now();
        
        if (this.isMusicEnabled) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }

    setVolume(volume) {
        if (!this.backgroundMusic) return;
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.backgroundMusic.volume = this.musicVolume;
        localStorage.setItem('cy-fur-music-volume', this.musicVolume);
    }

    updateMusicUI() {
        const musicToggle = document.getElementById('musicToggle');
        if (!musicToggle) return;
        
        // Show ON/OFF based on isMusicEnabled, not whether it's actually playing
        // (On mobile, it may be paused due to autoplay restrictions but still enabled)
        if (this.isMusicEnabled) {
            musicToggle.textContent = '🔊 Music: ON';
            musicToggle.classList.remove('music-off');
            musicToggle.classList.add('music-on');
        } else {
            musicToggle.textContent = '🔇 Music: OFF';
            musicToggle.classList.remove('music-on');
            musicToggle.classList.add('music-off');
        }
    }

    setMusicSource(src) {
        if (!this.backgroundMusic) return;
        this.backgroundMusic.src = src;
        if (this.isMusicEnabled) {
            this.playMusic();
        }
    }

    // Sound Effects Methods
    playSoundEffect(type) {
        if (!this.sfxSounds[type]) return;
        
        const sound = this.sfxSounds[type];
        sound.currentTime = 0; // Reset to start
        sound.play().catch(err => console.log('SFX play error:', err));
    }

    playMatchSound() {
        this.playSoundEffect('match');
    }

    playSwipeSound() {
        this.playSoundEffect('swipe');
    }

    playComboSound() {
        this.playSoundEffect('combo');
    }

    playSuccessSound() {
        this.playSoundEffect('success');
    }

    playWonderfulSound() {
        this.playSoundEffect('wonderful');
    }

    playClappingSound() {
        this.playSoundEffect('clapping');
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sfxSounds).forEach(sound => {
            sound.volume = this.sfxVolume;
        });
        localStorage.setItem('cy-fur-sfx-volume', this.sfxVolume);
    }

    setSoundEffectSource(type, src) {
        if (!this.sfxSounds[type]) return;
        this.sfxSounds[type].src = src;
    }
}
