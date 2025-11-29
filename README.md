# 吉吉的冒险之旅

一个基于Three.js的3D冒险游戏，采用模块化架构设计，具有高可复用性和可维护性。

## 项目结构

```
老吉游戏/
├── assets/
│   └── models/              # 模型资源目录
│       ├── characters/      # 角色模型
│       ├── items/          # 道具模型
│       └── environments/   # 环境模型
├── src/
│   ├── config/             # 配置模块
│   │   ├── GameConfig.js   # 游戏全局配置
│   │   └── LevelConfig.js  # 关卡配置
│   ├── core/               # 核心功能模块
│   │   ├── SceneManager.js      # 场景管理
│   │   ├── CameraController.js  # 相机控制
│   │   └── Renderer.js          # 渲染器管理
│   ├── game/               # 游戏逻辑模块
│   │   ├── LevelManager.js # 关卡管理
│   │   ├── Character.js    # 角色类
│   │   ├── Inventory.js    # 背包系统
│   │   ├── Item.js         # 道具类
│   │   └── Treasure.js     # 宝藏类
│   ├── physics/            # 物理系统模块
│   │   ├── CollisionDetector.js # 碰撞检测
│   │   └── PhysicsEngine.js     # 物理引擎
│   ├── models/             # 模型管理模块
│   │   ├── ModelLoader.js  # 模型加载器
│   │   └── ModelManager.js # 模型管理器
│   ├── ui/                 # UI模块
│   │   ├── LevelSelector.js # 关卡选择器
│   │   ├── InventoryUI.js   # 背包UI
│   │   └── GameUI.js       # 游戏UI
│   └── main.js             # 主入口文件
├── styles/                 # 样式文件
│   ├── main.css           # 主样式
│   └── ui.css            # UI样式
├── index.html            # 入口HTML
└── README.md            # 项目说明
```

## 架构特点

### 1. 模块化设计
- **高可复用性**：每个模块独立，可以在其他项目中复用
- **高可维护性**：代码结构清晰，职责分明
- **低耦合**：模块之间通过接口交互，互不影响

### 2. 前后端分离
- **前端（UI）**：`src/ui/` 目录，负责界面展示和用户交互
- **后端（逻辑）**：`src/game/`、`src/core/`、`src/physics/` 等，负责游戏逻辑和计算

### 3. 模型管理系统
- **统一管理**：`ModelManager` 统一管理所有模型资源
- **多格式支持**：支持GLTF、FBX、OBJ等多种格式
- **易于替换**：可以轻松替换模型而不影响其他代码
- **缓存机制**：模型加载后自动缓存，提高性能

### 4. 配置管理
- **集中配置**：所有配置集中在 `src/config/` 目录
- **易于修改**：修改配置无需改动代码逻辑

## 游戏特色

- 🎮 第一人称视角控制
- 🗺️ 六个不同的关卡场景（城市、森林、沙漠、冰川、山地、地狱）
- 💎 宝藏收集系统
- 🎒 25格背包系统
- ⚡ 道具系统（加速药水、弹跳药水）
- 🎯 碰撞检测系统
- 🎨 精美的3D场景和动画

## 操作说明

- **WASD** - 移动
- **鼠标** - 控制视角
- **空格** - 跳跃
- **F** - 收集宝藏（靠近宝藏时）
- **B** - 打开/关闭背包
- **右键** - 打开道具菜单（使用/删除）
- **左键** - 直接使用道具
- **ESC** - 退出鼠标锁定

## 如何添加新模型

### 1. 放置模型文件
将模型文件放入 `assets/models/` 对应的子目录中。

### 2. 注册模型
在 `src/main.js` 的 `init()` 方法中注册：

```javascript
// 注册角色模型
this.modelManager.registerModel(
    'character_custom',  // 模型ID（唯一标识）
    'assets/models/characters/custom_character.gltf',  // 模型路径
    'gltf',  // 模型格式
    'character'  // 模型分类
);
```

### 3. 使用模型
在需要的地方加载模型：

```javascript
const model = await this.modelManager.getModel('character_custom');
scene.add(model);
```

### 4. 替换模型
使用 `replaceModel()` 方法替换现有模型：

```javascript
await this.modelManager.replaceModel(
    'character_custom',
    'assets/models/characters/new_character.gltf',
    'gltf'
);
```

## 如何添加新的模型平台/格式

### 1. 引入加载器
```javascript
import { CustomLoader } from 'three/examples/jsm/loaders/CustomLoader.js';
```

### 2. 注册加载器
在 `src/main.js` 的 `init()` 方法中：

```javascript
this.modelManager.initialize({
    gltf: new GLTFLoader(),
    fbx: new FBXLoader(),
    custom: new CustomLoader()  // 注册新的加载器
});
```

### 3. 使用新格式
注册模型时指定格式：

```javascript
this.modelManager.registerModel(
    'model_id',
    'path/to/model.custom',
    'custom',  // 使用新注册的格式
    'category'
);
```

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Three.js (r128)

## 开始游戏

直接在浏览器中打开 `index.html` 文件即可开始游戏。

## 关卡介绍

1. **城市** - 繁华的都市，高楼林立
2. **森林** - 神秘的原始森林
3. **沙漠** - 炎热的沙漠地带
4. **冰川** - 冰冷的冰川世界
5. **山地** - 陡峭的山峰
6. **地狱** - 最终的挑战

## 道具效果

- **加速药水** ⚡ - 移动速度提升4倍，持续10秒
- **弹跳药水** 🦘 - 跳跃高度提升4倍，持续10秒

## 开发说明

### 模块扩展
每个模块都是独立的，可以轻松扩展：
- 添加新关卡：在 `LevelConfig.js` 中添加配置，在 `SceneManager.js` 中添加场景创建方法
- 添加新道具：在 `Item.js` 中添加道具类型，在 `GameConfig.js` 中添加效果配置
- 添加新UI：在 `src/ui/` 目录下创建新的UI组件

### 代码规范
- 使用ES6+语法
- 每个类/模块一个文件
- 使用JSDoc注释
- 遵循单一职责原则

## 许可证

MIT License
