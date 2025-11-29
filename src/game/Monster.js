/**
 * 小怪兽类
 */
export class Monster {
    constructor(id, position, modelManager = null) {
        this.id = id;
        this.position = position;
        this.modelManager = modelManager;
        this.group = null;
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.isAlive = true;
        this.mesh = null;
        this.healthBar = null;
    }

    /**
     * 创建怪兽模型
     * @returns {THREE.Group}
     */
    async createModel() {
        // 如果模型管理器存在且注册了怪兽模型，则加载
        if (this.modelManager) {
            try {
                const model = await this.modelManager.getModel('monster_default');
                this.group = model;
                this.group.position.copy(this.position);
                return this.group;
            } catch (error) {
                console.warn('加载怪兽模型失败，使用默认模型:', error);
            }
        }

        // 使用默认的简单几何体模型
        return this.createDefaultModel();
    }

    /**
     * 创建默认怪兽模型（简易几何体）
     */
    createDefaultModel() {
        const monsterGroup = new THREE.Group();

        // 身体（立方体，红色）
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        monsterGroup.add(body);
        this.mesh = body;

        // 头部（球体，深红色）
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.9;
        monsterGroup.add(head);

        // 眼睛（黑色小球）
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 0.95, 0.25);
        monsterGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 0.95, 0.25);
        monsterGroup.add(rightEye);

        // 腿部
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.2, 0);
        monsterGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, -0.2, 0);
        monsterGroup.add(rightLeg);

        // 手臂
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const leftArm = new THREE.Mesh(armGeometry, legMaterial);
        leftArm.position.set(-0.35, 0.3, 0);
        leftArm.rotation.z = Math.PI / 6;
        monsterGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, legMaterial);
        rightArm.position.set(0.35, 0.3, 0);
        rightArm.rotation.z = -Math.PI / 6;
        monsterGroup.add(rightArm);

        // 创建血量条
        this.createHealthBar(monsterGroup);

        this.group = monsterGroup;
        this.group.position.copy(this.position);

        return monsterGroup;
    }

    /**
     * 创建血量条
     */
    createHealthBar(group) {
        const healthBarGroup = new THREE.Group();

        // 背景条（灰色）
        const bgGeometry = new THREE.PlaneGeometry(0.8, 0.1);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const bg = new THREE.Mesh(bgGeometry, bgMaterial);
        bg.position.y = 1.2;
        healthBarGroup.add(bg);

        // 血量条（绿色）
        const healthGeometry = new THREE.PlaneGeometry(0.76, 0.08);
        const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        healthBar.position.set(0, 1.2, 0.01);
        healthBarGroup.add(healthBar);

        this.healthBar = healthBar;
        this.healthBarGroup = healthBarGroup;
        group.add(healthBarGroup);
    }

    /**
     * 更新血量条
     */
    updateHealthBar() {
        if (!this.healthBar) return;

        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBar.scale.x = healthPercent;

        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.material.color.setHex(0x00ff00); // 绿色
        } else if (healthPercent > 0.3) {
            this.healthBar.material.color.setHex(0xffff00); // 黄色
        } else {
            this.healthBar.material.color.setHex(0xff0000); // 红色
        }
    }

    /**
     * 受到伤害
     * @param {number} damage 
     */
    takeDamage(damage) {
        if (!this.isAlive) return false;

        this.currentHealth = Math.max(0, this.currentHealth - damage);
        this.updateHealthBar();

        if (this.currentHealth <= 0) {
            this.die();
            return true; // 返回true表示已死亡
        }

        return false; // 返回false表示还活着
    }

    /**
     * 死亡
     */
    die() {
        this.isAlive = false;
        this.currentHealth = 0;
        if (this.group) {
            this.group.visible = false;
        }
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
     * 清理资源
     */
    dispose() {
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
        this.healthBar = null;
        this.healthBarGroup = null;
    }
}

