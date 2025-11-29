/**
 * 关卡管理器
 */
import { LevelConfig } from '../config/LevelConfig.js';
import { SceneManager } from '../core/SceneManager.js';
import { Treasure } from './Treasure.js';
import { Item } from './Item.js';
import { CollisionDetector } from '../physics/CollisionDetector.js';
import { Monster } from './Monster.js';

export class LevelManager {
    constructor() {
        this.sceneManager = new SceneManager();
        this.currentLevel = null;
        this.treasure = null;
        this.collisionDetector = null;
        this.monsters = []; // 怪兽列表
    }

    /**
     * 加载关卡
     * @param {number} levelNum 
     * @returns {Promise<Object>} {scene, collisionDetector, treasure, monsters, levelConfig}
     */
    async loadLevel(levelNum) {
        const levelConfig = LevelConfig[levelNum];
        if (!levelConfig) {
            throw new Error(`关卡 ${levelNum} 不存在`);
        }

        this.currentLevel = levelNum;

        // 创建场景
        const scene = this.sceneManager.createScene(levelNum);

        // 创建碰撞检测器
        const collidableObjects = this.sceneManager.getCollidableObjects();
        this.collisionDetector = new CollisionDetector(collidableObjects);

        // 创建宝藏
        const treasurePosition = this.findValidTreasurePosition(collidableObjects);
        this.treasure = new Treasure(levelNum, treasurePosition);
        const { treasure, star } = this.treasure.createMesh();
        scene.add(treasure);
        scene.add(star);

        // 创建怪兽（等待完成）
        await this.createMonsters(scene, collidableObjects, levelNum);

        return {
            scene,
            collisionDetector: this.collisionDetector,
            treasure: this.treasure,
            monsters: this.monsters,
            levelConfig
        };
    }

    /**
     * 创建怪兽
     */
    async createMonsters(scene, collidableObjects, levelNum) {
        this.monsters = [];
        const monsterCount = 5; // 每个关卡5只怪兽

        for (let i = 0; i < monsterCount; i++) {
            const position = this.findValidMonsterPosition(collidableObjects);
            const monster = new Monster(`monster_${levelNum}_${i}`, position);
            const monsterModel = await monster.createModel();
            scene.add(monsterModel);
            this.monsters.push(monster);
        }
    }

    /**
     * 查找有效的怪兽位置
     */
    findValidMonsterPosition(collidableObjects) {
        let position;
        let validPosition = false;
        let attempts = 0;
        const tempDetector = new CollisionDetector(collidableObjects);

        while (!validPosition && attempts < 50) {
            position = new THREE.Vector3(
                -35 + Math.random() * 70,
                0.5,
                -35 + Math.random() * 70
            );

            validPosition = tempDetector.isValidPosition(position, 0.6);
            attempts++;
        }

        return position || new THREE.Vector3(10, 0.5, 10);
    }

    /**
     * 查找有效的宝藏位置
     */
    findValidTreasurePosition(collidableObjects) {
        let position;
        let validPosition = false;
        let attempts = 0;
        const tempDetector = new CollisionDetector(collidableObjects);

        while (!validPosition && attempts < 50) {
            position = new THREE.Vector3(
                -40 + Math.random() * 80,
                0.5,
                -40 + Math.random() * 80
            );

            validPosition = tempDetector.isValidPosition(position, 0.5);
            attempts++;
        }

        return position || new THREE.Vector3(0, 0.5, 0);
    }

    /**
     * 收集宝藏并生成道具
     * @param {Inventory} inventory 
     * @returns {Item|null}
     */
    collectTreasure(inventory) {
        if (!this.treasure || this.treasure.collected) {
            return null;
        }

        if (inventory.isFull()) {
            return null;
        }

        this.treasure.collect();

        // 随机生成道具类型
        const itemTypes = ['加速药水', '弹跳药水'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

        const item = new Item(Date.now(), itemType, this.currentLevel);
        inventory.addItem(item);

        return item;
    }

    /**
     * 更新关卡（更新宝藏动画等）
     */
    update() {
        if (this.treasure) {
            this.treasure.updateStar();
        }
    }

    /**
     * 获取所有活着的怪兽
     */
    getAliveMonsters() {
        return this.monsters.filter(monster => monster.isAlive);
    }

    /**
     * 清理关卡
     */
    dispose() {
        if (this.treasure) {
            this.treasure.dispose();
            this.treasure = null;
        }

        // 清理所有怪兽
        for (const monster of this.monsters) {
            monster.dispose();
        }
        this.monsters = [];

        this.sceneManager.dispose();
        this.collisionDetector = null;
        this.currentLevel = null;
    }
}

