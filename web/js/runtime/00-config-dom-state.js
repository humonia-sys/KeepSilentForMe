"use strict";

// Shared constants, DOM references, and mutable runtime state.
const DATA_URL = "../script/chapters.json";
const LOCALE_MANIFEST_URL = "../script/locales/manifest.json";
const LOCALE_ROOT = "../script/locales/";
const PLAYABLE_MANIFEST_URL = "../art/v4/playable/manifest.json";
const PAGE_MANIFEST_URL = "../art/v4/scenes/manifest.json";
const AUDIO_MANIFEST_URL = "audio/manifest.json?v=audio-3";
const VIDEO_MANIFEST_URL = "video/manifest.json?v=video-2";
const PLAYABLE_ROOT = "../art/v4/playable/";
const PAGE_ROOT = "../art/v4/scenes/";
const AUDIO_ROOT = "audio/";
const VIDEO_ROOT = "video/";
const SAVE_KEY = "keep-silent-for-me-demo";
const LOCALE_KEY = "keep-silent-for-me-locale";
const AUDIO_SETTINGS_KEY = "keep-silent-for-me-audio-settings";
const REVEAL_SEEN_KEY = "keep-silent-for-me-reveal-seen";
const MEMORY_CHAPTER_IDS = new Set(["L1", "L2", "L3", "L4"]);
const LIVE_CHAPTER_IDS = new Set(["L2", "L4"]);
const BGM_FADE_MS = 650;
const PAGE_TURN_DURATION_MS = 720;
const TITLE_CLOSE_DELAY_MS = 540;
const LIVE_VIEWER_TICK_MS = 1800;
const FX_REMOVE_DELAY_MS = 950;
const FEEDBACK_HINT_DELAY_MS = 420;
const FEEDBACK_DIALOGUE_REFRESH_DELAY_MS = 620;
const FEEDBACK_RISK_DELAY_MS = 120;
const TOAST_DEFAULT_DURATION_MS = 2100;
const TOAST_REJECT_DURATION_MS = 1500;
const TOAST_SELECTION_DURATION_MS = 2500;
const TOAST_FAILURE_DURATION_MS = 2600;
const BAR_DEFAULT_WIDTH = "min(34vw, 400px)";
const BAR_MIN_WIDTH = 88;
const BAR_MAX_WIDTH = 520;
const BAR_REST_X_RATIO = 0.62;
const BAR_REST_Y_RATIO = 0.44;
const BAR_REST_BOTTOM_GUTTER = 330;
const ZONE_REACHABLE_MIN_DISTANCE = 150;
const ZONE_REACHABLE_WIDTH_RATIO = 0.86;
const SELECTION_SNAP_DELAY_MS = 260;
const SELECTION_FEEDBACK_DELAY_MS = 1060;
const LINE_RENDER_DELAY_MS = 360;
const DEBUG_KEYS = new Set(["chapter", "line", "ending"]);

const LIVE_VIEWERS = {
  L2_S01: 1204,
  L2_S02: 1238,
  L2_S03: 1311,
  L2_S04: 1486,
  L2_S05: 1402,
  L2_S06: 1198,
  L2_S07: 1067,
  L4_S01: 8842,
  L4_S02: 9137,
  L4_S03: 8871,
  L4_S04: 8240,
  L4_S05: 7788,
  L4_S06: 10320,
  L4_S07: 6140,
};

const dom = {
  app: document.querySelector("#app"),
  stage: document.querySelector("#stage"),
  scenePage: document.querySelector("#scene-page"),
  storyVideoLayer: document.querySelector("#story-video-layer"),
  storyVideo: document.querySelector("#story-video"),
  storyVideoCaption: document.querySelector("#story-video-caption"),
  storyVideoSkip: document.querySelector("#story-video-skip"),
  bgmA: document.querySelector("#bgm-a"),
  bgmB: document.querySelector("#bgm-b"),
  titleScreen: document.querySelector("#title-screen"),
  titleKicker: document.querySelector("#title-kicker"),
  titleGameName: document.querySelector("#title-game-name"),
  titleLatinName: document.querySelector("#title-latin-name"),
  titleTagline: document.querySelector("#title-tagline"),
  titlePrimary: document.querySelector("#title-primary"),
  titleNewGame: document.querySelector("#title-new-game"),
  titleLanguageLabel: document.querySelector("#title-language-label"),
  titleLanguageSelect: document.querySelector("#title-language-select"),
  titleStatus: document.querySelector("#title-status"),
  wordmarkName: document.querySelector("#wordmark-name"),
  languageMenuButton: document.querySelector("#language-menu-button"),
  languageMenu: document.querySelector("#language-menu"),
  chapterKicker: document.querySelector("#chapter-kicker"),
  chapterTitle: document.querySelector("#chapter-title"),
  statusCopy: document.querySelector("#status-copy"),
  statusFill: document.querySelector("#status-rule-fill"),
  sceneCaption: document.querySelector("#scene-caption"),
  liveChat: document.querySelector("#live-chat"),
  liveChatTrack: document.querySelector("#live-chat-track"),
  liveChatViewers: document.querySelector("#live-chat-viewers"),
  fxLayer: document.querySelector("#fx-layer"),
  dialogueFrame: document.querySelector("#dialogue-frame"),
  dialogueContent: document.querySelector(".dialogue-content"),
  memoryEcho: document.querySelector("#memory-echo"),
  dialogueText: document.querySelector("#dialogue-text"),
  dialogueZones: document.querySelector("#dialogue-zones"),
  speakerName: document.querySelector("#speaker-name"),
  lineId: document.querySelector("#line-id"),
  feedbackCopy: document.querySelector("#feedback-copy"),
  zoneCount: document.querySelector("#zone-count"),
  blackBar: document.querySelector("#black-bar"),
  zoneHalo: document.querySelector("#zone-halo"),
  toast: document.querySelector("#toast"),
  overlay: document.querySelector("#chapter-overlay"),
  overlayEyebrow: document.querySelector("#overlay-eyebrow"),
  overlayTitle: document.querySelector("#overlay-title"),
  overlayCopy: document.querySelector("#overlay-copy"),
  overlayAction: document.querySelector("#overlay-action"),
  memoryOverlay: document.querySelector("#memory-overlay"),
  memoryEyebrow: document.querySelector("#memory-eyebrow"),
  memoryTitle: document.querySelector("#memory-title"),
  memoryCopy: document.querySelector("#memory-copy"),
  memoryPool: document.querySelector("#memory-pool"),
  memoryLane: document.querySelector("#memory-lane"),
  memoryConfirm: document.querySelector("#memory-confirm"),
  errorPanel: document.querySelector("#error-panel"),
  errorTitle: document.querySelector("#error-title"),
  errorCopy: document.querySelector("#error-copy"),
  restartButton: document.querySelector("#restart-button"),
  soundButton: document.querySelector("#sound-button"),
  audioSettingsButton: document.querySelector("#audio-settings-button"),
  audioSettings: document.querySelector("#audio-settings"),
  audioSettingsClose: document.querySelector("#audio-settings-close"),
  audioEnabled: document.querySelector("#audio-enabled"),
  audioEnabledStatus: document.querySelector("#audio-enabled-status"),
  musicVolume: document.querySelector("#music-volume"),
  musicVolumeValue: document.querySelector("#music-volume-value"),
  sfxVolume: document.querySelector("#sfx-volume"),
  sfxVolumeValue: document.querySelector("#sfx-volume-value"),
  audioSettingsStatus: document.querySelector("#audio-settings-status"),
  audioSettingsEyebrow: document.querySelector("#audio-settings-eyebrow"),
  audioSettingsTitle: document.querySelector("#audio-settings-title"),
  audioControlLabel: document.querySelector("#audio-control-label"),
  musicVolumeLabel: document.querySelector("#music-volume-label"),
  sfxVolumeLabel: document.querySelector("#sfx-volume-label"),
  statusCaption: document.querySelector("#status-caption"),
  memoryFragmentsLabel: document.querySelector("#memory-fragments-label"),
  memoryWhisperLabel: document.querySelector("#memory-whisper-label"),
  retryButton: document.querySelector("#retry-button"),
};

const state = {
  data: null,
  baseData: null,
  localeManifest: null,
  locale: null,
  localeData: null,
  fallbackLocaleData: null,
  localeSwitching: false,
  playable: null,
  pages: null,
  audio: null,
  video: null,
  assets: new Map(),
  pageAssets: new Map(),
  chapters: [],
  chapterIndex: 0,
  lineIndex: 0,
  flags: {},
  eatLog: [],
  memoryByChapter: {},
  memoryDraft: null,
  memoryDrag: null,
  suppressMemoryClick: false,
  liveChatLineId: "",
  liveChatMessages: [],
  liveViewerCount: 0,
  liveViewerTimer: null,
  endingId: null,
  endingSeed: null,
  selectedZone: null,
  hoverZone: null,
  hoverTarget: null,
  dialogueLayout: null,
  dragging: false,
  locked: false,
  pointerId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  sound: true,
  audioSettings: {
    enabled: true,
    musicVolume: 1,
    sfxVolume: 1,
  },
  audioContext: null,
  bgm: {
    activeSlot: 0,
    activeTrackId: "",
    desiredTrackId: "",
    pendingTrackId: "",
    baseGain: 0,
    desiredGain: 0,
    fadeTimer: null,
    transitionToken: 0,
    started: false,
  },
  overlayAction: null,
  toastTimer: null,
  transitionTimers: new Set(),
  transitionVersion: 0,
  persistenceAvailable: true,
  pageToken: 0,
  pageLoads: new Map(),
  hasSave: false,
  titleReady: false,
  titleStarting: false,
  debugMode: false,
  videoSequenceToken: 0,
  videoCaptionTimers: new Set(),
  videoPlaying: false,
  videoSkipRequested: false,
  revealSeen: false,
  pendingMigrationNotice: false,
};

function pathValue(object, path) {
  return path.split(".").reduce((value, key) => (
    value && typeof value === "object" ? value[key] : undefined
  ), object);
}

function formatText(value, variables = {}) {
  if (typeof value !== "string") return "";
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
  ));
}
