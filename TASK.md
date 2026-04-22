# 管道连通 (Pipe Connect) — 开发任务文档

## 项目概述

用 Phaser 3 + Vite + TypeScript 开发一款管道连通益智闯关H5小游戏。

## 一、项目初始化

```bash
npm create vite@latest pipe-connect-game -- --template vanilla-ts
cd pipe-connect-game
npm install phaser@3
npm install -D @types/node
```

## 二、项目结构

```
pipe-connect-game/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── favicon.ico
├── src/
│   ├── main.ts              # 入口，创建Phaser Game
│   ├── config.ts            # Phaser游戏配置
│   ├── scenes/
│   │   ├── BootScene.ts     # 启动/资源加载
│   │   ├── MenuScene.ts     # 主菜单
│   │   ├── LevelSelectScene.ts  # 关卡选择
│   │   ├── GameScene.ts     # 游戏主场景（核心）
│   │   └── LevelCompletePopup.ts # 通关弹窗（叠加场景）
│   ├── data/
│   │   └── levels.ts        # 关卡数据定义
│   ├── logic/
│   │   ├── Grid.ts          # 网格数据结构
│   │   ├── Pipe.ts          # 管道段逻辑
│   │   ├── ConnectionChecker.ts  # 连通检测（BFS）
│   │   └── LevelGenerator.ts     # 关卡生成器
│   ├── ui/
│   │   ├── Button.ts        # 通用按钮组件
│   │   ├── TopBar.ts        # 顶部信息栏
│   │   ├── BottomBar.ts     # 底部功能栏
│   │   └── StarDisplay.ts   # 星级显示
│   ├── save/
│   │   └── SaveManager.ts   # localStorage存档管理
│   └── utils/
│       ├── constants.ts     # 常量定义（颜色、尺寸等）
│       └── helpers.ts       # 工具函数
```

## 三、核心实现要求

### 3.1 游戏配置 (config.ts)
- 画布：自适应移动端，最大 480×854（9:16比例）
- 缩放模式：Phaser.Scale.FIT
- 背景色：#0f0f23
- 物理引擎：不需要

### 3.2 常量定义 (constants.ts)
```typescript
export const COLORS = {
  BLUE: 0x4a9eff,
  ORANGE: 0xff8c42,
  WHITE: 0xe8e8e8,
  LIGHTBLUE: 0x7ec8e3,
  GREEN: 0x5cb85c,
  PINK: 0xff69b4,
};

export const CELL_SIZE = 56;        // 每个格子像素大小
export const GRID_PADDING = 20;     // 棋盘边距
export const PIPE_WIDTH = 16;       // 管道宽度
export const ENDPOINT_RADIUS = 18;  // 端点半径

export const HINT_COST = 50;        // 提示金币消耗
export const LEVEL_REWARD = 30;     // 通关金币奖励
```

### 3.3 关卡数据 (levels.ts)

手工设计前10关 + 算法生成后续关卡。每关数据格式：

```typescript
export interface LevelData {
  id: number;
  gridSize: number;
  cells: CellData[];  // 二维数组flatten
  optimalSteps: number;
  reward: number;
}

export interface CellData {
  row: number;
  col: number;
  type: 'empty' | 'pipe' | 'endpoint';
  color?: string;           // pipe/endpoint的颜色
  connections?: string[];   // pipe的连接方向 ['up','down','left','right']
  isFixed?: boolean;        // 是否固定不可操作
}
```

**前10关设计要求：**
- 第1-3关：5×5网格，2种颜色，简单直连
- 第4-6关：5×5网格，3种颜色，需要拐弯
- 第7-10关：7×7网格，4种颜色，中等难度

### 3.4 网格与管道渲染 (GameScene.ts)

**核心渲染逻辑：**

1. **棋盘背景**：深色方格，交替深浅两色（如 #1a1a2e 和 #16162a）
2. **管道段绘制**：用Phaser Graphics绘制
   - 管道主体：圆角矩形，带颜色
   - 管道高光：顶部半透明白色条纹
   - 管道阴影：底部半透明黑色条纹
   - 连接方向决定管道形状（直管、弯管、T型、十字）
3. **圆形端点**：实心圆 + 外圈发光
4. **固定边框管路**：灰色管道，不可操作

**管道形状绘制规则：**
- 只有 `up`：从格子中心向上画到边缘
- `up` + `down`：垂直直管
- `up` + `right`：右上弯管（圆弧连接）
- `up` + `down` + `left`：T型管
- 四方向：十字管

### 3.5 玩家交互 (GameScene.ts)

**操作方式：**
1. 点击一个管道/端点 → 选中（高亮边框）
2. 再点击另一个同色管道/端点 → 尝试连接
3. 如果两个同色格子相邻且接口对接 → 连接成功，步数+1
4. 如果不相邻或颜色不同 → 取消选中

**连接判定：**
- 格子A在格子B的上方 → A有 `down` 连接 且 B有 `up` 连接 → 可连通
- 格子A在格子B的右方 → A有 `left` 连接 且 B有 `right` 连接 → 可连通
- 以此类推

**重要：管道不可旋转、不可移动！玩家操作是"确认连接"，即点击两个相邻同色管道来建立连接关系。**

**重新思考交互方式：** 参考同类游戏 Flow Free 的玩法：
- 玩家从一个端点开始，沿路径滑动到另一个同色端点
- 滑过的格子被该颜色"占据"
- 每种颜色必须连接所有同色端点
- 但本游戏不同：管道形状固定，不需要画路径

**最终交互方案（更直观）：**
- 玩家点击空白格子 → 该格子变为当前选中颜色的管道延伸
- 或者更简单：**管道已经预置在棋盘上，玩家只需点击切换管道的"激活/未激活"状态**
- 最简方案：**所有管道都在棋盘上，但初始有些管道是"断开"的（灰色），玩家点击断开的管道使其"连通"（变彩色），连通检测自动运行**

**采用最简方案：**
1. 初始状态：部分管道是灰色的（断开状态）
2. 玩家点击灰色管道 → 管道变为彩色（连通状态），步数+1
3. 玩家点击彩色管道 → 管道变回灰色（断开状态），不增加步数
4. 每次操作后自动检测连通性
5. 所有颜色都连通 → 通关

### 3.6 连通检测 (ConnectionChecker.ts)

```typescript
class ConnectionChecker {
  // 检查指定颜色是否全部连通
  static checkColor(grid: CellData[][], color: string): boolean {
    // 1. 找到该颜色所有已激活的管道和端点
    // 2. BFS从第一个开始，只走同色+已激活+接口对接的相邻格子
    // 3. 如果所有该颜色格子都被访问到 → 连通
  }

  // 检查所有颜色是否都连通
  static checkAll(grid: CellData[][], colors: string[]): boolean {
    return colors.every(color => this.checkColor(grid, color));
  }
}
```

### 3.7 通关判定与星级 (GameScene.ts)

```typescript
function calculateStars(currentSteps: number, optimalSteps: number): number {
  if (currentSteps <= optimalSteps) return 3;
  if (currentSteps <= Math.ceil(optimalSteps * 1.5)) return 2;
  return 1;
}
```

### 3.8 存档管理 (SaveManager.ts)

```typescript
interface SaveData {
  currentLevel: number;
  coins: number;
  levels: Record<number, {
    completed: boolean;
    stars: number;
    bestSteps: number;
  }>;
}

// 使用 localStorage
// key: 'pipe-connect-save'
// 方法：load(), save(), reset(), updateLevel()
```

### 3.9 场景实现细节

#### BootScene
- 显示加载进度条
- 加载完成后跳转 MenuScene
- 暂无外部资源需要加载（全部用Graphics绘制）

#### MenuScene
- 标题文字 "管道连通"
- "开始游戏" 按钮 → LevelSelectScene
- "继续游戏" 按钮 → 直接进入上次关卡 GameScene
- 背景装饰：几个静态管道图案

#### LevelSelectScene
- 3列网格展示关卡按钮
- 每个按钮显示：关卡号、星级图标
- 已通关：显示星级，可点击
- 未解锁：灰色+锁图标
- 顶部：金币数量、返回按钮
- 滚动支持（关卡多时）

#### GameScene（核心，最复杂）
- 初始化：加载关卡数据，渲染棋盘
- 交互：点击管道切换激活状态
- 步数统计
- 连通检测
- 通关触发
- 提示功能：高亮一个应该激活的灰色管道
- 重置功能：恢复初始状态

#### LevelCompletePopup
- 半透明遮罩
- 居中弹窗面板
- 星级动画（逐个点亮）
- 金币奖励数字跳动
- "下一关"和"重玩"按钮

### 3.10 视觉特效

1. **管道激活动画**：灰色→彩色，带缩放弹跳
2. **连通成功特效**：该颜色所有管道发光（tint叠加），流光粒子沿管道流动
3. **通关庆祝**：彩色粒子从底部喷射
4. **按钮交互**：按下缩放0.95，松开恢复
5. **星级动画**：星星逐个从上方落下，带旋转

## 四、关卡生成器 (LevelGenerator.ts)

```typescript
class LevelGenerator {
  // 生成一个可解关卡
  static generate(gridSize: number, colorCount: number, difficulty: number): LevelData {
    // 1. 创建空网格
    // 2. 为每种颜色随机放置2-4个端点
    // 3. 用随机路径连接同色端点，路径上的格子成为管道
    // 4. 随机选择一些管道设为"断开"（灰色）
    // 5. 确保断开的管道数量 = optimalSteps
    // 6. 返回关卡数据
  }
}
```

## 五、构建与部署

### 开发
```bash
npm run dev    # Vite开发服务器
```

### 构建
```bash
npm run build  # 输出到 dist/
```

### 部署
```bash
vercel --prod --yes
```

### Vite配置要点
- `base: '/'`
- `build.outDir: 'dist'`
- 无需特殊配置，Phaser 3 纯前端

## 六、验收标准

1. ✅ 所有5个场景正常切换
2. ✅ 棋盘正确渲染7×7网格和管道
3. ✅ 点击管道可切换激活/断开状态
4. ✅ 连通检测算法正确工作
5. ✅ 通关判定和星级计算正确
6. ✅ 步数统计正确
7. ✅ 重置功能正常
8. ✅ 提示功能正常（高亮应激活的管道）
9. ✅ 存档功能正常（localStorage）
10. ✅ 移动端适配，触摸操作流畅
11. ✅ 至少10个可玩关卡
12. ✅ 通关弹窗和庆祝动画
13. ✅ 构建无错误，Vercel可部署

## 七、开发顺序

1. 项目初始化 + Phaser配置
2. 常量定义 + 类型定义
3. 关卡数据（前10关手工数据）
4. GameScene核心渲染（棋盘+管道）
5. 玩家交互（点击切换）
6. 连通检测算法
7. 通关判定+星级
8. 存档管理
9. BootScene + MenuScene
10. LevelSelectScene
11. LevelCompletePopup
12. 提示功能
13. 视觉特效
14. 关卡生成器
15. 测试+调试
