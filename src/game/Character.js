/**
 * 角色类
 */
import { GameConfig } from '../config/GameConfig.js';
import { ModelManager } from '../models/ModelManager.js';

export class Character {
    constructor(modelManager = null) {
        this.modelManager = modelManager;
        this.group = null;
        this.position = new THREE.Vector3(0, 1.5, 0);
        this.moveSpeed = GameConfig.character.baseMoveSpeed;
        this.jumpPower = GameConfig.character.baseJumpPower;
        this.activeEffects = {};
        this.effectTimers = {};
    }

    /**
     * 创建角色模型
     * @returns {THREE.Group}
     */
    async createModel() {
        // 如果模型管理器存在且注册了角色模型，则加载
        if (this.modelManager) {
            try {
                const model = await this.modelManager.getModel('character_default');
                this.group = model;
                this.group.position.copy(this.position);
                this.group.visible = false; // 第一人称视角中隐藏
                return this.group;
            } catch (error) {
                console.warn('加载角色模型失败，使用默认模型:', error);
            }
        }

        // 使用默认的简单几何体模型
        return this.createDefaultModel();
    }

    /**
     * 创建默认角色模型（简易几何体）
     */
    createDefaultModel() {
        const characterGroup = new THREE.Group();

        // 身体（圆柱体）
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        characterGroup.add(body);

        // 头部（球体）
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        characterGroup.add(head);

        // 紫色长发
        const hairColor = 0x8b4c9f;
        const hairMaterial = new THREE.MeshPhongMaterial({ color: hairColor });

        for (let i = 0; i < 3; i++) {
            const hairGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.set(-0.3 - i * 0.1, 0.9 - i * 0.2, 0);
            hair.rotation.z = -0.3;
            characterGroup.add(hair);
        }

        for (let i = 0; i < 3; i++) {
            const hairGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.set(0.3 + i * 0.1, 0.9 - i * 0.2, 0);
            hair.rotation.z = 0.3;
            characterGroup.add(hair);
        }

        const backHairGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.9, 8);
        const backHair = new THREE.Mesh(backHairGeometry, hairMaterial);
        backHair.position.set(0, 0.85, -0.2);
        characterGroup.add(backHair);

        // 金丝眼镜
        const glassesColor = 0xffd700;
        const glassesMaterial = new THREE.MeshPhongMaterial({ color: glassesColor });

        const leftLensGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
        const leftLens = new THREE.Mesh(leftLensGeometry, glassesMaterial);
        leftLens.position.set(-0.15, 1.05, 0.35);
        leftLens.rotation.x = Math.PI / 2;
        characterGroup.add(leftLens);

        const rightLensGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
        const rightLens = new THREE.Mesh(rightLensGeometry, glassesMaterial);
        rightLens.position.set(0.15, 1.05, 0.35);
        rightLens.rotation.x = Math.PI / 2;
        characterGroup.add(rightLens);

        const bridgeGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.02);
        const bridge = new THREE.Mesh(bridgeGeometry, glassesMaterial);
        bridge.position.set(0, 1.05, 0.35);
        characterGroup.add(bridge);

        const legGeometry = new THREE.BoxGeometry(0.15, 0.02, 0.02);
        const leftLeg = new THREE.Mesh(legGeometry, glassesMaterial);
        leftLeg.position.set(-0.25, 1.05, 0.3);
        leftLeg.rotation.z = -0.3;
        characterGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, glassesMaterial);
        rightLeg.position.set(0.25, 1.05, 0.3);
        rightLeg.rotation.z = 0.3;
        characterGroup.add(rightLeg);

        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.05, 0.38);
        characterGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.05, 0.38);
        characterGroup.add(rightEye);

        // 腿部
        const legGeometry2 = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
        const leftLeg2 = new THREE.Mesh(legGeometry2, legMaterial);
        leftLeg2.position.set(-0.15, -0.3, 0);
        characterGroup.add(leftLeg2);

        const rightLeg2 = new THREE.Mesh(legGeometry2, legMaterial);
        rightLeg2.position.set(0.15, -0.3, 0);
        characterGroup.add(rightLeg2);

        // 脚
        const footGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
        const footMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.15, -0.65, 0.1);
        characterGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.15, -0.65, 0.1);
        characterGroup.add(rightFoot);

        this.group = characterGroup;
        this.group.position.copy(this.position);
        this.group.visible = false; // 第一人称视角中隐藏

        return characterGroup;
    }

    /**
     * 应用道具效果
     * @param {Object} effect 
     */
    applyEffect(effect) {
        if (!effect) return;

        if (effect.type === 'speed') {
            // 清除旧的定时器
            if (this.effectTimers.speed) {
                clearTimeout(this.effectTimers.speed);
            }

            this.moveSpeed = GameConfig.character.baseMoveSpeed * effect.multiplier;
            this.activeEffects.speed = true;

            this.effectTimers.speed = setTimeout(() => {
                this.moveSpeed = GameConfig.character.baseMoveSpeed;
                this.activeEffects.speed = false;
                this.effectTimers.speed = null;
            }, effect.duration);

        } else if (effect.type === 'jump') {
            // 清除旧的定时器
            if (this.effectTimers.jump) {
                clearTimeout(this.effectTimers.jump);
            }

            this.jumpPower = GameConfig.character.baseJumpPower * effect.multiplier;
            this.activeEffects.jump = true;

            this.effectTimers.jump = setTimeout(() => {
                this.jumpPower = GameConfig.character.baseJumpPower;
                this.activeEffects.jump = false;
                this.effectTimers.jump = null;
            }, effect.duration);
        }
    }

    /**
     * 清除所有效果
     */
    clearEffects() {
        for (const timer of Object.values(this.effectTimers)) {
            if (timer) {
                clearTimeout(timer);
            }
        }
        this.activeEffects = {};
        this.effectTimers = {};
        this.moveSpeed = GameConfig.character.baseMoveSpeed;
        this.jumpPower = GameConfig.character.baseJumpPower;
    }

    /**
     * 获取位置
     */
    getPosition() {
        return this.position.clone();
    }

    /**
     * 设置位置
     */
    setPosition(position) {
        this.position.copy(position);
        if (this.group) {
            this.group.position.copy(position);
        }
    }

    /**
     * 重置角色状态
     */
    reset() {
        this.position.set(0, 1.5, 0);
        this.moveSpeed = GameConfig.character.baseMoveSpeed;
        this.jumpPower = GameConfig.character.baseJumpPower;
        this.clearEffects();
    }

    /**
     * 清理资源
     */
    dispose() {
        this.clearEffects();
        if (this.group) {
            this.group.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            this.group = null;
        }
    }
}

