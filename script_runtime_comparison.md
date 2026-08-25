# 深度对比：台本 (Script) 与 落地实现 (Runtime) 差异分析

> **更新注记（2026-08-25）**：本文成文后，以下差异已被本轮「台本对齐」工作消除或改变：
> - `narration`（章首过场）不再被忽略——现已逐条自动渲染（含 L0 遮字教学、L5「只剩你了」）；
> - 台本「关末不可遮」结算台词已落地为 `settlement`（L1-L4；L1 失败侧播「我们再联系」）；
> - L2 `hate_leak<2` 结算与「直播事故」重试层、L4 表演/硬刚过场与混线 1s 噪声近似（Web Audio 白噪声+闪黑）、L5 `ending_seed` 微调均已实现；
> - `rules` 顶层字段仍为未读取的元数据（见 §4 差异点 2）；`creature`/`narration_note`/`演出` 仍为视觉注释（已并入整页图）。

本项目在从文本剧本转化为网页交互视觉小说的过程中，体现了清晰的**数据驱动**设计。但在迭代过程中，视觉架构和一些底层规则发生了演进。以下是剧本定义与实际前端运行时的深度对比分析。

## 1. 叙事流与分支控制 (Flow & Branching)

### 台本设计 (Script)
*   **结构：** 游戏分为 6 个主章节（L0 到 L5）。每个章节包含若干行对话（Lines，如 `L0_S01`），每行对话被划分为 4 个可交互的文本块（Zones，如 `L0_S01_Z01`）。
*   **流向：** 剧本**不使用**传统的节点跳转（Node Jumps/GoTo）。所有的分支和结局走向，都依赖于玩家遮盖特定词汇后累积的**Flag（标记）**。
    *   例如：性能/伪装（`mask`, `pass`）、真实/反抗（`truth`, `fail`）、关系网（`bond`, `trust`, `crack`）。
*   **硬性分支：** L5 终章的 `L5_S06` 是一次直接的结局硬分歧，遮挡 4 个不同 Zone 会直接触发 4 种截然不同的结局（A_separate, B_alienate, C_consume, C_cold）。结束后还会触发反转真相的揭示影片（`V_RV`）。

### 落地实现 (Runtime)
*   **状态机推进：** 前端通过 `50-dialogue-drag.js` 和 `70-flow.js` 驱动。玩家放下黑条（Black Bar）后，触发 `commitSelection`，行进到下一行（`state.lineIndex++`）。
*   **动态结算：** 只有在章节末尾 `finishChapter()` 时，才会统一计算 Flag 条件。例如 L1 会校验 `pass >= 3 && fail < 2`。成功则加载 `V1_pass` 视频并进入 L2，失败则加载 `V1_fail` 提示重试。
*   **吃词记录 (Eat Log)：** 玩家遮盖的词汇不仅会加 Flag，还会被存入 `state.eatLog`，这是剧本中未直接体现但在运行时极其重要的底层数据结构。

---

## 2. 视觉表现与多媒体 (Visuals & Media)

### 台本设计 (Script)
*   **视觉指令：** `chapters.json` 中保留了大量如 `creature`（阶段设定）、`narration_note`（旁白说明）、`演出`（特效/镜头说明）、`video_detail`（视频需求）等字段。
*   **连续性约束：** `v4-prop-lock/room-continuity.md` 严格规定了 AI 出图的固定空间布局（窗在北，门在东，CRT 显示器等），防止视觉漂移。

### 落地实现 (Runtime)
*   **全屏化革新（核心差异）：** 运行时**彻底废弃**了原本在 `playable/manifest.json` 中设计的碎件拼贴（Sprite Composite，如单独的 NPC 叠加层），改为通过 `scenes/manifest.json` 中的 `pageBindings` 直接映射到**全屏插画 (Scene Pages)**。通过 `#scene-page` 容器进行 Crossfade (`is-turning`) 切换。
*   **表现剥离：** 运行时**忽略**了剧本中的 `creature`, `narration_note`, `演出` 等视觉注释字段（相应内容已烘焙进整页场景图），一切视觉刷新只认 Manifest 配置的 ID。旁白 `narration` 本身不在此列——已按章首过场逐条渲染。
*   **纯程序化音效 (Procedural SFX)：** 令人意外的是，UI 交互音效（拿取、吸附、拒绝等）并没有加载传统的音频文件！`30-audio.js` 使用了浏览器的 **Web Audio API**，通过振荡器 (`createOscillator()`) 和特定波形动态生成音效。背景音乐（BGM）则是传统的双轨交叉淡入淡出。

---

## 3. 核心机制系统 (Special Mechanics)

### “语言胃”与记忆结算 (Memory UI)
*   **台本概念：** 剧本对这一块着墨不多，主要体现在章节间的过渡设定上。
*   **落地实现：** 这是一个重度的前端特有 UI 系统。在 L1-L4 章节末尾，前端会调用 `openMemoryOverlay()` 呼出记忆拼凑界面。玩家需要将在章节中“被吃掉的词”（来自 `eatLog`）重新拖拽排列。最终排列的句子会被存入 `state.memoryByChapter`，并在下一章开头作为“记忆回声”展示。

### 拟真直播弹幕 (Live Chat)
*   **台本概念：** L2（初次直播）和 L4（道歉直播）有 `hate_leak` 等相关 Flag 设计，表明有公众压力。
*   **落地实现：** `40-runtime-state-chat.js` 在这两个章节会强制呼出一个侧边栏 `#live-chat`。它伪造了一个滚动的观众计数器，并将 NPC 的反应或玩家“吞掉”的敏感词以弹幕的形式注入信息流，制造直播翻车的压迫感。

---

## 4. 本地化与数据结构差异 (Data & Localization)

### 差异点 1：深拷贝合并 (Deep Merge)
*   在静态数据层面，翻译文本和逻辑结构是分开的。但在运行时 (`10-locale.js`)，系统使用 `joinLocalizedChapters` 将本地化 JSON 中的 `chapter.title`, `narration`, 行级 `raw` 和块级 `text` **直接合并 (Deep Merge)** 到了基础的 `chapters.json` 对象树上。

### 差异点 2：被废弃的全局规则 (Deprecated Rules)
*   `chapters.json` 曾包含顶层 `rules` 字段，如 `"zones_per_line": "3-4"`、`"only_action": "drag_black_bar_continuous"`、`"nlp": false`，在实际的 `main.js` 或 runtime 中**完全未被读取和使用**。现行逻辑按 `line.zones.length` 动态取 zone 数量（并非硬编码 4），并直接做字符截取匹配。该字段已随 2026-08-25 数据解耦从 `chapters.json` 移除（连同 `creature`/`bg`/`demo`/`face`/`演出` 等视觉注释），设计内容由 `台本.md` 独有。

### 差异点 3：占位符与截断机制
*   剧本当中本地化必须严守 `remainMode`。对于 Semantic（语义）模式，本地化可以自由调整被消音后剩下的句子，以保证自然；但对于 Mechanical（机械）模式，运行时会使用极其死板的字符串减法，这对本地化团队是巨大的挑战，也是落地实现中非常脆弱的一环。

---

## 总结

台本 (`chapters.json`) 目前承担了**双重职责**：它既是给引擎读取的逻辑状态机配置文件，又是给美术/AI 提示词/翻译人员参考的“导演分镜本”。

从前端落地来看，代码逻辑非常现代且轻量（动态音效、全屏切换、纯 DOM 数据绑定），但这也意味着剧本中的大量文字描述字段（如 `演出`）实际上在运行时都是**冗余（Ignored）**的。未来的维护中，建议将“给程序的配置”和“给美术的设定集”进行一定程度的解耦。
