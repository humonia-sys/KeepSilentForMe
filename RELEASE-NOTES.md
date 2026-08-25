# 发布说明 / Release Notes（2026-08-25）

> 基线：`c833ec1`（refactor: split runtime into maintainable modules）
> 本次共 20 个提交（全部 GPG 签名），已推送 `main`。
> 验证状态：本地四项校验全绿；GitHub Pages 部署成功（最新提交 `352a6ea`）；Tauri 工作流运行中（首次带 ffmpeg 视频探测）。
> 原则：**台本.md 为唯一权威源**——新规则/新文案先落台本，代码与数据服从台本。

---

## 一、规则对齐与实现

- **L2 直播事故结算**：`hate_leak < 2` 下播；否则「直播事故」重试层并重开本章（新增 `ui.retryLive*`，四语言）。
- **L4 表演/硬刚结算**：`apology_perform >= apology_refuse` 选表演/硬刚过场（平票取表演）；混线（两路均≥1）进过场前播 1s 白噪声 + 闪黑。
- **L5 `ending_seed` 微调**：L5_S03 捕获种子（A/B），L5_S06 结算时相斥覆盖（C/C' 不受影响），随存档持久化。
- **门槛统一**：L1 `pass>=3 && fail<2 && risk<3`、L4 `>=1`——代码/数据/台本/四语言全链一致（按提交 `cba3b51` 设计意图）。
- **旗标全量消费（B-01/B-02/C-06 收口）**：
  - `risk≥3` 计入 L1 软失败（复用重试层）；
  - `revolt≥1` 改写 L4 章末文案（「不是她拖的——也不是你。」）；
  - `trust`/`distance`/`secret_risk`/`crack` 分支 L3 章末覆盖层文案（B-04）；
  - `mask`/`truth`/`bond`/`control` 在结局覆盖层追加「人格回显」一行（取最高且 ≥6）。
- **L4 反噬自动遮挡（B-05）**：L4_S02 细条从右侧爬入，预锁「不觉得自己做错了」1.5s 后由系统代吃（`eatLog.source = "parasite"`），章末「刚才有一条，不是我拖的」自此每局为真。

## 二、台本台词层落地（原先为死数据）

- **章首过场**：各章 `narration` 逐条自动渲染（含 L0 遮字教学、L5「……只剩你了。」），期间黑条隐藏锁定。
- **章末结算台词**：L1-L4 章末先播台本「关末不可遮」她的话；L1 失败侧补「我们再联系。」+ V1_fail UI「还可以再试一次。」；L3 补旁白「有些门开了，话却关得更死。」。
- **结局台词叠字**：`game.endings` 对齐台本（A 补「这次我说完了。她取回语言。」、C 改「请求还在，人不必在。」、C' 补「只剩条与字灰。」），四语言。
- **反转文案（C-04）**：改为谜语式「被你吃掉的，才是她想说的。/ 留下来的，是念给别人听的。」；动态字幕改为 eat 原文（去掉「已吞下」壳）。
- **L3 悬置线回收**：`secret_risk≥2` 时 L5 过场追加「那句「有别人」，也跟到了这里。」。

## 三、修复

- Windows release 弹出 console（`windows_subsystem` 移至 `main.rs`）。
- 直播章黑条休息位压住聊天框（L2/L4 休息位改左侧 0.34）。
- portable 产物 zip 套 zip（改为直接上传 exe，artifact 下载即平铺 zip）。
- 其余：存档 `endingSeed` 校验、L5_S03 无种子 zone 显式清空、重开取消旧定时器。

## 四、数据与文档

- **数据解耦**：`chapters.json` 移除纯视觉注释字段（`rules`/`creature`/`bg`/`demo`/`face`/`演出`/`narration_note`/`旁白` 等），仅保留规则与稳定 ID；注释由 `台本.md` 独有。
- 新增 [`TODO-AUDIT.md`](./TODO-AUDIT.md)（审计快照）、[`WORKLOG.md`](./WORKLOG.md)（工作日志）、[`script_runtime_comparison.md`](./script_runtime_comparison.md)（台本-运行时对比，含修正与更新注记）。
- `README.md` / `CLAUDE.md` / `schedule.md` / `issue.md` 全面同步；`issue.md` 批次标记 A-01/A-02/A-05/R-02/B-01/B-02/B-04/B-05/B-06/C-04/C-06 已解决/已处理。

## 五、CI

- Tauri 工作流安装 ffmpeg（Linux apt / Windows choco），视频探测与 Pages 对齐。
- 新增 Windows 便携 artifact（`keep-silent-for-me-windows-x64-portable`，下载解压即 exe 平铺）。

## 六、提交清单（20 个，GPG 签名）

```
352a6ea feat: L4 反噬自动遮挡落地（B-05）
9933d54 ci: Tauri 工作流安装 ffmpeg，视频探测与 Pages 对齐
58bae11 feat: 旗标全量消费（B-01/B-02/C-06 收口）
16b306a feat: B-04 完善（L5 悬置线回收）+ 未落地台词收尾
17a6c9f feat: L3 关系旗标回声（B-04）
713e04f fix: portable 产物不再 zip 套 zip
eff4c69 fix: 反转字幕改为 eat 原文，去掉「已吞下」壳
95dfe7d fix: 直播章黑条休息位避开右侧聊天框
2ff2edc feat: 数据解耦 + 结局台词叠字对齐台本
1052fe1 docs: 收录台本-运行时对比文档并补更新注记
5ad4cfa feat: L4 混线 1s 噪声近似落地（台本对齐）
33b2df5 feat: L1 失败侧结算台词「我们再联系」落地
434b0fb docs: 登记未追踪缺口并修正过时文档
8de10ba fix: 移除 Windows release 弹出的 console 窗口
7d7d4d1 feat: 章末结算台词落地（冲突二）
3d49ada feat: 章首过场台词（narration）落地渲染
c9a1515 docs: 反转文案改谜语式（C-04）
f67dd76 ci: add portable zip to Windows build artifacts
6c40af8 docs: 同步规则对齐后的文档、审计与工作日志
10efa53 feat: 对齐台本规则：L2/L4 结算、L5 ending_seed 与门槛统一
```

## 七、仍待处理（不在本次范围）

- **规则/文案决策**：A-04（L3→L4 缺「被炎上」事件）、C-02（L2_S03 半遮无 fail 旗标）、C-03（L1→L2 时间锚）。
- **媒体层**：真噪声插片（现为运行时近似）、SFX（待 freesound 素材）、配音（真人）。
- **低优先级**：A-06（URL 一致性）、R-12（CSP）、存档导出/导入、PWA、英/德/俄母语审校。
- **外部项**：Vercel/Netlify 镜像、预告视频、宣传素材、真机 QA、提交比赛。
