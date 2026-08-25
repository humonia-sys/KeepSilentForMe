import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scriptRoot = resolve(repositoryRoot, "script");
const base = JSON.parse(readFileSync(resolve(scriptRoot, "chapters.json"), "utf8"));
const manifestPath = resolve(scriptRoot, "locales", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const expectedLocales = [
  ["zh-CN", "简体中文", false, "zh-CN.json"],
  ["en", "English", true, "en.json"],
  ["de", "Deutsch", true, "de.json"],
  ["ru", "Русский", true, "ru.json"],
];
const expectedEndingIds = ["A_separate", "B_alienate", "C_consume", "C_cold"];
const requiredUiKeys = [
  "titleKicker", "titlePrimaryNew", "titlePrimaryContinue", "titleNewGame", "titleReady", "titleHasSave", "titleLoading",
  "languageLabel", "languageMenuLabel", "beta", "stageLabel", "titleScreenLabel", "storyVideoSkip", "restart",
  "audioSettingsOpen", "audioSettings", "audioSettingsClose", "soundToggleOn", "soundToggleOff", "soundSettingsEyebrow",
  "sound", "audioOn", "audioOff", "music", "soundEffects", "currentTrack", "currentTrackMuted", "waitingTrack",
  "sceneStatus", "sceneLoading", "liveChatLabel", "viewerCount", "dialogueLabel", "speaker", "initialFeedback",
  "lineFeedbackFirst", "lineFeedback", "swallowed", "swallowedFallback", "swallowedNpcFallback", "selectionNotFound",
  "sceneLoadRetained", "transitionVideoFailed", "endingSceneFailed", "endingVideoFailed", "revealVideoFailed", "revealVideoFallback",
  "chapterEnded", "nextChapter", "nextChapterCopy", "continue", "retryInterviewEyebrow", "retryInterviewTitle",
  "retryInterviewAction", "retryInterviewToast", "retryLiveEyebrow", "retryLiveTitle", "retryLiveAction", "retryLiveToast", "endingEyebrow", "endingFallbackTitle", "watchReveal", "replayEyebrow",
  "replayTitle", "replayCopy", "replayAction", "memoryEyebrow", "memoryTitle", "memoryCopy", "memoryFragments",
  "memoryWhisper", "memoryPoolLabel", "memoryLaneLabel", "memoryConfirm", "memoryEmpty", "memorySaved", "oldSaveMigrated",
  "errorTitle", "errorLocalServer", "retry", "loadErrorSuffix", "runtimeDataMissing", "fallbackChat",
];
const errors = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`Could not parse ${path}: ${error.message}`);
    return null;
  }
}

function sameKeys(label, expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  for (const key of expectedSet) if (!actualSet.has(key)) errors.push(`${label} is missing ${key}`);
  for (const key of actualSet) if (!expectedSet.has(key)) errors.push(`${label} has unknown ${key}`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

if (manifest?.schemaVersion !== 1 || manifest.defaultLocale !== "zh-CN" || !Array.isArray(manifest.locales)) {
  errors.push("Locale manifest must use schemaVersion 1 and defaultLocale zh-CN");
}
sameKeys("Locale manifest", expectedLocales.map(([id]) => id), (manifest?.locales ?? []).map((locale) => locale?.id));
for (const [id, nativeName, beta, path] of expectedLocales) {
  const locale = manifest?.locales?.find((item) => item?.id === id);
  if (!locale || locale.nativeName !== nativeName || locale.beta !== beta || locale.path !== path) {
    errors.push(`Locale manifest entry is invalid for ${id}`);
  }
}

const baseChapters = base.chapters ?? [];
const baseChapterIds = baseChapters.map((chapter) => chapter.id);
const baseLines = baseChapters.flatMap((chapter) => chapter.lines ?? []);
const baseLineIds = baseLines.map((line) => line.id);
const baseZones = new Map(baseLines.map((line) => [line.id, line.zones ?? []]));
const zhPath = resolve(scriptRoot, "locales", "zh-CN.json");
const zh = existsSync(zhPath) ? readJson(zhPath) : null;
const uiKeys = requiredUiKeys;
const trackKeys = Object.keys(zh?.trackLabels ?? {});
const sceneKeys = Object.keys(zh?.sceneMeta ?? {});
const chatKeys = Object.keys(zh?.liveChat ?? {});

sameKeys("zh-CN ui", requiredUiKeys, Object.keys(zh?.ui ?? {}));

for (const [localeId, , , relativePath] of expectedLocales) {
  const path = resolve(scriptRoot, "locales", relativePath);
  if (!existsSync(path)) {
    errors.push(`Missing locale file: ${relativePath}`);
    continue;
  }
  const pack = readJson(path);
  if (!pack) continue;
  const prefix = `[${localeId}]`;
  if (pack.schemaVersion !== 1 || pack.locale !== localeId) errors.push(`${prefix} has an invalid schema or locale ID`);
  if (!isNonEmptyString(pack.documentTitle) || !isNonEmptyString(pack.game?.title)
    || !isNonEmptyString(pack.game?.latinTitle) || !isNonEmptyString(pack.game?.tagline)) {
    errors.push(`${prefix} is missing title copy`);
  }
  sameKeys(`${prefix} ui`, uiKeys, Object.keys(pack.ui ?? {}));
  for (const key of uiKeys) {
    const source = zh?.ui?.[key];
    const value = pack.ui?.[key];
    if (Array.isArray(source)) {
      if (!Array.isArray(value) || !value.length || value.some((item) => !isNonEmptyString(item))) errors.push(`${prefix} ui.${key} must be a non-empty string array`);
    } else if (!isNonEmptyString(value)) {
      errors.push(`${prefix} ui.${key} must be a non-empty string`);
    }
  }
  sameKeys(`${prefix} trackLabels`, trackKeys, Object.keys(pack.trackLabels ?? {}));
  for (const key of trackKeys) if (!isNonEmptyString(pack.trackLabels?.[key])) errors.push(`${prefix} track label ${key} is invalid`);
  sameKeys(`${prefix} sceneMeta`, sceneKeys, Object.keys(pack.sceneMeta ?? {}));
  for (const id of sceneKeys) {
    for (const key of ["readout", "status", "caption"]) {
      if (!isNonEmptyString(pack.sceneMeta?.[id]?.[key])) errors.push(`${prefix} sceneMeta.${id}.${key} is invalid`);
    }
  }
  sameKeys(`${prefix} liveChat`, chatKeys, Object.keys(pack.liveChat ?? {}));
  for (const id of chatKeys) {
    const messages = pack.liveChat?.[id];
    if (!Array.isArray(messages) || messages.length < 3 || messages.some((message) => !isNonEmptyString(message))) errors.push(`${prefix} liveChat.${id} is invalid`);
  }
  sameKeys(`${prefix} chapters`, baseChapterIds, Object.keys(pack.game?.chapters ?? {}));
  sameKeys(`${prefix} lines`, baseLineIds, Object.keys(pack.game?.lines ?? {}));
  for (const endingId of expectedEndingIds) {
    if (!isNonEmptyString(pack.game?.endings?.[endingId]) || !isNonEmptyString(pack.game?.endingTitles?.[endingId])) {
      errors.push(`${prefix} is missing ending copy for ${endingId}`);
    }
  }
  if (!Array.isArray(pack.game?.revealCaptions) || pack.game.revealCaptions.length !== 5
    || pack.game.revealCaptions.some((caption) => !isNonEmptyString(caption))) {
    errors.push(`${prefix} revealCaptions must contain five strings`);
  }
  for (const chapter of baseChapters) {
    const localChapter = pack.game?.chapters?.[chapter.id];
    if (!isNonEmptyString(localChapter?.title)) errors.push(`${prefix} is missing title for ${chapter.id}`);
    for (const key of ["settlement", "settlementFail"]) {
      if (localChapter?.[key] !== undefined
        && (!Array.isArray(localChapter[key]) || !localChapter[key].length
          || localChapter[key].some((item) => !isNonEmptyString(item)))) {
        errors.push(`${prefix} ${chapter.id} ${key} must be a non-empty string array`);
      }
    }
  }
  for (const line of baseLines) {
    const localLine = pack.game?.lines?.[line.id];
    if (!isNonEmptyString(localLine?.raw) || !localLine.zones || typeof localLine.zones !== "object") {
      errors.push(`${prefix} is missing raw or zones for ${line.id}`);
      continue;
    }
    const expectedZoneIds = (baseZones.get(line.id) ?? []).map((zone) => zone.id);
    sameKeys(`${prefix} ${line.id} zones`, expectedZoneIds, Object.keys(localLine.zones));
    for (const baseZone of baseZones.get(line.id) ?? []) {
      const zone = localLine.zones[baseZone.id];
      if (!zone || !isNonEmptyString(zone.text) || !Number.isInteger(zone.start) || zone.start < 0) {
        errors.push(`${prefix} ${baseZone.id} has invalid text or start`);
        continue;
      }
      if (localLine.raw.slice(zone.start, zone.start + zone.text.length) !== zone.text) {
        errors.push(`${prefix} ${baseZone.id} does not match raw at start`);
      }
      for (const key of ["remain", "npc", "eat"]) {
        if (typeof zone[key] !== "string") errors.push(`${prefix} ${baseZone.id}.${key} must be a string`);
      }
      if (baseZone.remainMode === "mechanical") {
        const expectedRemain = localLine.raw.slice(0, zone.start) + localLine.raw.slice(zone.start + zone.text.length);
        if (zone.remain !== expectedRemain) errors.push(`${prefix} ${baseZone.id} mechanical remain is invalid`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  const zoneCount = baseLines.reduce((count, line) => count + (line.zones?.length ?? 0), 0);
  console.log(`Locale data OK: ${expectedLocales.length} locales, ${baseLines.length} lines, ${zoneCount} zones each`);
}
