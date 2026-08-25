# 仓库审计报告 / Repository Audit Report

> 审查范围：完整代码库、数据契约、资产完整性、运行时一致性
> 日期：2026-08-04
> 审计者：Claude Opus 5 (1M context)
> 性质：技术债务、逻辑漏洞、数据一致性、潜在运行时错误

---

## 审计概要

**总体评估**：✅ 核心功能可运行，数据完整性良好，存在中等优先级技术债务

**验证通过项**：
- ✅ 所有 JSON manifest 格式有效
- ✅ 13 个场景页资产完整存在（1536×1024）
- ✅ 4 个 BGM 音频文件存在
- ✅ JavaScript 语法无错误
- ✅ 场景页验证脚本通过
- ✅ 35 句台词、140 个 zone 数据完整
- ✅ Zone 文本全部在 raw 中可定位

**发现问题分类**：
- 🔴 严重（P0）：7 个 - 会导致逻辑错误或运行时故障
- 🟡 高（P1）：6 个 - 影响用户体验或叙事完整性
- 🟢 中（P2）：8 个 - 技术债务或改进建议
- 🔵 低（P3）：5 个 - 文档或边缘情况

以上数量保留初次审计的优先级分类；当前是否已处理，以各条目标题中的状态标记和文末批次状态为准。

**可行性标记**：`可直接修复` 表示已有明确行为和实现路径；`需设计决策` 表示要先确定
结算、叙事或媒体规则；`低优先级/非当前缺陷` 表示暂不阻塞 Demo 发布。

---

## 🔴 P0 严重问题（必须修复）

---

### A-01 · [已解决] 第四章结算条件自相矛盾，且存在「双 0 / 双不足」空洞

| 来源 | 条件 |
| --- | --- |
| 台本 · 第四章目标 | `apology_perform≥2` **或** `apology_refuse≥2` 皆可收束 |
| 台本 · 结算表 | 表演≥2 / 硬刚≥2 / 混线取较高 |
| `schedule.md` §11.8 | 表演：`perform >= refuse` **且 perform≥1**；否则硬刚 |
| `chapters.json` objective | 与台本「≥2」一致 |

**漏洞：**

1. **阈值门槛不一致**：台本要 ≥2，程序手册 ≥1 且比大小。同一周目可能被两套规则判成不同视频。
2. **无失败/兜底**：L4 **没有**像 L1/L2 的重来分支。玩家若全程点 `risk+` / `bond+` / `control+`：
   - `perform=0, refuse=0` 时，台本两条线都不触发；
   - 随机全选枚举约 **42%** 周目落在 `perform<2 且 refuse<2`。
3. **平局未定义**：`perform==refuse` 且都 ≥2（或 schedule 下都 ≥1）时，「以较高者为主」无法决出主视频。
4. **供给不对称**：L4_S04、L4_S07 **零**道歉 flag；L4_S06 **只有 refuse、没有 perform**。表演线比硬刚线更难堆到 ≥2。

**建议：** 统一为一种规则（推荐写进 JSON 的 `settlement` 字段），并显式定义：

- `both==0` 或 `max(p,r)<阈值` → 默认视频 / 强制重开 / 或本句必须选带 flag 的 zone；
- `p==r` → 固定优先（如 refuse）或播混线 tail。

---

### A-02 · [已解决] `L5_S03` 的 `ending_seed`「微调」没有算法

台本写：

> 主判定：L5_S06。L5_S03 种子微调。

JSON 有 `ending_seed: A|B`，但：

- **无 C 种子**（只有 A/B）；
- **无任何文档**说明 seed 如何改写 S06 结果（覆盖？加权？仅当 S06 选中性 zone？）；
- `schedule.md` §11.8 只读 `L5_S06.ending`，**完全忽略 seed**。

**结果：** 策划以为前序选择影响结局，实现只会看终句 → 设计意图落空；或两实现各写一套 → 结局不一致。

**建议：** 删掉「微调」表述，或写出伪代码，例如：

```text
final = S06.ending
if S03.seed == A and final == B_alienate → 仍 B（或改为 A）  # 必须二选一写死
```

---

### A-03 · [已修复] 多出现 zone：`remain` 与「第一次 `indexOf`」错位

引擎约定：`raw.indexOf(zone.text)` 定位。下列 zone **文本在 raw 中出现 ≥2 次**，且手写 `remain` **不等于删第一处**：

| ID | zone.text | 次数 | 问题 |
| --- | --- | --- | --- |
| **L3_S05** | `别人` | 2 | note 写「末」，`remain` 删的是**第二处**「那种别人」；`indexOf` 命中**第一处**「有别人」→ remain 会对不上 DOM 真遮挡。 |
| **L3_S04b** | `不能见人的` | 2 | `remain`＝「没有朋友，只有句子。」等于**两处一起删**，违反「只遮一段连续文字」的虚构规则；机械删第一处应为「没有朋友，只有不能见人的句子。」 |

同类多出现但目前 first 匹配正确（需用 span 钉死位置，禁止只靠 `indexOf`）：

- `L0_S01` / `L5_S04`：`我把`（句首 vs「替我把」）
- `L3_S03`：`我`
- `L3_S07`：`希望你`（note 已标第一处）
- `L5_S02`：`我`（note 已标句首）

**建议：** 多出现 zone 改为更长、唯一的 `text`；或 JSON 增加 `start`/`occurrence` 字段；L3_S04b 的 remain 改回单次删除结果。

---

### A-04 · [需设计决策] 第三章 → 第四章叙事因果断裂（缺「被炎上」事件）

时间线：

```text
L2 第一次直播（hate_leak<2 则「平安下播」）
  → L3 朋友上门（私人门缝对话，无外泄演出）
  → L4 开场已是「道歉 / 道歉 / 你怎么不说话」
```

**漏洞：**

- 若 L2 成功压住 `hate_leak`，公众侧**没有**事故；
- L3 是私密对话，朋友也未把内容公开；
- L4 却直接进入**道歉直播**，且 L4_S03 假设「如果伤害了谁」——**伤害对象、事件、传播路径全程未建立**。

V3_out 仅「暗示舆论将至」，不能替代一次可玩/可看的事件节拍。

**建议（任选其一写进台本）：**

- L2 失败支线或必过「切片流出」过场；
- L3 末朋友录下/门外有人；
- L3→L4 增加不可遮过场：热搜/剪辑/经纪或系统旁白点明指控；
- 或把 L4 改成「预防性公关」并改弹幕文案，避免「你已经犯了众怒」的既成事实。

---

### A-05 · [已解决] Web 运行时未实现 L4 结算逻辑

**位置**：`web/js/main.js:1004-1011`

```javascript
function chapterResult(chapter) {
  if (chapter.id === "L1") {
    const pass = state.flags.pass ?? 0;
    const fail = state.flags.fail ?? 0;
    return pass >= 4 && fail < 2 ? "pass" : "fail";
  }
  return "pass";  // ← L4 结算未实现，总是返回 "pass"
}
```

**问题**：
- L4 章节 `apology_perform` / `apology_refuse` 旗标被累积但从未读取
- `finishChapter()` 中只检查 L1 失败，L4 的重试分支不存在
- 导致无论玩家如何选择，L4 总是能通过，与台本设计不符

**影响**：玩家无法体验 L4 失败重试，降低游戏难度和叙事张力

**建议**：在 `chapterResult()` 中添加 L4 分支判定，并在 `finishChapter()` 中添加对应的 overlay 逻辑

---

### A-06 · [低优先级/非当前缺陷] 运行时 URL 路径不一致可能导致 404

**位置**：`web/js/main.js:1-7`

```javascript
const DATA_URL = "../script/chapters.json";
const PLAYABLE_MANIFEST_URL = "../art/v4/playable/manifest.json";
const PAGE_MANIFEST_URL = "../art/v4/scenes/manifest.json";
const AUDIO_MANIFEST_URL = "audio/manifest.json?v=audio-3";  // ← 不一致
```

**问题**：
- 前三个 manifest 使用相对路径 `../`（相对于 `web/js/`）
- 音频 manifest 使用 `audio/`（相对于当前页面）
- 如果 HTML 不在 `web/` 根目录，音频 manifest 会 404
- `PLAYABLE_ROOT` 和 `PAGE_ROOT` 也使用 `../` 前缀

**影响**：在某些部署配置下（如子目录部署）可能导致资源加载失败

**建议**：统一所有资源路径为相对于 HTML 的路径，或使用绝对路径

---

### A-07 · [已修复] L3_S04b 的 `remain` 删除了两处文本，违反游戏规则

**位置**：`script/chapters.json:911-952` / `台本.md:504-512`

```json
{
  "id": "L3_S04b",
  "raw": "没有不能见人的朋友，只有不能见人的句子。",
  "zones": [
    {
      "text": "不能见人的",
      "remain": "没有朋友，只有句子。"  // ← 删除了两处 "不能见人的"
    }
  ]
}
```

**问题**：
- `zone.text` = "不能见人的" 在 raw 中出现 2 次
- `remain` = "没有朋友，只有句子。" 是删除**两处**后的结果
- 但游戏规则是"只能遮一段连续文字"
- 正确的机械删除第一处应为："没有朋友，只有不能见人的句子。"

**影响**：破坏游戏物理规则的一致性，玩家可能困惑为何一次遮挡删除了两段文字

**建议**：
1. 改 `zone.text` 为更长的唯一字符串，如 "没有不能见人的朋友，"
2. 或修正 `remain` 为 "没有朋友，只有不能见人的句子。"
3. 或在 JSON 中添加 `occurrence: 2` 明确指定删除第二处

---

## 🟡 P1 高优先级问题

### B-01 · [已解决] 跨章 flag 大量只增不读

| flag | 出现章 | 是否进入任何结算/结局 |
| --- | --- | --- |
| `mask` `truth` `bond` `control` `crack` | L0–L5 | **否**（L5 终局只看 S06 zone） |
| `trust` `distance` `secret_risk` | L3 | **否**（L3 自称只记录） |
| `risk` | 几乎每章 | **否** |
| `revolt` | 仅 L4_S03 一处 | **否**（与「反噬自爬」special 无数据联动） |
| `pass` | L1 结算用；**L2_S02 也给了 pass+** | L2 的 pass **无读取方** |

台本总则把 `mask/truth/bond/crack` 写成跨关 flag，易让人以为影响终局；实际终局与 L3 关系值**全断**。

**建议：** 要么在 L5/V_RV 消费这些计数（改可选 zone、字幕、Stage 演出），要么在总则标明「竖切仅记录 / 不影响分支」，避免设计与实现双重预期。

**处理（2026-08-25）**：全部旗标已有消费方——`mask`/`truth`/`bond`/`control` 进结局覆盖层人格回显（≥6 取最高，平票按 mask>truth>bond>control）；`revolt` 进 L4 章末变体；`risk` 进 L1 软失败（≥3）；`trust`/`distance`/`secret_risk`/`crack` 进 L3 章末变体（B-04）。

---

### B-02 · [已解决] 第一章 `pass≥4 且 fail<2` 偏紧，且 `risk` 语义含混

- 7 句各选 1 zone；`pass+` 分布尚可，但随机全选通过率约 **12%**。
- 多句「正解」只有 1 个 `pass+`，其余为 `fail+` 或 `risk+`。
- **`risk+` 不进 L1 结算**：既不帮过关也不计失败 → 玩家难以理解「犹豫选项」的代价。
- 失败「重来」范围未写清：整章重置 vs 从本句重来 vs 保留已有 pass/fail。

**建议：** 明确 risk 是否计软失败、失败时 flag 是否清零；若面向 Jam 受众，可略降到 `pass≥3` 或增加每句 pass 供给。

**处理（2026-08-25）**：门槛部分已按提交 `cba3b51` 的设计意图落为 `pass>=3 && fail<2`（代码/数据/台本/四语言 objective 同步）；`risk≥3` 计软失败已落地（L1 结算改为 `pass>=3 && fail<2 && risk<3`），失败沿用重试层。

---

### B-03 · [已修复] 第二章结算与 `pass+` 污染

- 过关只读 `hate_leak<2`；L2_S02 却出现 `pass+`（面试旗标）。
- 成功下播后 outro 固定：「刚才那句『有你在』……我是对你说的。」  
  若玩家遮的是 `有你在，`，对外**没说出**这句，她仍用这句对「你」复盘——需依赖「吃掉的字仍算你们之间的对话」；台本未点明，初读像口误。

---

### B-04 · [已处理] 第三章「无完美通关」与关系旗标无反馈

- 设计声明无胜负，正确；但 `trust±` / `distance` / `secret_risk` / `crack` 在 UI 与后续章**零回声**。
- L3_S05「房间里是有别人」把秘密推到门口，朋友「让我见见」后无解决、无代价，**悬置线**在 L5 也不回收。

对 30 分钟叙事可以接受，但当前写法像「半截系统」。

**处理（2026-08-25）**：L3 章末覆盖层文案按关系旗标分支（台本第三章结算新增「结算变体」表，四语言 `variants`）：`secret_risk≥2` → 秘密跟着朋友下楼；`trust<0` → 朋友走得比来时快；`distance≥2` → 隔着门与雨道别；`crack≥5` → 裂开的声音比雨响；其余保持原句。L5 悬置线已回收：`secret_risk≥2` 时 L5 过场末尾追加「那句『有别人』，也跟到了这里。」（台本 L5_N02b）。

---

### B-05 · [已解决] 第四章「反噬」叙事 vs 数据

台本：Stage2.5–3，**细条可自爬/预锁**；L4_S02 special：困难下预锁 1.5s；结算台词：「刚才有一条，不是我拖的。」

JSON：仅 `special: parasite_auto_cover` / `prelock_optional`，**无一 zone 强制由系统代选**；`revolt+` 只出现一次且不触发演出契约。

**漏洞：** 关末指控「不是我拖的」在多数周目可能为假（玩家全程手拖）→ 元叙事撒谎，削弱反转可信度。

**建议：** 至少 1 句真正自动遮挡并写入 `eatLog`（标记 `source: parasite`），结算台词才成立。

**处理（2026-08-25）**：L4_S02 反噬落地——细条从右侧爬入，预锁「不觉得自己做错了」1.5s 后由系统代吃（`scheduleParasiteCover`，复用 `applySelection` 并标注 `source: parasite`），该句玩家无法干预；章末「刚才有一条，不是我拖的」自此每局为真。

---

### B-06 · [已文档化] 终局 C / C' 与视频映射

| zone | ending | 视频 |
| --- | --- | --- |
| 请你 | A_separate | V5_A |
| 把我 | B_alienate | V5_B |
| 留下来 | C_consume | V5_C |
| 我 | C_cold | V5_C（差分化仅文案） |

`endings` 字典有 4 个 id，视频只有 3 条；C' 依赖同一 `V5_C` 内部分支——需在播放器逻辑写清，否则 C_cold 易被当成缺失资源。

**处理（2026-08-25）**：已文档化——`web/video/manifest.json` 增加 note 说明；`schedule.md` 补「运行时结局映射」表；`scripts/validate-runtime-videos.mjs` 的 `expectedSequences` 显式写明 `C_cold` 与 `C_consume` 共用 K19/K20 与 `PAGE_END_C_hollow`，差异仅在结局标题/文案，不是缺失资源。

---

---

## 🟢 P2 中等优先级问题

### C-01 · [已修复] 若干 `remain` 超越「单段连续删除」（叙事物理）

在「只遮连续一段」的前提下，下列手写 remain 删多了连接词或第二段，属于**润色越权**（玩法演示尚可，严格逻辑不自洽）：

| ID | zone | 问题摘要 |
| --- | --- | --- |
| L1_S03 | `其实没什么经验，而且我经常会说错话，` | 连「但我」一并消化，才得到「我真的很需要…」 |
| L2_S02 | `因为缺钱，` | remain 变成「我直播**不是**因为喜欢…」，实为改写「是因为缺钱」整块 |
| L2_S03 | `心里在骂人，嘴上不会` | 机械应残留「只是我唱的时候」；remain 整段削掉 |
| L3_S04b | `不能见人的` | 见 I-03，双处删除 |
| L5_S05 | `我只能问你饿不饿` | 机械应残留「你是消音，」；remain 把后半前提也收了 |

若坚持「remain 必须可从 raw 删一段得到」，需改 zone 边界或改 remain。

---

### C-02 · [需文案决策] L2_S03 半遮逻辑听感破裂（可接受的 fail，但无 fail flag）

遮 `只是我唱的时候心里在骂人，` → remain「你们要我唱歌也可以，**嘴上不会**。」  
弹幕「嘴上不会啥」挂 `risk+`，合理；但同句完整遮才 `mask+`。教学上 OK，不影响结算。

---

### C-03 · [需文案决策] L1 录取后立刻「缺钱直播」

叙事可解释为「尚未入职 / 试用无薪」，但台本未给一句时间锚（「入职前最后一晚」等），部分玩家会问：面试都过了为什么还在乞播。

---

### C-04 · [已处理] 反转文案与操作直觉的张力（非硬 bug）

玩法：遮住 = 不出口 / 喂给体；留下 = 对外说。  
`V_RV`：「**被遮住的，是她说出口的**」「屏幕上留下的，是给外界的字幕」。

需在反转里用一层 UI 把「对你说出口 / 对外字幕」说死，否则与 L0 教学「被遮住的会成为你」并读时会像两套物理。

**处理（2026-08-25）**：反转第 2/3 句改为谜语式表述（四语言、台本分镜、`chapters.json` reveal 同步）——「被你吃掉的，才是她想说的。」「留下来的，是念给别人听的。」，与 L0「遮住 = 吃掉」共用同一物理，不另加解释层。

---

### C-05 · [已修复] L3_S05 多出现 zone 的 note 说「末」但实际是哪一处不明确

**位置**：`script/chapters.json:955-998` / `台本.md:516-527`

```json
{
  "id": "L3_S05",
  "raw": "房间里是有别人，但不是你想象的那种别人。",
  "zones": [
    {
      "text": "别人",
      "note": "末"  // ← 标注为"末"
    }
  ]
}
```

**问题**：
- `别人` 在句中出现 2 次："有**别人**" 和 "那种**别人**"
- note 写 "末" 指第二处，但 JSON 没有 `occurrence: 2` 字段
- 运行时 `indexOf()` 会匹配**第一处**
- 导致遮挡位置与设计意图不符

**影响**：玩家遮挡的是 "有别人"，但策划想让玩家遮 "那种别人"

**建议**：
1. 添加 `occurrence: 2` 明确指定第二次出现
2. 或改 `zone.text` 为 "那种别人" 使其唯一
3. 更新 `buildDialogue()` 函数支持 `occurrence` 字段（当前已支持，但 JSON 未使用）

---

### C-06 · [已处理] `risk+` 旗标用途不明确

**统计**：39 个 zone 使用 `risk+`，是所有旗标中最多的

**问题**：
- `risk+` 在任何结算逻辑中都未被读取（L1, L4, 终局均不使用）
- 台本总则未定义 `risk` 的语义
- 从 NPC 反馈看，`risk` 似乎表示"语句异常但不算完全失败"
- 但无数值 UI，玩家无法感知累积效果

**影响**：玩家选择了 `risk+` zone 后无法得知后果，削弱选择的意义

**建议**：
1. 明确定义 `risk` 在结算中的作用（如 L1: `risk >= 3` 算软失败）
2. 或将 `risk` 改为纯叙事标签，不参与逻辑判断
3. 在文档中说明当前 `risk` 仅用于记录

**处理（2026-08-25）**：`risk` 语义已定义——L1 结算计入软失败（`risk≥3` 则重试，台本结算表已更新），全章保留选 zone 时的 reject 即时反馈。

---

### C-07 · [已修复] 音频设置面板缺少可访问性标签

**位置**：`web/index.html:56-86`

**问题**：
- 音量滑块缺少 `aria-label` 或 `aria-labelledby`
- `<output>` 元素未使用 `aria-live` 通知屏幕阅读器音量变化
- 面板关闭按钮只有 `×` 符号，缺少明确的文本标签

**影响**：屏幕阅读器用户难以使用音频设置

**建议**：
1. 为 `<input type="range">` 添加 `aria-valuetext` 动态描述当前值
2. 为 `<output>` 添加 `aria-live="polite"`
3. 关闭按钮的 `aria-label` 已有，但可以改进描述

---

### C-08 · [已修复] 代码中存在硬编码的魔法数字

**示例**：
- `web/js/main.js:781`：`window.innerWidth * 0.62` - 黑条休息位置
- `web/js/main.js:824`：`Math.max(150, target.rect.width * 0.86)` - 可达距离
- `web/js/main.js:12`：`650` - BGM 淡入淡出时间

**问题**：这些数值缺少命名常量，难以调整和维护

**建议**：提取为具名常量，如：
```javascript
const BAR_REST_POSITION_X_RATIO = 0.62;
const BAR_REST_POSITION_Y_MAX_VH = 0.44;
const ZONE_REACHABLE_MIN_DISTANCE = 150;
```

---

## 🔵 P3 低优先级问题

### D-01 · [低优先级/说明项] 体量与编号

- 可遮句 35：L0:1 + L1–L4:7×4 + L5:6 = 35，与总表一致。
- L3 可遮 id 为 S01–S03、**S04b**、S05–S07（S04 不可遮），导出/统计时勿当成缺 S04。

---

## 文档不一致速查

| 主题 | 台本.md | schedule.md / 实现手册 | chapters.json |
| --- | --- | --- | --- |
| L4 结算 | ≥2 或混线 | ≥1 且比大小 | objective 写 ≥2，无机器可执行 settlement 块 |
| L5 seed | 要微调 | 不提 | 有字段无语义 |
| 跨关 flag | 总则强调 | 多数不进 §11.8 表 | 只累加 |
| L3 目标 | 记关系偏移 | 无胜负必播 V3 | 同左 |

---

### D-02 · [已修复] 文档不一致速查

| 主题 | 台本.md | schedule.md / 实现手册 | chapters.json |
| --- | --- | --- | --- |
| L4 结算 | ≥2 或混线 | ≥1 且比大小 | objective 写 ≥2，无机器可执行 settlement 块 |
| L5 seed | 要微调 | 不提 | 有字段无语义 |
| 跨关 flag | 总则强调 | 多数不进 §11.8 表 | 只累加 |
| L3 目标 | 记关系偏移 | 无胜负必播 V3 | 同左 |

---

### D-03 · [已验证/非缺陷] 资产清单验证通过

**场景页（13 张）**：
- ✅ `PAGE_L0_desk.png` (2.6M)
- ✅ `PAGE_L1_interview.png` (2.7M)
- ✅ `PAGE_L2_live.png` (2.6M)
- ✅ `PAGE_L2_fed.png` (2.2M)
- ✅ `PAGE_L3_door_default.png` (2.7M)
- ✅ `PAGE_L3_door_hesitant.png` (2.4M)
- ✅ `PAGE_L4_apology.png` (2.2M)
- ✅ `PAGE_L4_break.png` (2.6M)
- ✅ `PAGE_L5_empty.png` (2.3M)
- ✅ `PAGE_L5_poster.png` (2.1M)
- ✅ `PAGE_END_A_separate.png` (2.5M)
- ✅ `PAGE_END_B_alienate.png` (2.3M)
- ✅ `PAGE_END_C_hollow.png` (2.7M)

**BGM 音频（4 首）**：
- ✅ `rain-room.mp3` - 雨夜环境 (323.89s, CC0)
- ✅ `live-pressure.mp3` - 直播压迫 (312.76s, CC0)
- ✅ `hollow-hope.mp3` - 终局余响 (182.89s, CC0)
- ✅ `door-tension.mp3` - 门厅悬疑 (181.39s, CC0)

**JSON 清单**：
- ✅ `script/chapters.json` - 6 章节 35 句台词 140 zones
- ✅ `art/v4/scenes/manifest.json` - 13 场景页 + 6 章绑定 + 4 结局页
- ✅ `art/v4/playable/manifest.json` - V4 可玩资产包（未启用）
- ✅ `web/audio/manifest.json` - 4 音轨 + 章节/结局绑定

---

### D-04 · [已验证/非缺陷] 运行时验证状态

**验证通过**：
- ✅ Python 场景验证脚本：`OK: 13 scene pages, 6 chapters, 4 endings`
- ✅ JavaScript 语法检查：无错误
- ✅ 所有 JSON manifest 格式验证通过
- ✅ Zone 文本全部在 raw 句中可定位（无孤立 zone）
- ✅ GitHub Pages 最新部署成功
- ✅ Tauri CI Windows/Linux 打包成功

**已知限制**：
- 🟡 关末视频（V0_out 到 V_RV）未实现
- 🟡 外部 SFX/配音未接入
- 🟡 L2/L3/L4 旗标结算逻辑部分缺失
- 🟡 反噬自动遮挡机制未实现

---

### D-05 · [已验证/非缺陷] 旗标使用统计

基于 `script/chapters.json` 的 140 个 zone 统计：

| 旗标 | 出现次数 | 用途 | 是否参与结算 |
|------|---------|------|-------------|
| `risk+` | 39 | 异常/犹豫选项 | ❌ 未读取 |
| `crack+` | 18 | 关系裂缝 | ❌ L3 记录未用 |
| `control+` | 13 | 被控制感 | ❌ 未读取 |
| `truth+` | 12 | 露出真实 | ❌ 未读取 |
| `bond+` | 11 | 对消音依赖 | ❌ 未读取 |
| `hate_leak+` | 11 | 直播厌恶外泄 | ✅ L2 结算 |
| `pass+` | 11 | 面试通过分 | ✅ L1 结算 |
| `mask+` | 10 | 表演/讨好 | ❌ 未读取 |
| `fail+` | 9 | 面试失败分 | ✅ L1 结算 |
| `secret_risk+` | 6 | 秘密暴露风险 | ❌ L3 记录未用 |
| `apology_refuse+` | 5 | 道歉硬刚 | ⚠️ L4 累积但未结算 |
| `apology_perform+` | 4 | 道歉表演 | ⚠️ L4 累积但未结算 |
| `distance+` | 4 | 朋友距离 | ❌ L3 记录未用 |
| `trust-` | 4 | 朋友不信任 | ❌ L3 记录未用 |
| `trust+` | 2 | 朋友信任 | ❌ L3 记录未用 |
| `revolt+` | 1 | 被反噬 | ❌ 未读取 |

**结论**：140 个旗标中只有 31 个（22%）参与实际结算逻辑，78% 的旗标仅用于记录。

---

## 建议修复优先级

> 下表是初次审计时的排序记录；已修复项仍保留在表中用于追溯，当前待处理范围见文末批次状态。

| 优先级 | 问题编号 | 标题 | 理由 |
|--------|---------|------|------|
| 🔴 P0 | A-01 | 第四章结算条件矛盾 | 直接决定能否出关、播哪条视频 |
| 🔴 P0 | A-03 | 多出现 zone 错位 | 运行时遮错字 / remain 错位 |
| 🔴 P0 | A-05 | L4 结算逻辑未实现 | 游戏规则未完成 |
| 🔴 P0 | A-07 | L3_S04b 违反游戏规则 | 破坏物理规则一致性 |
| 🔴 P0 | A-02 | ending_seed 无算法 | 结局判定歧义 |
| 🔴 P0 | A-04 | L3→L4 因果断裂 | 第四章动机空洞 |
| 🔴 P0 | A-06 | URL 路径不一致 | 可能导致 404 |
| 🟡 P1 | B-01 | 跨章 flag 空转 | 78% 旗标未被消费 |
| 🟡 P1 | B-02 | L1 难度与 risk 语义 | 教学关体验 |
| 🟡 P1 | B-03 | L2 pass+ 污染 | 结算旗标污染 |
| 🟡 P1 | B-04 | L3 关系旗标无反馈 | 系统完整性 |
| 🟡 P1 | B-05 | 反噬叙事未兑现 | 关末台词可信度 |
| 🟡 P1 | B-06 | 终局 C/C' 映射 | 视频资源清晰度 |
| 🟢 P2 | C-01 | remain 超越删除规则 | 叙事物理一致性 |
| 🟢 P2 | C-02 | L2_S03 听感破裂 | 边缘体验 |
| 🟢 P2 | C-03 | L1→L2 时间锚缺失 | 叙事连贯性 |
| 🟢 P2 | C-04 | 反转文案张力 | 元叙事清晰度 |
| 🟢 P2 | C-05 | L3_S05 note 不明确 | 实现细节 |
| 🟢 P2 | C-06 | risk+ 用途不明 | 系统透明度 |
| 🟢 P2 | C-07 | 无障碍标签缺失 | 可访问性 |
| 🟢 P2 | C-08 | 魔法数字硬编码 | 代码可维护性 |
| 🔵 P3 | D-01 | 体量与编号说明 | 文档完整性 |
| 🔵 P3 | D-02 | 文档不一致 | 开发协同 |

---

## 审查方法摘要

**数据完整性验证**：
- 全文对照 `台本.md` v1.2 与 `script/chapters.json` v1.2.1（35 句 / 140 zone）
- 校验每条 `zone.text ∈ line.raw`；标记多出现与 remain 非第一处删除
- 验证 13 个场景页 PNG 文件存在且尺寸正确（1536×1024）
- 验证 4 个 BGM MP3 文件存在且 manifest 绑定完整

**逻辑完整性验证**：
- 枚举 L1/L4 每句 4 选 1 的 flag 可达性（4^7=16384 种组合）
- 对照 `schedule.md` §11.8 结算表与台本结算节差异
- 检查运行时代码 `web/js/main.js` 中的结算逻辑实现
- 交叉验证 manifest 绑定与实际资产文件

**代码质量验证**：
- JavaScript 语法检查（`node --check`）
- JSON 格式验证（`python -m json.tool`）
- Python 场景验证脚本（`art/v4/scenes/validate.py`）
- URL 路径一致性检查

---

## 结论与建议

### 总体状态
《请替我沉默》Demo 的**核心玩法循环完整且可运行**，数据资产完备，但存在**中等规模的技术债务**需要在正式发布前解决。

### 待设计行动项（发布前仍需确认）
1. **统一 L4 结算规则**并实现运行时逻辑（A-01, A-05）
2. **明确 ending_seed 算法**或移除该特性（A-02）
3. **补充 L3→L4 因果事件**（A-04）
4. **评估非 `/web/` 根路径部署策略**（A-06，当前 `/web/` 入口已验证）

### 短期改进项（提升体验）
1. 消费或明确标注未使用的 78% 旗标（B-01）
2. 实现反噬自动遮挡机制（B-05）
3. 调整 L1 难度或明确 risk 语义（B-02）

### 长期优化项（技术债务）
1. 消费或明确标注未使用的关系旗标（B-01、B-04、C-06）
2. 补齐反噬与终局媒体规则（B-05、B-06）
3. 为 Tauri WebView 增加最小 CSP（R-12）

**审计完成时间**：2026-08-04
**下次审计建议**：关末视频接入后、正式发布前

---

## 2026-08-04 增量审计：运行时与发布链

> 本节只补充本次代码、浏览器烟测和产物组装中确认的新问题；上方既有 A-D 条目保留不改。

### R-01 · P1 · [已修复] `Esc` 关闭章节覆盖层后游戏卡死

**位置**：`web/js/main.js:1269-1272,1504-1512`

章节或结局覆盖层出现时，`Esc` 会调用 `hideOverlay()`，但不会清除上一句吸附留下的
`state.locked = true`。覆盖层消失后，黑条仍有 `is-locked` 和 `pointer-events: none`，
而 `overlayAction` 已被清空，玩家无法继续，只能重启或按 `R`。

**复现**：完成任一 L0-L4 末句，在“段落结束”覆盖层按 `Esc`，再拖动黑条。

**建议**：覆盖层关闭时恢复可继续状态，或章节覆盖层禁止 `Esc` 关闭；结局覆盖层则应明确
只允许“重新开始”。

### R-02 · P1 · [已解决] L2 的 `hate_leak` 目标没有运行时结算

`script/chapters.json` 声明 L2 目标为 `hate_leak<2`，否则应进入事故/重来分支；但
`web/js/main.js:1004-1011` 的 `chapterResult()` 只实现 L1，`finishChapter()` 也只处理
L1 失败。L2 无论累计多少 `hate_leak+` 都会正常进入 L3，旗标只写入存档而不产生结果。

**建议**：实现 L2 结算和重试，或从章节 JSON 和文档中删除该目标，避免“可玩的规则”和实际
流程不一致。

### R-03 · P1 · [已修复] 调试 URL 会继承存档的旧行号

`restoreState()` 先恢复 `lineIndex`，`applyDebugLocation()` 在只有 `chapter` 参数时只改
`chapterIndex`（`web/js/main.js:1316-1344`），不会把行号重置为 0。已有存档停在 L5_S05
时访问 `/web/?chapter=L3` 会打开 L3_S05；行号超过 L3 长度时则直接进入章节结束逻辑。
未知章节参数也会让页面跳过封面并回退到存档状态。

**建议**：`chapter` 参数存在且没有显式 `line` 时将 `lineIndex` 设为 0，并对未知 chapter/line
返回可见错误或保留封面。

### R-04 · P1 · [已修复] 选项提交不是原子存档，刷新可重复计数

`applySelection()` 在 `web/js/main.js:905-924` 先把 flags 和 `eatLog` 写入存档，再通过
`setTimeout` 延迟推进 `lineIndex`。玩家在约 1 秒窗口内刷新或关闭页面，恢复后仍停在同一句，
但旗标和吞字记录已经存在；再次选择会重复累计。重启按钮或 `R` 也不会取消旧的延迟回调，
可能让旧回调推进新的一局。

**建议**：持久化 pending selection/token 并在恢复时完成或回滚，或把“选项结果 + 行号”一次性
提交；重启时统一清理所有推进计时器。

### R-05 · P2 · [已修复] 禁用 `localStorage` 时启动失败

`restoreAudioSettings()` 和 `restoreState()` 的 `catch` 中再次调用 `localStorage.removeItem`
（`web/js/main.js:223-239,1316-1335`）。在隐私模式或浏览器策略禁止存储时，第一次
`getItem()` 已抛 `SecurityError`，清理调用会再次抛出并使 `load()` 显示致命错误页；`resetRun()`
也未保护 `removeItem()`。

**建议**：封装安全的读写/删除 helper；存储不可用时降级为无存档运行，而不是阻止游戏启动。

### R-06 · P2 · [已修复] 小屏直播滚屏与台词框重叠

在 520px 以下，`web/css/style.css:391,405-406` 同时设置台词框最小高度 246px、滚屏顶部
190px 和滚屏最小高度 160px。浏览器 320×568 烟测中，滚屏最后几条评论和黑条落入台词框区域，
遮挡评论及交互反馈。

**建议**：用剩余可视高度计算滚屏高度，或在小屏将滚屏移到台词框上方并缩短最小高度；补充
320×568 和横屏移动端截图验收。

### R-07 · P2 · [已修复] Pages/Tauri 产物缺少 manifest 声明的旧背景

`art/v4/playable/manifest.json:21-27` 的 `backgrounds` 指向 `../../bg/BG_*.png`，但
`.github/workflows/deploy-pages.yml:46-50` 和 `scripts/prepare-tauri.mjs:57-64` 都只复制
manifest 的 `assets[]`，不会复制 `art/bg/`。实测 `npm run tauri:prepare` 后，五个
`dist/tauri/art/bg/BG_*.png` 均不存在。当前整页 Demo 不读取这些路径，但任何 legacy/fallback
消费者都会在发布包中收到 404，manifest 也因此不是自包含的。

**建议**：要么从发布 manifest 删除旧背景声明，要么把 `art/bg/` 纳入两个产物并在 CI 校验
`backgrounds` 路径。

### R-08 · P2 · [已修复] Tauri 构建没有 `Cargo.lock`

`src-tauri/Cargo.lock` 不在仓库中，CI 使用 `dtolnay/rust-toolchain@stable`，而
`tauri`/`tauri-build` 依赖按 semver 范围重新解析。相同提交在未来可能解析到不同依赖，导致
桌面构建不可复现或突然失败。

**建议**：提交桌面应用的 `Cargo.lock`，CI 使用 `cargo build --locked` 或等价的 Tauri 构建参数，
并固定 Rust 工具链版本。

### R-09 · P2 · [已修复] 资产生成入口泄露本地密钥约定且不可跨环境运行

当前 `storyboard/v4-prop-lock/gen_v4.sh:6`、归档 `archive/art-v1/gen_art.sh:6` 和
`archive/storyboard/demo-effects/gen_demo.sh:4` 在环境变量缺失时读取 `/tmp/opencode/api_key.txt`，
与仓库的“密钥只从进程环境读取”约定冲突；同时这些脚本以及
`art/v4/scenes/generate_pages.sh:127-128` 硬编码了
`/home/donz/game/video-storyboard-doomer-1999/generated/S09.png` 和 `S11.png`，其他机器会直接失败。

**建议**：只接受 `OPENAI_API_KEY`，参考图路径改为可配置变量并在调用前显式检查存在性。

### R-10 · P2 · [已修复] Tauri CI 的质量门槛低于 Pages

`.github/workflows/build-tauri.yml:55-56` 只验证音频；Pages 工作流才运行场景页校验。Tauri 的
`beforeBuild` 会组装文件，但不会检查 page bindings、PNG 尺寸或可玩 manifest 语义，因此桌面包
可能包含 Pages 会拒绝的坏资源。

**建议**：在 Tauri workflow 也安装 Pillow 并运行场景/可玩资产校验，或对 `dist/tauri` 执行同等
manifest 验证。

### R-11 · P2 · [已修复] CI action 与工具链版本可漂移

两个 workflow 使用可变的 `@v1/@v4/@v5` action、`rust-toolchain@stable` 和 `node-version: lts/*`。
这会让构建结果受上游 tag 移动、Node LTS 切换或 Rust 更新影响，也扩大供应链风险。

**建议**：对关键 action 使用 commit SHA，固定 Node/Rust 版本，并在升级时单独提交变更。

### R-12 · P3 · [低优先级加固] Tauri WebView 未设置 CSP

`src-tauri/tauri.conf.json:22-24` 将 `app.security.csp` 设为 `null`。当前资源是本地静态文件，
风险有限；但若未来引入外部内容或动态 HTML，打包 WebView 没有 CSP 防线。

**建议**：在不阻断本地资源的前提下设置最小 `default-src 'self'` 策略，并为需要的音频/图片源显式
放行。

### R-13 · P2 · [已修复] 存档索引和空存档缺少边界校验

`restoreState()`（`web/js/main.js:1323-1327`）只对 `chapterIndex` 做上界限制，没有限制下界
或整数性；手工写入 `-1`、小数或超大值的存档会让 `currentChapter()` 变成空值或跳到错误章节。
即使存档只有 `{}`，也会被标记为 `hasSave = true`，标题页会错误显示“继续游戏”。

**建议**：统一把章节/行号解析为有限整数并 clamp 到有效范围；校验失败时丢弃存档并回退为新游戏。

### 增量审计复核

- `python3 art/v4/scenes/validate.py`：通过（13 pages / 6 chapters / 4 endings）
- `python3 art/v4/playable/validate.py`：通过（55 assets，0 errors，5 existing warnings）
- `node scripts/validate-audio.mjs`：通过（4 tracks / 6 chapters / 4 endings）
- `node --check web/js/main.js`：通过
- `npm run tauri:prepare`：通过，五个旧背景路径已随产物复制并可解析
- Chrome 1440×900、390×844、320×568：页面可加载；小屏滚屏已与台词框分离

### 既有条目复核说明

上方 A-06 将相对 URL 差异直接定为 P0，但仓库约定的 `/web/` 入口在 Pages 和本地静态服务器
上已验证可加载；Tauri 组装脚本也会重写 `../art/` 与 `../script/`。该项更适合作为“页面被搬到
其他目录时的可移植性风险”，不应与 R-07 的实际发布包资源缺失混为同一故障。

### 直接修复批次状态（2026-08-04）

- 已处理：A-03、A-07、B-03、C-01、C-05、C-07、C-08、D-02、R-01、R-03 至 R-11、R-13。
- 新增 `scripts/validate-chapters.mjs`，并纳入 Pages/Tauri CI；`remainMode: mechanical` 只在
  数据校验脚本中严格检查，运行时仍允许叙事文案保留标点重组。
- 已验证：`node --check`、章节/音频/场景/playable 校验、`npm run tauri:prepare`、Pages/Tauri
  workflow YAML 解析、桌面与 320×568 移动端浏览器冒烟。
- 未处理：A-01、A-02、A-04、A-05、B-01、B-02、B-04、B-05、B-06、C-02 至 C-04、C-06、R-02；
  这些条目仍需要结算、文案或媒体规则决策。R-12 CSP 继续作为后续安全加固项。

### 2026-08-05 运行时复核

- **已修复**：章节过场序列从 `chapterOutros` 查找，L0-L4 不再因只查询 `sequences` 而跳过视频。
- **已修复**：反转视频的“跳过”现在会结束整个 K21→K22 序列，不会跳到下一镜头继续播放。
- **已修复**：重开或按 `R` 时统一取消视频/提示/直播计时器，并释放黑条与记忆碎片的指针捕获，避免旧状态污染新局。
- **已验证**：35 个台词调试入口、结局反转跳过、禁用 `localStorage` 启动、视频/场景/音频/章节校验和 Tauri 产物组装均通过。

### 2026-08-25 规则对齐实现

按台本实现此前标记「需设计决策」的结算项；`台本.md` 原文未改，代码/数据服从台本：

- **A-05 / R-02（L2 结算）**：`web/js/runtime/70-flow.js` 的 `chapterResult()` 增加 L2 分支——`hate_leak < 2` 下播，否则「直播事故」重试层（新增 `ui.retryLive*` 四语言文案，并加入 `validate-locales` 白名单）并 `restartChapter()` 重开；重开时清零 `hate_leak`。
- **A-01 / A-05（L4 结算）**：新增 `chapterL4Route()`——`apology_perform >= apology_refuse` 走 `L4_perform_to_L5`，否则 `L4_refuse_to_L5`；实现台本「混线取较高」，平票取表演为补足台本未定义的边界；「另一路 1s 噪声」已以运行时近似落地（见下）。
- **L4 混线 1s 噪声（近似落地）**：`chapterL4Mixed()`（两路均≥1）时，进路线过场前播 1s Web Audio 白噪声 + 画面闪黑（`playNoiseBurst` + `.stage.is-noise`）；真视频插片仍留媒体层。
- **B-04（L3 关系旗标回声）**：已处理——L3 章末覆盖层按 `secret_risk`/`trust`/`distance`/`crack` 分支文案（台本新增结算变体表，四语言 `variants`；优先级 risk > distrust > distance > crack）。
- **未落地台词收尾**：L3 旁白「有些门开了，话却关得更死。」并入 L3 settlement 第二条；V1_fail UI「还可以再试一次。」并入 L1 settlementFail 第二条；L5 过场 N02b 秘密回声（`secretEcho`，`secret_risk≥2`）——台本与四语言同步。
- **结局台词叠字落地**：`game.endings` 对齐台本——A 补「她：……这次我说完了。她取回语言。」，C 改台本字幕「请求还在，人不必在。」，C' 补「只剩条与字灰」（四语言）。
- **数据解耦（chapters.json）**：移除纯视觉注释字段（顶层 `rules`、各章 `creature`/`bg`/`demo`/`演出`/`narration_note`/`special_note`/`旁白`、行级 `face`），仅保留规则与稳定 ID；`sync.note` 更新，注释内容由 `台本.md` 独有。
- **A-02（ending_seed）**：实现种子微调——选 L5_S03 zone 时捕获 `ending_seed`（A/B），L5_S06 结算时 `resolveEnding()`：seed A 与 `B_alienate` 相斥改 `A_separate`、seed B 与 `A_separate` 相斥改 `B_alienate`，C/C' 不受影响；`endingSeed` 随存档持久化，恢复时校验为 A/B，无种子 zone 显式清空。`chapters.json` 与台本的种子字段保留。
- **L1/L4 门槛（B-02 / 提交 cba3b51）**：按提交 `cba3b51`「for better player flow」的设计意图统一为 L1 `pass>=3 && fail<2`、L4 `apology_perform>=1 || apology_refuse>=1`——代码、`chapters.json`、`台本.md` 与四语言 objective 全部同步；L4 运行时仍为「取较高、平票取表演」。
- **已验证**：`node --check` 全部运行时文件、`validate-chapters`、`validate-locales` 通过。
- **B-06（C/C' 视频映射）**：已文档化——`C_consume` 与 `C_cold` 共用 K19/K20（`V5_C`）与 `PAGE_END_C_hollow` 是显式设计，差异仅在结局标题/文案；已写入视频 manifest note、`schedule.md` 映射表，`validate-runtime-videos.mjs` 亦显式声明。
- **C-04（反转文案）**：已处理——第 2/3 句改为谜语式「被你吃掉的，才是她想说的。/ 留下来的，是念给别人听的。」（四语言、台本分镜、`chapters.json` 同步）。
- **过场层（narration）落地**：章首按 `narration` 逐条自动播放（时长按字数，1.8s–3.6s），期间黑条隐藏并锁定，结束渲染首句；重启/重开会取消并重置。L0 教学、L5「只剩你了」等台本过场自此可见。
- **关末结算台词落地**：L1-L4 章末先播 `settlement`（台本「关末不可遮」她的台词，四语言 locale 新增字段；L1 含面试官「明天来试用」），再弹覆盖层；`chapters.json` 的 `结算台词` 字段移除，避免双语双源。
- **L1 失败侧结算台词落地**：`settlementFail`（四语言）——L1 失败先播「（面试官A）我们再联系。」，再进 `L1_fail_retry` 过场与重试层；`validate-locales` 增加 `settlementFail` 校验。
- **旗标全量消费（B-01/B-02/C-06）**：`risk≥3` 计入 L1 失败；`revolt≥1` 改写 L4 章末文案；`mask`/`truth`/`bond`/`control` 结局覆盖层人格回显（≥6 取最高，台本新增「人格回显」表，四语言 `game.persona`）。
- **B-05（L4 反噬自动遮挡）**：已落地——L4_S02 细条爬入预锁「不觉得自己做错了」1.5s 后由系统代吃，eatLog 标 `source: parasite`；章末「不是我拖的」每局为真。
- **仍未处理**：A-04、C-02、C-03；真噪声插片属媒体层待办。

### 2026-08-25 未追踪缺口登记

此前未被任何 TODO/清单追踪的项（已核实现状）：

- **L1 失败侧结算台词**：已落地（同日）——`settlementFail` 四语言新增，L1 失败先播「（面试官A）我们再联系。」再进失败过场与重试层。
- **A-06（URL 路径一致性）**：已降级为「页面搬到其他目录时的可移植性风险」，`/web/` 入口已验证；无处理计划。
- **R-12（Tauri WebView CSP）**：低优先级安全加固，继续挂起。
- **存档导出/导入**：README 自述「暂未实现」，无计划。
- **PWA**：README 部署方案提及「支持 PWA」，未实现、无计划。
- **en/de/ru 母语审校**：三语言 Beta，待母语审校（README 已标注，无专门条目）。
