# README TODO 审计报告 / README TODO Audit Report

> 审计范围：`README.md` 全部未勾选 `[ ]` 项，与 `issue.md` 交叉核对，并核对当前 `web/js/runtime/` 运行时实现
> 日期：2026-08-25
> 基线：`c833ec1`（2026-08-15），工作树干净
> 性质：可执行清单 + 卡点 + 可代做范围界定（不直接改代码）
> 后续（同日）：2.2/2.3/2.4 已按台本规则实现（L4 结算、L2 重试、ending_seed 微调），
> 见 `issue.md`「2026-08-25 规则对齐实现」；本文其余条目维持快照原状。

---

## 0. 审计结论（TL;DR）

`README.md` 共 11 个未勾选 `[ ]` 项，按可操作性分为三类：

| 类别 | 数量 | 结论 |
|------|------|------|
| 🟡 代码可做，但需设计决策 | 2（L4 结算、ending_seed） | 已选定"暂不实现，只补文档" |
| 🟢 已事实完成，README 描述滞后 | 1（多出现 zone） | 建议从 TODO 删除 |
| 🔴 需外部资源/账号/真机/人工 | 8 | 见逐条清单，均无法由编码 agent 代做 |

唯一有代码可做的"规则对齐"项，其三个子项中：**多出现 zone 已修复**、**L4/L2 结算未实现且规则自相矛盾**、**`ending_seed` 是零引用死字段**。

---

## 1. 审计范围与方法

- 逐一核对 `README.md` 第 215、216、375、450、451、452、459、465、466、467、468 行的未勾选项。
- 交叉核对 `issue.md`（2026-08-04 审计 + 08-04/08-05 增量）的批次状态。
- 直接阅读 `web/js/runtime/70-flow.js`、`20-video.js`、`50-dialogue-drag.js`、`script/chapters.json`、`script/locales/*.json` 确认当前实现状态。
- 注意：`issue.md` 中的 `web/js/main.js:1004-1011` 等行号已过期；代码已拆分为 `web/js/runtime/` 模块，本报告使用新位置。

---

## 2. 规则对齐专项核对（README 第 451 行）

该 TODO 原文：「处理 `issue.md` 中 L4 结算、ending seed、多出现 zone 等问题」，实为三个状态不同的子项。

### 2.1 多出现 zone —— ✅ 已修复（README 描述滞后）

- 运行时已支持 `zone.start` / `zone.occurrence` 定位：`web/js/runtime/50-dialogue-drag.js:15-24`。
- 数据侧改用「加长 `zone.text` 使其唯一」的方式解决，未使用 `occurrence`/`start` 字段（`script/chapters.json` 全文无这两个键）。
- `issue.md` 中 A-03、A-07、C-05 均标「已修复」。
- **建议**：README 第 451 行删除「多出现 zone」字样，或改注「已修复」。

### 2.2 L4 结算 —— 🟡 未实现，且三套规则冲突

**实现状态**：

| 位置 | 现状 |
|------|------|
| `web/js/runtime/70-flow.js:4-11` `chapterResult()` | 仅判断 L1（`pass≥4 && fail<2`），其余一律 `return "pass"` |
| `web/js/runtime/70-flow.js:13-41` `finishChapter()` | 仅 L1 有失败重试 overlay，L2/L3/L4 无重试分支 |
| `web/js/runtime/20-video.js:244-249` | 唯一读取 L4 旗标处：`perform >= refuse ? L4_perform_to_L5 : L4_refuse_to_L5`，平票取表演、无阈值门槛 |

**三套互相矛盾的规则**：

| 来源 | 规则 |
|------|------|
| `台本.md` / `script/chapters.json` objective / `script/locales/zh-CN.json:56` | `apology_perform≥2` **或** `apology_refuse≥2` 皆可收束；混线取较高 |
| `schedule.md` §11.8 | `perform ≥ refuse` **且** `perform≥1`；否则硬刚 |
| `web/js/runtime/20-video.js:248` | `perform >= refuse`，平票取表演，**无门槛** |

**未定义的边界**：

1. `perform=0 && refuse=0` 或 `max(p,r)<2`：台本两线都不触发，无兜底。
2. `perform == refuse`：台本「取较高」无法决出。
3. 供给不对称：L4_S04、L4_S07 零道歉旗标；L4_S06 只有 `refuse` 无 `perform`。

**卡点**：属于叙事/结算规则决策，且 `README.md:430` 写明「本轮不修改游戏数据」。已选定「暂不实现，只补文档」。

### 2.3 L2 结算 —— 🟡 未实现

- `script/chapters.json:311` 声明 L2 目标 `"goal": "hate_leak<2"`，`zh-CN.json:38` objective 也写「hate_leak<2且撑完；否则事故可重来」。
- 但 `chapterResult()` 对 L2 一律返回 `"pass"`，`hate_leak+` 只累积、永不消费（`issue.md` R-02 仍开放）。
- **卡点**：同 2.2，需设计决策（是否实现事故/重来分支）。

### 2.4 `ending_seed` —— 🟡 零引用死字段

- `script/chapters.json:1135/1143/1154` 的三个 L5_S03 zone 各带 `ending_seed: "A"/"B"/"B"`。
- `web/js/` 全文无 `ending_seed` 引用 → 策划以为前序影响结局，实际终局只读 `L5_S06` 的 `zone.ending`。
- **二选一**（需你定方向）：
  1. 写死伪代码并实现，例如 `seed==A && final==B_alienate → 改为 A`；
  2. 从 `chapters.json` 与 `台本.md` 删除 seed 表述。

---

## 3. 逐条 TODO 清单（README 全部未勾选项）

### 3.1 规则对齐（README 第 451 行）

| 子项 | 状态 | 卡点 | 下一步 | 可否代做 |
|------|------|------|--------|----------|
| 多出现 zone | ✅ 已修复 | 无 | 从 README 删除该字样 | 可 |
| L4 结算 | 🟡 未实现 | 三套规则冲突，需决策 | 选定一套规则 + 补文档 | 文档可代写，实现待决策 |
| L2 `hate_leak` 结算 | 🟡 未实现 | 需决策是否要重试分支 | 同上 | 同上 |
| `ending_seed` | 🟡 死字段 | 无算法定义 | 选定「实现」或「删除」方向 | 两方向都可代做 |

### 3.2 音频类（README 第 375 / 450 / 459 行，三处实为同一件事）

| 项 | 状态 | 卡点 | 下一步 | 可否代做 |
|----|------|------|--------|----------|
| 外部 SFX | 🔴 缺素材 | 需 freesound.org 选 6-8 个 CC0 音效 | 你下载素材 → 我代做接入层（manifest、触发绑定、转码、校验、SOURCES） | 接入层可 |
| 配音 | 🔴 缺素材 | 真人录制 | 你或 CV 录制 | 否 |
| 音频角色分工（`音频` 勾选项） | 🔴 | 同上 | 同上 | — |

### 3.3 发布/部署类（README 第 465 行）

| 项 | 状态 | 卡点 | 下一步 | 可否代做 |
|----|------|------|--------|----------|
| Vercel/Netlify 镜像 | 🔴 未部署 | 需账号授权 | 账号持有人手动 `vercel` 或拖拽 | 否 |

### 3.4 宣传/提交类（README 第 466 / 467 / 468 行）

| 项 | 状态 | 卡点 | 下一步 | 可否代做 |
|----|------|------|--------|----------|
| 预告视频（10s） | 🔴 未做 | 需剪辑 Kling 关末视频 | 可代写分镜/脚本草案，剪辑需你执行 | 草案可 |
| 宣传素材（截图+GIF+slogan） | 🔴 未做 | 需实际运行录屏 | 可补 slogan 库，截图/GIF 需你执行 | slogan 可 |
| 提交网易雷火比赛 | 🔴 未提交 | 需登录比赛平台报名 | 由你提交 | 否 |

### 3.5 设备/验证类（README 第 216 / 452 行）

| 项 | 状态 | 卡点 | 下一步 | 可否代做 |
|----|------|------|--------|----------|
| 真实移动设备回归 | 🔴 未做 | 需真机 | 真机过一遍触摸拖拽/横竖屏 | 否 |
| 设备 QA（横竖屏/低端/下载产物） | 🔴 未做 | 需真机 + 下载产物 | 同上；可代写回归检查表 | 检查表可 |
| AI 视频质量验证（D0 首帧 V0_out） | 🔴 未做 | 需生成 V0_out 并人工审脸 | 生成并审脸，或认定已被 K01-K22 接入覆盖 | 否 |

---

## 4. 关键代码位置索引

| 主题 | 位置 | 说明 |
|------|------|------|
| 章节结算入口 | `web/js/runtime/70-flow.js:4-11` | `chapterResult()` 仅实现 L1 |
| 章节结束/重试 | `web/js/runtime/70-flow.js:13-41` | `finishChapter()` 仅 L1 有重试分支 |
| L4 过场选择 | `web/js/runtime/20-video.js:234-253` | `chapterOutroSequenceId()`，`perform>=refuse` 平票取表演 |
| zone 定位 | `web/js/runtime/50-dialogue-drag.js:15-24` | 支持 `start`/`occurrence`，数据未使用 |
| L2 目标 | `script/chapters.json:311` | `"goal": "hate_leak<2"`，无运行时消费 |
| L4 objective | `script/locales/zh-CN.json:56` | `apology_perform≥2或apology_refuse≥2皆可收束` |
| ending_seed | `script/chapters.json:1135/1143/1154` | 仅 A/B，运行时代码零引用 |

---

## 5. 建议优先级与下一步

| 优先级 | 行动 | 类型 | 备注 |
|--------|------|------|------|
| P0 | 统一 L4 结算规则并落文档（2.2） | 设计决策 | 先定「台本 ≥2」还是「schedule ≥1」；README:430 本轮不动数据 |
| P0 | 决定 `ending_seed` 去留（2.4） | 设计决策 | 二选一 |
| P1 | 决定 L2 `hate_leak` 是否要重试分支（2.3） | 设计决策 | 当前目标字段与实际流程不一致 |
| P2 | 从 README 删除「多出现 zone」滞后描述（2.1） | 文档 | 已修复 |
| P3 | 收集 SFX 素材后接入（3.2） | 外部素材 + 接入 | 素材到位后接入层可代做 |
| P3 | 宣传/预告/提交/设备 QA（3.3-3.5） | 人工/账号/真机 | 编码 agent 仅能产出文案或检查表草案 |

---

## 6. 结论

`README.md` 的 11 个未勾选项里：

- **1 项已事实完成**（多出现 zone），是 README 描述滞后。
- **2 项有代码可做但卡在设计决策**（L4 结算、ending_seed；L2 结算同属此类）。
- **8 项依赖外部资源、账号、真机或人工**，编码 agent 无法直接完成，只能提供文案、检查表或接入层脚手架。

在「本轮不修改游戏数据」与「暂不实现 L4 结算」的既定前提下，当前最可交付的是：把第 2.2-2.4 节的规则冲突与待决策点补进 `issue.md`，并修正 README 中已过时的勾选状态。
