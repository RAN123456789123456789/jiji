/**
 * 游戏UI管理器
 */
import { LevelConfig } from '../config/LevelConfig.js';

export class GameUI {
    constructor() {
        this.levelPage = null;
        this.treasureHint = null;
        this.attackFeedback = null;
        this.victoryModal = null;
    }

    /**
     * 创建关卡页面
     * @param {number} levelNum 
     * @returns {HTMLElement}
     */
    createLevelPage(levelNum) {
        const levelConfig = LevelConfig[levelNum];
        if (!levelConfig) {
            throw new Error(`关卡 ${levelNum} 不存在`);
        }

        const levelPage = document.createElement('div');
        levelPage.className = `level-page active level-${this.getLevelClass(levelNum)}`;
        levelPage.innerHTML = `
            <div class="level-header">
                <h1>${levelConfig.icon} 第${levelNum}关：${levelConfig.name}</h1>
            </div>
            <div class="level-content">
                <div class="scene-container">
                    <div id="scene3d"></div>
                    <div class="controls-hint">
                        <p>点击场景开始游戏 | WASD移动 | 鼠标控制视角 | 空格跳跃 | 左键攻击 | B打开背包 | ESC退出</p>
                    </div>
                </div>
                <div class="character-info">
                    <div class="character-name">吉吉</div>
                </div>
                <div class="level-description">
                    ${levelConfig.description}
                </div>
                <button class="back-button">返回主界面</button>
            </div>
        `;

        this.levelPage = levelPage;
        return levelPage;
    }

    /**
     * 显示宝藏提示
     * @param {boolean} show 
     * @param {string} message 
     */
    showTreasureHint(show, message = '按住 F 收集宝藏') {
        if (show) {
            if (!this.treasureHint) {
                this.treasureHint = document.createElement('div');
                this.treasureHint.id = 'treasure-hint';
                this.treasureHint.className = 'treasure-hint';
                const sceneContainer = document.querySelector('.scene-container');
                if (sceneContainer) {
                    sceneContainer.appendChild(this.treasureHint);
                }
            }
            this.treasureHint.textContent = message;
            this.treasureHint.style.display = 'block';
        } else {
            if (this.treasureHint) {
                this.treasureHint.style.display = 'none';
            }
        }
    }

    /**
     * 显示背包已满提示
     */
    showInventoryFullHint() {
        this.showTreasureHint(true, '背包已满！');
        if (this.treasureHint) {
            this.treasureHint.style.background = 'rgba(255, 0, 0, 0.9)';
            setTimeout(() => {
                this.showTreasureHint(false);
                if (this.treasureHint) {
                    this.treasureHint.style.background = '';
                }
            }, 2000);
        }
    }

    /**
     * 获取关卡CSS类名
     */
    getLevelClass(levelNum) {
        const classMap = {
            1: 'city',
            2: 'forest',
            3: 'desert',
            4: 'glacier',
            5: 'mountain',
            6: 'hell'
        };
        return classMap[levelNum] || 'city';
    }

    /**
     * 显示攻击反馈
     */
    showAttackFeedback(hitCount) {
        if (!this.attackFeedback) {
            this.attackFeedback = document.createElement('div');
            this.attackFeedback.id = 'attack-feedback';
            this.attackFeedback.className = 'attack-feedback';
            const sceneContainer = document.querySelector('.scene-container');
            if (sceneContainer) {
                sceneContainer.appendChild(this.attackFeedback);
            }
        }

        this.attackFeedback.textContent = `命中 ${hitCount} 个目标！`;
        this.attackFeedback.style.display = 'block';
        this.attackFeedback.style.opacity = '1';

        // 淡出效果
        setTimeout(() => {
            if (this.attackFeedback) {
                this.attackFeedback.style.transition = 'opacity 0.5s';
                this.attackFeedback.style.opacity = '0';
                setTimeout(() => {
                    if (this.attackFeedback) {
                        this.attackFeedback.style.display = 'none';
                    }
                }, 500);
            }
        }, 1000);
    }

    /**
     * 显示胜利界面
     * @param {number} levelNum 
     */
    showVictory(levelNum) {
        // 如果已经显示，不重复显示
        if (this.victoryModal) return;

        const nextLevel = levelNum + 1;
        const hasNextLevel = nextLevel <= 6;

        this.victoryModal = document.createElement('div');
        this.victoryModal.className = 'victory-modal';
        this.victoryModal.innerHTML = `
            <div class="victory-content">
                <h1>🎉 恭喜通关！</h1>
                <p class="victory-message">你成功完成了第${levelNum}关！</p>
                ${hasNextLevel ? `<p class="unlock-message">第${nextLevel}关已解锁！</p>` : '<p class="unlock-message">恭喜完成所有关卡！</p>'}
                <div class="victory-buttons">
                    <button class="victory-button" id="continue-btn">继续游戏</button>
                    <button class="victory-button" id="back-to-menu-btn">返回主菜单</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.victoryModal);

        // 绑定按钮事件
        const continueBtn = this.victoryModal.querySelector('#continue-btn');
        const backBtn = this.victoryModal.querySelector('#back-to-menu-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.closeVictory();
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.closeVictory();
                // 触发返回主菜单事件
                const event = new CustomEvent('backToMain');
                window.dispatchEvent(event);
            });
        }
    }

    closeVictory() {
        if (this.victoryModal) {
            this.victoryModal.remove();
            this.victoryModal = null;
        }
    }

    /**
     * 清理UI
     */
    dispose() {
        if (this.treasureHint) {
            this.treasureHint.remove();
            this.treasureHint = null;
        }
        if (this.attackFeedback) {
            this.attackFeedback.remove();
            this.attackFeedback = null;
        }
        if (this.victoryModal) {
            this.victoryModal.remove();
            this.victoryModal = null;
        }
        if (this.levelPage) {
            this.levelPage.remove();
            this.levelPage = null;
        }
    }
}

