// Notification Manager - Handles pop-up notifications and celebrations
class NotificationManager {
    constructor() {
        this.container = null;
        this.initializeContainer();
    }

    initializeContainer() {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        this.container = container;
    }

    showMatchNotification(matchCount, position = null) {
        if (matchCount < 4) return;

        let message = '';
        let className = '';
        let duration = 1200;

        if (matchCount >= 5) {
            message = '✨ WONDERFUL! ✨';
            className = 'notification-wonderful';
            duration = 1500;
        } else if (matchCount === 4) {
            message = '🔥 NICE MOVE! 🔥';
            className = 'notification-nice';
            duration = 1200;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${className}`;
        notification.textContent = message;

        // Position the notification
        if (position) {
            notification.style.position = 'fixed';
            notification.style.left = position.x + 'px';
            notification.style.top = position.y + 'px';
            notification.style.transform = 'translate(-50%, -50%)';
        }

        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after animation completes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    showComboNotification(comboLevel) {
        if (comboLevel < 2) return;

        const messages = [
            '🎯 COMBO x2!',
            '⚡ COMBO x3!',
            '💥 COMBO x4!',
            '🌟 COMBO x5!',
            '🚀 MEGA COMBO!'
        ];

        const message = messages[Math.min(comboLevel - 2, messages.length - 1)];
        const notification = document.createElement('div');
        notification.className = 'notification notification-combo';
        notification.textContent = message;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 1000);
    }

    showScorePopup(score, position) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = '+' + score;

        popup.style.position = 'fixed';
        popup.style.left = position.x + 'px';
        popup.style.top = position.y + 'px';
        popup.style.pointerEvents = 'none';

        this.container.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('float-up');
        }, 10);

        setTimeout(() => {
            popup.remove();
        }, 1500);
    }
}
