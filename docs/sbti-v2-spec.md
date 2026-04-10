# SBTI 2.0 · 创业人格 × MBTI 融合 — Design Spec

## Vision

SBTI 2.0 是一个**创业者人格测试**，融合 SBTI 原创的 4 轴创业人格框架和经典 MBTI 性格分类，由 AI 动态生成深度个性化报告。每个结果都是独一无二的，自带分享冲动。

## Quiz Flow

### Phase 1: 创业人格测试 (12 题, ~2 分钟)
- 保留现有 4 轴: W/Z (Wild/Zen) · F/S (Fast/Slow) · I/T (Individual/Team) · M/A (Market/Art)
- 每轴 3 题, 共 12 题
- 纯客户端计算, 得出 4 字母 SBTI code (e.g., "WFIM")

### Phase 2: MBTI 选择 (1 步, ~10 秒)
- 展示 16 个 MBTI 类型的卡片网格
- 用户点选自己的 MBTI (e.g., "ENFP")
- 如果不知道, 可选 "不确定 / 跳过"
- 跳过时 AI 会根据 SBTI 答案推测一个 MBTI

### Phase 3: AI 生成融合画像 (~3 秒)
- 调用 /api/sbti-profile
- Input: SBTI code + MBTI type + 原始答案
- Output: 结构化 JSON 含以下字段:
  - number: 创业人格编号 #1-100
  - name: 创业人格名 (创意中文名, 8 字内)
  - emoji: 代表 emoji
  - tagline: 一句话标签
  - overview: 200-300 字深度画像
  - strengths: 3 条优势
  - blindspots: 2 条盲区
  - idealCofounder: 最适合搭档的 SBTI 类型 + 原因
  - sbIdeas: 3 个最适合的 SB 创业点子 (每个含 name + oneLiner + whyFit)
  - fortune: 一段 80-120 字的创业运势 (带仪式感)

### Phase 4: 结果展示 + 分享
- 渐变色彩的人格卡片
- 编号 badge: "创业人格 #47"
- SBTI code + MBTI code 双标签
- 3 个推荐 SB 点子 (点击可跳转到 generator.sbidea.ai)
- 一键分享按钮

## Top 100 编号系统

编号基于 SBTI code + MBTI type 的确定性哈希:
- hash("WFIM-ENFP") % 100 + 1 = #47 (举例)
- 同一组合永远得到同一编号
- 不需要预先存储 100 个 profile (AI 动态生成)
- 给用户 "你是百种创业人格中的第 47 号" 的收集感

## 联动 generator

结果页底部:
- "你最适合的 3 个 SB 点子" 区块
- 每个点子有 name + 一句话描述 + "为什么适合你" 分析
- 点击任一点子跳转到 generator.sbidea.ai 并预填 hint

## Tech

- Route: /sbti (已有) + /api/sbti-profile (新)
- Model: google/gemini-2.5-flash (BYOK, ~3s)
- Client: 纯客户端 quiz + 结果页调 AI
- Data: lib/sbti.ts 保留现有 questions + types, 新增 MBTI 数据
