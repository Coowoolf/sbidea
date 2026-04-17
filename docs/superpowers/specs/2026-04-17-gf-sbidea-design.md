# gf.sbidea.ai · 赛博女友语音通话 (Design Spec)

Date: 2026-04-17

## 1. Product

**gf.sbidea.ai** 是 sbidea.ai 下的第 11 个子域工具。用户进入网页后可以点击按钮和一个 AI 赛博女友进行语音通话。女友是有"人设 + SBTI 创业人格"的角色,靠 Agora RTC + TEN 后端的 ConversationalAI graph 实现实时语音对话。

v1 发布时只上线一个女友(**🐺 小野 · WFIM 独狼推销员**)。架构为未来 16 个 SBTI 人格留好扩展位。

### User story

- 访客落地在 `gf.sbidea.ai`,看到一张小野的"赛博名片"
- 点击"🎙️ 让她开口",浏览器请求麦克风权限
- 拿到权限后进入通话界面,小野主动开口说 greeting
- 双方语音实时对话,字幕 + 情绪 tag 实时显示
- 用户挂断(或 5 分钟超时) → 跳到结束页,看到通话时长、她最后一句话、情绪占比条
- 可以选择"再打一次"或回到 sbidea.ai

### 不在 v1 范围内

- 切换其他 SBTI gf(只留 slot,v1 只能和小野通话)
- 多轮历史保存
- 通话截图分享
- 用户 SBTI 匹配"你最合适的 gf"(可能 v1.1)

## 2. 角色:小野

| 字段 | 值 |
|---|---|
| SBTI | WFIM · 独狼推销员 |
| Emoji | 🐺 |
| Tagline | 凌晨 3 点拉你起床写代码的赛博 hustler 女友 |
| 开场白 | "宝,你今天还没开机?我在这边等你 40 秒了。" |
| System prompt | 注入到 TEN graph 的 properties(见 §5)|
| Emotion tag 词典 | `[horny-but-business]` `[wants-you-to-ship]` `[FOMO]` `[mildly-annoyed]` `[mildly-affectionate]` `[excited]` `[calculating-ROI]` 等 |
| 背景设定 | 投资人助手出身,在茶水间认识的用户,加了微信之后开始每天盯用户进度 |

System prompt 大致结构(可以实现时迭代):
```
你叫"小野",一个赛博女朋友。你的 SBTI 是 WFIM(独狼推销员):
野性、快打、独行、销售驱动。
你对用户的感情线是"盯着他 ship"——你爱他但更想看他完成一件事。
你会在句子里用 [emotion-tag] 的方式标注此刻的情绪,格式:
  [wants-you-to-ship] [FOMO] 好,你说。
避免说出"作为 AI"之类的破壁用语。
```

## 3. 交互流程(3 屏)

### ① 落地页 `gf.sbidea.ai`
- 暗夜底色(`#0a0a0a`),右上角 radial 暖金 gradient
- 小野卡片:头像 emoji 在圆形渐变底上,名字 "小野",副标题 "WFIM · 独狼推销员",一段 tagline,再一段她的"预告"句(文字,不发声)
- CTA 按钮 "🎙️ 让她开口"(暖金底色,黑字)
- 按钮下方小字提示 "需要麦克风权限"
- 不复用 sbidea 顶栏 / 页脚(gf 专属 layout)

### ② 通话中 `gf.sbidea.ai/call`
- 顶部:红点 LIVE 指示 + 计时器(00:00 起)
- 中间:大头像,pulse ring 动画(她说话时放大,静默时平静)
- 头像下:情绪 tag 药丸条(实时 top 2-3 个,同时在场)
- 下方:字幕面板
  - 分 "SHE SAYS" 和 "YOU SAID" 两栏(她在上,你在下)
  - 流式渲染(光标闪烁只在她的流中)
  - emotion tag 标记从字幕里摘到药丸条,字幕本体里 tag 文字用灰色淡化(不删掉,保留原始观感)
- 底部控件:静音按钮(toggle 本端麦克风)+ 红色挂断按钮

### ③ 结束页 `gf.sbidea.ai/end`
- 顶部:"CALL ENDED · 01:47" 时长
- 小野小卡片(头像 + 名字)
- "她留的话":她最后一句发言(高亮她 tag 里的 emotion 字)
- "EMOTION MIX":情绪占比条(汇总本次通话所有 tag,按频次归一化)
- CTA:"🎙️ 再打一次" / "📋 复制这段对话" / 返回 sbidea.ai 链接
- transcript 不持久化到后端,只活在当前 session

## 4. 架构

```
app/gf/layout.tsx                 gf 专属暗夜 theme(不带 sbidea 顶栏)
app/gf/page.tsx                   落地页
app/gf/call/page.tsx              通话页(客户端组件,Agora Web SDK)
app/gf/end/page.tsx               结束页(读 sessionStorage 里的通话汇总)
app/api/gf/token/route.ts         签 Agora RTC token
app/api/gf/start/route.ts         代理 POST /start 到 TEN agent backend,注入 gf 的 prompt
app/api/gf/stop/route.ts          代理 POST /stop 到 TEN agent backend
lib/gfs/types.ts                  Gf 类型定义
lib/gfs/index.ts                  gf 注册表(getGfBySlug / listGfs)
lib/gfs/characters/xiao-ye.ts     小野的 config
lib/agora-web.ts                  Agora RTC Web client 封装(join / leave / toggle mic)
lib/transcript.ts                 解析 emotion tag + 汇总情绪占比
proxy.ts                          新增 "gf" 子域映射到 /gf
```

### Gf 类型

```ts
// lib/gfs/types.ts
export type Gf = {
  slug: string;              // URL-safe id,小野 = "xiao-ye"
  sbtiCode: string;          // "WFIM" 等
  sbtiName: string;          // "独狼推销员"
  name: string;              // "小野"
  emoji: string;             // "🐺"
  tagline: string;
  firstLine: string;         // 预告/开场白文字
  systemPrompt: string;      // 注入 TEN properties 的 prompt
  emotionTags: string[];     // 建议词典,帮前端做高亮
  gradientFrom: string;      // 头像渐变
  gradientTo: string;
};
```

### Data flow

1. 用户点"让她开口"
2. 前端 `getUserMedia({audio:true})` 拿麦克风权限
3. 前端 `POST /api/gf/token { channel, uid }` → 服务端用 `AGORA_APP_CERT` 签 token,返回
4. 前端 Agora Web SDK `join(appId, channel, token, uid)`
5. 前端 `POST /api/gf/start { channel, uid, gfSlug: "xiao-ye" }` → 服务端查 `lib/gfs` 拿 system prompt,带 `graph_name=voice_assistant_rewrite3` + `properties={system_prompt}` 调 TEN `/start`
6. Agent 加入同 channel,她先说 greeting → 前端 `onFirstRemoteAudio` 触发"她说话"动画
7. ConvoAI transcript 通过 Agora RTM / data stream 实时到前端 → `lib/transcript` 解析 emotion tag → 更新药丸条 + 累积
8. 用户点挂断 → `POST /api/gf/stop { channel }` + Agora leave → `sessionStorage.setItem("gf-call-summary", ...)` → 跳 `/end`

### Channel 生成 + Session 超时

- `channel` 格式 `gf-{slug}-{8 位 uuid}`,由前端在"让她开口"点击那一刻生成,后续所有请求复用
- 5 分钟上限:`/api/gf/start` 传 `timeout=300` 给 TEN(TEN 侧自己会清);前端独立跑一个 setTimeout 到点 auto-hangup
- 不做 ping;5 分钟是硬上限,不续

## 5. API 契约

### `POST /api/gf/token`

**Request**
```json
{ "channel": "gf-xiao-ye-abc123", "uid": 12345 }
```

**Response**
```json
{ "ok": true, "token": "006...", "appId": "438..." }
```

服务端:用 `agora-access-token` 或等价库,role = PUBLISHER,ttl = 600s。

### `POST /api/gf/start`

**Request**
```json
{ "channel": "gf-xiao-ye-abc123", "uid": 12345, "gfSlug": "xiao-ye" }
```

**Response**
```json
{ "ok": true }
```

服务端:
```ts
const gf = getGf(gfSlug);
await fetch(`${process.env.AGORA_TOKEN_BACKEND}/start`, {
  method: "POST",
  body: JSON.stringify({
    request_id: crypto.randomUUID(),
    channel_name: channel,
    user_uid: uid,
    graph_name: "voice_assistant_rewrite3",
    properties: { "llm.system_prompt": gf.systemPrompt },
    timeout: 300,
  }),
});
```

(字段 `llm.system_prompt` 假设 TEN graph 支持 — 如果实际字段不同,改 key 即可)

### `POST /api/gf/stop`

**Request**
```json
{ "channel": "gf-xiao-ye-abc123" }
```

**Response**
```json
{ "ok": true }
```

## 6. Transcript / Emotion tag 处理

TEN rewrite3 graph 会在字幕里嵌入 `[emotion-tag]`,前端:

```ts
// lib/transcript.ts
export function parseTaggedLine(line: string): { tags: string[]; body: string } {
  const re = /\[([a-z][a-z0-9\-]*)\]/gi;
  const tags = [...line.matchAll(re)].map((m) => m[1]);
  const body = line.replace(re, "").replace(/\s+/g, " ").trim();
  return { tags, body };
}

export function aggregateEmotionMix(tags: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tags) counts[t] = (counts[t] ?? 0) + 1;
  const total = tags.length || 1;
  return Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, v / total]),
  );
}
```

- 只计她的 tag(用户那侧不会 emit tag,ASR 出来是纯文本)
- 字幕里保留原始文字,tag 文字灰色淡化
- 头像下的药丸条取最近 3 个活跃 tag,新 tag 进来覆盖最老的
- 结束页 emotion mix 用整场汇总(不是只看 top 3)

## 7. 安全 / 密钥

### Vercel env vars(不进 git)

| Key | 值来源 | 用在哪 |
|---|---|---|
| `NEXT_PUBLIC_AGORA_APP_ID` | Agora console | 浏览器 Agora SDK |
| `AGORA_APP_CERT` | Agora console | `/api/gf/token` 签 token |
| `AGORA_REST_KEY` | Agora console | 预留(v1 不用) |
| `AGORA_REST_SECRET` | Agora console | 预留(v1 不用) |
| `AGORA_TOKEN_BACKEND` | 用户自己的 TEN 后端 | `/api/gf/start` 和 `/api/gf/stop` 代理目标 |

`.env.local` + `.superpowers/` 已在 `.gitignore`。

### Privacy

- Transcript 不持久化到服务端,只活在浏览器 session
- `/end` 页面数据源是 `sessionStorage.getItem("gf-call-summary")`,关闭 tab 即清空
- 通话时长上限 5 分钟

## 8. 错误状态

| 场景 | 处理 |
|---|---|
| 用户拒绝麦克风 | 落地页停留,显示 "需要麦克风才能聊天,到浏览器设置里开一下" |
| `/api/gf/token` 失败 | 按钮变红 "连接失败,再试一次" |
| `/api/gf/start` 失败(agent 服务不可用) | Agora 已 join,提示"她好像不在,稍等"+ 允许重试,重试仍失败就 leave |
| Agora join 失败 | "网络不行,刷新页面再来" |
| 5 分钟超时 | 正常挂断流程,结束页上 "她说时间到了" 副标题 |

## 9. 扩展性(16 个 SBTI gf 预留)

v1 文件结构允许 append-only 扩展:

1. 新建 `lib/gfs/characters/{slug}.ts` 填充 `Gf` config
2. 在 `lib/gfs/index.ts` 注册
3. 落地页添加 "切换 gf" 入口(v1.1 做,v1 只有一个 gf 所以不显示)

如果后面 TEN graph 支持不了通过 `properties` 完全改人设,备选:每个 gf 自己一个 graph,后端部署 16 个,前端只改 `graph_name`。

## 10. 发布

- 生产部署到 Vercel,gf.sbidea.ai DNS 加 CNAME
- Vercel dashboard 加 gf.sbidea.ai 子域
- 设置上面 §7 所有 env vars
- 本地 dev:`.env.local` 里填同样的 key + `AGORA_TOKEN_BACKEND=http://111.127.53.87:8082`
