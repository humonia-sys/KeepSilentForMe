"use strict";

// Locale loading, fallback joining, and language controls.
function localeValue(path, fallback = "") {
  const current = pathValue(state.localeData, path);
  if (current !== undefined && current !== null) return current;
  const fallbackValue = pathValue(state.fallbackLocaleData, path);
  return fallbackValue !== undefined && fallbackValue !== null ? fallbackValue : fallback;
}

function t(path, variables = {}, fallback = "") {
  return formatText(localeValue(path, fallback), variables);
}

function localeDescriptor(localeId) {
  return state.localeManifest?.locales?.find((locale) => locale?.id === localeId) ?? null;
}

function defaultLocaleDescriptor() {
  return localeDescriptor(state.localeManifest?.defaultLocale) ?? state.localeManifest?.locales?.[0] ?? null;
}

function localeLabel(locale) {
  if (!locale) return "";
  return locale.beta ? `${locale.nativeName} (${t("ui.beta", {}, "Beta")})` : locale.nativeName;
}

function compactLocaleLabel(locale) {
  if (!locale) return "";
  return locale.id === "zh-CN" ? "中文" : locale.id.toUpperCase();
}

function normalizeBrowserLocale(locale) {
  if (typeof locale !== "string" || !locale) return "";
  const normalized = locale.replace("_", "-").toLowerCase();
  if (localeDescriptor(normalized)) return normalized;
  const language = normalized.split("-")[0];
  if (language === "zh") return localeDescriptor("zh-CN") ? "zh-CN" : "";
  return localeDescriptor(language) ? language : "";
}

function requestedLocaleDescriptor() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("lang")) {
    const requested = params.get("lang") ?? "";
    const match = localeDescriptor(requested);
    if (!match) console.warn(`Unsupported locale query: ${requested}`);
    return match ?? defaultLocaleDescriptor();
  }
  const saved = localeDescriptor(storageGet(LOCALE_KEY));
  if (saved) return saved;
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const localeId = normalizeBrowserLocale(candidate);
    if (localeId) return localeDescriptor(localeId);
  }
  return defaultLocaleDescriptor();
}

function localePath(locale) {
  if (!locale || typeof locale.path !== "string" || !locale.path || locale.path.includes("..")) return "";
  return `${LOCALE_ROOT}${locale.path}`;
}

async function fetchLocaleData(locale) {
  const path = localePath(locale);
  if (!path) throw new Error("Invalid locale path");
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Locale data unavailable: ${locale.id}`);
  const data = await response.json();
  if (!data || data.schemaVersion !== 1 || data.locale !== locale.id) {
    throw new Error(`Locale data is invalid: ${locale.id}`);
  }
  return data;
}

function joinLocalizedChapters(baseData, localizedData) {
  if (!baseData || !Array.isArray(baseData.chapters) || !localizedData?.game?.lines) {
    throw new Error("Localized chapter data is invalid");
  }
  return baseData.chapters.map((baseChapter) => {
    const localizedChapter = localizedData.game.chapters?.[baseChapter.id];
    if (!localizedChapter || typeof localizedChapter.title !== "string") {
      throw new Error(`Locale is missing chapter ${baseChapter.id}`);
    }
    return {
      ...baseChapter,
      title: localizedChapter.title,
      narration: localizedChapter.narration ?? [],
      objective: localizedChapter.objective ?? "",
      lines: (baseChapter.lines ?? []).map((baseLine) => {
        const localizedLine = localizedData.game.lines[baseLine.id];
        if (!localizedLine || typeof localizedLine.raw !== "string" || !localizedLine.zones) {
          throw new Error(`Locale is missing line ${baseLine.id}`);
        }
        return {
          ...baseLine,
          raw: localizedLine.raw,
          zones: (baseLine.zones ?? []).map((baseZone) => {
            const localizedZone = localizedLine.zones[baseZone.id];
            if (!localizedZone || typeof localizedZone.text !== "string" || !localizedZone.text
              || !Number.isInteger(localizedZone.start)) {
              throw new Error(`Locale is missing zone ${baseZone.id}`);
            }
            return { ...baseZone, ...localizedZone };
          }),
        };
      }),
    };
  });
}

function zoneById(chapterId, zoneId) {
  const chapter = state.chapters.find((item) => item.id === chapterId);
  return chapter?.lines?.flatMap((line) => line.zones ?? []).find((zone) => zone.id === zoneId) ?? null;
}

function textForZoneId(chapterId, zoneId) {
  const zone = zoneById(chapterId, zoneId);
  return zone?.eat || zone?.text || "";
}

function languageSwitchLocked() {
  return dom.app.classList.contains("is-loading")
    || state.dragging
    || state.locked
    || state.videoPlaying
    || state.titleStarting
    || state.memoryDrag !== null
    || !dom.memoryOverlay.classList.contains("is-hidden")
    || state.localeSwitching;
}

function closeLanguageMenu() {
  dom.languageMenu.classList.add("is-hidden");
  dom.languageMenuButton.setAttribute("aria-expanded", "false");
}

function syncLanguageControls() {
  const disabled = languageSwitchLocked() || !state.localeManifest?.locales?.length;
  dom.titleLanguageSelect.disabled = disabled;
  dom.languageMenuButton.disabled = disabled;
  dom.languageMenuButton.setAttribute("aria-disabled", String(disabled));
  if (disabled) closeLanguageMenu();
}

function renderLanguageControls() {
  const locales = state.localeManifest?.locales ?? [];
  const selectedId = state.locale?.id ?? "";
  const options = locales.map((locale) => {
    const option = document.createElement("option");
    option.value = locale.id;
    option.textContent = localeLabel(locale);
    option.selected = locale.id === selectedId;
    return option;
  });
  dom.titleLanguageSelect.replaceChildren(...options);
  dom.titleLanguageSelect.value = selectedId;
  dom.languageMenuButton.textContent = compactLocaleLabel(state.locale);
  dom.languageMenuButton.setAttribute("aria-label", `${t("ui.languageMenuLabel")}: ${localeLabel(state.locale)}`);
  dom.languageMenuButton.setAttribute("title", localeLabel(state.locale));
  const choices = locales.map((locale) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-menu-option";
    button.role = "menuitemradio";
    button.setAttribute("aria-checked", String(locale.id === selectedId));
    button.textContent = localeLabel(locale);
    button.addEventListener("click", () => { void switchLocale(locale.id, { persist: true }); });
    return button;
  });
  dom.languageMenu.replaceChildren(...choices);
  syncLanguageControls();
}

function applyLocaleText() {
  if (!state.localeData || !state.locale) return;
  document.documentElement.lang = state.locale.id;
  document.title = localeValue("documentTitle", "Keep Silent for Me");
  dom.stage.setAttribute("aria-label", t("ui.stageLabel"));
  dom.titleScreen.setAttribute("aria-label", t("ui.titleScreenLabel"));
  dom.storyVideoSkip.textContent = t("ui.storyVideoSkip");
  dom.titleKicker.textContent = t("ui.titleKicker");
  dom.titleGameName.textContent = t("game.title");
  dom.titleLatinName.textContent = t("game.latinTitle");
  dom.titleTagline.textContent = t("game.tagline");
  dom.titleNewGame.textContent = t("ui.titleNewGame");
  dom.titleLanguageLabel.textContent = t("ui.languageLabel");
  dom.wordmarkName.textContent = t("game.title");
  dom.languageMenu.setAttribute("aria-label", t("ui.languageMenuLabel"));
  dom.restartButton.setAttribute("aria-label", t("ui.restart"));
  dom.restartButton.setAttribute("title", t("ui.restart"));
  dom.audioSettingsButton.setAttribute("aria-label", t("ui.audioSettingsOpen"));
  dom.audioSettingsButton.setAttribute("title", t("ui.audioSettings"));
  dom.audioSettingsEyebrow.textContent = t("ui.soundSettingsEyebrow");
  dom.audioSettingsTitle.textContent = t("ui.audioSettings");
  dom.audioSettingsClose.setAttribute("aria-label", t("ui.audioSettingsClose"));
  dom.audioSettingsClose.setAttribute("title", t("ui.audioSettingsClose"));
  dom.audioControlLabel.textContent = t("ui.sound");
  dom.musicVolumeLabel.textContent = t("ui.music");
  dom.sfxVolumeLabel.textContent = t("ui.soundEffects");
  dom.statusCaption.textContent = t("ui.sceneStatus");
  dom.statusCopy.textContent = localeValue("sceneMeta.L0.status", "");
  dom.sceneCaption.textContent = t("ui.sceneLoading");
  dom.liveChat.setAttribute("aria-label", t("ui.liveChatLabel"));
  dom.dialogueFrame.setAttribute("aria-label", t("ui.dialogueLabel"));
  dom.speakerName.textContent = t("ui.speaker");
  dom.feedbackCopy.textContent = t("ui.initialFeedback");
  dom.overlayEyebrow.textContent = t("ui.chapterEnded");
  dom.overlayAction.textContent = t("ui.continue");
  dom.memoryEyebrow.textContent = t("ui.memoryEyebrow", { chapterId: currentChapter()?.id ?? "L0" });
  dom.memoryTitle.textContent = t("ui.memoryTitle");
  dom.memoryCopy.textContent = t("ui.memoryCopy");
  dom.memoryFragmentsLabel.textContent = t("ui.memoryFragments");
  dom.memoryWhisperLabel.textContent = t("ui.memoryWhisper");
  dom.memoryPool.setAttribute("aria-label", t("ui.memoryPoolLabel"));
  dom.memoryLane.setAttribute("aria-label", t("ui.memoryLaneLabel"));
  dom.memoryConfirm.textContent = t("ui.memoryConfirm");
  dom.errorTitle.textContent = t("ui.errorTitle");
  dom.retryButton.textContent = t("ui.retry");
  if (dom.errorPanel.classList.contains("is-hidden")) dom.errorCopy.textContent = t("ui.errorLocalServer");
  renderLanguageControls();
  updateAudioSettingsUI();
}

async function switchLocale(localeId, { persist = false } = {}) {
  if (languageSwitchLocked()) return false;
  const target = localeDescriptor(localeId);
  if (!target) return false;
  if (target.id === state.locale?.id) {
    closeLanguageMenu();
    return true;
  }
  state.localeSwitching = true;
  syncLanguageControls();
  try {
    const localizedData = await fetchLocaleData(target);
    const chapters = joinLocalizedChapters(state.baseData, localizedData);
    state.locale = target;
    state.localeData = localizedData;
    state.data = { ...state.baseData, endings: localizedData.game.endings ?? {} };
    state.chapters = chapters;
    if (persist) storageSet(LOCALE_KEY, target.id);
    applyLocaleText();
    if (dom.titleScreen.classList.contains("is-hidden")) {
      renderLine();
    } else {
      configureTitleScreen();
    }
    return true;
  } catch (error) {
    console.error(error);
    showToast(t("ui.errorTitle", {}, "Unable to switch language."), TOAST_FAILURE_DURATION_MS);
    return false;
  } finally {
    state.localeSwitching = false;
    closeLanguageMenu();
    syncLanguageControls();
  }
}
