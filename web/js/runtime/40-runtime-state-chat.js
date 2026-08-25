"use strict";

// Current location, save normalization helpers, scene pages, and live chat.
function currentChapter() {
  return state.chapters[state.chapterIndex];
}

function currentLine() {
  return currentChapter()?.lines?.[state.lineIndex] ?? null;
}

function chapterDefaultPage(chapter) {
  return state.pages?.pageBindings?.[chapter?.id]?.default ?? null;
}

function isKnownZoneId(chapterId, lineId, zoneId) {
  const chapter = state.chapters.find((item) => item.id === chapterId);
  const line = chapter?.lines?.find((item) => item.id === lineId);
  return Boolean(line?.zones?.some((zone) => zone.id === zoneId));
}

function normalizeSelections(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw
    .filter((entry) => entry && typeof entry === "object"
      && typeof entry.chapterId === "string"
      && typeof entry.lineId === "string"
      && typeof entry.zoneId === "string"
      && isKnownZoneId(entry.chapterId, entry.lineId, entry.zoneId))
    .filter((entry) => !seen.has(entry.zoneId) && seen.add(entry.zoneId))
    .map((entry) => ({
      chapterId: entry.chapterId,
      lineId: entry.lineId,
      zoneId: entry.zoneId,
      source: entry.source === "parasite" ? "parasite" : "player",
    }));
}

function normalizeMemoryByChapter(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw)
    .filter(([chapterId, fragments]) => state.chapters.some((chapter) => chapter.id === chapterId) && Array.isArray(fragments))
    .map(([chapterId, fragments]) => [
      chapterId,
      [...new Set(fragments.filter((zoneId) => typeof zoneId === "string" && textForZoneId(chapterId, zoneId)))],
    ]));
}

function normalizeMemoryDraft(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.chapterId !== "string" || !Array.isArray(raw.fragmentIds)) return null;
  const fragmentIds = [...new Set(raw.fragmentIds.filter((zoneId) => typeof zoneId === "string" && textForZoneId(raw.chapterId, zoneId)))];
  if (!fragmentIds.length) return null;
  const ids = new Set(fragmentIds);
  const order = Array.isArray(raw.order) ? raw.order.filter((id) => typeof id === "string" && ids.has(id)) : [];
  return {
    chapterId: raw.chapterId,
    fragments: fragmentIds.map((id) => ({ id, text: textForZoneId(raw.chapterId, id) })),
    order: [...new Set(order)],
  };
}

function memoryFragmentsForChapter(chapterId) {
  return state.eatLog
    .filter((entry) => entry.chapterId === chapterId)
    .map((entry) => ({ id: entry.zoneId, text: textForZoneId(chapterId, entry.zoneId) }))
    .filter((fragment) => fragment.text);
}

function memoryDraftMatches(draft, chapterId, fragments) {
  if (!draft || draft.chapterId !== chapterId || !Array.isArray(draft.fragments)) return false;
  return draft.fragments.length === fragments.length
    && draft.fragments.every((fragment, index) => fragment?.id === fragments[index].id);
}

function renderMemoryEcho(chapter, line) {
  const previousChapter = state.chapters[state.chapterIndex - 1];
  const fragments = previousChapter ? state.memoryByChapter[previousChapter.id] : null;
  const isFirstLine = line?.id === chapter?.lines?.[0]?.id;
  if (!isFirstLine || !fragments?.length) {
    dom.memoryEcho.textContent = "";
    dom.memoryEcho.classList.add("is-hidden");
    return;
  }
  dom.memoryEcho.textContent = fragments.map((zoneId) => textForZoneId(previousChapter.id, zoneId)).filter(Boolean).join(" · ");
  dom.memoryEcho.classList.remove("is-hidden");
}

function updateLiveChatTrack(restart = true) {
  const fragment = document.createDocumentFragment();
  const scrollingMessages = [...state.liveChatMessages, ...state.liveChatMessages];
  for (const message of scrollingMessages) {
    const item = document.createElement("div");
    item.className = "live-chat-item";
    item.textContent = message;
    fragment.append(item);
  }
  dom.liveChatTrack.replaceChildren(fragment);
  if (!restart) return;
  dom.liveChatTrack.classList.remove("is-scrolling");
  void dom.liveChatTrack.offsetWidth;
  dom.liveChatTrack.classList.add("is-scrolling");
}

function startLiveViewerCounter(lineId) {
  window.clearInterval(state.liveViewerTimer);
  state.liveViewerCount = LIVE_VIEWERS[lineId] ?? 1204;
  dom.liveChatViewers.textContent = t("ui.viewerCount", { count: new Intl.NumberFormat(state.locale?.id ?? "zh-CN").format(state.liveViewerCount) });
  const changes = [7, 4, -3, 11, -5, 6, -2, 9, -7, 3];
  let tick = 0;
  state.liveViewerTimer = window.setInterval(() => {
    if (!LIVE_CHAPTER_IDS.has(currentChapter()?.id) || dom.liveChat.classList.contains("is-hidden")) {
      window.clearInterval(state.liveViewerTimer);
      state.liveViewerTimer = null;
      return;
    }
    state.liveViewerCount = Math.max(0, state.liveViewerCount + changes[tick % changes.length]);
    dom.liveChatViewers.textContent = t("ui.viewerCount", { count: new Intl.NumberFormat(state.locale?.id ?? "zh-CN").format(state.liveViewerCount) });
    tick += 1;
  }, LIVE_VIEWER_TICK_MS);
}

function renderLiveChat(chapter, line) {
  if (!LIVE_CHAPTER_IDS.has(chapter?.id) || !line) {
    hideLiveChat();
    return;
  }
  const localizedMessages = localeValue(`liveChat.${line.id}`, null);
  const fallbackMessages = localeValue("ui.fallbackChat", []);
  const messages = Array.isArray(localizedMessages)
    ? localizedMessages
    : (Array.isArray(fallbackMessages) ? fallbackMessages : []);
  state.liveChatLineId = line.id;
  state.liveChatMessages = [...messages];
  startLiveViewerCounter(line.id);
  dom.liveChat.classList.remove("is-hidden");
  updateLiveChatTrack();
}

function appendLiveChat(message) {
  if (!LIVE_CHAPTER_IDS.has(currentChapter()?.id) || !message) return;
  state.liveChatMessages = [...state.liveChatMessages.slice(-7), message];
  updateLiveChatTrack();
}

function hideLiveChat() {
  window.clearInterval(state.liveViewerTimer);
  dom.liveChat.classList.add("is-hidden");
  dom.liveChatTrack.replaceChildren();
  dom.liveChatTrack.classList.remove("is-scrolling");
  state.liveChatLineId = "";
  state.liveChatMessages = [];
  state.liveViewerCount = 0;
  state.liveViewerTimer = null;
}

function showToast(text, duration = TOAST_DEFAULT_DURATION_MS) {
  clearTimeout(state.toastTimer);
  dom.toast.textContent = text;
  dom.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => dom.toast.classList.remove("is-visible"), duration);
}

function pageForLine(chapter, line) {
  const binding = state.pages?.pageBindings?.[chapter?.id];
  return binding?.lines?.[line?.id] ?? binding?.default ?? null;
}

function loadPageImage(pageId, src) {
  const existing = state.pageLoads.get(pageId);
  if (existing) return existing;
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`场景页加载失败: ${pageId}`));
    image.src = src;
  }).catch((error) => {
    state.pageLoads.delete(pageId);
    throw error;
  });
  state.pageLoads.set(pageId, promise);
  return promise;
}

async function setScenePage(pageId, animate = true) {
  const src = pageUrl(pageId);
  if (!src) throw new Error(`场景页资产不存在: ${pageId}`);
  if (dom.scenePage.dataset.asset === pageId && dom.scenePage.classList.contains("is-visible")) return true;

  const token = ++state.pageToken;
  const previousPageId = dom.scenePage.dataset.asset || "";
  const previousSrc = dom.scenePage.getAttribute("src") || "";

  try {
    await loadPageImage(pageId, src);
    if (token !== state.pageToken) return false;
    dom.scenePage.src = src;
    dom.scenePage.dataset.asset = pageId;
    dom.stage.dataset.page = pageId;
    dom.scenePage.classList.remove("is-turning");
    dom.scenePage.classList.add("is-visible");
    void dom.scenePage.offsetWidth;
    if (animate) {
      dom.scenePage.classList.add("is-turning");
      window.setTimeout(() => {
        if (token === state.pageToken) dom.scenePage.classList.remove("is-turning");
      }, PAGE_TURN_DURATION_MS);
    }
    return true;
  } catch (error) {
    if (token !== state.pageToken) return false;
    console.error(error);
    // Never commit a failed page ID. Keeping the last committed source avoids
    // a transparent scene during a transient network or decode failure.
    dom.scenePage.dataset.asset = previousPageId;
    dom.stage.dataset.page = previousPageId;
    if (previousSrc) {
      dom.scenePage.src = previousSrc;
      dom.scenePage.classList.add("is-visible");
      showToast(t("ui.sceneLoadRetained", { pageId }), TOAST_FAILURE_DURATION_MS);
      return false;
    }
    dom.scenePage.classList.remove("is-visible", "is-turning");
    throw error;
  }
}
