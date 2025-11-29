/**
 * 物理引擎
 * 处理重力、移动等物理效果
 */
import { GameConfig } from '../config/GameConfig.js';
import { CollisionDetector } from './CollisionDetector.js';

export class PhysicsEngine {
    constructor(collisionDetector) {
        this.collisionDetector = collisionDetector;
        this.isGrounded = true;
        this.verticalVelocity = 0;
    }

    /**
     * 更新物理状态
     * @param {THREE.Object3D} character - 角色对象
     * @param {Object} keys - 键盘状态
     * @param {THREE.Vector3} direction - 移动方向（前方向）
     * @param {THREE.Vector3} right - 右方向
     * @param {number} moveSpeed - 移动速度
     * @param {number} jumpPower - 跳跃力度
     * @returns {THREE.Vector3} 新位置
     */
    update(character, keys, direction, right, moveSpeed, jumpPower) {
        // 处理重力
        if (!this.isGrounded) {
            this.verticalVelocity += GameConfig.character.gravity;
            character.position.y += this.verticalVelocity;

            // 检查是否落地
            if (character.position.y <= 1.5) {
                character.position.y = 1.5;
                this.verticalVelocity = 0;
                this.isGrounded = true;
            }
        }

        // 空格键跳跃
        if (keys[' '] && this.isGrounded) {
            this.verticalVelocity = jumpPower;
            this.isGrounded = false;
        }

        // 计算移动
        const velocity = new THREE.Vector3(0, 0, 0);

        // W - 前进
        if (keys['w']) {
            velocity.add(direction.clone().multiplyScalar(moveSpeed));
        }
        // S - 后退
        if (keys['s']) {
            velocity.add(direction.clone().multiplyScalar(-moveSpeed));
        }
        // A - 左移
        if (keys['a']) {
            velocity.add(right.clone().multiplyScalar(-moveSpeed));
        }
        // D - 右移
        if (keys['d']) {
            velocity.add(right.clone().multiplyScalar(moveSpeed));
        }

        // 尝试移动X轴
        const newX = character.position.x + velocity.x;
        const testPosX = new THREE.Vector3(newX, character.position.y, character.position.z);
        if (!this.collisionDetector.checkCollision(testPosX)) {
            character.position.x = newX;
        }

        // 尝试移动Z轴
        const newZ = character.position.z + velocity.z;
        const testPosZ = new THREE.Vector3(character.position.x, character.position.y, newZ);
        if (!this.collisionDetector.checkCollision(testPosZ)) {
            character.position.z = newZ;
        }

        // 限制移动范围
        character.position.x = Math.max(
            -GameConfig.scene.boundary,
            Math.min(GameConfig.scene.boundary, character.position.x)
        );
        character.position.z = Math.max(
            -GameConfig.scene.boundary,
            Math.min(GameConfig.scene.boundary, character.position.z)
        );

        return character.position.clone();
    }

    /**
     * 重置物理状态
     */
    reset() {
        this.isGrounded = true;
        this.verticalVelocity = 0;
    }
}

