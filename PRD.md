# 管道连通 (Pipe Connect) — 产品需求文档

## 一、项目概述

一款轻量休闲管道益智闯关H5小游戏，用 Phaser 3 引擎开发。玩家通过点击/滑动连接同色管道，把所有相同颜色的管道全部连通即可通关。

**核心卖点：** 极简上手、关卡闯关、无需旋转/移动管道、同色连通即赢。

## 二、游戏页面设计

### 页面1：启动页 (BootScene)
- 游戏Logo（SVG占位，后续替换）
- 游戏名称"管道连通"
- "开始游戏"按钮
- 简单的管道动画背景装饰
- 自动跳转或点击进入主菜单

### 页面2：主菜单 (MenuScene)
- 游戏标题
- "开始游戏"按钮 → 进入关卡选择
- "继续游戏"按钮 → 进入上次关卡
- 底部横幅广告位（预留）
- 背景动画（管道流光效果）

### 页面3：关卡选择 (LevelSelectScene)
- 网格/列表展示关卡按钮（1-50关，分页/滚动）
- 每关显示：关卡编号、星级（0-3星）、通关状态
- 已解锁关卡可点击进入，未解锁关卡灰色锁定
- 顶部：金币数量、返回按钮
- 关卡解锁规则：通关前一关解锁下一关

### 页面4：游戏主界面 (GameScene) — 核心页面
- **顶部信息栏**：
  - 左：返回按钮
  - 中：关卡编号（如"第 1 关"）
  - 右：金币数量
- **步数显示**：步数：当前步 / 最优步（如"步数：5 / 3"）
- **游戏棋盘区域**：
  - 7×7网格（可扩展）
  - 深色方格背景
  - 彩色管道段（蓝、橙、白、浅蓝等）
  - 圆形管口端点
  - 固定外圈边框管路
- **底部功能按钮栏**：
  - 返回：回到关卡选择
  - 重置：重置本关，步数清零
  - 提示：消耗金币显示指引
  - 免费提示：看广告（预留接口）
- **交互效果**：
  - 点击/滑动选中管道，高亮显示
  - 连通成功：整条管道发光+流光动画
  - 通关：弹出庆祝动画

### 页面5：通关弹窗 (LevelCompletePopup) — 叠加在GameScene上
- 星级评价（1-3星，基于步数）
  - 3星：步数 = 最优步数
  - 2星：步数 ≤ 最优步数 × 1.5
  - 1星：步数 > 最优步数 × 1.5
- 金币奖励显示
- "下一关"按钮
- "重玩"按钮
- 庆祝动画（粒子/烟花）

### 页面6：提示弹窗 (HintPopup) — 叠加在GameScene上
- 提示内容：高亮显示下一步应连接的管道
- 金币消耗提示
- 确认/取消按钮

## 三、技术架构

- **引擎**：Phaser 3 (v3.80+)
- **构建**：Vite + TypeScript
- **部署**：Vercel 静态站
- **存储**：localStorage 存档
- **适配**：移动端优先，响应式缩放

### 场景结构
```
BootScene → PreloadScene → MenuScene
                              ↓
                         LevelSelectScene
                              ↓
                         GameScene ←→ LevelCompletePopup
                              ↓
                         HintPopup (overlay)
```

### 数据模型
```typescript
// 关卡数据
interface LevelData {
  id: number;
  gridSize: number;        // 如 7
  pipes: PipeData[];       // 所有管道段
  endpoints: EndpointData[]; // 圆形端点
  optimalSteps: number;    // 最优步数
  reward: number;          // 通关金币
}

// 管道段
interface PipeData {
  row: number;
  col: number;
  color: string;           // 'blue'|'orange'|'white'|'lightblue'
  connections: Direction[]; // ['up','right'] 等
}

// 端点
interface EndpointData {
  row: number;
  col: number;
  color: string;
}

// 存档
interface SaveData {
  currentLevel: number;
  coins: number;
  levels: {
    [id: number]: {
      completed: boolean;
      stars: number;
      bestSteps: number;
    }
  }
}
```

## 四、核心算法

### 连通检测 (BFS/DFS)
1. 玩家每次操作后，对每种颜色独立检测
2. 从该颜色任一管道/端点出发BFS
3. 只能通过同色且接口对接的相邻格子扩展
4. 若该颜色所有管道+端点都在同一连通分量 → 该颜色通关
5. 所有颜色都通关 → 关卡通关

### 关卡生成
1. 先生成一个合法的连通解
2. 随机移除部分连接（保持可解）
3. 计算最优步数（BFS求最短操作序列）
4. 校验关卡可解性

## 五、视觉风格

- 深色棋盘背景 (#1a1a2e)
- 彩色立体管道（带高光和阴影）
- 圆形端点带发光效果
- 连通成功：管道发光+流光粒子
- 通关：粒子烟花庆祝
- 卡通休闲画风，圆角UI元素

## 六、变现预留

- 底部横幅广告位
- 激励视频广告（免费提示）
- 金币系统（通关奖励 + 广告获取）
