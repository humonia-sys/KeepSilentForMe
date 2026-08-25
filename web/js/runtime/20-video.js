"use strict";

// Story clips, reveal captions, and chapter transition videos.
function assetUrl(id) {
  const asset = state.assets.get(id);
  return asset ? `${PLAYABLE_ROOT}${asset.path}` : "";
}

function pageUrl(id) {
  const asset = state.pageAssets.get(id);
  return asset ? `${PAGE_ROOT}${asset.path}` : "";
}

function videoUrl(path) {
  if (typeof path !== "string" || !path || path.includes("..")) return "";
  return `${VIDEO_ROOT}${path}`;
}

function validateVideoManifest() {
  const sequences = state.video?.sequences;
  if (!sequences || typeof sequences !== "object" || Array.isArray(sequences)) {
    throw new Error("运行时视频清单缺少 sequences");
  }
  for (const [sequenceId, sequence] of Object.entries(sequences)) {
    if (!sequence || !Array.isArray(sequence.clips) || !sequence.clips.length) {
      throw new Error(`视频序列 ${sequenceId} 缺少 clips`);
    }
    for (const clip of sequence.clips) {
      if (!clip?.id || !videoUrl(clip.path)) throw new Error(`视频序列 ${sequenceId} 包含无效视频路径`);
      if (!state.pageAssets.has(clip.beforePage)) {
        throw new Error(`视频 ${clip.id} 引用了不存在的首帧场景页 ${clip.beforePage ?? ""}`);
      }
      if (!Number.isFinite(Number(clip.duration)) || Number(clip.duration) <= 0) {
        throw new Error(`视频 ${clip.id} 缺少有效时长`);
      }
    }
  }
  for (const endingId of ["A_separate", "B_alienate", "C_consume", "C_cold"]) {
    if (!sequences[endingId]?.clips?.length) throw new Error(`结局 ${endingId} 缺少视频序列`);
  }
  if (!sequences.reveal?.clips?.length) throw new Error("反转序列缺少视频");

  const chapterOutros = state.video?.chapterOutros;
  const requiredChapterOutros = [
    "L0_to_L1",
    "L1_pass_to_L2",
    "L1_fail_retry",
    "L2_to_L3",
    "L3_to_L4",
    "L4_perform_to_L5",
    "L4_refuse_to_L5",
  ];
  if (!chapterOutros || typeof chapterOutros !== "object" || Array.isArray(chapterOutros)) {
    throw new Error("运行时视频清单缺少 chapterOutros");
  }
  for (const sequenceId of requiredChapterOutros) {
    const sequence = chapterOutros[sequenceId];
    if (!sequence || sequence.kind !== "chapterOutro" || !Array.isArray(sequence.clips) || !sequence.clips.length) {
      throw new Error(`章节过场 ${sequenceId} 缺少有效 clips`);
    }
    for (const clip of sequence.clips) {
      if (!clip?.id || !videoUrl(clip.path)) throw new Error(`章节过场 ${sequenceId} 包含无效视频路径`);
      if (!state.pageAssets.has(clip.beforePage)) {
        throw new Error(`章节过场 ${clip.id} 引用了不存在的首帧场景页 ${clip.beforePage ?? ""}`);
      }
      if (!Number.isFinite(Number(clip.duration)) || Number(clip.duration) <= 0) {
        throw new Error(`章节过场 ${clip.id} 缺少有效时长`);
      }
    }
  }
}

function clearVideoCaptionTimers() {
  for (const timer of state.videoCaptionTimers) window.clearTimeout(timer);
  state.videoCaptionTimers.clear();
  dom.storyVideoCaption.textContent = "";
  dom.storyVideoCaption.classList.remove("is-visible");
}

function setVideoCaption(text) {
  dom.storyVideoCaption.textContent = text;
  dom.storyVideoCaption.classList.toggle("is-visible", Boolean(text));
}

function hideStoryVideo() {
  clearVideoCaptionTimers();
  dom.storyVideo.pause();
  dom.storyVideo.style.opacity = "0";
  dom.storyVideoLayer.classList.add("is-hidden");
  dom.storyVideoLayer.setAttribute("aria-hidden", "true");
  dom.storyVideoSkip.classList.add("is-hidden");
  dom.app.classList.remove("is-video-playing");
  state.videoPlaying = false;
  state.videoSkipRequested = false;
  syncLanguageControls();
}

function cancelStoryVideo() {
  state.videoSequenceToken += 1;
  state.videoSkipRequested = true;
  dom.storyVideo.dispatchEvent(new Event("storycancel"));
  hideStoryVideo();
}

function setRevealSeen() {
  state.revealSeen = true;
  storageSet(REVEAL_SEEN_KEY, "1");
}

function startRevealCaptions(token) {
  const whispers = state.eatLog
    .slice(-3)
    .map((entry) => textForZoneId(entry?.chapterId, entry?.zoneId))
    .filter(Boolean);
  const captions = localeValue("game.revealCaptions", []);
  const cues = [
    [0, captions[0] ?? ""],
    [2000, captions[1] ?? ""],
    [5000, captions[2] ?? ""],
    [7600, whispers.length ? t("ui.swallowed", { text: whispers.join(" · ") }) : (captions[3] ?? "")],
    [9200, captions[4] ?? ""],
  ];
  for (const [delay, text] of cues) {
    const timer = window.setTimeout(() => {
      state.videoCaptionTimers.delete(timer);
      if (token === state.videoSequenceToken) setVideoCaption(text);
    }, delay);
    state.videoCaptionTimers.add(timer);
  }
}

async function loadStoryClip(clip, token) {
  if (token !== state.videoSequenceToken) return false;
  const loaded = await setScenePage(clip.beforePage, false);
  if (!loaded || token !== state.videoSequenceToken) return false;
  const src = videoUrl(clip.path);
  if (!src) throw new Error(`视频 ${clip.id} 路径无效`);
  dom.storyVideo.style.opacity = "0";
  dom.storyVideo.pause();
  dom.storyVideo.src = src;
  dom.storyVideo.load();
  if (dom.storyVideo.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    await new Promise((resolve, reject) => {
      let timer = window.setTimeout(() => {
        cleanup();
        reject(new Error(`视频 ${clip.id} 加载超时`));
      }, 12000);
      const cleanup = () => {
        window.clearTimeout(timer);
        dom.storyVideo.removeEventListener("canplay", onReady);
        dom.storyVideo.removeEventListener("error", onError);
      };
      const onReady = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(new Error(`视频 ${clip.id} 解码失败`)); };
      dom.storyVideo.addEventListener("canplay", onReady, { once: true });
      dom.storyVideo.addEventListener("error", onError, { once: true });
    });
  }
  if (token !== state.videoSequenceToken) return false;
  dom.storyVideo.currentTime = 0;
  return true;
}

async function playLoadedStoryClip(clip, token) {
  if (token !== state.videoSequenceToken) return false;
  dom.storyVideoLayer.classList.remove("is-hidden");
  dom.storyVideoLayer.setAttribute("aria-hidden", "false");
  dom.app.classList.add("is-video-playing");
  dom.storyVideo.style.opacity = "1";
  let cancelFinished = () => {};
  const finished = new Promise((resolve, reject) => {
    const cleanup = () => {
      dom.storyVideo.removeEventListener("ended", onEnded);
      dom.storyVideo.removeEventListener("error", onError);
      dom.storyVideoSkip.removeEventListener("click", onSkip);
      dom.storyVideo.removeEventListener("storycancel", onCancel);
    };
    const onEnded = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`视频 ${clip.id} 播放失败`)); };
    const onSkip = () => {
      // A skip applies to the whole sequence, not only the currently loaded clip.
      state.videoSkipRequested = true;
      cleanup();
      dom.storyVideo.pause();
      resolve();
    };
    const onCancel = () => { cleanup(); dom.storyVideo.pause(); resolve(); };
    cancelFinished = () => { cleanup(); dom.storyVideo.pause(); resolve(); };
    dom.storyVideo.addEventListener("ended", onEnded, { once: true });
    dom.storyVideo.addEventListener("error", onError, { once: true });
    dom.storyVideoSkip.addEventListener("click", onSkip, { once: true });
    dom.storyVideo.addEventListener("storycancel", onCancel, { once: true });
    if (state.videoSkipRequested) {
      cleanup();
      resolve();
    }
  });
  try {
    await dom.storyVideo.play();
  } catch (error) {
    cancelFinished();
    throw new Error(`视频 ${clip.id} 无法自动播放: ${error.message}`);
  }
  await finished;
  return token === state.videoSequenceToken;
}

async function playStorySequence(sequenceId, { reveal = false } = {}) {
  const sequence = state.video?.sequences?.[sequenceId] ?? state.video?.chapterOutros?.[sequenceId];
  if (!sequence?.clips?.length) throw new Error(`视频序列不存在: ${sequenceId}`);
  const token = ++state.videoSequenceToken;
  state.videoPlaying = true;
  state.videoSkipRequested = false;
  syncLanguageControls();
  dom.storyVideo.muted = true;
  dom.storyVideo.defaultMuted = true;
  dom.storyVideoSkip.classList.toggle("is-hidden", !(reveal && state.revealSeen));
  try {
    for (let index = 0; index < sequence.clips.length; index += 1) {
      const clip = sequence.clips[index];
      const loaded = await loadStoryClip(clip, token);
      if (!loaded) return false;
      if (reveal && index === 0) startRevealCaptions(token);
      const played = await playLoadedStoryClip(clip, token);
      if (!played || state.videoSkipRequested) break;
    }
    if (reveal) setRevealSeen();
    return token === state.videoSequenceToken;
  } finally {
    if (token === state.videoSequenceToken) hideStoryVideo();
  }
}

function chapterOutroSequenceId(chapter) {
  switch (chapter?.id) {
    case "L0":
      return "L0_to_L1";
    case "L1":
      return chapterResult(chapter) === "pass" ? "L1_pass_to_L2" : "L1_fail_retry";
    case "L2":
      return "L2_to_L3";
    case "L3":
      return "L3_to_L4";
    case "L4":
      return chapterL4Route() === "perform" ? "L4_perform_to_L5" : "L4_refuse_to_L5";
    default:
      return "";
  }
}

async function playChapterOutro(sequenceId, onComplete = null) {
  try {
    const played = await playStorySequence(sequenceId);
    if (!played) return null;
    onComplete?.();
    return true;
  } catch (error) {
    console.error(error);
    showToast(t("ui.transitionVideoFailed"), TOAST_FAILURE_DURATION_MS);
    onComplete?.();
    return false;
  }
}

async function playChapterOutroThenAdvance(chapter) {
  const sequenceId = chapterOutroSequenceId(chapter);
  if (!sequenceId) {
    nextChapter();
    return;
  }
  hideOverlay();
  hideMemoryOverlay();
  state.locked = true;
  syncLanguageControls();
  const result = await playChapterOutro(sequenceId);
  if (result === null) return;
  if (currentChapter()?.id !== chapter?.id) return;
  nextChapter();
}
