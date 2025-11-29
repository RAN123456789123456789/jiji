/**
 * 道具类
 */
import { GameConfig } from '../config/GameConfig.js';

export class Item {
    constructor(id, name, level) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.used = false;
    }

    /**
     * 使用道具
     * @returns {Object} 道具效果配置
     */
    use() {
        if (this.used) {
            return null;
        }

        this.used = true;

        if (this.name === '加速药水') {
            return {
                type: 'speed',
                multiplier: GameConfig.itemEffects.speedPotion.multiplier,
                duration: GameConfig.itemEffects.speedPotion.duration
            };
        } else if (this.name === '弹跳药水') {
            return {
                type: 'jump',
                multiplier: GameConfig.itemEffects.jumpPotion.multiplier,
                duration: GameConfig.itemEffects.jumpPotion.duration
            };
        }

        return null;
    }

    /**
     * 获取图标
     */
    getIcon() {
        return this.name === '加速药水' ? '⚡' : '🦘';
    }
}

