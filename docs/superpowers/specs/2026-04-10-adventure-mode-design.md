# 创业冒险模式 · Design Spec

> sbidea.ai Phase 1 产品灵魂：把 10 个散工具串成一条创业者的自我发现之旅。

## 一句话

用户通过一条引导式剧情线，在 5 个站点中探索自己的创业人格，最后收到两份礼物：一篇 AI 写的"未来成功故事"和一张极简社交名片。

## 核心设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 串联方式 | 引导式剧情线（任务链） | 比自由探索更有仪式感和完成感 |
| 起点 | 任何工具可进入，SBTI 自动插入 | 不阻断自然流量，但保证人格数据 |
| 旅程锚点 | 人格（你这个人），不是单个点子 | 更深的情感连接，点子只是旅途收获 |
| 终点 | 双重礼物：成功故事 + 极简名片 | 情绪价值 + 社交货币 |
| 节奏 | 可分次完成（localStorage 持久化） | 不强制一口气，像"创业周记" |
| SB 品牌 | 此 SB 非彼 SB，每次冒险开场展示一个 Tier 1-5 定义 | 和网络爆款做区分 |
| 技术 | localStorage，零注册零数据库 | 轻到极致 |

## 旅程流程

```
用户从任意 *.sbidea.ai 子域名进入
        ↓
   localStorage 检测: 测过 SBTI?
        ↓ 没有
   轻量浮层: "先花 2 分钟认识一下自己？"
   → 跳转 sbti.sbidea.ai
        ↓ 测完 / 已测过
   根据 SBTI 人格类型，生成个性化 5 站路线
        ↓
   adventure.sbidea.ai 展示路线图 + 当前进度
        ↓
   用户逐站探索（可跨天）
   每站完成后: 结果存入 localStorage + 显示"下一站"CTA
        ↓
   5 站全部完成
        ↓
   adventure.sbidea.ai/story — 选文风 → AI 生成成功故事
   adventure.sbidea.ai/card  — 生成极简名片 → 保存图片/分享
```

## 路线生成逻辑

根据 SBTI 4 字母 code 的特征推荐站点顺序。每条路线固定 5 站（从 10 个工具中选 5 个最相关的）。

示例：

| 人格特征 | 推荐路线 |
|---------|---------|
| W_I_ (Wild + Individual) | generator → roast → deathways → daily → headline |
| Z_T_ (Zen + Team) | tarot → slogan → jargon → roast → headline |
| __IM (Individual + Market) | generator → jargon → roast → deathways → headline |
| __TA (Team + Art) | tarot → slogan → daily → roast → generator |

路线推荐是硬编码映射（16 种 SBTI type → 16 条预设路线），不需要 AI。

## localStorage 数据结构

```ts
type AdventureState = {
  // 人格数据
  sbtiCode: string;           // "WFIM"
  mbtiType: string;           // "ENFP" | "UNKNOWN"
  sbtiProfile: SbtiProfile;   // AI 生成的完整画像

  // 旅程路线
  route: string[];            // ["generator", "roast", "deathways", "daily", "headline"]
  currentStep: number;        // 0-4

  // 各站收获（每站完成时写入）
  stops: {
    [product: string]: {
      completedAt: string;    // ISO timestamp
      summary: string;        // 核心输出的一句话摘要
      data: unknown;          // 站点特定数据（点子名、吐槽结论、牌面等）
    };
  };

  // 品牌
  todaySbMeaning: string;     // 本次冒险的 SB 定义

  // 最终产出
  story?: {
    style: "techcrunch" | "founder" | "biography";
    content: string;
    generatedAt: string;
  };

  // 元数据
  startedAt: string;
  version: 1;
};
```

## 各站改造（最小侵入）

现有工具不改核心逻辑，只加两层薄壳：

### 入口层：进度条

当 localStorage 中存在活跃冒险时，工具页顶部显示一条窄进度条：
```
[冒险进度 ●●●○○ 3/5]  当前站: 死法占卜  ← 上一站 | 下一站 →
```
不在冒险模式的用户看不到这个条。

### 出口层：下一站 CTA

工具完成后（生成结果后），在结果卡下方显示一个醒目的 CTA：
```
✅ 本站完成！你的发现已记录。
[继续冒险 → 下一站: SB 融资头条]
```

### 数据桥

每个工具在生成结果时，检查 localStorage 是否有活跃冒险。如果有，把核心输出写入 `stops[product]`：
- generator: `{ summary: "点子名", data: { name, oneLiner, sbScore } }`
- roast: `{ summary: "鉴定结论关键词", data: { fullText } }`
- tarot: `{ summary: "三张牌名", data: { cards, reading } }`
- 等等

## 终点：双重礼物

### 礼物 1：未来成功故事

**路由**: `adventure.sbidea.ai/story`

**AI 生成**，素材来自旅程中收集的所有数据：
- SBTI 人格画像（性格、优势、盲区）
- 旅途中生成/选中的点子
- roast 的吐槽要点
- tarot 的牌面和解读
- deathways 的风险预警
- daily 的今日口号

**3 种文风可选**：
1. 📰 **TechCrunch 报道体** — "2028 年，[公司名] 宣布完成 B 轮融资……"
2. 📝 **创始人自述体** — "三年前那个晚上，我在 sbidea.ai 上测出自己是 #47 号……"
3. 📖 **传记特写体** — "TA 当时还不知道，那个被所有人骂 SB 的想法，会改变一个行业。"

**字数**: 800-1200 字
**格式**: 类似公众号长文的排版（大标题 + 引用块 + 数据亮点 + 引言）
**底部**: sbidea.ai 品牌水印 + 今日 SB 定义

### 礼物 2：极简名片

**路由**: `adventure.sbidea.ai/card`

一张精心设计的卡片，包含：
- 创业人格编号 #47
- 人格 emoji + 名字
- SBTI code × MBTI code
- 一句 tagline
- 今日 SB 定义（底部水印）
- sbidea.ai 小字

**导出**: html2canvas 生成 PNG，支持 navigator.share()

## 新增路由

| 子域名 | 路径 | 功能 |
|--------|------|------|
| adventure.sbidea.ai | / | 冒险入口：路线图 + 进度 + 开始/继续按钮 |
| adventure.sbidea.ai | /story | 成功故事：选文风 → AI 生成 → 长文渲染 |
| adventure.sbidea.ai | /card | 极简名片：渲染 + 图片导出 |
| — | /api/adventure-story | AI 生成成功故事 |

## 新增组件

| 组件 | 位置 | 功能 |
|------|------|------|
| AdventureBar | 所有工具页顶部（条件渲染） | 进度条 + 站点导航 |
| AdventureNextCTA | 工具结果下方（条件渲染） | "继续冒险"按钮 |
| AdventureProvider | 顶层 context | 读写 localStorage，提供旅程状态 |

## 不做的事

- ❌ 用户注册 / 登录 / 数据库
- ❌ 社交功能（评论、关注、合伙人匹配）
- ❌ 邮件 / 推送通知
- ❌ 修改现有工具的核心 AI 逻辑
- ❌ 路线的 AI 动态生成（硬编码映射足够）
