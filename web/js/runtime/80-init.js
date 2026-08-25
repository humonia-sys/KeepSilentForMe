"use strict";

// Debug routing, title startup, event binding, manifest checks, and loading.
function readDebugParam(params, key) {
  const values = params.getAll(key);
  if (!values.length) return { present: false, value: null };
  if (values.length !== 1 || !values[0]) throw new Error(`调试参数 ${key} 必须只有一个非空值`);
  return { present: true, value: values[0] };
}

function parseDebugLocation() {
  const params = new URLSearchParams(window.location.search);
  const values = Object.fromEntries([...DEBUG_KEYS].map((key) => [key, readDebugParam(params, key)]));
  const active = [...DEBUG_KEYS].some((key) => values[key].present);
  if (!active) return { active: false };

  const chapterId = values.chapter.value;
  const lineId = values.line.value;
  const endingId = values.ending.value;
  if (values.ending.present && (values.chapter.present || values.line.present)) {
    throw new Error("调试结局不能同时指定章节或台词");
  }
  if (values.line.present && !values.chapter.present) {
    throw new Error("调试台词必须同时指定 chapter");
  }
  if (values.ending.present) {
    const endingPages = state.pages?.endingPages ?? {};
    if (!Object.prototype.hasOwnProperty.call(endingPages, endingId)) {
      throw new Error(`未知调试结局: ${endingId}`);
    }
    const chapterIndex = state.chapters.findIndex((chapter) => chapter.id === "L5");
    if (chapterIndex < 0) throw new Error("找不到终局章节 L5");
    return {
      active: true,
      endingId,
      chapterIndex,
      lineIndex: Math.max(0, (state.chapters[chapterIndex].lines?.length ?? 1) - 1),
    };
  }

  const chapterIndex = state.chapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex < 0) throw new Error(`未知调试章节: ${chapterId}`);
  const lines = state.chapters[chapterIndex].lines ?? [];
  const lineIndex = values.line.present ? lines.findIndex((line) => line.id === lineId) : 0;
  if (lineIndex < 0) throw new Error(`台词不属于 ${chapterId}: ${lineId}`);
  return { active: true, chapterId, lineId: lineId ?? null, chapterIndex, lineIndex };
}

function configureTitleScreen() {
  const hasSave = state.hasSave;
  dom.app.classList.add("is-title-screen");
  dom.titleScreen.classList.remove("is-hidden", "is-leaving");
  dom.titleScreen.setAttribute("aria-hidden", "false");
  dom.titleScreen.setAttribute("aria-busy", "false");
  dom.titleScreen.inert = false;
  dom.titlePrimary.disabled = false;
  dom.titleNewGame.disabled = false;
  dom.titlePrimary.textContent = hasSave ? t("ui.titlePrimaryContinue") : t("ui.titlePrimaryNew");
  dom.titleNewGame.classList.toggle("is-hidden", !hasSave);
  dom.titleStatus.textContent = state.pendingMigrationNotice
    ? t("ui.oldSaveMigrated")
    : (hasSave ? t("ui.titleHasSave") : t("ui.titleReady"));
  state.titleReady = true;
  syncLanguageControls();
}

function skipTitleScreen() {
  dom.app.classList.remove("is-title-screen");
  dom.titleScreen.classList.add("is-hidden");
  dom.titleScreen.classList.remove("is-leaving");
  dom.titleScreen.setAttribute("aria-hidden", "true");
  dom.titleScreen.setAttribute("aria-busy", "false");
  dom.titleScreen.inert = true;
  dom.titlePrimary.disabled = true;
  dom.titleNewGame.disabled = true;
  state.titleReady = false;
  syncLanguageControls();
}

function closeTitleScreen() {
  dom.titleScreen.classList.add("is-leaving");
  dom.titleScreen.setAttribute("aria-hidden", "true");
  dom.titleScreen.inert = true;
  dom.titlePrimary.disabled = true;
  dom.titleNewGame.disabled = true;
  syncLanguageControls();
  window.setTimeout(() => {
    dom.titleScreen.classList.add("is-hidden");
    dom.app.classList.remove("is-title-screen");
  }, TITLE_CLOSE_DELAY_MS);
}

async function startGame(mode = "continue") {
  if (!state.titleReady || state.titleStarting) return;
  state.titleStarting = true;
  syncLanguageControls();
  dom.titlePrimary.disabled = true;
  dom.titleNewGame.disabled = true;
  if (mode === "new") resetRun();

  try {
    const endingId = mode === "continue" ? state.endingId : null;
    const pendingMemory = state.memoryDraft?.chapterId === currentChapter()?.id;
    const pageId = endingId
      ? state.pages.endingPages[endingId]
      : pageForLine(currentChapter(), currentLine()) ?? chapterDefaultPage(currentChapter());
    if (!pageId) throw new Error("当前游戏页面不存在");

    // Start from the trusted button gesture before waiting on image decoding.
    state.bgm.started = true;
    syncBgmForLocation(endingId ? null : currentChapter(), endingId);

    if (endingId) {
      await finishEnding(endingId, null, { playSequence: false });
    } else {
      await setScenePage(pageId, true);
      state.endingId = null;
      if (pendingMemory) {
        setScene(currentChapter(), null, false);
        openMemoryOverlay(currentChapter());
      } else {
        setScene(currentChapter(), currentLine(), false);
        renderLine();
      }
    }
    startBgm();
    closeTitleScreen();
  } catch (error) {
    console.error(error);
    state.bgm.started = false;
    stopBgmSlots();
    dom.titleStatus.textContent = t("ui.endingSceneFailed");
    dom.titlePrimary.disabled = false;
    dom.titleNewGame.disabled = false;
  } finally {
    state.titleStarting = false;
    syncLanguageControls();
  }
}

function applyDebugLocation(location) {
  if (!location?.active) return;
  state.chapterIndex = location.chapterIndex;
  state.lineIndex = location.lineIndex;
  state.endingId = location.endingId ?? null;
  // A debug URL is an explicit location request; an interrupted memory draft
  // from local storage must not hijack the requested chapter or line.
  state.memoryDraft = null;
}

function audioContext() {
  if (!state.audioContext) state.audioContext = new AudioContext();
  return state.audioContext;
}

function ping(kind) {
  if (!state.sound || state.audioSettings.sfxVolume <= 0) return;
  try {
    const context = audioContext();
    if (context.state === "suspended") void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const peak = 0.035 * state.audioSettings.sfxVolume;
    oscillator.frequency.value = { pick: 152, snap: 218, reject: 78 }[kind] ?? 140;
    oscillator.type = kind === "reject" ? "sawtooth" : "sine";
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
  } catch (error) {
    // Browsers can block audio until a gesture; the visual loop still works.
  }
}

// 台本 L4 混线「另一路用 1s 闪入噪声」的运行时近似：白噪声脉冲，真插片留媒体层。
function playNoiseBurst(durationMs = L4_MIXED_NOISE_MS) {
  if (!state.sound || state.audioSettings.sfxVolume <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const settle = window.setTimeout(resolve, durationMs + 120);
    try {
      const context = audioContext();
      if (context.state === "suspended") void context.resume();
      const length = Math.max(1, Math.floor(context.sampleRate * durationMs / 1000));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.6;
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.12 * state.audioSettings.sfxVolume, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + durationMs / 1000);
      source.connect(gain).connect(context.destination);
      source.onended = () => { window.clearTimeout(settle); resolve(); };
      source.start();
    } catch (error) {
      window.clearTimeout(settle);
      resolve();
    }
  });
}

function bindEvents() {
  dom.blackBar.addEventListener("pointerdown", onPointerDown);
  dom.blackBar.addEventListener("pointermove", onPointerMove);
  dom.blackBar.addEventListener("pointerup", onPointerUp);
  dom.blackBar.addEventListener("pointercancel", onPointerUp);
  dom.restartButton.addEventListener("click", restartGame);
  dom.soundButton.addEventListener("click", toggleSound);
  dom.retryButton.addEventListener("click", load);
  dom.titlePrimary.addEventListener("click", () => startGame(state.hasSave ? "continue" : "new"));
  dom.titleNewGame.addEventListener("click", () => startGame("new"));
  dom.overlayAction.addEventListener("click", () => state.overlayAction?.());
  dom.memoryConfirm.addEventListener("click", confirmMemory);
  dom.titleLanguageSelect.addEventListener("change", (event) => {
    void switchLocale(event.target.value, { persist: true });
  });
  dom.languageMenuButton.addEventListener("click", () => {
    if (languageSwitchLocked()) return;
    const opening = dom.languageMenu.classList.contains("is-hidden");
    dom.languageMenu.classList.toggle("is-hidden", !opening);
    dom.languageMenuButton.setAttribute("aria-expanded", String(opening));
  });
  dom.audioSettingsButton.addEventListener("click", toggleAudioSettings);
  dom.audioSettingsClose.addEventListener("click", closeAudioSettings);
  dom.audioEnabled.addEventListener("change", () => setAudioEnabled(dom.audioEnabled.checked));
  dom.musicVolume.addEventListener("input", (event) => setMusicVolume(event.target.value));
  dom.sfxVolume.addEventListener("input", (event) => setSfxVolume(event.target.value));
  dom.memoryOverlay.addEventListener("pointermove", onMemoryPointerMove);
  dom.memoryOverlay.addEventListener("pointerup", onMemoryPointerUp);
  dom.memoryOverlay.addEventListener("pointercancel", onMemoryPointerCancel);
  document.addEventListener("pointerdown", () => {
    if (state.debugMode && !state.bgm.started) startBgm();
  }, { capture: true });
  document.addEventListener("pointerdown", (event) => {
    if (dom.audioSettings.classList.contains("is-hidden")) return;
    if (!dom.audioSettings.contains(event.target) && event.target !== dom.audioSettingsButton) closeAudioSettings();
  }, { capture: true });
  document.addEventListener("pointerdown", (event) => {
    if (dom.languageMenu.classList.contains("is-hidden")) return;
    if (!dom.languageMenu.contains(event.target) && event.target !== dom.languageMenuButton) closeLanguageMenu();
  }, { capture: true });
  window.addEventListener("resize", () => {
    if (state.dialogueLayout) layoutDialogueZones();
    if (!state.dragging && !state.locked) positionBarAtRest();
    if (state.hoverZone !== null) setNearestZone(state.hoverZone);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r" && dom.titleScreen.classList.contains("is-hidden")) restartGame();
    if (event.key === "Escape" && !dom.audioSettings.classList.contains("is-hidden")) {
      event.preventDefault();
      closeAudioSettings();
      return;
    }
    if (event.key === "Escape" && !dom.memoryOverlay.classList.contains("is-hidden")) {
      event.preventDefault();
      return;
    }
    if (event.key === "Escape" && !dom.overlay.classList.contains("is-hidden")) {
      event.preventDefault();
      return;
    }
  });
}

function validateBindings() {
  const pageBindings = state.pages.pageBindings ?? {};
  const endingPages = state.pages.endingPages ?? {};
  const endingIds = new Set(["A_separate", "B_alienate", "C_consume", "C_cold"]);
  const referencedEndings = new Set();
  const chapterIds = new Set(state.chapters.map((chapter) => chapter.id));
  if (!state.pages.coverPage || !state.pageAssets.has(state.pages.coverPage)) {
    throw new Error(`封面场景页不存在: ${state.pages.coverPage ?? ""}`);
  }
  for (const chapterId of Object.keys(pageBindings)) {
    if (!chapterIds.has(chapterId)) throw new Error(`整页绑定包含未知章节 ${chapterId}`);
  }
  for (const chapter of state.chapters) {
    const binding = pageBindings[chapter.id];
    if (!binding) throw new Error(`${chapter.id} 缺少整页绑定`);
    if (!binding.default || !state.pageAssets.has(binding.default)) {
      throw new Error(`${chapter.id} 缺少有效默认场景页`);
    }
    const lineIds = new Set((chapter.lines ?? []).map((line) => line.id));
    const lineBindings = binding.lines ?? {};
    for (const lineId of Object.keys(lineBindings)) {
      if (!lineIds.has(lineId)) throw new Error(`整页绑定包含未知台词 ${lineId}`);
    }
    for (const line of chapter.lines ?? []) {
      if (!Object.prototype.hasOwnProperty.call(lineBindings, line.id)) {
        throw new Error(`${line.id} 缺少显式整页绑定`);
      }
      const pageId = lineBindings[line.id];
      if (!pageId || !state.pageAssets.has(pageId)) throw new Error(`${line.id} 缺少场景页 ${pageId ?? ""}`);
      for (const zone of line.zones ?? []) {
        const start = dialogueZoneStart(line.raw, zone);
        if (start < 0
          || start + zone.text.length > line.raw.length
          || line.raw.slice(start, start + zone.text.length) !== zone.text) {
          throw new Error(`${line.id} 的遮挡区不在原句中`);
        }
        if (Number.isInteger(zone.start) && zone.start < 0) {
          throw new Error(`${line.id} 的遮挡区起点无效`);
        }
        if (zone.ending && !endingIds.has(zone.ending)) {
          throw new Error(`${line.id} 引用了未知结局 ${zone.ending}`);
        }
        if (zone.ending) referencedEndings.add(zone.ending);
      }
    }
  }
  if (Object.keys(endingPages).length !== endingIds.size || [...endingIds].some((id) => !Object.prototype.hasOwnProperty.call(endingPages, id))) {
    throw new Error("结局绑定必须包含四个结局 ID");
  }
  for (const pageId of Object.values(endingPages)) {
    if (!state.pageAssets.has(pageId)) throw new Error(`结局缺少场景页 ${pageId}`);
  }
  if (referencedEndings.size !== endingIds.size) throw new Error("章节台词没有覆盖全部结局 ID");
}

function validateAudioManifest() {
  const tracks = Array.isArray(state.audio?.tracks) ? state.audio.tracks : [];
  const trackIds = new Set(tracks.map((track) => track?.id).filter(Boolean));
  if (!tracks.length || !state.audio?.title || !trackIds.has(state.audio.title)) {
    throw new Error("配乐 manifest 缺少有效封面曲目");
  }
  for (const track of tracks) {
    if (!track.id || typeof track.path !== "string" || !track.path || !trackIds.has(track.id)) {
      throw new Error(`配乐条目无效: ${track.id ?? ""}`);
    }
  }
  for (const chapter of state.chapters) {
    const binding = normalizeAudioBinding(state.audio.chapters?.[chapter.id]);
    if (!binding?.track || !trackIds.has(binding.track)) {
      throw new Error(`${chapter.id} 缺少有效配乐绑定`);
    }
  }
  for (const endingId of ["A_separate", "B_alienate", "C_consume", "C_cold"]) {
    const binding = normalizeAudioBinding(state.audio.endings?.[endingId]);
    if (!binding?.track || !trackIds.has(binding.track)) {
      throw new Error(`${endingId} 缺少有效配乐绑定`);
    }
  }
}

function preloadPages(excludeId = "") {
  const pending = [...state.pageAssets.values()]
    .map((asset) => asset.id)
    .filter((pageId) => pageId !== excludeId);
  window.setTimeout(async () => {
    // Keep the first viewport responsive: warm one page at a time after the
    // committed page is visible instead of opening 13 large requests at once.
    for (const pageId of pending) {
      try {
        await loadPageImage(pageId, pageUrl(pageId));
      } catch (error) {
        console.warn(error.message);
      }
    }
  }, 0);
}

async function load() {
  dom.errorPanel.classList.add("is-hidden");
  dom.app.classList.add("is-loading");
  try {
    const fetchOptions = { cache: "no-store" };
    const responses = await Promise.all([
      fetch(DATA_URL, fetchOptions),
      fetch(LOCALE_MANIFEST_URL, fetchOptions),
      fetch(PLAYABLE_MANIFEST_URL, fetchOptions),
      fetch(PAGE_MANIFEST_URL, fetchOptions),
      fetch(AUDIO_MANIFEST_URL, fetchOptions),
      fetch(VIDEO_MANIFEST_URL, fetchOptions),
    ]);
    if (responses.some((response) => !response.ok)) throw new Error("Runtime data unavailable");
    state.baseData = await responses[0].json();
    state.localeManifest = await responses[1].json();
    state.playable = await responses[2].json();
    state.pages = await responses[3].json();
    state.audio = await responses[4].json();
    state.video = await responses[5].json();
    if (state.localeManifest?.schemaVersion !== 1 || !Array.isArray(state.localeManifest?.locales)) {
      throw new Error("Locale manifest is invalid");
    }
    const fallbackLocale = defaultLocaleDescriptor();
    if (!fallbackLocale) throw new Error("Locale manifest has no default locale");
    state.fallbackLocaleData = await fetchLocaleData(fallbackLocale);
    let selectedLocale = requestedLocaleDescriptor() ?? fallbackLocale;
    let selectedData = state.fallbackLocaleData;
    if (selectedLocale.id !== fallbackLocale.id) {
      try {
        selectedData = await fetchLocaleData(selectedLocale);
      } catch (error) {
        console.warn(error);
        selectedLocale = fallbackLocale;
      }
    }
    state.locale = selectedLocale;
    state.localeData = selectedData;
    state.data = { ...state.baseData, endings: selectedData.game?.endings ?? {} };
    state.chapters = joinLocalizedChapters(state.baseData, selectedData);
    restoreAudioSettings();
    state.assets = new Map((state.playable.assets ?? []).map((asset) => [asset.id, asset]));
    state.pageAssets = new Map((state.pages.assets ?? []).map((asset) => [asset.id, asset]));
    if (!state.chapters.length || !state.assets.size || !state.pageAssets.size) throw new Error("章节或资产为空");
    applyLocaleText();
    validateBindings();
    validateAudioManifest();
    validateVideoManifest();
    state.revealSeen = storageGet(REVEAL_SEEN_KEY) === "1";
    const debugLocation = parseDebugLocation();
    restoreState();
    applyDebugLocation(debugLocation);
    state.debugMode = debugLocation.active;
    const savedEnding = state.endingId && state.pages.endingPages?.[state.endingId] ? state.endingId : null;
    state.endingId = savedEnding;
    if (!state.debugMode) {
      const coverPageId = state.pages.coverPage;
      await setScenePage(coverPageId, false);
      syncBgmForLocation(null);
      preloadPages(coverPageId);
      dom.app.classList.remove("is-loading");
      configureTitleScreen();
      return;
    }

    const initialPageId = savedEnding
      ? state.pages.endingPages[savedEnding]
      : pageForLine(currentChapter(), currentLine()) ?? chapterDefaultPage(currentChapter());
    await setScenePage(initialPageId, false);
    if (state.endingId && state.pages.endingPages?.[state.endingId]) {
      await finishEnding(state.endingId, null, { playSequence: false });
    } else if (state.memoryDraft?.chapterId === currentChapter()?.id) {
      state.endingId = null;
      setScene(currentChapter(), null, false);
      openMemoryOverlay(currentChapter());
    } else {
      state.endingId = null;
      setScene(currentChapter(), currentLine(), false);
      renderLine();
    }
    preloadPages(initialPageId);
    dom.app.classList.remove("is-loading");
    skipTitleScreen();
  } catch (error) {
    console.error(error);
    dom.app.classList.remove("is-loading");
    dom.errorCopy.textContent = `${t("ui.runtimeDataMissing", {}, "Runtime data is unavailable.")} ${t("ui.loadErrorSuffix", {}, "Please open the game through a local web server.")}`;
    dom.errorPanel.classList.remove("is-hidden");
  }
}
