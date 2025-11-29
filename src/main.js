/**
 * 游戏主入口
 * 整合所有模块
 */
import { GameConfig } from './config/GameConfig.js';
import { LevelConfig } from './config/LevelConfig.js';
import { SceneManager } from './core/SceneManager.js';
import { Renderer } from './core/Renderer.js';
import { CameraController } from './core/CameraController.js';
import { ModelManager } from './models/ModelManager.js';
import { ModelLoader } from './models/ModelLoader.js';
import { LevelManager } from './game/LevelManager.js';
import { Character } from './game/Character.js';
import { Inventory } from './game/Inventory.js';
import { CombatSystem } from './game/CombatSystem.js';
import { GameProgress } from './game/GameProgress.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { LevelSelector } from './ui/LevelSelector.js';
import { InventoryUI } from './ui/InventoryUI.js';
import { GameUI } from './ui/GameUI.js';

class Game {
    constructor() {
        // 核心系统
        this.renderer = null;
        this.cameraController = null;
        this.sceneManager = new SceneManager();

        // 游戏系统
        this.levelManager = new LevelManager();
        this.character = null;
        this.inventory = new Inventory();
        this.physicsEngine = null;
        this.combatSystem = new CombatSystem();
        this.gameProgress = new GameProgress();

        // 模型管理
        this.modelManager = new ModelManager();

        // UI系统
        this.levelSelector = null;
        this.inventoryUI = null;
        this.gameUI = new GameUI();

        // 游戏状态
        this.keys = {};
        this.animationId = null;
        this.currentLevel = null;
        this.isRunning = false;
        this.levelCompleted = false; // 防止重复触发完成事件

        // 初始化
        this.init();
    }

    async init() {
        // 初始化模型管理器（可以在这里注册GLTFLoader等）
        // 示例：如果需要加载GLTF模型，可以这样注册
        // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
        // this.modelManager.initialize({
        //     gltf: new GLTFLoader()
        // });

        // 注册默认角色模型（如果存在）
        // this.modelManager.registerModel('character_default', 'assets/models/characters/character.gltf', 'gltf', 'character');

        // 创建角色
        this.character = new Character(this.modelManager);
        await this.character.createModel();

        // 初始化UI
        this.initUI();

        // 设置键盘事件
        this.setupKeyboardControls();

        // 设置鼠标事件
        this.setupMouseControls();

        // 设置窗口大小变化事件
        window.addEventListener('resize', () => this.handleResize());

        // 监听返回主菜单事件
        window.addEventListener('backToMain', () => {
            this.backToMain();
        });
    }

    initUI() {
        // 关卡选择器
        const mainContainer = document.querySelector('.container');
        if (!mainContainer) {
            console.error('找不到 .container 元素');
            return;
        }
        try {
            this.levelSelector = new LevelSelector(mainContainer, (levelNum) => {
                this.startLevel(levelNum);
            });
        } catch (error) {
            console.error('初始化UI失败:', error);
        }

        // 背包UI（稍后在关卡页面创建）
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            this.keys[key] = true;

            // 当游戏运行时，阻止所有可能导致页面滚动的按键
            if (this.isRunning) {
                // 阻止空格键的默认滚动行为
                if (key === ' ' || event.code === 'Space') {
                    event.preventDefault();
                }
                // 阻止方向键的默认滚动行为
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) ||
                    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                    event.preventDefault();
                }
                // 阻止PageUp/PageDown的默认滚动行为
                if (key === 'pageup' || key === 'pagedown' ||
                    event.code === 'PageUp' || event.code === 'PageDown') {
                    event.preventDefault();
                }
                // 阻止Home/End键的默认滚动行为
                if (key === 'home' || key === 'end' ||
                    event.code === 'Home' || event.code === 'End') {
                    event.preventDefault();
                }
            }

            // ESC键退出指针锁定
            if (key === 'escape' && this.cameraController && this.cameraController.isPointerLocked) {
                this.cameraController.exitPointerLock();
            }

            // B键打开/关闭背包
            if (key === 'b' && this.inventoryUI) {
                const isOpen = this.inventoryUI.toggle();
                if (this.cameraController) {
                    this.cameraController.setInventoryOpen(isOpen);
                }
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }

    setupMouseControls() {
        let isMouseDown = false;

        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // 左键
                isMouseDown = true;
                if (this.isRunning && this.cameraController && this.cameraController.isPointerLocked) {
                    this.performAttack();
                }
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // 左键
                isMouseDown = false;
            }
        });
    }

    performAttack() {
        if (!this.character || !this.cameraController || !this.combatSystem) return;

        const characterPosition = this.character.getPosition();

        // 使用相机控制器的方法获取前方向
        const direction = this.cameraController.getForwardDirection();

        // 获取所有活着的怪兽
        const monsters = this.levelManager.getAliveMonsters();
        if (monsters.length === 0) return;

        // 执行攻击
        const hitMonsters = this.combatSystem.attack(characterPosition, direction, monsters);

        // 对击中的怪兽造成伤害
        for (const monster of hitMonsters) {
            const isDead = this.combatSystem.damageMonster(monster);
            if (isDead) {
                console.log(`怪兽 ${monster.id} 被击败！`);
            } else {
                console.log(`怪兽 ${monster.id} 受到 ${this.combatSystem.attackDamage} 点伤害，剩余血量：${monster.currentHealth}`);
            }
        }

        // 更新UI显示
        if (this.gameUI && hitMonsters.length > 0) {
            this.gameUI.showAttackFeedback(hitMonsters.length);
        }
    }

    checkLevelComplete() {
        if (!this.currentLevel || this.levelCompleted) return;

        // 检查是否所有怪兽都被击败
        const aliveMonsters = this.levelManager.getAliveMonsters();
        if (aliveMonsters.length === 0 && this.levelManager.monsters.length > 0) {
            // 所有怪兽都被击败，关卡完成
            this.levelCompleted = true;
            this.onLevelComplete();
        }
    }

    onLevelComplete() {
        if (!this.currentLevel) return;

        // 停止游戏循环
        this.isRunning = false;

        // 标记关卡完成
        this.gameProgress.completeLevel(this.currentLevel);

        // 显示胜利UI
        if (this.gameUI) {
            this.gameUI.showVictory(this.currentLevel);
        }

        // 更新关卡选择器状态
        if (this.levelSelector) {
            this.levelSelector.updateLevelStatus();
        }
    }

    async startLevel(levelNum) {
        // 隐藏主界面
        this.levelSelector.hide();

        // 清理之前的关卡
        this.cleanupLevel();

        // 创建关卡页面
        const levelPage = this.gameUI.createLevelPage(levelNum);
        document.body.appendChild(levelPage);

        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 100));

        // 加载关卡
        const container = document.getElementById('scene3d');
        if (!container) {
            console.error('找不到场景容器');
            return;
        }

        // 创建渲染器
        this.renderer = new Renderer(container);

        // 创建相机控制器
        this.cameraController = new CameraController(container);
        const canvas = this.renderer.getDomElement();
        if (canvas) {
            this.cameraController.setCanvas(canvas);
            // 设置canvas后初始化鼠标锁定
            this.cameraController.setupPointerLock();
        }

        // 加载关卡
        const { scene, collisionDetector, treasure, monsters, levelConfig } = await this.levelManager.loadLevel(levelNum);

        // 添加角色到场景
        const characterModel = this.character.group;
        if (characterModel) {
            scene.add(characterModel);
        }

        // 创建物理引擎
        this.physicsEngine = new PhysicsEngine(collisionDetector);

        // 创建背包UI
        const levelContent = document.querySelector('.level-content');
        const inventoryContainer = document.createElement('div');
        inventoryContainer.id = 'inventory';
        inventoryContainer.className = 'inventory';
        inventoryContainer.style.display = 'none';
        levelContent.appendChild(inventoryContainer);

        this.inventoryUI = new InventoryUI(
            inventoryContainer,
            this.inventory,
            (index) => this.useItem(index),
            (index) => this.deleteItem(index)
        );

        // 重置角色状态
        this.character.reset();
        this.character.setPosition(new THREE.Vector3(0, 1.5, 0));

        // 设置返回按钮事件
        const backButton = levelPage.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.backToMain();
            });
        }

        this.currentLevel = levelNum;
        this.isRunning = true;
        this.levelCompleted = false; // 重置完成标志

        // 防止页面滚动
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // 开始游戏循环
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.gameLoop());

        if (!this.character || !this.cameraController || !this.renderer) return;

        // 更新关卡（宝藏动画等）
        this.levelManager.update();

        // 处理移动
        this.handleMovement();

        // 更新相机
        const characterPosition = this.character.getPosition();
        this.cameraController.update(characterPosition);

        // 检查宝藏收集
        this.checkTreasureCollection();

        // 检查是否所有怪兽都被击败
        this.checkLevelComplete();

        // 渲染场景
        const scene = this.levelManager.sceneManager.getScene();
        if (scene) {
            this.renderer.render(scene, this.cameraController.camera);
        }
    }

    handleMovement() {
        if (!this.character || !this.cameraController || !this.physicsEngine) return;

        // 使用相机控制器的方法获取方向向量
        const direction = this.cameraController.getForwardDirection();
        const right = this.cameraController.getRightDirection();

        // 更新物理引擎
        const newPosition = this.physicsEngine.update(
            this.character.group,
            this.keys,
            direction,
            right,
            this.character.moveSpeed,
            this.character.jumpPower
        );

        this.character.setPosition(newPosition);
    }

    checkTreasureCollection() {
        const treasure = this.levelManager.treasure;
        if (!treasure || treasure.collected) return;

        const characterPosition = this.character.getPosition();
        const isInRange = treasure.isInRange(characterPosition, 3);

        // 显示/隐藏提示
        this.gameUI.showTreasureHint(isInRange);

        // 按住F收集
        if (isInRange && this.keys['f']) {
            const item = this.levelManager.collectTreasure(this.inventory);
            if (item) {
                this.gameUI.showTreasureHint(false);
                if (this.inventoryUI) {
                    this.inventoryUI.update();
                }
            } else if (this.inventory.isFull()) {
                this.gameUI.showInventoryFullHint();
            }
        }
    }

    useItem(index) {
        const effect = this.inventory.useItem(index);
        if (effect) {
            this.character.applyEffect(effect);
            if (this.inventoryUI) {
                this.inventoryUI.update();
            }
        }
    }

    deleteItem(index) {
        this.inventory.removeItem(index);
        if (this.inventoryUI) {
            this.inventoryUI.update();
        }
    }

    handleResize() {
        if (this.renderer) {
            this.renderer.updateSize();
        }
        if (this.cameraController) {
            this.cameraController.updateAspect();
        }
    }

    cleanupLevel() {
        this.isRunning = false;
        this.levelCompleted = false; // 重置完成标志

        // 恢复页面滚动
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.cameraController) {
            this.cameraController.dispose();
            this.cameraController = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        if (this.levelManager) {
            this.levelManager.dispose();
        }

        if (this.character) {
            this.character.clearEffects();
        }

        if (this.physicsEngine) {
            this.physicsEngine.reset();
            this.physicsEngine = null;
        }

        if (this.inventoryUI) {
            this.inventoryUI.dispose();
            this.inventoryUI = null;
        }

        this.gameUI.dispose();
        this.keys = {};
    }

    backToMain() {
        this.cleanupLevel();

        // 关闭胜利界面
        if (this.gameUI) {
            this.gameUI.closeVictory();
        }

        // 移除关卡页面
        const levelPage = document.querySelector('.level-page');
        if (levelPage) {
            levelPage.remove();
        }

        // 更新关卡选择器状态（显示新解锁的关卡）
        if (this.levelSelector) {
            this.levelSelector.updateLevelStatus();
        }

        // 显示主界面
        this.levelSelector.show();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化游戏...');
        window.game = new Game();
        console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化失败:', error);
        // 显示错误信息给用户
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: red;">
                    <h1>游戏加载失败</h1>
                    <p>错误信息: ${error.message}</p>
                    <p>请检查浏览器控制台获取更多信息</p>
                    <p style="margin-top: 20px; color: #666;">
                        提示：如果使用ES6模块，请使用本地服务器运行项目<br>
                        Python: python -m http.server 8000<br>
                        Node.js: npx http-server
                    </p>
                </div>
            `;
        }
    }
});

