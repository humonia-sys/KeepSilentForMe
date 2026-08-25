# 《请替我沉默》游戏策划案

> 一页介绍：玩家是寄生在少女语言里的“消音”。每次她开口前，屏幕出现完整台词；玩家只能拖动黑条，遮掉一段连续文字。被遮掉的字被“吃掉”，剩下的句子说出口——她靠你的沉默活在社会里，你靠她没说出口的真实想法长出身体。

---

## 一、游戏描述

| 项目 | 内容 |
| --- | --- |
| 游戏名称 | 《请替我沉默》 |
| 英文暂定 | Keep Silent For Me |
| 主题选择 | 叙事解谜 / 语言操作 / 共生关系 |
| 平台目标 | PC（优先）/ 后续可移植 Web、移动端 |
| 预计时长 | 约 30—36 分钟单周目（含关末视频） |
| 目标受众 | 喜欢《主播女孩重度依赖》式角色关系、短叙事实验、直播可玩内容的玩家 |
| 开发周期建议 | 7 天可出可玩竖切；完整打磨 2—3 周 |

### 1.1 美术风格

**锁定母版**：作者已跑通的 doomer 关键帧系  
`/home/donz/game/video-storyboard-doomer-1999/coordinate-storyboard/generated-gpt-image-2/`  
（详见同目录 [`art-style.md`](art-style.md)）

- **整体**：手绘 2D 写实动画线稿 + 深黑室内层级 + 细 35mm 颗粒；对话框 UI 与黑条叠在原画之上。焦点仍是“句子 / 黑条 / 少女 / 消音体”。
- **不是**：亮色可爱偶像立绘、赛博霓虹、厚涂商业萌系、高光 3D。
- **少女**：长黑发、灰橄榄/蓝灰连帽或朴素层；多侧影与背影；V4 已提供 10 个基础表情 + 2 个变体（紧张、假笑、冷淡、崩溃边缘、依赖、空白、讨好、抽离等）。
- **消音体（玩家）**：哑光墨迹与黑体残字蠕动聚合；三阶段（桌角渗墨 → 身侧半人 → 几乎重叠的实体），从属同一套蓝黑阶，禁止霓虹特效。
- **场景**：旧公寓书桌/面试隔间/门厅/空房；单点台灯 + 冷窗光；雨夜湿材质可作过场。不做探索。
- **关系参考**：《主播女孩重度依赖》的黏着与直播压迫 —— **视觉上不跟它的甜系**，跟 doomer 母版的疲惫与封闭。

### 1.2 一句话描述（卖点）

**你是她没有说出口的那个人。**

备选：

- 她负责说谎，你负责活下来。
- 拖动黑条，吃掉她不能说的话。
- 唯一操作：遮住一段字。唯一关系：共生。

### 1.3 为什么“标新立异”成立

真正要追求的不是“从来没人做过某种操作”，而是像《主播女孩重度依赖》一样，形成**只属于这款游戏的角色关系与视觉语言**。

单纯的文字变形、删字解谜已有先例（如《Counterfeit Monkey》把删除字母作为改变现实的核心玩法），**不能把卖点写成“文字可以被修改”**。

本作品的差异化在于：

1. **操作即关系**：遮字不是解谜手段，而是共生与控制的身体行为。
2. **可传播图像**：暗房侧影 + 哑光消音条/残字在身侧长成人形（doomer 母版）。
3. **结尾认知反转**：玩家以为在删除，其实一直在“听见”被遮住的真实话语。

---

## 二、故事概要

你是寄生在少女语言里的“消音”。

她把不能说出口的话喂给你，你替她维持正常的人生：面试顺利、直播讨喜、朋友不拆穿、舆论不把她撕碎。

代价是：每遮掉一段文字，黑色文字就会从对话框爬出，附着在她身边，逐渐长成你的身体。  
她越会说“正确的话”，你就越完整；你越完整，她自己的语言就越残缺。

五段封闭场景之后，房间里只剩你们。她说：

> “请你把我留下来。”

你仍然只能遮掉一段——没有额外结局按钮。最后一次使用核心机制，就是选择。

**反转**：玩家以为自己一直在删除文字。结尾揭示，黑条遮住的内容才是她真实说出口的话；屏幕上留下的文字只是她向外界展示的字幕。  
玩家不是替她沉默，而是**唯一真正听见她的人**。

共生因此有两面：

- 你保护了她的公众人格；
- 你也独占了她真实的语言。

它既是陪伴，也是控制。

---

## 三、游戏设计

### 3.1 核心玩法（唯一操作）

少女每次准备说话时，屏幕出现一句**完整台词**。

玩家**只能**做一件事：

> **拖动黑条，遮掉句子中的一段连续文字。**

规则约束：

| 规则 | 说明 |
| --- | --- |
| 唯一操作 | 不输入文字、不自由对话、不第二种技能 |
| 连续遮挡 | 只能遮一段连续区间，不能多选、跳选 |
| 预设吸附 | 技术上不解析自然语言；每句预置 3—4 个合法遮挡区，拖拽吸附到预设短语 |
| 吃掉而非删除 | 被遮文字进入消音体，驱动视觉成长与关系变化 |
| 说出口的是剩余句 | 剩余文字组成对外说出的句子，决定本关成败与关系偏移 |

#### 示例

原句：

> “我当然很高兴你还能回来。”

可选遮挡：

| 遮掉 | 剩余效果（叙事） |
| --- | --- |
| “当然” | 变成勉强的欢迎 |
| “很高兴” | 变成冷淡回应 |
| “你还能回来” | 变成没有对象的虚假开心 |
| “我” | 她开始用不属于自己的语气说话 |

### 3.2 设计思路（为什么这样设计）

对标“扫雷式”拆解，把本玩法拆成可调参数：

| 设计维度 | 本游戏的选择 | 理由 |
| --- | --- | --- |
| 操作原子 | 只拖黑条 | 保证 10 秒预告片能讲清，直播观众秒懂 |
| 决策空间 | 每句 3—4 个预设区 | 小而密，避免组合爆炸，适合 7 天制作 |
| 反馈层级 | 句子语义变化 → NPC 反应 → 消音体成长 → 关卡结果 | 让“改一个词”有多重回响 |
| 失败形态 | 说错话导致关卡失败 / 关系破裂 / 被看穿 | 失败也是叙事，不靠数值扣血 |
| 成长绑定 | 遮得越多，消音体越完整，少女语言越残 | 机制即主题，不做独立升级树 |
| 终局选择 | 仍只用遮挡，不用菜单选结局 | 机制闭环，强化“你只能这样存在” |

**共生逻辑（机制主题合一）**：

- 少女需要你吞掉不能说的话，否则会在面试、直播、约会或审问中说出真实想法。
- 你需要她继续开口，因为**你的身体由她没有说出口的文字组成**。
- 她靠你的沉默活着，你靠她的真实想法活着。

这比“寄生生物提供能力”更贴近共生：双方互相成全，也互相剥夺。

### 3.3 游戏循环结构

#### 单句微循环（核心循环）

```text
完整台词出现
    → 玩家拖黑条选择遮挡区
    → 文字被“吃掉”，消音体蠕动生长
    → 剩余句子说出口
    → NPC / 观众 / 系统反馈
    → 进入下一句 或 结算本关
```

#### 单关中循环

```text
进入固定场景
    → 简短情境说明（目标一句话）
    → 6—7 轮台词微循环
    → 关卡结果（通过 / 有代价通过 / 失败重来）
    → 消音体阶段可能升级
    → 【关末 AI 视频 6–12s】空间/关系收束
    → 进入下一关
```

#### 全局宏循环

```text
开场教程 + V0_out
    → 教学（面试）+ V1_pass
    → 表演与讨好（直播）+ V2_out
    → 关系无法两全（朋友）+ V3_out
    → 舆论与自我（道歉）+ V4_perform|refuse
    → 只对你说话（终局）+ V5_A|B|C
    → 反转视频 V_RV + 标题
```

用结构图表示：

```text
                    ┌──────────────────┐
                    │  完整台词出现     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ 拖黑条遮连续文字  │  ← 唯一操作
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        剩余句子说出口   被遮文字被吃掉   语义/关系偏移
              │              │              │
              ▼              ▼              ▼
           场景反馈      消音体成长      关卡推进/失败
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                      下一句 / 下一关 / 结局
```

### 3.4 系统清单（只保留必要系统）

| 系统 | 是否做 | 说明 |
| --- | --- | --- |
| 遮挡吸附 | 做 | 核心 |
| 句子结果分支 | 做 | 每句 3—4 分支，驱动反馈 |
| 关卡目标检测 | 做 | 如面试通过、直播完成 |
| 消音体三阶段视觉 | 做 | 叙事 thruline |
| 表情/立绘切换 | 做 | 低成本高反馈 |
| 简单结局标记 | 做 | 2—3 个结局，由关键遮挡累计或终句决定 |
| 好感度 / 压力 / 粉丝数 | **不做** | 数值会稀释“只遮一字”的锋利感 |
| 多可攻略角色 | **不做** | |
| 自由输入 / AI 对话 | **不做** | |
| 地图探索 / 小游戏 | **不做** | |
| 多周目收集 / 大量结局 | **不做** | |

### 3.5 结局设计（2—3 个）

终局句：

> “请你把我留下来。”

仍只能遮一段：

| 遮挡 | 倾向结局 | 调性 |
| --- | --- | --- |
| “请你” | 她留下自己的意志，消音体被拒绝/消散 | 分离 / 她取回语言 |
| “把我” | 关系扭曲：留下的不是“我” | 异化 |
| “留下来” | 只剩请求的空壳，或消音体完全接管 | 吞没 |
| 遮掉名字相关部分 | 身份被抹去 | 最冷的结局 |

可选第三结局：由前四关“过度遮挡 / 最小遮挡”隐式累计，影响终句可选区或 CG。

**原则**：没有额外结局按钮；最后一次使用核心机制本身就是选择。

### 3.6 最后的反转（必须落地的信息设计）

全程 UI 暗示可以很轻，但结尾必须说清：

1. 玩家以为：黑条 = 删除，剩余 = 真说出口。
2. 实际：黑条遮住的 = 她真实说出口的话；剩余 = 对外字幕/伪装。
3. 因此玩家是唯一听见真实的人——也是唯一能决定外界听见什么的人。

实现建议：

- 终局后回放关键句子：同一句“黑条层”与“字幕层”对调显示一次。
- 消音体用被遮原文低语复述玩家吃过的句子。

### 3.7 参考作品

| 作品 | 参考点 | 不参考点 |
| --- | --- | --- |
| 《主播女孩重度依赖》 | 角色关系黏着、直播场景、传播图像清晰 | 不做成养成/多系统 |
| 《Counterfeit Monkey》 | 改字改现实 | 不做成文字冒险大世界 |
| 一般 AVG | 立绘+对白节奏 | 不做成选项分支恋爱 |

### 3.8 传播与演示（十秒预告片分镜）

视觉跟 doomer 母版一致（见 `art-style.md`）：

1. 台灯下，她准备说一句“正确”的台词；
2. 玩家拖出黑条，遮掉其中几个字；
3. 被遮字像污迹一样蠕动；
4. 黑色人形在她身后低语：“谢谢你喂我。”
5. 近黑底标题出现。

直播/短视频天然讨论点：

- “这句话到底删哪个？”
- “删掉‘我’之后意思完全变了。”
- “我是不是一直在控制她？”
- “为什么被删掉的话在跟我说话？”

---

## 四、内容规划

### 4.1 体量总表

| 条目 | 数量 |
| --- | --- |
| 游戏时长 | 约 30—36 分钟（含关末视频） |
| 固定场景 / 关卡 | 开场 + 5 关 |
| 每关台词 | **6—7 句**可遮（见 `台本.md` v1.2） |
| 可处理台词总计 | 约 **35** 句 |
| 每句可遮挡区 | 3—4 个 |
| 少女关键姿势 + 表情 | V4 运行时 8 姿势 / 10 个基础表情 + 2 个变体 |
| 场景 BG | 5 张旧批次深黑室内 PNG（运行时 fit/crop 到 16:9 逻辑画布） |
| **关末 AI 视频** | **约 9–11 条**，每条 6–12s（图生视频） |
| 消音体阶段 | 3（哑光墨迹系） |
| 结局 | 2—3（终句 zone 决定 + 结局视频） |
| BGM | 2—3 首；**关末视频默认无 BGM**，以环境声为主 |
| 关键 SFX | 遮挡、吞噬、说出口、观众反应、生长 |

### 4.2 五个独立关卡

每关都是固定场景，几轮台词，解法空间有限。

#### 第一关：面试（教学）

- **目标**：让她成功获得工作。
- **场景**：正经小型会议室（非审讯室）。
- **原话特征**：紧张、自卑、诚实过头。
- **玩家任务**：遮掉不合适部分，教会她说出“正确答案”。
- **设计重点**：教操作、教“遮挡改变语义”、教失败可重来。
- **消音体**：阶段 1 萌芽（墨迹/细条）。
- **关末视频**：`V1_pass`（录取→雨夜归家）；失败用短 `V1_fail` 或不播。

#### 第二关：第一次直播

- **目标**：完成一场新人直播。
- **冲突**：她讨厌观众的问题；需遮掉攻击性内容，让剩余显得无害、讨好或“人设正确”（画面仍是暗房，不是美颜直播间）。
- **关系句**（对玩家）：
  > “有你在，我好像什么话都能说。”
  > 实际情况正相反。
- **设计重点**：引入“观众反馈”；表演性正确 vs 真实厌恶。
- **消音体**：明显附着在身侧（Stage2）。
- **关末视频**：`V2_out`（关播→肩侧坐实）。

#### 第三关：朋友来访

- **目标**：表面维持友谊，同时不暴露秘密——**二者无法同时完美**。
- **难点**：不是蒙混过关，而是同一句话无法两全。
- **示例**：
  > “我最近没有在躲你，只是不知道该怎么面对你。”
- - > 无论遮哪部分，关系都会偏移。
- **设计重点**：无有最优解；让玩家体会机制的伦理重量。
- **消音体**：阶段 2，半人形。
- **关末视频**：`V3_out`（门合上→门内更挤）。

#### 第四关：道歉直播

- **目标**：发表“合格道歉”，或拒绝表演道歉（两条路线都要能收束）。
- **完整原句示例**：
  > “对不起，我知道你们想听这句话，但我其实不觉得自己做错了。”
- **设计重点**：舆论压力；玩家必须决定留下什么。
- **特殊规则**：消音体已占画面很大，并开始**主动遮挡**某些词（教学“你也被机制反噬”）。
- **关末视频**：`V4_perform` / `V4_refuse` 二选一（按路线 flag）。

#### 第五关：没有观众的房间（终局）

- **情境**：没有面试官、朋友、观众；只对玩家说话。
- **关键句**：
  > “我已经不知道哪些话是我想说的，哪些话是你允许我说的。”
  > “请你把我留下来。”
- **设计重点**：终局选择 = 最后一次遮挡；接反转揭示。
- **消音体**：阶段 3，几乎与她重叠。
- **关末视频**：`V5_A` / `V5_B` / `V5_C`（终句 zone）→ 再播反转 `V_RV`。

### 4.3 单句内容制作规范（便于量产）

每句台词建议按同一张表填写：

| 字段 | 说明 |
| --- | --- |
| `id` | 如 `L2_S03` |
| `raw` | 完整原句 |
| `zones[]` | 可遮挡区间（起始字下标 + 文案） |
| `remain_text` | 各 zone 对应剩余句（可自动生成后人工改） |
| `npc_reaction` | 对方反应文案 / 表情 |
| `flags` | 如 `interview_pass++` / `friend_trust--` |
| `eat_text` | 被吃掉、进入消音体低语库的文本 |
| `note` | 设计意图（教学/两难/反转伏笔） |

### 4.4 必须删除的内容（防范围膨胀）

不要加入：

- 好感度、压力值、粉丝数等 Habit 数值条；
- 多个可攻略人物；
- 自由输入；
- AI 生成对话（**关末视频用 AI，对白仍人工表驱动**）；
- 地图探索；
- 小游戏；
- 多周目收集；
- 二十多个结局；
- 每句都配视频（**仅关末/结局/反转**，句内仍 UI）。

它应该是一部**极短、极密集、视觉高度统一**的作品。

### 4.5 关末 AI 视频转场（场景转换方案）

**决策**：场景与场景之间、每章「结局感」用 **AI 图生视频短片**完成，而不是手搓全套过场动画或纯黑场淡入。

**好处**

1. **更好做**：首帧直接用 Demo/关键帧（D0–D5、R0），流水线：静帧锁定 → 图生视频 → 引擎 VideoPlayer。  
2. **更直观**：8 秒内讲清「结果 + 空间迁移 + 消音体长大」。  
3. **统一风格**：与 doomer 静帧同一套提示词 DNA，避免实拍/3D 穿帮。

**规格**

| 项 | 规范 |
| --- | --- |
| 时长 | 关间 6–10s；结局/反转 12–15s |
| 画幅 | 16:9 |
| 生成 | 图生视频优先；首帧=结算静帧或 Demo 锚点 |
| 音频 | 默认 **无 BGM**；雨、门、CRT、脚步、墨/纸屑；可极轻低语 |
| 字幕 | 大字尽量引擎 UI 叠层，不烧进视频 |
| 分支 | 主路径每章 1 条；第 4 章 2 条；第 5 章 3 条结局 + 1 条反转 |
| 跳过 | 首次不可跳（或仅末 2s 可点）；回看可跳 |
| 失败 | 不播完整 outro |

**清单**（详分镜见 `台本.md`）

| ID | 用途 |
| --- | --- |
| `V0_out` | 开场→面试 |
| `V1_pass` / `V1_fail` | 面试录取 / 失败短闪 |
| `V2_out` | 直播结束→肩侧 Stage2 |
| `V3_out` | 朋友离去→门关 |
| `V4_perform` / `V4_refuse` | 道歉双路线 |
| `V5_A` / `V5_B` / `V5_C` | 终局三向（C' 并入 `V5_C`） |
| `V_RV` | 认知反转回放 |

**运行时结局映射**（`web/video/manifest.json` sequences + `art/v4/scenes/manifest.json` endingPages）：

| 结局 ID | 视频序列 | 整页图 |
| --- | --- | --- |
| `A_separate` | K15→K16（`V5_A`） | `PAGE_END_A_separate` |
| `B_alienate` | K17→K18（`V5_B`） | `PAGE_END_B_alienate` |
| `C_consume` | K19→K20（`V5_C`） | `PAGE_END_C_hollow` |
| `C_cold` | K19→K20（与 `C_consume` 共用 `V5_C`） | `PAGE_END_C_hollow`（同左） |

`C_consume` 与 `C_cold` 是两个逻辑结局 ID，但共用同一 `V5_C` 视频与同一整页图，当前差异仅在结局标题/文案；台本「C' 差」的镜中演出暂未单独出片。`scripts/validate-runtime-videos.mjs` 的 `expectedSequences` 已将两者显式写为同组片段，并非缺失资源。

**与玩法边界**：视频段 **不可操作**；黑条只在对白 UI 段出现。视频负责「电影连接」，不负责解谜。

---

## 五、技术实现要点（服务 7 天可做完）

### 5.1 技术栈选择

**已确定方案：Web (DOM + CSS)**

> **当前实现快照（2026-08-03）**：`web/` 已完成 L0-L5 的可玩整页 Demo；运行时使用
> `art/v4/scenes/manifest.json` 的 13 张整页 PNG 和 `pageBindings`，不再叠加角色、NPC、
> 消音体或结局透明叙事层。`script/chapters.json`、场景 manifest 和 V4 UI/反馈资产已接入，
> Tauri 2 的 Windows NSIS 与 Linux AppImage/deb 已在 GitHub Actions 通过。本文后续关于
> 视频、外部音频、透明叙事层和完整路线结算的内容仍是目标设计或待办，不代表当前 Demo 已实现。

| 方案 | 选择 |
| --- | --- |
| **引擎** | **Web (HTML5 + CSS + JavaScript)**；桌面发行由 Tauri 2 包装 |
| 文本 | 不跑 NLP；JSON/表格驱动预设遮挡（`script/chapters.json`） |
| 交互 | 当前为单一文本节点 + `Range.getClientRects()` 命中层 → 拖拽黑条吸附 |
| **当前章节切换** | `pageBindings` 选择整页 PNG，HTML overlay 显示段落结束和结局 |
| 关末视频 | `web/video/manifest.json` 驱动 K01-K22：章节过场、结局与反转，见 §11.8 运行时映射 |
| 存档 | **localStorage** 保存章节、台词、旗标、吃字记录、`endingSeed` 和结局 ID；`revealSeen` 记录反转已看 |
| 部署 | 静态托管（Vercel / Netlify / GitHub Pages）一键发布 |
| 本地化 | 简体中文 + en/de/ru（Beta，待母语审校）；切换语言不丢进度、旗标、结局与私语 |

### 5.2 Web技术栈优势

✅ **字符级热区问题已解决**：
```html
<!-- 每个zone用span包裹，浏览器自动计算精确位置 -->
<div class="dialogue-text">
  我<span class="zone" data-zone-id="0">其实没什么经验，而且我经常会说错话，</span>但我真的很需要这份工作。
</div>
```

```javascript
// 获取zone的精确屏幕位置（无需手动计算）
const zoneElement = document.querySelector('[data-zone-id="0"]');
const rect = zoneElement.getBoundingClientRect();
// rect.x, rect.y, rect.width, rect.height 全部由浏览器计算
```

✅ **其他优势**：
- 零构建时间（F5刷新即可测试）
- 跨平台原生支持（PC/Mac/移动端）
- 中文排版由浏览器处理（无需字体渲染引擎）
- 拖拽用原生 Pointer Events API
- 视频播放用原生 `<video>` 标签

### 5.3 数据结构（简化版）

```json
{
  "id": "L1_S02",
  "raw": "我当然很高兴你还能回来。",
  "zones": [
    {
      "id": "z1",
      "text": "当然",
      "remain": "我很高兴你还能回来。",
      "npc": "变成勉强的欢迎",
      "flags": ["pass+"],
      "eat": "当然"
    },
    {
      "id": "z2",
      "text": "很高兴",
      "remain": "我当然你还能回来。",
      "npc": "变成冷淡回应",
      "flags": ["truth+"],
      "eat": "很高兴"
    }
  ]
}
```

**注意**：Web方案**不需要**手动填写 `start/end` 索引，由DOM自动计算

---

## 六、七天制作排期（Web技术栈）

| 天 | 目标 | 程序任务 | 美术任务 |
| --- | --- | --- | --- |
| **D0** | **技术验证** | HTML结构+1句zone渲染+黑条拖拽demo | 测试AI生成V0_out视频 |
| **D1** | 核心循环 | JSON加载+拖拽吸附+flag累加 | 公寓BG + UI对话框/黑条 |
| **D2** | 第一关全流程 | L0+L1完整+失败重来+视频播放 | 会议室BG + 少女1姿势 + 3表情 |
| **D3** | 第二、三关 | L2+L3内容+消音体CSS切换 | 门厅BG + Stage1/2素材 + 剩余表情 |
| **D4** | 第四、五关 | L4+L5+结局分支 | Stage3 + 终局空房BG + 视频V1/V2 |
| **D5** | 视频+反转 | 所有视频接入+反转`V_RV`+UI抛光 | 视频V3/V4/V5批量生成 |
| **D6** | 音频+存档 | localStorage存档+音频接入+移动端测试 | 收集免费SFX/BGM |
| **D7** | 打包发布 | 测试+修bug+部署到Vercel/Netlify | 预告截图+宣传素材 |

### Day 0 技术验证清单（必做）

✅ **验证1：字符热区吸附**（2小时）
```bash
# 创建test.html，用1句话测试zone包裹+getBoundingClientRect
# 验证：中文、英文、标点符号的包围盒都正确
```

✅ **验证2：AI视频质量**（3小时）
```bash
# 用D0首帧生成V0_out测试片
# 检查清单：
# - 脸是否崩坏
# - 消音体是否长出五官
# - doomer风格是否保持
# - 文件大小是否合理（<10MB/条）
```

✅ **验证3：移动端兼容**（1小时）
```bash
# 在手机浏览器测试：
# - 触摸拖拽是否流畅
# - 视频能否自动播放
# - localStorage是否可用
```

**若验证失败**：
- 验证1失败 → Web方案不可行，需换引擎
- 验证2失败率>50% → 切换静帧推镜方案
- 验证3失败 → 添加兼容性fallback

---

## 七、风险与对策（Web技术栈更新）

| 风险 | 对策 | Web特有补充 |
| --- | --- | --- |
| 玩家以为是普通”选词解谜” | 开场 30 秒内用吞噬动画+消音体说话建立关系 | CSS动画足够 |
| 预设区感觉不自由 | 吸附手感做软；视觉上像自由拖，松手再吸附 | Pointer Events统一处理鼠标/触摸 |
| 语义改写变生硬 | 每句人工写剩余句，不自动删字拼接 | — |
| 范围膨胀 | 严格遵守”唯一操作 + 五关 + 2—3 结局”；视频只做关末不每句 | — |
| 主题过重引争议 | 表达控制与陪伴的双面，避免说教；结尾留给玩家解释 | — |
| AI 视频人物崩/闪 | 首帧锁 Demo；运镜慢；崩坏镜剪掉改静帧推镜 | 备用方案：CSS Ken Burns效果 |
| 视频风格不统一 | 统一提示词块（doomer/无 BGM/消音体材质）；同一批生成 | — |
| 体积过大 | 720p–1080p、短时长、H.264；总视频预算建议 < 80MB | Web部署可用CDN加速 |
| **移动端自动播放限制** | **在用户首次交互后初始化音频上下文** | **显示”点击开始”按钮** |
| **字体加载闪烁(FOUT)** | **使用font-display: block等待字体** | **或预加载字体后再显示游戏** |
| **跨浏览器兼容性** | **测试Chrome/Safari/Firefox** | **使用标准Web API，避免实验性特性** |
| **localStorage被禁用** | **检测可用性，降级到sessionStorage** | **提示用户”存档需要启用存储”** |

### Web技术栈新增风险

#### 1. 移动端视频自动播放
**问题**：iOS Safari/Chrome默认禁止自动播放  
**解决方案**：
```javascript
// 首次交互时初始化
document.getElementById('start-button').addEventListener('click', async () => {
  // 尝试播放静音视频解锁
  const dummyVideo = document.createElement('video');
  dummyVideo.muted = true;
  await dummyVideo.play().catch(() => {});
  
  startGame();
});
```

#### 2. 性能优化
**问题**：低端设备可能拖拽卡顿  
**解决方案**：
- 使用 `transform` 代替 `left/top`
- `requestAnimationFrame` 节流
- `will-change` 提示浏览器优化
- 移动端减少粒子特效

#### 3. 存档丢失
**问题**：用户清除浏览器数据会丢失存档  
**解决方案**：
- UI明确提示”存档保存在浏览器本地”
- 提供”导出/导入存档”功能（JSON下载）
- 可选：接入云存档（需后端）

---

## 八、宣传语与对外材料

**主宣传语**

> 你是她没有说出口的那个人。

**副宣传语**

> 她负责说谎，你负责活下来。

**商店短描述草稿**

每次她开口，你只能拖一条黑条，遮住一段话。被遮住的字会爬到她身边，长成你的身体。帮她说“正确的话”，或听她说不能说的话——二十分钟的共生，一次只能删一段。

**对外需准备**

- 十秒预告片（见 3.8；可直接剪 `V0`+遮挡 UI +`V2` 肩侧）
- 3—5 张关键截图：遮挡中、消音体生长、直播关、终局房间、反转对位
- 可选：竖切 Demo 链接
- 关末视频也可作短视频物料（无剧透反转版）

---

## 九、一页纸总结（给评审 / 队友）

| 维度 | 一句话 |
| --- | --- |
| 是什么 | 拖黑条改台词的短篇叙事解谜 |
| 谁 | 你是她语言里的消音；她是靠你说谎活着的少女 |
| 唯一玩法 | 遮掉一段连续文字并“吃掉” |
| 爽点/钩子 | 改一个词，关系与命运偏移；黑字长成人形 |
| 结构 | 开场+5 关 × 约 35 句 + 关末 AI 视频，约 30—36 分钟 |
| 场景转换 | 每章结局用图生视频短片连接下一空间 |
| 反转 | 遮住的才是真话，你是唯一听见的人（`V_RV`） |
| 不做 | 数值养成、自由输入、大地图、多结局收集、每句视频 |
| 为什么像“重度依赖” | 不是系统多，而是关系与图像只属于这个游戏 |
| 台本 | 详见 `台本.md` / `script/chapters.json` |
| 怎么组 | 见下文 **第十—十五章**（程序/美术/验收） |

---

## 十、文档地图（先看这个）

| 你是谁 | 先读 | 再读 | 动手用 |
| --- | --- | --- | --- |
| **程序（Web前端）** | 本文 §3.1、§5、§十一 | `script/chapters.json` | §11.11 Day 1 demo |
| **程序（菜鸟）** | 本文 §十六 快速启动 | §11.5 单句状态机 | 复制Day 1 HTML |
| **美术（菜鸟）** | `art-style.md` + 本文 §十二 | Demo 图 D0–D6 | §十二资产表 |
| **策划/文案** | `台本.md` | 本文 §4 | JSON 字段表 |
| **资产/技术整合** | `art/v4/playable/README.md` | `manifest.json` + `validate.py` | V4 资产验收 |
| **全员** | 本文 §九 | `selling-points.md` | 验收 §十四 |

```text
KeepSilentForMe/
├── schedule.md              ← 本策划案（含Web组装手册）
├── 台本.md                   ← 分章台词 + 关末视频分镜
├── script/chapters.json     ← 程序唯一内容源（读这个驱动游戏）
├── art-style.md             ← 画风锁
├── selling-points.md        ← 对外怎么说
├── storyboard/
│   └── v4-prop-lock/        ← 公寓道具锁 R0（当前）
├── archive/storyboard/demo-effects/frames/ ← D0–D6 玩法效果参考（历史）
└── ...
└── [Web项目目录结构见 §11.3]
```

当前静态可玩资产的唯一入口是 `art/v4/playable/manifest.json`；它通过
`sceneBindings` 兼容引用 `art/bg/` 的五张旧背景，并管理透明角色、表情、NPC、
消音体、结局、FX 和 UI。Web 项目创建后可以把这些类别复制到自己的 `assets/`
目录，但不要重新维护一份独立的资产清单。

**原则**：对白与分支以 **JSON 为准**；画风以 **art-style + Demo 图** 为准；关末电影感以 **台本视频节** 为准。不要在三个地方各写一套互相矛盾的句子。

**Web技术栈特别提示**：
- 不需要Unity/Godot等引擎，纯浏览器即可运行
- 程序菜鸟可直接用 §11.11 的HTML demo开始
- 无需构建工具，F5刷新即测试
- 部署到Vercel/Netlify一键完成

---

## 十一、程序组装手册（Web技术栈）

### 11.1 你要做的游戏其实只有这些屏

| 屏 ID | 名字 | 玩家能做什么 | 退出条件 |
| --- | --- | --- | --- |
| `Boot` | 标题 | 开始 / 继续 | 点开始 |
| `ChapterIntro` | 关卡一句话目标 | 点击继续 | 点击 |
| `LinePlay` | **核心玩法屏** | 拖黑条、松手确认 | 本句结算完 |
| `Npc` | NPC/弹幕反馈 | 点击下一句 | 点击或自动 1.5s |
| `ChapterOutro` | 关末视频 | 可选跳过（非首次） | 视频结束 |
| `Ending` | 结局视频 | 同左 | 结束 |
| `Reveal` | 反转 `V_RV` | 同左 | 结束 → 标题/制作人员 |

竖切最低：`LinePlay` + 读 JSON 一句三 zone 即可。

### 11.2 Web画面层级（CSS z-index）

```css
/* 从下到上的层级 */
#bg-layer          { z-index: 0; }   /* 场景BG（整屏16:9图） */
#character-layer   { z-index: 10; }  /* 少女立绘/姿势 */
#creature-layer    { z-index: 20; }  /* 消音体Stage（CSS opacity渐变） */
#dialogue-box      { z-index: 30; }  /* 对话框底板（下20%-28%屏高） */
#dialogue-text     { z-index: 40; }  /* 台词文字（raw + span.zone包裹） */
#black-bar         { z-index: 50; }  /* 黑条（position: absolute拖拽） */
#chapter-title     { z-index: 5; }   /* 顶栏章名（极淡，可无） */
#video-layer       { z-index: 100; } /* 全屏视频（仅Outro/Ending/Reveal） */
```

**HTML结构示例**：
```html
<div id="game-container">
  <img id="bg-layer" src="assets/bg/BG_L1.jpg" />
  <img id="character-layer" src="assets/char/pose_desk.png" />
  <div id="creature-layer" class="stage-1"></div>
  
  <div id="dialogue-box">
    <div id="dialogue-text">
      <!-- 动态渲染，zone用span包裹 -->
    </div>
  </div>
  
  <div id="black-bar"></div>
  <video id="video-layer" style="display: none;"></video>
</div>
```

**禁止**：把黑条画进 BG；在 BG 上烤大段可读正文。

### 11.3 文件夹结构（Web项目）

```text
KeepSilentForMe/
├── index.html              # 游戏主页面
├── css/
│   ├── style.css           # 主样式
│   ├── dialogue.css        # 对话框样式
│   └── animations.css      # 吃字特效
├── js/
│   ├── game.js             # 核心游戏逻辑
│   ├── drag-handler.js     # 黑条拖拽+吸附
│   ├── video-player.js     # 视频播放器
│   ├── save-manager.js     # localStorage存档
│   └── data-loader.js      # JSON加载
├── assets/
│   ├── data/
│   │   └── chapters.json   # 从script/拷贝
│   ├── bg/
│   │   ├── BG_L0.jpg
│   │   └── BG_L1.jpg …
│   ├── char/
│   │   ├── pose_desk.png
│   │   └── face_紧张.png …
│   ├── creature/
│   │   ├── stage1.png
│   │   └── stage2.png stage3.png
│   ├── ui/
│   │   ├── dialog_panel.png
│   │   └── bar_black.png
│   ├── video/
│   │   ├── V0_out.mp4
│   │   └── V1_pass.mp4 …
│   ├── audio/
│   │   ├── sfx/
│   │   │   ├── eat.mp3
│   │   │   └── snap.mp3 …
│   │   └── bgm/
│   │       ├── room.mp3
│   │       └── live.mp3 end.mp3
│   └── fonts/
│       └── SourceHanSansCN-Regular.woff2
└── README.md
```

### 11.4 运行时状态（JavaScript对象）

```javascript
// 游戏状态（全局对象）
const gameState = {
  chapterIndex: 0,           // 当前章节 0-5 (L0-L5)
  lineIndex: 0,              // 当前句子索引
  phase: 'boot',             // boot|intro|line|npc|outro|ending|reveal
  
  // Flag系统（关键结算用）
  flags: {
    pass: 0,                 // L1结算
    fail: 0,                 // L1结算
    hate_leak: 0,            // L2结算
    apology_perform: 0,      // L4路线
    apology_refuse: 0,       // L4路线
    // 以下为可选（供彩蛋/反转字幕筛选）
    mask: 0, truth: 0, bond: 0, crack: 0, control: 0
  },
  
  eatLog: [],                // 本周目吃掉的文字数组，供反转低语
  creatureStage: 1,          // 消音体阶段 1|2|3
  seenVideos: new Set(),     // 已看过的视频ID（用于跳过）
  endingId: null             // 最终结局 "A"|"B"|"C"
};

// 存档到localStorage
function saveGame() {
  localStorage.setItem('keepsilent_save', JSON.stringify(gameState));
}

// 读档
function loadGame() {
  const saved = localStorage.getItem('keepsilent_save');
  if (saved) {
    Object.assign(gameState, JSON.parse(saved));
    // 注意：Set需要特殊处理
    gameState.seenVideos = new Set(gameState.seenVideos);
  }
}
```

**不要做**：HP、好感条、粉丝数、物品栏、多角色好感。

### 11.5 单句状态机（Web实现）

```javascript
async function playLine(lineData) {
  // 1. 更新BG/立绘/消音体
  updateBackground(currentChapter.scene);
  updateCharacter(lineData.face);
  updateCreature(gameState.creatureStage);
  
  // 2. 渲染对话框（用span包裹zone）
  const dialogueHTML = renderDialogueWithZones(lineData);
  document.getElementById('dialogue-text').innerHTML = dialogueHTML;
  
  // 3. 获取所有zone的屏幕位置
  const zones = document.querySelectorAll('.zone');
  const zoneRects = Array.from(zones).map(el => ({
    element: el,
    rect: el.getBoundingClientRect(),
    data: lineData.zones[el.dataset.zoneId]
  }));
  
  // 4. 启用黑条拖拽
  const selectedZone = await dragBlackBar(zoneRects);
  
  // 5. 吃字动画
  await playEatAnimation(selectedZone.element);
  
  // 6. 应用flags
  applyFlags(selectedZone.data.flags);
  gameState.eatLog.push(selectedZone.data.eat);
  
  // 7. 显示剩余句子 + NPC反馈
  document.getElementById('dialogue-text').textContent = selectedZone.data.remain;
  showNpcReaction(selectedZone.data.npc);
  
  // 8. 等待继续
  await waitForClick();
}

// 渲染函数：将zones包裹成span
function renderDialogueWithZones(lineData) {
  let html = lineData.raw;
  // 倒序替换（避免索引错位）
  lineData.zones.reverse().forEach((zone, index) => {
    const startIndex = html.indexOf(zone.text);
    if (startIndex === -1) {
      console.error(`Zone text "${zone.text}" not found in raw!`);
      return;
    }
    const before = html.substring(0, startIndex);
    const after = html.substring(startIndex + zone.text.length);
    html = before + 
           `<span class="zone" data-zone-id="${index}">${zone.text}</span>` + 
           after;
  });
  return html;
}
```

### 11.6 黑条拖拽与吸附（Web核心实现）

```javascript
// 黑条拖拽+吸附逻辑
function dragBlackBar(zoneRects) {
  return new Promise(resolve => {
    const bar = document.getElementById('black-bar');
    let isDragging = false;
    let currentZone = null;
    
    // 指针按下（支持鼠标+触摸）
    bar.addEventListener('pointerdown', (e) => {
      isDragging = true;
      bar.style.cursor = 'grabbing';
      bar.setPointerCapture(e.pointerId);
    });
    
    // 拖动中（使用requestAnimationFrame优化性能）
    let rafId = null;
    bar.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        // 移动黑条到指针位置
        bar.style.transform = `translate(${e.clientX - bar.offsetWidth/2}px, 
                                         ${e.clientY - bar.offsetHeight/2}px)`;
        
        // 计算最近的zone（视觉提示）
        currentZone = findNearestZone(e.clientX, e.clientY, zoneRects);
        highlightZone(currentZone);
        
        rafId = null;
      });
    });
    
    // 松手吸附
    bar.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      bar.style.cursor = 'grab';
      
      // 吸附到最近zone
      const targetZone = findNearestZone(e.clientX, e.clientY, zoneRects);
      if (targetZone) {
        snapToZone(bar, targetZone.rect, () => {
          resolve(targetZone);
        });
      }
    });
  });
}

// 查找最近zone（欧氏距离）
function findNearestZone(x, y, zoneRects) {
  let nearest = null;
  let minDistance = Infinity;
  
  zoneRects.forEach(zone => {
    const centerX = zone.rect.left + zone.rect.width / 2;
    const centerY = zone.rect.top + zone.rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = zone;
    }
  });
  
  return nearest;
}

// 吸附动画（CSS transition）
function snapToZone(bar, targetRect, callback) {
  bar.style.transition = 'transform 0.12s ease-out';
  bar.style.transform = `translate(${targetRect.left}px, ${targetRect.top}px)`;
  bar.style.width = `${targetRect.width}px`;
  
  setTimeout(() => {
    bar.style.transition = '';
    callback();
  }, 120);
}
```

**CSS配合**：
```css
#black-bar {
  position: absolute;
  background: #0A0A0A;
  height: 40px;
  cursor: grab;
  will-change: transform;
  touch-action: none; /* 防止触摸滚动 */
  user-select: none;
}

.zone {
  display: inline;
  transition: background-color 0.15s;
}

.zone.highlight {
  background-color: rgba(255, 0, 0, 0.1); /* 拖拽时预览 */
}
```

### 11.7 flag 字符串解析

| JSON 写法 | 程序 |
| --- | --- |
| `pass+` | `flags["pass"] = get+1` |
| `fail+` | `fail += 1` |
| `trust-` | `trust -= 1` |
| `mask+` `truth+` `bond+` `crack+` `control+` `hate_leak+` `revolt+` `secret_risk+` `distance+` `apology_perform+` `apology_refuse+` | 同理 ±1 |

结算只读这些计数，**不要**做复杂公式。

### 11.8 各章结算（抄这张表写 if）

> **实现状态说明**：当前代码对 L1 执行 `pass >= 3 && fail < 2 && risk < 3`、对 L2 执行 `hate_leak < 2`，
> 失败均显示重试层；L3 只记录旗标；L4 按 `apology_perform >= apology_refuse` 选表演/硬刚
> 过场（混线取较高，平票取表演；混线先播 1s 噪声近似）；L5 主判定 L5_S06 的 `ending`，L5_S03 的 `ending_seed`（A/B）
> 微调 A/B 两结局（C/C' 不受影响）。

| 章 | 通过/走向 | 条件（读 flags） | 视频 |
| --- | --- | --- | --- |
| L0 | 必过 | 任意选完 L0_S01 | `V0_out` |
| L1 | 录取 | `pass>=3 && fail<2 && risk<3` | `V1_pass` |
| L1 | 重来 | 否则 | `V1_fail` 或直接 `lineIndex=0` |
| L2 | 下播 | `hate_leak<2` | `V2_out` |
| L2 | 事故重来 | 否则 | 提示后重开章 |
| L3 | 无胜负 | 只记录 crack/trust 等 | 必播 `V3_out` |
| L4 | 表演线 | `apology_perform >= apology_refuse`（混线取较高，平票取表演；混线先播 1s 噪声近似） | `V4_perform` |
| L4 | 硬刚线 | 否则（refuse 更高） | `V4_refuse` |
| L5 | 结局 | 看 L5_S06 zone 的 `ending`；L5_S03 `ending_seed` 微调 A/B（C/C' 不参与） | `V5_A/B/C` |
| 后 | 反转 | 任意结局后 | `V_RV`（eatLog 取 3 条叠 UI） |

L5 zone 的 `ending` 示例：`A_separate` → 播 `V5_A`。
`ending_seed` 微调：seed A 与 `B_alienate` 相斥时回 `A_separate`；seed B 与 `A_separate` 相斥时回 `B_alienate`。

### 11.9 黑条手感参数（可调表）

| 参数 | 建议值 |
| --- | --- |
| 条高度 | 对话框字号 × 1.2 |
| 最小宽 | 2 个汉字宽 |
| 吸附 | 松手时落到最近 zone 中心 |
| 吸附动画 | 0.08–0.12s easeOut |
| 未确认透明度 | 1.0（不要半透明「玻璃条」） |
| 确认后 | 条可留 0.3s 再吸入 |

### 11.10 关末视频播放（Web实现）

```javascript
// 视频播放器
async function playOutroVideo(videoId) {
  const videoLayer = document.getElementById('video-layer');
  const video = document.createElement('video');
  video.src = `assets/video/${videoId}.mp4`;
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  
  // 显示视频层
  videoLayer.innerHTML = '';
  videoLayer.appendChild(video);
  videoLayer.style.display = 'block';
  
  // 如果已看过，显示跳过按钮
  if (gameState.seenVideos.has(videoId)) {
    const skipBtn = createSkipButton();
    videoLayer.appendChild(skipBtn);
    skipBtn.onclick = () => {
      video.pause();
      videoLayer.style.display = 'none';
    };
  }
  
  // 播放视频
  return new Promise((resolve, reject) => {
    video.play().catch(err => {
      // 移动端自动播放失败，显示"点击继续"
      if (err.name === 'NotAllowedError') {
        showPlayButton(() => {
          video.play();
        });
      } else {
        console.error('Video load error:', err);
        // 视频缺失时用黑场占位
        showBlackScreen(videoId, 1.5);
        resolve();
      }
    });
    
    video.onended = () => {
      gameState.seenVideos.add(videoId);
      videoLayer.style.display = 'none';
      saveGame(); // 自动存档
      resolve();
    };
  });
}

// 视频预加载策略
function preloadVideos() {
  const criticalVideos = ['V0_out', 'V1_pass', 'V_RV'];
  
  criticalVideos.forEach(id => {
    const video = document.createElement('video');
    video.src = `assets/video/${id}.mp4`;
    video.preload = 'auto';
    video.style.display = 'none';
    document.body.appendChild(video);
  });
}

// 根据章节预加载下一条视频
function preloadNextVideo(chapterId) {
  const nextVideoMap = {
    'L0': 'V1_pass',
    'L1': 'V2_out',
    'L2': 'V3_out',
    'L3': 'V4_perform', // 预加载主路线
    'L4': 'V5_A'
  };
  
  const nextId = nextVideoMap[chapterId];
  if (nextId) {
    const video = document.createElement('video');
    video.src = `assets/video/${nextId}.mp4`;
    video.preload = 'auto';
  }
}
```

**音频处理**：
```javascript
// 视频播放时降低BGM音量
function playVideoWithAudio(videoId) {
  const bgm = document.getElementById('bgm-player');
  const originalVolume = bgm.volume;
  
  bgm.volume = 0.2; // 降低到20%
  
  playOutroVideo(videoId).then(() => {
    bgm.volume = originalVolume; // 恢复
  });
}
```

### 11.11 竖切（第 1 天）最小目标

**Web技术栈Day 1清单**：

- [ ] **HTML基础结构**（index.html + 基础CSS）
- [ ] 读入 JSON 一句（fetch + JSON.parse）
- [ ] 显示 raw，用 `<span class="zone">` 包裹3个zone
- [ ] 获取zone的 `getBoundingClientRect()`（验证位置正确）
- [ ] 黑条可拖动（`pointerdown/move/up`）
- [ ] 松手吸附到最近zone（简单距离计算）
- [ ] 切换 remain + 打印 npc 文本
- [ ] 累加 flags.pass/fail
- [ ] **第二天再加吃字动画和视频播放**

**Day 1 最小可运行demo**：
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Keep Silent For Me - Prototype</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      width: 100vw; 
      height: 100vh; 
      background: #0A0A0A;
      overflow: hidden;
    }
    #game-container { 
      position: relative; 
      width: 100%; 
      height: 100%; 
    }
    #dialogue-box {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 25%;
      background: rgba(18, 18, 18, 0.9);
      padding: 2vw;
      color: #E8E4DC;
      font-size: clamp(16px, 1.8vw, 32px);
      font-family: sans-serif;
    }
    .zone {
      background: rgba(255, 0, 0, 0.1);
      transition: background 0.15s;
    }
    .zone:hover { background: rgba(255, 0, 0, 0.3); }
    #black-bar {
      position: absolute;
      background: #0A0A0A;
      height: 44px;
      width: 100px;
      cursor: grab;
      touch-action: none;
      will-change: transform;
      top: 50%;
      left: 50%;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div id="dialogue-box">
      <div id="dialogue-text">加载中...</div>
    </div>
    <div id="black-bar"></div>
  </div>
  
  <script>
    // Day 1 最小实现
    fetch('assets/data/chapters.json')
      .then(r => r.json())
      .then(data => {
        const line = data.chapters[0].lines[0]; // L0_S01
        renderLine(line);
      });
    
    function renderLine(line) {
      let html = line.raw;
      line.zones.forEach((zone, i) => {
        html = html.replace(zone.text, 
          `<span class="zone" data-id="${i}">${zone.text}</span>`);
      });
      document.getElementById('dialogue-text').innerHTML = html;
      console.log('Zones rendered:', line.zones.length);
    }
  </script>
</body>
</html>
```  

### 11.12 完整版模块清单（Web程序任务拆分）

| 模块 | 优先级 | 说明 | 文件 |
| --- | --- | --- | --- |
| DataLoader | P0 | fetch读取chapters.json | js/data-loader.js |
| DialogueView | P0 | 对话框渲染 + span.zone包裹 | js/dialogue-view.js |
| DragHandler | P0 | 黑条拖拽 + 吸附（Pointer Events） | js/drag-handler.js |
| FlagService | P0 | flags对象 ± 计数 | js/flag-service.js |
| ChapterFlow | P0 | 句/章/结算状态机 | js/chapter-flow.js |
| CreatureView | P1 | CSS切换stage类名 | css/creature.css |
| CharacterView | P1 | 切换立绘src + 表情 | js/character-view.js |
| EatAnimation | P1 | CSS @keyframes字屑飞向肩 | css/animations.css |
| VideoPlayer | P1 | HTML5 `<video>` + 预加载 | js/video-player.js |
| SaveManager | P2 | localStorage存/读档 | js/save-manager.js |
| AudioManager | P2 | Web Audio API播放SFX/BGM | js/audio-manager.js |
| RevealUI | P2 | 反转视频 + eatLog字幕叠层 | js/reveal-ui.js |

**技术细节**：
- **不需要构建工具**：直接用ES6 modules（`<script type="module">`）
- **不需要框架**：纯Vanilla JS，总代码量约1500-2000行
- **移动端兼容**：使用Pointer Events（统一鼠标+触摸）
- **性能优化**：requestAnimationFrame + CSS transform + will-change

### 11.13 JSON 字段（程序契约 - Web版）

```javascript
// chapters.json 结构
{
  "chapters": [
    {
      "id": "L1",
      "title": "面试",
      "scene": "meeting_room",  // 对应 manifest.sceneBindings.meeting_room
      "creature": "stage1",     // CSS类名: .creature.stage-1
      "goal": "pass>=3 && fail<2",
      "lines": [/* 见下 */],
      "outro_video": "V1_pass",
      "narration": ["旁白1", "旁白2"]
    }
  ]
}

// lines[] 结构
{
  "id": "L1_S01",
  "raw": "我叫——算了，名字不重要，我只是一个很普通、很容易把事情搞砸的人。",
  "face": "紧张",           // script 标签；由 manifest.faceMap 映射到 FACE_anxious
  "zones": [
    {
      "text": "很容易把事情搞砸",  // ⚠️ 必须是raw的连续子串
      "remain": "我叫——算了，名字不重要，我只是一个很普通的人。",
      "npc": "普通也没关系。",
      "flags": ["pass+"],
      "eat": "很容易把事情搞砸"
    }
  ],
  "demo": "D1",            // 可选：参考图编号
  "is_ending": false,      // 仅L5_S06为true
  "special": null          // 可选：如"预锁1.5s"
}
```

**Web实现注意**：
- `text` 字段用于 `raw.indexOf(zone.text)` 查找位置
- **不需要** `start/end` 数值索引（DOM自动计算）
- `scene/face/creature` 字段直接映射到文件路径或CSS类名
- `flags[]` 数组：遍历执行 `gameState.flags[flag.replace('+', '')] += 1`

**坏数据检测**（启动时校验）：
```javascript
function validateChaptersData(data) {
  data.chapters.forEach(chapter => {
    chapter.lines.forEach(line => {
      line.zones.forEach(zone => {
        if (line.raw.indexOf(zone.text) === -1) {
          throw new Error(
            `Zone text "${zone.text}" not found in raw: "${line.raw}" (${line.id})`
          );
        }
      });
    });
  });
}
```

---

## 十二、美术组装手册（从 0 到齐套）

### 12.1 你要交的东西（打勾表）

| 序号 | 资产 | 规格 | 参考 | 当前入口 |
| --- | --- | --- | --- | --- |
| 1–5 | 场景 BG | 5 张旧批次 PNG，1536×1024；运行时 fit/crop 到 1920×1080 逻辑画布 | R0 / D0–D5 | `art/bg/BG_*.png`，由旧版 manifest `backgrounds` 引用 |
| 6 | 少女叙事姿势 | 8 张透明 RGBA 层 | D0–D5 | `art/v4/playable/char/` |
| 7 | 对话表情 | 10 个基础表情 + 2 个变体 | face 枚举 | `art/v4/playable/faces/`，由 `faceMap` 映射 |
| 8 | 消音体 Stage1/2/3 | 3 张透明 RGBA 层 | D6 | `art/v4/playable/creature/` |
| 9 | NPC 层 | 4 张透明 RGBA 层 | D3 / D1 | `art/v4/playable/npc/` |
| 10 | 结局层 | 2 张透明 RGBA 层 | 台本终局 | `art/v4/playable/ending/` |
| 11 | FX 交互层 | 9 张透明 RGBA 层 | 章节触发 | `art/v4/playable/fx/` |
| 12 | UI 运行时层 | 5 张透明 RGBA 层 | D0 / 直播 / 黑条状态 | `art/v4/playable/ui/` |
| 13 | 关末视频 | 9–11 条，16:9 MP4，6–12s | 台本 V* | `video/V*.mp4`（待制作） |

**当前状态**：13 张整页场景/结局页已完成并通过校验，运行时入口为
`art/v4/scenes/manifest.json`；V4 可玩包的 55 件透明/反馈资产仍保留，其中透明叙事层
仅作源文件和未来变体，当前 Demo 不叠加它们。旧 `art/bg/` 继续作为生成与回溯素材和 V4 兼容入口。
关末视频、BGM、外部 SFX 和配音仍待制作，当前章节切换使用整页翻页/淡入动画。

### 12.2 画风铁律（违反即返工）

1. doomer 手绘 2D 写实线稿，深黑室内，低饱和。  
2. **不是**粉嫩偶像、赛博霓虹、厚涂萌、写实照片。  
3. 消音体 = **哑光黑条 + 碎字**，禁止五官、发光眼、长发厉鬼。  
4. 信号红 ≤ 画面约 2%（直播点除外）。  
5. 场景图 **不要** 写满可读长文；字留给 UI。  
6. 详规：`art-style.md`；效果样张：`archive/storyboard/demo-effects/frames/`。

### 12.3 表情枚举（与 JSON `face` 一一对应）

| face 字段 | 怎么画 | 多用关 |
| --- | --- | --- |
| 紧张 | 眉心轻蹙，视线下 | L1 |
| 假笑 | 嘴角勉强，眼不笑 | L2 |
| 冷淡 | 眉眼平，少高光 | L2/L3 |
| 崩溃边缘 | 眼红/咬唇，仍克制 | L3/L4 |
| 依赖 | 看向肩侧/镜头旁 | 关系句、终句 |
| 空白 | 表情抽离 | L4 后、吞没 |
| 讨好 | 职业假面 | L2/L4 |
| 抽离 | 侧脸对窗 | L2 末、L5 |

### 12.4 消音体三阶段（美术交付标准）

| Stage | 尺寸感 | 锚点 | 出现 |
| --- | --- | --- | --- |
| 1 | 巴掌大墨团+细条 | 袖口/桌角 | L0–L2 初 |
| 2 | 半个上身碎字堆 | 肩背 | L2 末–L4 |
| 3 | 与人等高重叠剪影 | 身体中轴 | L4 末–L5 |

程序只切换贴图或透明度，**不做**骨骼复杂动画（蠕动用 2–3 帧循环或 shader 噪波即可）。

### 12.5 UI 视觉规格

| 元素 | 规格 |
| --- | --- |
| 分辨率逻辑 | 1920×1080，16:9 |
| 对话框 | 底部，左右边距 ≥ 8%，高度约 22%–28% |
| 字体 | 思源/微软雅黑等；字号约 28–36px@1080p |
| 字色 | `#E8E4DC` 近白暖灰 |
| 底色 | `#121212`–`#1A1A1A`，透明度 85%–92% |
| 黑条 | `#0A0A0A`–`#000000`，**不透明**，边缘可 1px 噪 |
| 禁止 | 彩色渐变条、霓虹描边、游戏血条风 |

### 12.6 场景与 Demo 对照（直接临摹构图）

| 章 | BG | 打开这张临摹 |
| --- | --- | --- |
| L0/L2/L4/L5 公寓系 | 书桌+三格窗+门右 | `D0` `D2` `D4` `D5` + `v4-prop-lock` R0 |
| L1 | 会议室 | `D1-interview.png` |
| L3 | 门厅 | `D3-friend-door.png` |
| 消音体 | — | `D6-creature-stages.png` |

公寓道具锁（勿丢）：西侧桌、CRT、黑关节灯、书堆、三格雨窗、灰褐帘、门在窗右。

### 12.7 关末视频制作流水线（美术/影像）

```text
1. 选首帧：对应 Demo PNG（或本关结算截图）
2. 图生视频 6–12s，提示词跟台本「V*」节 + art-style §十
3. 检查：脸崩/多指/五官消音体 → 重roll 或剪成慢推静帧
4. 导出 H.264，720p 或 1080p，无必要 4K
5. 默认无 BGM；环境声可后期贴
6. 命名放入 video/（见台本附录）
```

### 12.8 美术日程建议（V4 静态包已完成，与程序并行）

| 日 | 美术产出 |
| --- | --- |
| 1 | 读取 `art/v4/playable/manifest.json`，接入 L0/L1 的 BG、角色、表情与 UI |
| 2 | 跑 `validate.py`，确认透明通道、尺寸和锚点；补缺的 Web 资源复制脚本 |
| 3 | 接入门厅/NPC/直播交互层，核对 `interactiveBindings` 的章节触发 |
| 4 | 接入 Stage3、结局层和结束画面；确认 `endingIds` 映射 |
| 5–6 | 关末视频批量 |
| 7 | 修崩溃帧、预告截图 |

---

## 十三、音频资产清单（使用免费资源）

### 13.1 音效(SFX)来源

**推荐网站**：
- [Freesound.org](https://freesound.org) - CC0/CC-BY授权
- [Zapsplat.com](https://zapsplat.com) - 免费下载
- [Mixkit.co](https://mixkit.co/free-sound-effects/) - 商用免费

| SFX ID | 用途 | 搜索关键词 | 备注 |
| --- | --- | --- | --- |
| `sfx_drag` | 黑条拖动 | "cloth drag" "fabric slide" | 极轻，循环 |
| `sfx_snap` | 吸附到zone | "snap" "click soft" | 短促0.1s |
| `sfx_eat` | 吃字动画 | "paper crumble" "ink drip" | 纸屑+墨吸 |
| `sfx_say` | remain文字出现 | "text appear" "soft pop" | 轻定音 |
| `sfx_chat` | 弹幕反馈 | "notification" "chat beep" | 稀疏，可选 |
| `sfx_grow` | 消音体升级 | "dark whoosh" "entity grow" | 低沉 |
| `sfx_video_end` | 视频结束转场 | "whoosh" "transition" | 可选 |

**格式要求**：MP3（128kbps）或 OGG  
**总预算**：<2MB

### 13.2 背景音乐(BGM)来源

**推荐网站**：
- [Incompetech.com](https://incompetech.com/music/royalty-free/) - Kevin MacLeod CC-BY
- [Purple Planet](https://www.purple-planet.com) - 免费商用
- [Bensound.com](https://bensound.com) - 部分免费

| BGM ID | 场景 | 推荐曲目/关键词 | 时长 | 循环 |
| --- | --- | --- | --- | --- |
| `bgm_room` | L0/L3/L5 安静场景 | "Ambient Dark" "Drone" | 2-3min | ✅ |
| `bgm_live` | L2/L4 直播 | "Tension" "Anxiety" | 2-3min | ✅ |
| `bgm_end` | 结局前 | "Minimalist Piano" | 2min | ❌ |

**Incompetech推荐曲目**：
- `Dark Fog` - 低沉氛围
- `Oppressive Gloom` - 压抑感
- `Echoes of Time` - 极简钢琴

**格式要求**：MP3（128-192kbps）  
**总预算**：<3MB

### 13.3 视频环境声

**关末视频音频处理**：
- **优先**：AI视频生成时自带环境声（雨、脚步、门）
- **备选**：单独录制/下载Foley音效叠加
- **规则**：视频播放时BGM降低到20%音量

**环境声搜索关键词**：
| 场景 | 关键词 |
| --- | --- |
| 雨夜 | "rain window" "rain ambience" |
| 门/走廊 | "door close" "footsteps hallway" |
| CRT开关 | "TV static" "CRT power" |
| 纸屑/墨 | "paper rustle" "ink drip" |

### 13.4 Web Audio实现

```javascript
// 简单音频管理器
class AudioManager {
  constructor() {
    this.sfx = {};
    this.bgm = null;
    this.volume = {
      sfx: 0.7,
      bgm: 0.4
    };
  }
  
  // 预加载SFX
  async loadSFX() {
    const sfxList = ['drag', 'snap', 'eat', 'say', 'grow'];
    for (const name of sfxList) {
      const audio = new Audio(`assets/audio/sfx/${name}.mp3`);
      audio.volume = this.volume.sfx;
      this.sfx[name] = audio;
    }
  }
  
  // 播放SFX
  playSFX(name) {
    if (this.sfx[name]) {
      this.sfx[name].currentTime = 0;
      this.sfx[name].play().catch(e => console.log('SFX play error:', e));
    }
  }
  
  // 播放BGM（循环）
  playBGM(name) {
    if (this.bgm) this.bgm.pause();
    this.bgm = new Audio(`assets/audio/bgm/${name}.mp3`);
    this.bgm.volume = this.volume.bgm;
    this.bgm.loop = true;
    this.bgm.play().catch(e => console.log('BGM play error:', e));
  }
  
  // 视频播放时降低BGM
  lowerBGM() {
    if (this.bgm) this.bgm.volume = this.volume.bgm * 0.2;
  }
  
  // 恢复BGM
  restoreBGM() {
    if (this.bgm) this.bgm.volume = this.volume.bgm;
  }
}
```

### 13.5 音频授权注意事项

**CC-BY授权使用规范**：
- ✅ 游戏内Credits页面署名作者
- ✅ 保留原始授权信息
- ❌ 不要声称音频是自己创作

**示例Credits文本**：
```
音频资产
========

SFX来源：
- Freesound.org (CC0 License)
- Zapsplat.com (Standard License)

BGM来源：
- "Dark Fog" by Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0 License
  http://creativecommons.org/licenses/by/4.0/
```

---

## 十四、验收标准（做完如何算过）

### 14.1 玩法验收

- [ ] 10 秒内能看懂：拖条 → 字没了 → 肩侧有反应  
- [ ] 每句只能遮 **一段** 连续 zone，不能多选  
- [ ] remain 与台本一致，无自动乱删字  
- [ ] L1 失败可重来；L3 无「完美通关」勾  
- [ ] L5 无结局菜单，遮终句即结局  
- [ ] 反转必播一次，eat 低语来自本周目  

### 14.2 美术验收

- [ ] 与 D0–D6 同一画风家族  
- [ ] 消音体无五官鬼脸  
- [ ] UI 黑条压在字上清晰可辨  
- [ ] 视频不出现粉嫩棚/潜行 HUD  

### 14.3 程序验收

- [ ] JSON 启动校验 zone⊂raw  
- [ ] 缺视频不崩溃（黑场占位）  
- [ ] 存档能续关  
- [ ] 16:9 下 UI 不溢出  

### 14.4 内容验收

- [ ] 全文案来自 `台本.md` / `chapters.json`，无临时占位句进发包  

---

## 十五、一页「今天做什么」（Web技术栈版）

**程序今天（Day 1）：**  
① 创建 `index.html` + 基础CSS → ② fetch读取 `chapters.json` → ③ 渲染1句话，用 `<span class="zone">` 包裹 → ④ 黑条可拖动（pointerdown/move/up） → ⑤ 松手吸附到最近zone → ⑥ 切换remain文本 → ⑦ flags累加

**美术今天（静态包已完成）：**
① 阅读 `art/v4/playable/README.md` → ② 运行 `python3 art/v4/playable/validate.py` → ③ 按 manifest 接入 L0/L1 的背景、角色、表情、对话框和黑条 → ④ 把视频与音频列为后续开发资产，不在旧批次目录重复生成

**音频今天（Day 6）：**  
① 访问 freesound.org 搜索 "paper rustle" "ink drip" "snap" → ② 下载5-8个SFX → ③ 访问 incompetech.com 选择3首BGM（ambient/dark） → ④ 转换为MP3格式

**共同禁止：**  
好感条、自由输入、探索地图、每句都做视频、消音体长脸。

---

## 十六、Web技术栈快速启动指南

### 16.1 零基础5分钟启动

```bash
# 1. 创建项目目录
mkdir KeepSilentForMe-web
cd KeepSilentForMe-web

# 2. 创建基础结构
mkdir -p assets/{data,bg,char,creature,ui,video,audio/sfx,audio/bgm,fonts}
mkdir -p css js

# 3. 拷贝JSON数据
cp ../script/chapters.json assets/data/

# 4. 创建index.html（使用上面的Day 1 demo）
# 5. 用浏览器打开index.html（无需服务器）

# 6. 若需要本地服务器（解决CORS问题）
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 16.2 部署到生产环境（免费）

#### 方案A：Vercel（推荐）
```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 在项目目录运行
vercel

# 3. 按提示操作，自动部署
# 得到URL：https://keep-silent-for-me.vercel.app
```

#### 方案B：Netlify
```bash
# 拖拽整个文件夹到 https://app.netlify.com/drop
# 立即获得URL
```

#### 方案C：GitHub Pages
```bash
# 1. 推送到GitHub仓库
git init
git add .
git commit -m "feat: Web版游戏完成"
git push origin main

# 2. 在仓库设置中启用GitHub Pages
# Settings → Pages → Source: GitHub Actions
# URL: https://avrovadonz2026.github.io/KeepSilentForMe/web/
```

仓库当前已由 `.github/workflows/deploy-pages.yml` 自动发布到上述地址；Tauri 桌面打包由
`.github/workflows/build-tauri.yml` 负责，Windows CI 产出 NSIS，Linux CI 产出 AppImage/deb，
均作为 Actions artifact 提供下载，未启用签名和自动更新。

### 16.3 性能优化清单

- [ ] **图片优化**：BG使用WebP格式（70-80%质量）
- [ ] **视频压缩**：H.264编码，720p，CRF 23-28
- [ ] **字体子集化**：只包含使用的汉字（减少90%体积）
- [ ] **懒加载**：首屏只加载L0资产
- [ ] **CDN加速**：大文件走CDN（Vercel/Netlify自带）
- [ ] **压缩代码**：生产环境压缩JS/CSS（可选）

### 16.4 移动端适配清单

- [ ] **响应式布局**：使用vw/vh单位
- [ ] **触摸优化**：黑条最小44x44px点击区域
- [ ] **横屏提示**：检测竖屏时显示旋转提示
- [ ] **性能降级**：低端设备减少粒子特效
- [ ] **自动播放fallback**：视频播放失败显示播放按钮

---

## 十七、Web技术栈总结

### 优势
✅ 零安装：浏览器直接打开  
✅ 跨平台：PC/Mac/iOS/Android统一  
✅ 快速迭代：F5刷新即测试  
✅ 易分发：一个URL即可分享  
✅ 字符热区方案已落地：单一文本节点 + `Range.getClientRects()`，已用于当前 Demo

### 当前交付状态
- ✅ Web Demo：标题封面、L0-L5、整页翻页、拖拽遮字、localStorage、四结局
- ✅ 场景与运行时资产：13 张整页页图 + 55 件 V4 UI/反馈和源资产
- ✅ CI：GitHub Pages、Windows NSIS、Linux AppImage/deb
- ⏳ 视频、BGM、外部 SFX/配音、完整跨章节分支和真实设备 QA

### 最终交付物（目标设计结构）

当前仓库的实际入口集中在 `web/`、`art/v4/playable/`、`art/v4/scenes/` 和 `src-tauri/`；
下面的 `production/` 树保留为未来媒体层接入时的目标结构。
```
production/
├── index.html              # 单页应用入口
├── css/                    # 3-5个CSS文件
├── js/                     # 8-10个JS模块
├── assets/                 # 所有资产
│   ├── data/chapters.json  # 35句完整数据
│   ├── bg/                 # 5张场景（可转WebP；旧批次源为1536×1024 PNG）
│   ├── char/               # V4 8姿势（RGBA PNG）
│   ├── faces/              # V4 10基础表情+2变体（RGBA PNG）
│   ├── npc/                # V4 4个NPC层（RGBA PNG）
│   ├── creature/           # V4 3个Stage（RGBA PNG）
│   ├── ending/             # V4 2个结局层（RGBA PNG）
│   ├── fx/                 # V4 9个交互层（RGBA PNG）
│   ├── ui/                 # V4 5个UI层（RGBA PNG）
│   ├── video/              # 9-11条视频（MP4，共<80MB）
│   └── audio/              # SFX+BGM（MP3，共<5MB）
└── README.md

V4 当前静态运行时 PNG 约 24 MiB；视频和音频接入后再按压缩结果核算总体积。
首屏加载：<5MB（渐进加载）
```

### 关键指标
- 首屏加载时间：<3秒（4G网络）
- 拖拽延迟：<16ms（60fps）
- 内存占用：<200MB
- 支持浏览器：Chrome 90+, Safari 14+, Firefox 88+
