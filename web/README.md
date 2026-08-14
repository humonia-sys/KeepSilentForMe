# Web Demo

`web/` 是当前可玩的原生 HTML/CSS/JavaScript 运行时。它不需要打包器，
通过 Pointer Events 处理鼠标和触摸拖拽，通过 `localStorage` 保存稳定章节、台词、zone
ID、旗标和结局状态。简体中文、英文、德文和俄文都由同一套规则驱动；后三种在界面中标记为 Beta。

运行时脚本按依赖顺序由 `index.html` 加载：`js/runtime/00-config-dom-state.js` 提供共享配置、DOM
引用和状态，后续文件依次负责语言、视频、音频、章节状态/滚屏、台词拖拽、语言胃、流程与启动校验；
`js/main.js` 只保留最终的事件绑定和 `load()` 调用。样式入口 `css/style.css` 依次导入
`tokens.css`、`base.css`、`components.css` 和 `responsive.css`。

## 本地运行

必须通过静态服务器打开，不能直接双击 `index.html`：

```bash
python3 -m http.server 8765 --directory .
```

打开 <http://127.0.0.1:8765/web/>。

提交前运行 `npm run validate:runtime-js`，它会对每个运行时脚本执行 `node --check`，并确认
`index.html` 引用了全部文件且保持 `main.js` 最后加载。

正常启动顺序为：

1. 载入规则 JSON、语言 manifest/当前语言包、V4 可玩 manifest 和整页场景 manifest。
2. 显示 `coverPage` 指定的标题封面（当前为 `PAGE_L5_poster`）。
3. 没有存档时显示“开始游戏”；有存档时显示“继续游戏”和“重新开始”。
4. 进入 L0-L5，完成最后一句后显示对应结局覆盖层。

## 调试入口

URL 参数是直接调试入口，启动时会跳过标题封面：

```text
/web/?chapter=L3
/web/?chapter=L3&line=L3_S04b
/web/?ending=A_separate
/web/?lang=en
/web/?lang=de&chapter=L3&line=L3_S04b
```

可用章节 ID 为 `L0`、`L1`、`L2`、`L3`、`L4`、`L5`；结局 ID 为
`A_separate`、`B_alienate`、`C_consume`、`C_cold`。

## 本地化

- [`../script/chapters.json`](../script/chapters.json) 只保存规则、旗标和稳定 ID；文本在 [`../script/locales/`](../script/locales/) 中。
- 语言入口位于封面选择框和右上角菜单。稳定状态下可即时切换；拖拽、记忆编排、视频或结局覆盖层期间会禁用切换，避免 Range 命中层和定时器失配。
- `?lang=` 仅覆盖当前 URL，不写入偏好。未带参数时，优先使用手动偏好，其次匹配浏览器语言，最后回退简体中文。
- v2 存档保存 `{ chapterId, lineId, zoneId }`，切换语言后私语与反转字幕会使用当前语言重新渲染。旧文本型存档会保留主进度和旗标，清除无法可靠对应的吞字/私语记录并显示提示。
- 运行 `npm run validate:locales` 校验四份语言包的全部 35 条台词、140 个 zone、显式 offset 和机械删词结果。翻译说明见 [`../script/locales/README.md`](../script/locales/README.md)。

## 当前运行时边界

- 运行时代码按职责拆在 `js/runtime/`：配置/状态、语言、视频、音频、存档与直播、台词拖拽、记忆层和流程初始化；`js/main.js` 只负责最后的事件绑定与启动。`index.html` 必须保持这些 classic script 的顺序，运行 `npm run validate:runtime-js` 会同时检查每个 chunk 的语法、引用完整性和入口顺序。
- 句子原文只渲染一次，`Range.getClientRects()` 生成可换行、可重叠的透明命中层。
- 玩家只能把黑条拖到预定义连续 zone；吸附后显示 HTML 反馈和整页切换动画。
- 角色、朋友、消音体和结局已经绘制进 13 张整页 PNG，运行时不再叠加透明叙事层。
- `pageBindings` 负责章节/台词到场景页的映射；`endingPages` 负责四个逻辑结局。
- L1 会按 `pass/fail` 显示重试层；L2/L3/L4 当前只记录旗标并继续推进。
- `L5_S06` 直接决定四个结局；`C_consume` 和 `C_cold` 共用 `PAGE_END_C_hollow`。
- L1-L4 段落结束后会进入“语言胃 / Echo Digest”：本章所有被吞下的片段会以可拖拽碎片出现，玩家把它们收进私语 lane 后确认；没有正确顺序和失败判定。
- 私语只影响叙事回声和视觉反馈，不改旗标、章节分支或结局；下一章第一句旁显示上一章的私语，L0 教学和 L5 终局不插入该层。
- 存档中的 `selections` 记录 `{ chapterId, lineId, zoneId }`，`memoryByChapter` 和 `memoryDraft` 保存 zone ID；显示文本只在当前语言包中解析。
- L2 与 L4 直播章节会显示独立的右侧滚屏评论层；每句台词切换一组观众文本和人数基准，人数会持续小幅波动，黑条吸附后的 NPC 反馈会追加到滚屏，离开直播章节自动清理。
- 滚屏桌面宽度上限为 `480px`（约 `42vw`）、高度上限为 `420px`（约 `48vh`）；移动端宽度约 `72vw`、高度最高 `154px`，并保持在底部台词框上方。
- `audio/manifest.json` 绑定 4 首 CC0 本地 BGM：标题/L0/L1 使用雨夜环境，L2/L4 使用直播压迫，L3 使用门厅悬疑，L5 和四个结局使用终局余响；章节或结局切换时交叉淡化。
- 右上角总开关同时控制 Web Audio 提示音和 BGM；配乐在开始按钮或调试入口的第一次用户手势后启动，以遵守浏览器自动播放策略。
- 右上角齿轮打开“音乐调节”面板，可分别调整配乐和提示音音量；设置保存在 `localStorage`，重新开始不会重置音量偏好。
- 音频来源、作者、CC0 记录、原始文件、转码参数和 SHA-256 见 [`audio/SOURCES.md`](audio/SOURCES.md)；运行时不请求外部音频 URL。
- 章节、终局和反转视频由 [`video/manifest.json`](video/manifest.json) 驱动：`chapterOutros` 覆盖 K01-K14 的七条过场（L1 失败播放后留在重试界面），`sequences` 覆盖 A/B/C 结局与 K21/K22 反转；视频静音，BGM 继续由 HTML 音频控制。首次反转播放后可跳过。

## 在线与桌面构建

GitHub Pages 工作流位于 `.github/workflows/deploy-pages.yml`，在线入口为：

<https://avrovadonz2026.github.io/KeepSilentForMe/web/>

Tauri 2 工作流位于 `.github/workflows/build-tauri.yml`。最新成功运行生成：

- `keep-silent-for-me-windows-x64-nsis`
- `keep-silent-for-me-linux-amd64-appimage`
- `keep-silent-for-me-linux-amd64-deb`

桌面构建前，`scripts/prepare-tauri.mjs` 会将 `web/`（包括 `web/video/kling/` 的 K01-K22）、整个 `script/`（含 `locales/`）、
`art/bg/`、`art/v4/playable/` 和 `art/v4/scenes/` 组装到 `dist/tauri/`。
`src-tauri/Cargo.lock` 与 CI 的 Rust 1.88.0 共同固定桌面依赖解析。

## 场景页生成与校验

`art/v4/scenes/manifest.json` 是页面 ID、封面、章节绑定和结局绑定的唯一来源。
生成脚本使用 `/images/edits`，不会把密钥写入仓库：

```bash
OPENAI_BASE_URL=https://api.qingyuntop.top/v1 \
OPENAI_API_KEY=... \
MODEL=gpt-image-2 \
./art/v4/scenes/generate_pages.sh all

python3 art/v4/scenes/validate.py
python3 art/v4/playable/validate.py
node scripts/validate-chapters.mjs
npm run validate:locales
```

生成器默认跳过已存在的 PNG；使用 `FORCE=1` 才会重绘。响应和日志保存在 `/tmp`。

## 相关文档

- 根目录 [README.md](../README.md)：项目状态、部署和下一步
- [art/v4/scenes/README.md](../art/v4/scenes/README.md)：13 张整页场景页
- [art/v4/playable/README.md](../art/v4/playable/README.md)：55 件 V4 UI/反馈与源资产
- [issue.md](../issue.md)：当前规则和叙事数据问题清单
