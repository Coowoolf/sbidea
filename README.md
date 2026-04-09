# sbidea.ai · 傻想法研究所

> 看起来 SB，赚起来真。

一晚上造的 10 个小工具，全部围绕同一个 insight：
**"The best startup ideas seem at first like bad ideas." — Paul Graham**

每一个工具都围绕『SB 创业点子』这个主题，并且都内置『生成即分享』的裂变路径（一键复制、Web Share API、结果卡可截图）。

## 10 个产品

| # | 路径 | 产品 | 一句话 |
|---|------|------|--------|
| 1 | `/generator` | 🎲 SB 想法生成器 | AI 吐出一个『听起来很傻、细想真行』的创业点子 |
| 2 | `/roast` | 🔥 SB 想法鉴定所 | 你粘贴点子，AI 先毒舌吐槽再认真分析（流式输出） |
| 3 | `/hall` | 🦄 SB 独角兽名人堂 | 12 个真实案例：当年被骂 SB，现在估值百亿 |
| 4 | `/sbti` | 🧠 SBTI · 创业 16 型 | 12 题 MBTI 风格测试，纯客户端 |
| 5 | `/headline` | 📰 SB 融资头条 | 把你的点子写成一篇煞有介事的融资新闻稿 |
| 6 | `/deathways` | 💀 SB 死法占卜 | 预言你的点子会以哪 7 种戏剧化方式死掉 |
| 7 | `/slogan` | 🎨 SB Slogan 对撞机 | 同一个产品的 8 种风格 slogan 并排 |
| 8 | `/tarot` | 🔮 SB 创业塔罗 | 22 张大阿卡那，抽 3 张（现状/挑战/结果） |
| 9 | `/daily` | 🏆 SB 成功学日签 | 每次生成一张带配色的反成功学海报 |
| 10 | `/jargon` | 📖 SB 黑话词典 | 人话 ↔ 投资人黑话双向翻译 + 黑话含量分数 |

## 技术栈

- **Next.js 16** (App Router, Turbopack)
- **React 19** + Tailwind CSS v4
- **AI SDK v6** via **Vercel AI Gateway**（`provider/model` 字符串，无需直连 Provider）
- 主力模型：`anthropic/claude-haiku-4-5`（快 + 便宜）
- 全部 Node.js runtime（Vercel Fluid Compute）
- 独角兽名人堂用 `generateStaticParams` 静态生成，每一条独立 SEO URL
- SBTI 测试纯客户端，零 AI 调用成本

## 本地开发

```bash
npm install
npm run dev
```

然后打开 http://localhost:3000

### 环境变量

唯一必需的是 AI Gateway 凭证之一（二选一）：

```bash
# 方式 A：直接使用 AI Gateway API key（从 vercel.com/ai-gateway 拿）
AI_GATEWAY_API_KEY=...

# 方式 B：直接用 Anthropic API key（不走 gateway）
ANTHROPIC_API_KEY=...
```

部署到 Vercel 后，如果项目绑定了账号，会自动通过 OIDC 获取 Gateway token，**不需要任何环境变量**。

可选：

```bash
NEXT_PUBLIC_SITE_URL=https://sbidea.ai
```

## 部署到 Vercel

```bash
# 安装 Vercel CLI（如还没装）
npm i -g vercel

# 一键部署
cd sbidea.ai
vercel link    # 关联项目
vercel deploy --prod
```

### 接入 sbidea.ai 域名

这个域名在 Spaceship 注册，nameserver 是 `launch1.spaceship.net` / `launch2.spaceship.net`。接入 Vercel 有两种方式，推荐 A：

**方式 A（推荐）· 把 NS 整个交给 Vercel**
1. 在 Vercel 项目 → Settings → Domains 里添加 `sbidea.ai`
2. Vercel 会给你 2-4 个 `ns*.vercel-dns.com` 或 `*.vercel-dns-xxx.com` 的 nameserver
3. 去 Spaceship 控制台把 nameserver 换成 Vercel 给的那组
4. 等 DNS 生效（一般 10 分钟到 1 小时）
5. Vercel 会自动签发 SSL 证书

**方式 B · 保留 Spaceship NS，手动加记录**
1. 在 Spaceship DNS 面板添加：
   - `A  @  76.76.21.21`
   - `CNAME  www  cname.vercel-dns.com`
2. 在 Vercel 项目里添加 `sbidea.ai` 和 `www.sbidea.ai`
3. 等待证书签发

方式 A 的好处是之后改子域名（staging、api、blog）都可以直接在 Vercel 里加，不用再回 Spaceship。

## 目录结构

```
app/
  layout.tsx              # 全局 header / footer + 导航
  page.tsx                # 首页（10 个产品卡片）
  globals.css             # Tailwind 4 + 全局样式
  generator/              # 产品 1
  roast/                  # 产品 2
  hall/                   # 产品 3（+ [slug] 动态详情页）
  sbti/                   # 产品 4
  headline/               # 产品 5
  deathways/              # 产品 6
  slogan/                 # 产品 7
  tarot/                  # 产品 8
  daily/                  # 产品 9
  jargon/                 # 产品 10
  api/
    generate/
    roast/                # 流式 text
    headline/
    deathways/
    slogan/
    tarot/
    daily/
    jargon/
lib/
  models.ts               # AI SDK 模型常量
  unicorns.ts             # 独角兽名人堂的策展数据
  sbti.ts                 # SBTI 题目 + 16 型数据
  tarot.ts                # 22 张创业塔罗数据
public/
  favicon.svg
```

## 裂变路径的设计要点

每一个产品都满足下面三条之一或全部：

- **生成即分享**：每次结果都有「复制/分享」按钮，调 `navigator.share()`，fallback 是剪贴板
- **结果卡可截图**：布局是独立的 `<article class="sb-card">`，适合整张截图
- **静态 SEO**：名人堂每一条是一个独立 URL，长尾流量来源
- **强反差**：Slogan 对撞机、黑话词典、鉴定所都靠对比制造转发冲动

## 法律与风险

- AI 生成的所有内容都是虚构的娱乐内容，不构成投资建议
- 融资头条里的机构 / 数据 / 人名都是虚构的
- 请勿用于实际融资材料、股权交易或公开信息披露

## 许可证

MIT

---

🤖 Built overnight with Claude Code
