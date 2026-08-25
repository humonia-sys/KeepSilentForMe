"use strict";

// Dialogue rendering, draggable censor bar, and selection feedback.
function setScene(chapter, line = currentLine(), animate = false) {
  const meta = localeValue(`sceneMeta.${chapter?.id}`, localeValue("sceneMeta.L0", {}));
  dom.stage.dataset.chapter = chapter?.id ?? "L0";
  dom.statusCopy.textContent = meta.status ?? "";
  dom.sceneCaption.textContent = meta.caption ?? t("ui.sceneLoading");
  dom.statusFill.style.width = `${Math.max(18, ((state.chapterIndex + 1) / state.chapters.length) * 100)}%`;
  syncBgmForLocation(chapter);
  if (line) setScenePage(pageForLine(chapter, line), animate);
}

function dialogueZoneStart(raw, zone) {
  if (Number.isInteger(zone.start)) return zone.start;
  const occurrence = Math.max(1, Number(zone.occurrence) || 1);
  let from = 0;
  let start = -1;
  for (let count = 0; count < occurrence; count += 1) {
    start = raw.indexOf(zone.text, from);
    if (start < 0) break;
    from = start + zone.text.length;
  }
  return start;
}

function buildDialogue(raw, zones) {
  const intervals = zones
    .map((zone, index) => {
      const start = dialogueZoneStart(raw, zone);
      return { zone, index, start, end: start < 0 ? -1 : start + zone.text.length };
    })
    .filter((item) => item.start >= 0 && item.end > item.start && item.end <= raw.length);
  if (intervals.length !== zones.length) {
    throw new Error("台词遮挡区无法定位到原句");
  }

  dom.dialogueText.replaceChildren(document.createTextNode(raw));
  state.dialogueLayout = { intervals };
  layoutDialogueZones();
}

function layoutDialogueZones() {
  const layout = state.dialogueLayout;
  const textNode = dom.dialogueText.firstChild;
  if (!layout || !textNode || !dom.dialogueZones) return;

  clearNearestZone();
  const hostRect = dom.dialogueContent.getBoundingClientRect();
  const fragment = document.createDocumentFragment();
  for (const item of layout.intervals) {
    const range = document.createRange();
    range.setStart(textNode, item.start);
    range.setEnd(textNode, item.end);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    if (!rects.length) throw new Error(`台词遮挡区 ${item.index + 1} 没有可见位置`);
    rects.forEach((rect, rectIndex) => {
      const hit = document.createElement("span");
      hit.className = "zone";
      hit.dataset.zoneIndex = String(item.index);
      hit.dataset.zoneRect = String(rectIndex);
      Object.assign(hit.style, {
        left: `${rect.left - hostRect.left}px`,
        top: `${rect.top - hostRect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      hit.addEventListener("pointerenter", () => {
        if (!state.dragging && !state.locked) setNearestZone(item.index, hit);
      });
      hit.addEventListener("pointerleave", () => {
        if (!state.dragging && state.hoverTarget === hit) clearNearestZone();
      });
      fragment.append(hit);
    });
  }
  dom.dialogueZones.replaceChildren(fragment);
}

function setBarSource(mode) {
  const source = {
    hover: "UI_bar_hover",
    active: "UI_bar_active",
    snap: "UI_bar_snap",
    locked: "UI_bar_locked",
    cracked: "UI_bar_cracked",
  }[mode] ?? "UI_bar_hover";
  const src = assetUrl(source);
  if (src) dom.blackBar.src = src;
  dom.blackBar.classList.toggle("bar-hover", mode === "hover");
  dom.blackBar.classList.toggle("bar-active", mode === "active");
  dom.blackBar.classList.toggle("bar-snap", mode === "snap");
  dom.blackBar.classList.toggle("bar-locked", mode === "locked");
  dom.blackBar.classList.toggle("bar-cracked", mode === "cracked");
}

function startNarration(lines, onDone = null, index = 0, version = state.transitionVersion) {
  const line = lines[index];
  state.locked = true;
  syncLanguageControls();
  state.dialogueLayout = null;
  state.selectedZone = null;
  state.hoverZone = null;
  state.hoverTarget = null;
  dom.dialogueZones.replaceChildren();
  dom.blackBar.classList.add("is-hidden");
  dom.dialogueFrame.classList.add("is-narrating");
  dom.speakerName.textContent = "";
  dom.lineId.textContent = "";
  dom.feedbackCopy.textContent = "";
  dom.zoneCount.textContent = "";
  dom.dialogueText.replaceChildren(document.createTextNode(line));
  const duration = Math.max(NARRATION_LINE_MIN_MS, Math.min(NARRATION_LINE_MAX_MS, line.length * NARRATION_LINE_PER_CHAR_MS));
  scheduleTransition(() => {
    if (version !== state.transitionVersion) return;
    if (index + 1 < lines.length) {
      startNarration(lines, onDone, index + 1, version);
      return;
    }
    dom.blackBar.classList.remove("is-hidden");
    dom.dialogueFrame.classList.remove("is-narrating");
    state.locked = false;
    syncLanguageControls();
    if (onDone) onDone();
    else renderLine();
  }, duration);
}

// 台本 L4_S02 反噬：细条从右侧爬入，预锁「不觉得自己做错了」1.5s 后由系统代吃。
function scheduleParasiteCover(line) {
  const version = state.transitionVersion;
  const parasiteIndex = 0;
  state.locked = true;
  syncLanguageControls();
  dom.blackBar.classList.add("bar-parasite", "bar-crawling");
  setBarCenter(window.innerWidth + 240, window.innerHeight * BAR_REST_Y_RATIO);
  void dom.blackBar.offsetWidth;
  scheduleTransition(() => {
    if (version !== state.transitionVersion) return;
    const target = getZones().find((item) => Number(item.dataset.zoneIndex) === parasiteIndex);
    if (target) {
      const rect = target.getBoundingClientRect();
      setBarCenter(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, PARASITE_CRAWL_DELAY_MS);
  scheduleTransition(() => {
    if (version !== state.transitionVersion) return;
    dom.blackBar.classList.remove("bar-crawling");
    applySelection(parasiteIndex, version, "parasite");
  }, PARASITE_CRAWL_DELAY_MS + PARASITE_PRELOCK_MS);
}

function renderLine() {
  const chapter = currentChapter();
  const line = currentLine();
  if (!chapter || !line) {
    finishChapter();
    return;
  }
  // 章首过场：先逐条播放 narration（含 L0 教学、L5 终局独白），再渲染首句。
  if (line.id === chapter.lines[0].id
    && Array.isArray(chapter.narration) && chapter.narration.length
    && state.narrationShown !== chapter.id) {
    state.narrationShown = chapter.id;
    let lines = chapter.narration;
    // 台本 L5 过场 N02b：第三章秘密被推到门口（secret_risk≥2）时追加回声。
    if (chapter.id === "L5"
      && (Number(state.flags.secret_risk) || 0) >= 2
      && Array.isArray(chapter.secretEcho) && chapter.secretEcho.length) {
      lines = [...lines, ...chapter.secretEcho];
    }
    startNarration(lines);
    return;
  }
  state.selectedZone = null;
  state.hoverZone = null;
  state.hoverTarget = null;
  state.locked = false;
  syncLanguageControls();
  dom.blackBar.classList.remove("is-locked", "bar-active", "bar-snap", "bar-locked", "bar-cracked", "bar-parasite", "bar-crawling", "is-hidden");
  dom.dialogueFrame.classList.remove("is-narrating");
  const cracked = manifestLayerIds("bar_cracked", line.id)?.length;
  const locked = manifestLayerIds("bar_locked", line.id)?.length;
  setBarSource(cracked ? "cracked" : locked ? "locked" : "hover");
  dom.blackBar.style.width = BAR_DEFAULT_WIDTH;
  dom.chapterKicker.textContent = `${chapter.id} · ${chapter.title}`;
  dom.chapterTitle.textContent = localeValue(`sceneMeta.${chapter.id}.readout`, chapter.title);
  dom.speakerName.textContent = t("ui.speaker");
  dom.lineId.textContent = line.id;
  dom.zoneCount.textContent = String(line.zones.length).padStart(2, "0");
  dom.feedbackCopy.textContent = state.chapterIndex === 0 ? t("ui.lineFeedbackFirst") : t("ui.lineFeedback");
  renderMemoryEcho(chapter, line);
  renderLiveChat(chapter, line);
  buildDialogue(line.raw, line.zones);
  setScene(chapter, line, true);
  clearNearestZone();
  if (line.special === "prelock_optional") {
    scheduleParasiteCover(line);
  } else {
    window.requestAnimationFrame(positionBarAtRest);
  }
  triggerManifestEvent("zone_hint", undefined, FEEDBACK_HINT_DELAY_MS);
}

function setBarCenter(x, y) {
  const stageRect = dom.stage.getBoundingClientRect();
  const halfWidth = dom.blackBar.getBoundingClientRect().width / 2;
  const halfHeight = dom.blackBar.getBoundingClientRect().height / 2;
  const minX = stageRect.left + halfWidth + 12;
  const maxX = stageRect.right - halfWidth - 12;
  const minY = Math.max(stageRect.top + halfHeight + 12, 92);
  const maxY = stageRect.bottom - halfHeight - 12;
  const safeX = Math.min(maxX, Math.max(minX, x));
  const safeY = Math.min(maxY, Math.max(minY, y));
  dom.blackBar.style.left = `${safeX}px`;
  dom.blackBar.style.top = `${safeY}px`;
  return { x: safeX, y: safeY };
}

function positionBarAtRest() {
  if (state.dragging || state.locked) return;
  // 直播章（L2/L4）聊天框在右侧，休息位挪到左侧避免黑条挡住弹幕。
  const liveChapter = LIVE_CHAPTER_IDS.has(currentChapter()?.id);
  setBarCenter(
    window.innerWidth * (liveChapter ? BAR_REST_X_RATIO_LIVE : BAR_REST_X_RATIO),
    Math.min(window.innerHeight * BAR_REST_Y_RATIO, window.innerHeight - BAR_REST_BOTTOM_GUTTER),
  );
}

function getZones() {
  return [...dom.dialogueZones.querySelectorAll(".zone")];
}

function nearestZone(x, y) {
  let nearest = null;
  for (const zone of getZones()) {
    const rect = zone.getBoundingClientRect();
    const distance = Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y);
    const index = Number(zone.dataset.zoneIndex);
    if (!nearest || distance < nearest.distance) nearest = { index, distance, rect, element: zone };
  }
  return nearest;
}

function setNearestZone(index, element = null) {
  clearNearestZone();
  const zones = getZones().filter((zone) => Number(zone.dataset.zoneIndex) === index);
  const zone = element && zones.includes(element) ? element : zones[0];
  if (!zone) return;
  zones.forEach((item) => item.classList.add("is-nearest"));
  state.hoverZone = index;
  state.hoverTarget = zone;
  const rect = zone.getBoundingClientRect();
  dom.zoneHalo.style.left = `${rect.left + rect.width / 2}px`;
  dom.zoneHalo.style.top = `${rect.top + rect.height / 2}px`;
  dom.zoneHalo.style.width = `${Math.max(rect.width + 18, 54)}px`;
  dom.zoneHalo.style.height = `${Math.max(rect.height + 14, 38)}px`;
  dom.zoneHalo.classList.add("is-visible");
}

function clearNearestZone() {
  for (const zone of getZones()) zone.classList.remove("is-nearest");
  state.hoverZone = null;
  state.hoverTarget = null;
  dom.zoneHalo.classList.remove("is-visible");
}

function isReachableZone(target) {
  return Boolean(
    target
      && target.distance < Math.max(ZONE_REACHABLE_MIN_DISTANCE, target.rect.width * ZONE_REACHABLE_WIDTH_RATIO),
  );
}

function updateDragTarget(clientX, clientY) {
  const nearest = nearestZone(clientX, clientY);
  if (!nearest) return;
  if (isReachableZone(nearest)) {
    setNearestZone(nearest.index, nearest.element);
    dom.blackBar.style.width = `${Math.min(BAR_MAX_WIDTH, Math.max(BAR_MIN_WIDTH, nearest.rect.width + 22))}px`;
  } else {
    clearNearestZone();
    dom.blackBar.style.width = BAR_DEFAULT_WIDTH;
  }
}

function onPointerDown(event) {
  if (state.locked || event.button > 0) return;
  event.preventDefault();
  const rect = dom.blackBar.getBoundingClientRect();
  state.dragging = true;
  syncLanguageControls();
  state.pointerId = event.pointerId;
  state.dragOffsetX = event.clientX - (rect.left + rect.width / 2);
  state.dragOffsetY = event.clientY - (rect.top + rect.height / 2);
  dom.blackBar.setPointerCapture(event.pointerId);
  setBarSource("active");
  updateDragTarget(event.clientX, event.clientY);
  ping("pick");
}

function onPointerMove(event) {
  if (!state.dragging || event.pointerId !== state.pointerId) return;
  event.preventDefault();
  const x = event.clientX - state.dragOffsetX;
  const y = event.clientY - state.dragOffsetY;
  const center = setBarCenter(x, y);
  updateDragTarget(center.x, center.y);
}

function onPointerUp(event) {
  if (!state.dragging || event.pointerId !== state.pointerId) return;
  state.dragging = false;
  syncLanguageControls();
  state.pointerId = null;
  if (dom.blackBar.hasPointerCapture(event.pointerId)) dom.blackBar.releasePointerCapture(event.pointerId);
  const rect = dom.blackBar.getBoundingClientRect();
  const target = nearestZone(rect.left + rect.width / 2, rect.top + rect.height / 2);
  if (!isReachableZone(target)) {
    clearNearestZone();
    setBarSource("hover");
    dom.blackBar.style.width = BAR_DEFAULT_WIDTH;
    positionBarAtRest();
    showToast(t("ui.selectionNotFound"), TOAST_REJECT_DURATION_MS);
    ping("reject");
    return;
  }
  snapToZone(target.index, target.element);
}

function snapToZone(index, targetElement = null) {
  const zone = targetElement ?? getZones().find((item) => Number(item.dataset.zoneIndex) === index);
  if (!zone || state.locked) return;
  const rect = zone.getBoundingClientRect();
  state.selectedZone = index;
  setNearestZone(index, zone);
  dom.blackBar.style.width = `${Math.min(BAR_MAX_WIDTH, Math.max(BAR_MIN_WIDTH, rect.width + 22))}px`;
  setBarSource("snap");
  setBarCenter(rect.left + rect.width / 2, rect.top + rect.height / 2);
  state.locked = true;
  syncLanguageControls();
  dom.blackBar.classList.add("is-locked");
  ping("snap");
  triggerManifestEvent("bar_snap", index);
  const version = state.transitionVersion;
  scheduleTransition(() => applySelection(index, version), SELECTION_SNAP_DELAY_MS);
}

function applyFlags(flags = []) {
  for (const flag of flags) {
    const match = /^([a-z_]+)([+-])$/.exec(flag);
    if (!match) continue;
    const [, name, operator] = match;
    state.flags[name] = Math.max(0, (state.flags[name] ?? 0) + (operator === "+" ? 1 : -1));
  }
}

function applySelection(index, version = state.transitionVersion, source = "player") {
  if (version !== state.transitionVersion || !state.locked) return;
  const line = currentLine();
  const zone = line?.zones?.[index];
  if (!line || !zone) return;
  getZones()
    .filter((item) => Number(item.dataset.zoneIndex) === index)
    .forEach((item) => item.classList.add("is-eaten"));
  applyFlags(zone.flags);
  if (line.id === "L5_S03") {
    // L5_S03 决定终局种子：Z01→A、Z02/Z04→B、Z03（这一次，）无种子；
    // 无种子时显式清空，避免调试回跳重玩时沿用上一轮的旧值。
    state.endingSeed = typeof zone.ending_seed === "string" && zone.ending_seed ? zone.ending_seed : null;
  }
  state.eatLog.push({ chapterId: currentChapter().id, lineId: line.id, zoneId: zone.id, source });
  dom.feedbackCopy.textContent = zone.npc || t("ui.swallowedNpcFallback");
  dom.statusCopy.textContent = zone.eat ? t("ui.swallowed", { text: zone.eat }) : t("ui.swallowedFallback");
  appendLiveChat(zone.npc || t("ui.swallowedFallback"));
  showToast(zone.npc || t("ui.swallowedFallback"), TOAST_SELECTION_DURATION_MS);
  triggerFeedback("snap", index);
  triggerManifestEvent("censor_absorb", index);
  triggerManifestEvent("dialogue_refresh", index, FEEDBACK_DIALOGUE_REFRESH_DELAY_MS);
  if (zone.flags?.some((flag) => flag.startsWith("risk"))) triggerFeedback("reject", index, FEEDBACK_RISK_DELAY_MS);
  triggerManifestEvent("bar_reject", index, FEEDBACK_RISK_DELAY_MS);
  const transition = commitSelection(zone, line);
  saveState();
  scheduleTransition(() => continueAfterSelection(transition, version), SELECTION_FEEDBACK_DELAY_MS);
}

function resolveEnding(s06Ending, seed) {
  // 台本：L5_S06 主判定，L5_S03 的 ending_seed 微调。
  // seed A（想自己说）与 S06 的 B_alienate 相斥时回 A_separate；
  // seed B（仍依赖你）与 S06 的 A_separate 相斥时回 B_alienate；
  // C_consume / C_cold 不受种子影响。
  if (seed === "A" && s06Ending === "B_alienate") return "A_separate";
  if (seed === "B" && s06Ending === "A_separate") return "B_alienate";
  return s06Ending;
}

function commitSelection(zone, line) {
  if (line.is_ending) {
    const endingId = resolveEnding(zone.ending ?? "A_separate", state.endingSeed);
    state.endingId = endingId;
    return { kind: "ending", endingId };
  }
  state.lineIndex += 1;
  return {
    kind: state.lineIndex >= currentChapter().lines.length ? "chapter" : "line",
  };
}

function continueAfterSelection(transition, version) {
  if (version !== state.transitionVersion) return;
  if (transition.kind === "ending") {
    void finishEnding(transition.endingId, version).catch((error) => {
      if (version !== state.transitionVersion) return;
      console.error(error);
      state.locked = false;
      showToast(t("ui.endingSceneFailed"), TOAST_FAILURE_DURATION_MS);
    });
    return;
  }
  if (transition.kind === "chapter") {
    finishChapter();
    return;
  }
  scheduleTransition(() => {
    if (version === state.transitionVersion) renderLine();
  }, LINE_RENDER_DELAY_MS);
}

function fxPosition(index) {
  const zone = index === undefined
    ? null
    : state.hoverTarget && Number(state.hoverTarget.dataset.zoneIndex) === index
      ? state.hoverTarget
      : getZones().find((item) => Number(item.dataset.zoneIndex) === index);
  if (!zone) return { left: "50%", top: "46%" };
  const rect = zone.getBoundingClientRect();
  return { left: `${rect.left + rect.width / 2}px`, top: `${rect.top + rect.height / 2}px` };
}

function triggerFeedback(kind, index, delay = 0, assetIds = null) {
  const map = {
    hint: ["FX_zone_hint"],
    snap: ["FX_zone_snap_pulse"],
    absorb: ["FX_censor_absorb", "FX_text_fragment_burst"],
    refresh: ["FX_dialog_refresh_glitch"],
    reject: ["FX_bar_reject_shiver"],
  };
  const schedule = () => {
    for (const id of assetIds ?? map[kind] ?? []) {
      const src = assetUrl(id);
      if (!src) continue;
      const sprite = document.createElement("img");
      sprite.className = `fx-sprite ${kind === "absorb" ? "is-ink" : ""}`;
      sprite.src = src;
      sprite.alt = "";
      const position = fxPosition(index);
      Object.assign(sprite.style, position);
      sprite.style.transform = "translate(-50%, -50%)";
      sprite.style.width = id.includes("burst") ? "min(34vw, 440px)" : "min(62vw, 980px)";
      sprite.style.height = "auto";
      dom.fxLayer.append(sprite);
      window.setTimeout(() => sprite.remove(), FX_REMOVE_DELAY_MS);
    }
  };
  const version = state.transitionVersion;
  const run = () => {
    if (version !== state.transitionVersion) return;
    schedule();
  };
  if (delay) scheduleTransition(run, delay); else run();
}

function manifestLayerIds(name, lineId) {
  const binding = state.playable?.interactiveBindings?.[currentChapter()?.id];
  const entry = binding?.events?.[name] ?? binding?.states?.[name];
  if (!entry || entry.trigger !== lineId) return null;
  return (entry.layers ?? []).map((layer) => layer?.asset).filter((id) => id && state.assets.has(id));
}

function triggerManifestEvent(name, index, delay = 0) {
  const ids = manifestLayerIds(name, currentLine()?.id);
  if (!ids?.length) return false;
  const kind = {
    zone_hint: "hint",
    bar_snap: "snap",
    censor_absorb: "absorb",
    dialogue_refresh: "refresh",
    bar_reject: "reject",
  }[name];
  if (!kind) return false;
  triggerFeedback(kind, index, delay, ids);
  return true;
}
