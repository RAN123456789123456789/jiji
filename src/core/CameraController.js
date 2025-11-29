/**
 * 相机控制器
 * 管理第一人称视角相机
 */
import { GameConfig } from '../config/GameConfig.js';

export class CameraController {
    constructor(container) {
        this.container = container;
        this.camera = null;
        this.yRotation = 0; // Y轴旋转角度（弧度），允许无限旋转
        this.isPointerLocked = false;
        this.isInventoryOpen = false;
        this.init();
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(
            GameConfig.camera.fov,
            this.container.clientWidth / this.container.clientHeight,
            GameConfig.camera.near,
            GameConfig.camera.far
        );
        // setupPointerLock 将在canvas设置后调用
    }

    /**
     * 设置鼠标锁定
     */
    setupPointerLock() {
        const canvas = this.canvas || this.getCanvas();
        if (!canvas) return;

        // 点击场景时锁定鼠标
        const clickHandler = () => {
            const requestPointerLock = canvas.requestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;

            if (requestPointerLock) {
                requestPointerLock.call(canvas);
            }
        };

        canvas.addEventListener('click', clickHandler);

        // 监听指针锁定状态变化
        const pointerlockchange = () => {
            this.isPointerLocked = document.pointerLockElement === canvas ||
                document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas;
        };

        document.addEventListener('pointerlockchange', pointerlockchange);
        document.addEventListener('mozpointerlockchange', pointerlockchange);
        document.addEventListener('webkitpointerlockchange', pointerlockchange);

        // 鼠标移动控制视角（只允许左右旋转，不允许上下倾斜）
        const onMouseMove = (event) => {
            if (!this.isPointerLocked || !this.camera || this.isInventoryOpen) return;

            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            // 忽略movementY，不允许上下倾斜

            // 直接累加Y轴旋转角度，允许无限旋转
            // 不进行任何限制或模运算，让角度可以无限累加
            this.yRotation -= movementX * GameConfig.camera.mouseSensitivity;
        };

        document.addEventListener('mousemove', onMouseMove);
    }

    /**
     * 更新相机位置和旋转
     * @param {THREE.Vector3} position - 角色位置
     */
    update(position) {
        if (!this.camera) return;

        // 相机跟随角色位置
        this.camera.position.x = position.x;
        this.camera.position.z = position.z;
        this.camera.position.y = position.y + GameConfig.character.eyeHeight;

        // 使用四元数直接设置Y轴旋转，避免欧拉角转换问题
        // 每次更新都重新设置，确保旋转平滑连续
        this.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yRotation);
    }

    /**
     * 获取前方向向量（用于移动计算）
     * @returns {THREE.Vector3}
     */
    getForwardDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        direction.y = 0; // 保持水平
        direction.normalize();
        return direction;
    }

    /**
     * 获取右方向向量（用于移动计算）
     * @returns {THREE.Vector3}
     */
    getRightDirection() {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.camera.quaternion);
        right.y = 0; // 保持水平
        right.normalize();
        return right;
    }

    /**
     * 更新相机宽高比
     */
    updateAspect() {
        if (this.camera && this.container) {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * 设置背包打开状态
     */
    setInventoryOpen(isOpen) {
        this.isInventoryOpen = isOpen;
        if (isOpen && this.isPointerLocked && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    /**
     * 退出指针锁定
     */
    exitPointerLock() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    /**
     * 获取画布元素
     */
    getCanvas() {
        // 需要从渲染器获取，这里返回null，由外部设置
        return null;
    }

    /**
     * 设置画布元素
     */
    setCanvas(canvas) {
        this.canvas = canvas;
    }

    /**
     * 清理资源
     */
    dispose() {
        this.exitPointerLock();
        this.camera = null;
    }
}

