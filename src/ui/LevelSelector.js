/**
 * 关卡选择器UI
 */
import { LevelConfig } from '../config/LevelConfig.js';
import { GameProgress } from '../game/GameProgress.js';

export class LevelSelector {
    constructor(container, onLevelSelect) {
        this.container = container;
        this.onLevelSelect = onLevelSelect;
        this.gameProgress = new GameProgress();
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('LevelSelector: container 未找到');
            return;
        }
        try {
            this.render();
            this.attachEvents();
        } catch (error) {
            console.error('LevelSelector 初始化失败:', error);
        }
    }

    render() {
        const levelCards = Object.entries(LevelConfig).map(([num, config]) => {
            const levelNum = parseInt(num);
            const isUnlocked = this.gameProgress.isLevelUnlocked(levelNum);
            const isCompleted = this.gameProgress.isLevelCompleted(levelNum);
            const lockedClass = isUnlocked ? '' : 'locked';
            const completedClass = isCompleted ? 'completed' : '';

            return `
                <div class="level-card ${lockedClass} ${completedClass}" data-level="${num}" ${!isUnlocked ? 'data-locked="true"' : ''}>
                    ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
                    ${isCompleted ? '<div class="completed-badge">✓</div>' : ''}
                    <div class="level-icon">${config.icon}</div>
                    <h2>第${num}关：${config.name}</h2>
                    <p>${isUnlocked ? this.getDescription(num) : '需要完成上一关才能解锁'}</p>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            <header>
                <h1>吉吉的冒险之旅</h1>
                <p class="subtitle">选择关卡，开始你的冒险！</p>
            </header>
            <main class="level-selection">
                ${levelCards}
            </main>
        `;
    }

    getDescription(levelNum) {
        const descriptions = {
            1: '在繁华的都市中寻找线索，小心隐藏的危险',
            2: '深入神秘的森林，探索未知的秘密',
            3: '穿越炎热的沙漠，寻找珍贵的宝藏',
            4: '在冰冷的冰川中前行，克服严寒的考验',
            5: '攀登陡峭的山峰，挑战极限',
            6: '面对最终的挑战，战胜邪恶的力量'
        };
        return descriptions[levelNum] || '';
    }

    attachEvents() {
        const levelCards = this.container.querySelectorAll('.level-card');
        levelCards.forEach(card => {
            card.addEventListener('click', () => {
                const isLocked = card.getAttribute('data-locked') === 'true';
                if (isLocked) {
                    // 显示提示
                    this.showLockedMessage();
                    return;
                }
                const levelNum = parseInt(card.getAttribute('data-level'));
                this.onLevelSelect(levelNum);
            });
        });
    }

    showLockedMessage() {
        // 创建临时提示
        const message = document.createElement('div');
        message.className = 'lock-message';
        message.textContent = '该关卡尚未解锁！请先完成上一关。';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 1.2em;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    /**
     * 更新关卡状态（当关卡完成时调用）
     */
    updateLevelStatus() {
        this.render();
        this.attachEvents();
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }
}

