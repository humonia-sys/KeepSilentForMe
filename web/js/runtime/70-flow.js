"use strict";

// Chapter progression, endings, overlays, and persistence.
function chapterResult(chapter) {
  if (chapter.id === "L1") {
    const pass = state.flags.pass ?? 0;
    const fail = state.flags.fail ?? 0;
    return pass >= 3 && fail < 2 ? "pass" : "fail";
  }
  if (chapter.id === "L2") {
    const hateLeak = state.flags.hate_leak ?? 0;
    return hateLeak < 2 ? "pass" : "fail";
  }
  return "pass";
}

// L4 无失败重开：任何周目都会收束，结算即「走表演线还是硬刚线」。
// 台本第四章结算：混线取较高，平票取表演（apology_perform >= apology_refuse）；
// 「另一路 1s 噪声闪入」属媒体层，运行时暂未插片。
function chapterL4Route() {
  const perform = Number(state.flags.apology_perform) || 0;
  const refuse = Number(state.flags.apology_refuse) || 0;
  return perform >= refuse ? "perform" : "refuse";
}

function finishChapter() {
  const chapter = currentChapter();
  if (LIVE_CHAPTER_IDS.has(chapter?.id)) hideLiveChat();
  if (chapterResult(chapter) === "fail") {
    hideOverlay();
    state.locked = true;
    if (chapter.id === "L1") {
      void playChapterOutro("L1_fail_retry", () => {
        if (currentChapter()?.id !== "L1") return;
        state.locked = true;
        syncLanguageControls();
        showOverlay(
          t("ui.retryInterviewEyebrow"),
          t("ui.retryInterviewTitle"),
          t("ui.retryInterviewAction"),
          () => restartChapter(),
          t("ui.retryInterviewToast"),
        );
      });
    } else if (chapter.id === "L2") {
      // 台本第二章：hate_leak≥2 即直播事故，提示后重开本章（无独立事故视频）。
      syncLanguageControls();
      showOverlay(
        t("ui.retryLiveEyebrow"),
        t("ui.retryLiveTitle"),
        t("ui.retryLiveAction"),
        () => restartChapter(),
        t("ui.retryLiveToast"),
      );
    }
    return;
  }
  if (state.chapterIndex >= state.chapters.length - 1) return;
  const chapterOverlay = localeValue(`game.chapterOverlays.${chapter.id}`, null);
  const title = chapterOverlay?.title ?? t("ui.nextChapter");
  const copy = chapterOverlay?.copy ?? t("ui.nextChapterCopy");
  const action = MEMORY_CHAPTER_IDS.has(chapter.id)
    ? () => openMemoryOverlay(chapter)
    : () => void playChapterOutroThenAdvance(chapter);
  showOverlay(t("ui.chapterEnded"), title, copy, action);
}

function nextChapter() {
  cancelTransitionTimers();
  hideOverlay();
  hideMemoryOverlay();
  state.endingId = null;
  state.chapterIndex += 1;
  state.lineIndex = 0;
  state.selectedZone = null;
  state.locked = false;
  syncLanguageControls();
  saveState();
  setScene(currentChapter(), currentLine(), true);
  renderLine();
}

function restartChapter() {
  cancelTransitionTimers();
  hideOverlay();
  hideMemoryOverlay();
  const chapter = currentChapter();
  state.eatLog = state.eatLog.filter((entry) => entry.chapterId !== chapter?.id);
  if (chapter?.id) delete state.memoryByChapter[chapter.id];
  state.memoryDraft = null;
  state.endingId = null;
  state.lineIndex = 0;
  state.flags.pass = 0;
  state.flags.fail = 0;
  state.flags.hate_leak = 0;
  state.narrationShown = null;
  state.locked = false;
  syncLanguageControls();
  state.selectedZone = null;
  saveState();
  setScene(currentChapter(), currentLine(), true);
  renderLine();
}

async function playRevealSequence() {
  hideOverlay();
  state.locked = true;
  try {
    await playStorySequence("reveal", { reveal: true });
    showOverlay(
      t("ui.replayEyebrow"),
      t("ui.replayTitle"),
      t("ui.replayCopy"),
      () => restartGame(),
      t("ui.replayAction"),
    );
  } catch (error) {
    console.error(error);
    showToast(t("ui.revealVideoFailed"), TOAST_FAILURE_DURATION_MS);
    showOverlay(
      t("ui.replayEyebrow"),
      t("ui.replayTitle"),
      t("ui.revealVideoFallback"),
      () => restartGame(),
      t("ui.replayAction"),
    );
  }
}

async function finishEnding(endingId, expectedTransitionVersion = null, { playSequence = true } = {}) {
  if (expectedTransitionVersion !== null && expectedTransitionVersion !== state.transitionVersion) return false;
  const pageId = state.pages?.endingPages?.[endingId];
  if (!pageId) throw new Error(`结局页面不存在: ${endingId}`);
  state.endingId = endingId;
  state.locked = true;
  syncLanguageControls();
  syncBgmForLocation(null, endingId);
  saveState();
  if (playSequence) {
    try {
      await playStorySequence(endingId);
    } catch (error) {
      console.error(error);
      showToast(t("ui.endingVideoFailed"), TOAST_FAILURE_DURATION_MS);
    }
  }
  const loaded = await setScenePage(pageId, false);
  if (!loaded || (expectedTransitionVersion !== null && expectedTransitionVersion !== state.transitionVersion)) {
    return false;
  }
  dom.stage.dataset.ending = endingId;
  state.locked = true;
  syncLanguageControls();
  const endingTitle = localeValue(`game.endingTitles.${endingId}`, t("ui.endingFallbackTitle"));
  const endingCopy = state.data.endings?.[endingId] ?? "";
  showOverlay(
    t("ui.endingEyebrow", { endingId }),
    endingTitle,
    endingCopy,
    () => void playRevealSequence(),
    t("ui.watchReveal"),
  );
  return true;
}

function showOverlay(eyebrow, title, copy, action, actionLabel = t("ui.continue")) {
  state.overlayAction = action;
  dom.overlayEyebrow.textContent = eyebrow;
  dom.overlayTitle.textContent = title;
  dom.overlayCopy.textContent = copy;
  dom.overlayAction.textContent = actionLabel;
  dom.overlay.classList.remove("is-hidden");
}

function hideOverlay() {
  dom.overlay.classList.add("is-hidden");
  state.overlayAction = null;
}

function resetRun() {
  cancelStoryVideo();
  cancelTransitionTimers();
  hideLiveChat();
  clearTimeout(state.toastTimer);
  state.toastTimer = null;
  dom.toast.classList.remove("is-visible");
  if (state.pointerId !== null && dom.blackBar.hasPointerCapture?.(state.pointerId)) {
    dom.blackBar.releasePointerCapture(state.pointerId);
  }
  state.dragging = false;
  state.pointerId = null;
  state.dragOffsetX = 0;
  state.dragOffsetY = 0;
  storageRemove(SAVE_KEY);
  state.chapterIndex = 0;
  state.lineIndex = 0;
  state.flags = {};
  state.eatLog = [];
  state.memoryByChapter = {};
  state.memoryDraft = null;
  state.endingId = null;
  state.endingSeed = null;
  state.narrationShown = null;
  state.hasSave = false;
  state.pendingMigrationNotice = false;
  state.locked = false;
  syncLanguageControls();
  state.selectedZone = null;
  state.hoverZone = null;
  state.hoverTarget = null;
  delete dom.stage.dataset.ending;
}

function restartGame() {
  resetRun();
  hideOverlay();
  hideMemoryOverlay();
  setScene(currentChapter(), currentLine(), true);
  renderLine();
}

function saveState() {
  const chapter = currentChapter();
  const line = currentLine();
  const saved = storageSet(SAVE_KEY, JSON.stringify({
    schemaVersion: 2,
    position: {
      chapterId: chapter?.id ?? "L0",
      lineId: line?.id ?? null,
    },
    flags: state.flags,
    selections: state.eatLog,
    memoryByChapter: state.memoryByChapter,
    memoryDraft: state.memoryDraft ? {
      chapterId: state.memoryDraft.chapterId,
      fragmentIds: state.memoryDraft.fragments.map((fragment) => fragment.id),
      order: state.memoryDraft.order,
    } : null,
    endingId: state.endingId,
    endingSeed: state.endingSeed,
  }));
  if (saved) {
    state.hasSave = true;
  } else {
    state.hasSave = false;
    console.warn("save unavailable");
  }
}

function restoreState() {
  state.hasSave = false;
  state.pendingMigrationNotice = false;
  const raw = storageGet(SAVE_KEY);
  try {
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("存档格式无效");
    const endingIds = new Set(Object.keys(state.pages?.endingPages ?? {}));
    if (saved.endingId !== null && saved.endingId !== undefined && !endingIds.has(saved.endingId)) {
      throw new Error("存档结局无效");
    }
    if (saved.flags !== undefined
      && (!saved.flags || typeof saved.flags !== "object" || Array.isArray(saved.flags))) {
      throw new Error("存档状态无效");
    }
    if (saved.schemaVersion === 2) {
      const position = saved.position;
      if (!position || typeof position.chapterId !== "string") throw new Error("存档位置无效");
      const chapterIndex = state.chapters.findIndex((chapter) => chapter.id === position.chapterId);
      if (chapterIndex < 0) throw new Error("存档章节无效");
      const lines = state.chapters[chapterIndex]?.lines ?? [];
      const lineIndex = position.lineId === null
        ? lines.length
        : lines.findIndex((line) => line.id === position.lineId);
      if (lineIndex < 0) throw new Error("存档台词无效");
      state.chapterIndex = chapterIndex;
      state.lineIndex = lineIndex;
      state.flags = saved.flags ?? {};
      state.eatLog = normalizeSelections(saved.selections);
      state.memoryByChapter = normalizeMemoryByChapter(saved.memoryByChapter);
      state.memoryDraft = normalizeMemoryDraft(saved.memoryDraft);
      state.endingId = typeof saved.endingId === "string" ? saved.endingId : null;
      state.endingSeed = saved.endingSeed === "A" || saved.endingSeed === "B" ? saved.endingSeed : null;
      state.hasSave = true;
      return;
    }

    // Legacy saves persist translated text and cannot reliably be mapped to a
    // zone (several selectable texts are duplicated). Preserve progression only.
    const chapterIndex = saved.chapterIndex;
    const lineIndex = saved.lineIndex;
    const lines = state.chapters[chapterIndex]?.lines ?? [];
    if (!Number.isSafeInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= state.chapters.length
      || !Number.isSafeInteger(lineIndex) || lineIndex < 0 || lineIndex > lines.length) {
      throw new Error("旧版存档位置无效");
    }
    state.chapterIndex = chapterIndex;
    state.lineIndex = lineIndex;
    state.flags = saved.flags ?? {};
    state.eatLog = [];
    state.memoryByChapter = {};
    state.memoryDraft = null;
    state.endingId = typeof saved.endingId === "string" ? saved.endingId : null;
    state.endingSeed = saved.endingSeed === "A" || saved.endingSeed === "B" ? saved.endingSeed : null;
    state.hasSave = true;
    state.pendingMigrationNotice = true;
    saveState();
  } catch (error) {
    storageRemove(SAVE_KEY);
    console.warn("discarding invalid save", error.message);
  }
}
