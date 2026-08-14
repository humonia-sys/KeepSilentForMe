"use strict";

// Persistent audio settings and cross-faded background music.
function audioTrack(trackId) {
  const tracks = state.audio?.tracks;
  if (Array.isArray(tracks)) return tracks.find((track) => track?.id === trackId) ?? null;
  return tracks?.[trackId] ?? null;
}

function audioBinding(chapterId, endingId = null) {
  const bindings = state.audio?.bindings ?? state.audio ?? {};
  if (endingId) return bindings.endings?.[endingId] ?? null;
  return bindings.chapters?.[chapterId] ?? null;
}

function normalizeAudioBinding(binding) {
  if (typeof binding === "string") return { track: binding };
  return binding && typeof binding === "object" ? binding : null;
}

function clampAudioValue(value, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0, number));
}

function storageGet(key) {
  try {
    const storage = globalThis.localStorage;
    if (!storage) {
      state.persistenceAvailable = false;
      return null;
    }
    return storage.getItem(key);
  } catch (error) {
    state.persistenceAvailable = false;
    return null;
  }
}

function storageSet(key, value) {
  try {
    const storage = globalThis.localStorage;
    if (!storage) {
      state.persistenceAvailable = false;
      return false;
    }
    storage.setItem(key, value);
    return true;
  } catch (error) {
    state.persistenceAvailable = false;
    return false;
  }
}

function storageRemove(key) {
  try {
    const storage = globalThis.localStorage;
    if (!storage) {
      state.persistenceAvailable = false;
      return false;
    }
    storage.removeItem(key);
    return true;
  } catch (error) {
    state.persistenceAvailable = false;
    return false;
  }
}

function scheduleTransition(callback, delay) {
  const timer = window.setTimeout(() => {
    state.transitionTimers.delete(timer);
    callback();
  }, delay);
  state.transitionTimers.add(timer);
  return timer;
}

function cancelTransitionTimers() {
  state.transitionVersion += 1;
  for (const timer of state.transitionTimers) window.clearTimeout(timer);
  state.transitionTimers.clear();
}

function saveAudioSettings() {
  if (!storageSet(AUDIO_SETTINGS_KEY, JSON.stringify(state.audioSettings))) {
    console.warn("audio settings unavailable");
  }
}

function restoreAudioSettings() {
  state.audioSettings = { enabled: true, musicVolume: 1, sfxVolume: 1 };
  const raw = storageGet(AUDIO_SETTINGS_KEY);
  try {
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        state.audioSettings.enabled = saved.enabled !== false;
        state.audioSettings.musicVolume = clampAudioValue(saved.musicVolume);
        state.audioSettings.sfxVolume = clampAudioValue(saved.sfxVolume);
      }
    }
  } catch (error) {
    storageRemove(AUDIO_SETTINGS_KEY);
  }
  state.sound = state.audioSettings.enabled;
  updateAudioSettingsUI();
}

function audioTrackLabel(trackId) {
  return localeValue(`trackLabels.${trackId}`, t("ui.waitingTrack")) || trackId || t("ui.waitingTrack");
}

function setRangeProgress(input, value) {
  if (!input) return;
  input.style.setProperty("--range-progress", `${Math.round(value * 100)}%`);
}

function updateSoundButton() {
  if (!dom.soundButton) return;
  dom.soundButton.textContent = state.sound ? "◌" : "·";
  dom.soundButton.setAttribute("aria-label", state.sound ? t("ui.soundToggleOff") : t("ui.soundToggleOn"));
  dom.soundButton.setAttribute("title", state.sound ? t("ui.soundToggleOff") : t("ui.soundToggleOn"));
  dom.soundButton.setAttribute("aria-pressed", String(state.sound));
}

function updateAudioSettingsUI() {
  const settings = state.audioSettings;
  if (!settings || !dom.audioEnabled) return;
  const musicPercent = Math.round(settings.musicVolume * 100);
  const sfxPercent = Math.round(settings.sfxVolume * 100);
  dom.audioEnabled.checked = state.sound;
  dom.audioEnabledStatus.textContent = state.sound ? t("ui.audioOn") : t("ui.audioOff");
  dom.musicVolume.value = String(musicPercent);
  dom.musicVolume.setAttribute("aria-valuetext", `${musicPercent}%`);
  dom.musicVolumeValue.textContent = `${musicPercent}%`;
  dom.sfxVolume.value = String(sfxPercent);
  dom.sfxVolume.setAttribute("aria-valuetext", `${sfxPercent}%`);
  dom.sfxVolumeValue.textContent = `${sfxPercent}%`;
  setRangeProgress(dom.musicVolume, settings.musicVolume);
  setRangeProgress(dom.sfxVolume, settings.sfxVolume);
  const trackId = state.bgm.desiredTrackId || state.bgm.activeTrackId || state.audio?.title;
  dom.audioSettingsStatus.textContent = state.sound
    ? t("ui.currentTrack", { track: audioTrackLabel(trackId) })
    : t("ui.currentTrackMuted");
  updateSoundButton();
}

function setAudioEnabled(enabled, playFeedback = false) {
  state.sound = Boolean(enabled);
  state.audioSettings.enabled = state.sound;
  saveAudioSettings();
  updateAudioSettingsUI();
  if (state.sound) {
    startBgm();
    if (playFeedback) ping("snap");
  } else {
    state.bgm.started = false;
    stopBgmSlots();
  }
}

function setMusicVolume(value) {
  state.audioSettings.musicVolume = clampAudioValue(Number(value) / 100);
  state.bgm.desiredGain = Math.min(1, state.bgm.baseGain * state.audioSettings.musicVolume);
  if (state.bgm.activeTrackId && !state.bgm.pendingTrackId) {
    const active = bgmSlot(state.bgm.activeSlot);
    if (active.src) active.volume = state.bgm.desiredGain;
  }
  saveAudioSettings();
  updateAudioSettingsUI();
}

function setSfxVolume(value) {
  state.audioSettings.sfxVolume = clampAudioValue(Number(value) / 100);
  saveAudioSettings();
  updateAudioSettingsUI();
}

function openAudioSettings() {
  dom.audioSettings.classList.remove("is-hidden");
  dom.audioSettingsButton.setAttribute("aria-expanded", "true");
  updateAudioSettingsUI();
}

function closeAudioSettings() {
  dom.audioSettings.classList.add("is-hidden");
  dom.audioSettingsButton.setAttribute("aria-expanded", "false");
}

function toggleAudioSettings() {
  if (dom.audioSettings.classList.contains("is-hidden")) openAudioSettings();
  else closeAudioSettings();
}

function bgmSlot(index) {
  return index === 0 ? dom.bgmA : dom.bgmB;
}

function bgmGain(binding, track) {
  return Math.min(1, Math.max(0, Number(binding?.gain ?? track?.gain ?? track?.defaultGain ?? 0.1)));
}

function clearBgmFade() {
  if (state.bgm.fadeTimer) {
    window.clearInterval(state.bgm.fadeTimer);
    state.bgm.fadeTimer = null;
  }
}

function stopBgmSlots() {
  clearBgmFade();
  state.bgm.pendingTrackId = "";
  for (let index = 0; index < 2; index += 1) {
    const slot = bgmSlot(index);
    slot.pause();
    slot.volume = 0;
  }
}

function transitionBgm(trackId, gain) {
  const track = audioTrack(trackId);
  if (!track || typeof track.path !== "string") return;
  const current = bgmSlot(state.bgm.activeSlot);
  const nextIndex = state.bgm.activeSlot === 0 ? 1 : 0;
  const next = bgmSlot(nextIndex);
  const token = ++state.bgm.transitionToken;
  const currentVolume = current.src ? current.volume : 0;

  clearBgmFade();
  state.bgm.pendingTrackId = trackId;
  next.pause();
  next.src = `${AUDIO_ROOT}${track.path}`;
  next.loop = track.loop !== false;
  next.currentTime = 0;
  next.volume = 0;

  const playPromise = next.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      state.bgm.started = false;
      state.bgm.pendingTrackId = "";
    });
  }

  const startedAt = performance.now();
  state.bgm.fadeTimer = window.setInterval(() => {
    if (token !== state.bgm.transitionToken) {
      clearBgmFade();
      return;
    }
    const progress = Math.min(1, (performance.now() - startedAt) / BGM_FADE_MS);
    const eased = progress * progress * (3 - 2 * progress);
    current.volume = currentVolume * (1 - eased);
    const targetGain = state.bgm.desiredTrackId === trackId ? state.bgm.desiredGain : gain;
    next.volume = targetGain * eased;
    if (progress >= 1) {
      clearBgmFade();
      current.pause();
      current.volume = 0;
      state.bgm.activeSlot = nextIndex;
      state.bgm.activeTrackId = trackId;
      state.bgm.pendingTrackId = "";
    }
  }, 16);
}

function syncBgmForLocation(chapter = currentChapter(), endingId = null) {
  const rawBinding = endingId
    ? state.audio?.endings?.[endingId]
    : state.audio?.chapters?.[chapter?.id] ?? audioBinding(chapter?.id);
  const binding = normalizeAudioBinding(rawBinding);
  const trackId = binding?.track ?? state.audio?.title ?? "";
  const track = audioTrack(trackId);
  if (!track) return;

  state.bgm.desiredTrackId = trackId;
  state.bgm.baseGain = bgmGain(binding, track);
  state.bgm.desiredGain = Math.min(1, state.bgm.baseGain * state.audioSettings.musicVolume);
  updateAudioSettingsUI();
  if (!state.sound || !state.bgm.started) return;
  if (state.bgm.pendingTrackId === trackId) return;
  if (!state.bgm.pendingTrackId && state.bgm.activeTrackId === trackId && bgmSlot(state.bgm.activeSlot).src) {
    const activeSlot = bgmSlot(state.bgm.activeSlot);
    activeSlot.volume = state.bgm.desiredGain;
    const playPromise = activeSlot.play();
    if (playPromise?.catch) playPromise.catch(() => { state.bgm.started = false; });
    return;
  }
  transitionBgm(trackId, state.bgm.desiredGain);
}

function startBgm() {
  if (!state.sound || !state.audio) return;
  state.bgm.started = true;
  syncBgmForLocation(state.endingId ? null : currentChapter(), state.endingId);
}

function toggleSound() {
  setAudioEnabled(!state.sound, true);
}
