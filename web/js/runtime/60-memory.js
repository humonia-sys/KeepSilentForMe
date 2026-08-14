"use strict";

function memoryFragmentById(id) {
  return state.memoryDraft?.fragments?.find((fragment) => fragment.id === id) ?? null;
}

function setMemoryOrder(nextOrder) {
  if (!state.memoryDraft) return;
  const validIds = new Set(state.memoryDraft.fragments.map((fragment) => fragment.id));
  const seen = new Set();
  state.memoryDraft.order = nextOrder.filter((id) => validIds.has(id) && !seen.has(id) && seen.add(id));
}

function moveMemoryFragment(id, beforeId = null) {
  if (!state.memoryDraft || !memoryFragmentById(id)) return;
  const order = state.memoryDraft.order.filter((item) => item !== id);
  const targetIndex = beforeId ? order.indexOf(beforeId) : -1;
  if (targetIndex >= 0) order.splice(targetIndex, 0, id);
  else order.push(id);
  setMemoryOrder(order);
  renderMemoryDraft();
  saveState();
}

function removeMemoryFragment(id) {
  if (!state.memoryDraft) return;
  setMemoryOrder(state.memoryDraft.order.filter((item) => item !== id));
  renderMemoryDraft();
  saveState();
}

function toggleMemoryFragment(id) {
  if (!state.memoryDraft) return;
  if (state.memoryDraft.order.includes(id)) removeMemoryFragment(id);
  else moveMemoryFragment(id);
}

function createMemoryFragment(fragment) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "memory-fragment";
  chip.dataset.memoryId = fragment.id;
  chip.textContent = fragment.text;
  chip.setAttribute("aria-label", fragment.text);
  chip.addEventListener("pointerdown", onMemoryPointerDown);
  chip.addEventListener("click", () => {
    if (state.suppressMemoryClick) {
      state.suppressMemoryClick = false;
      return;
    }
    toggleMemoryFragment(fragment.id);
  });
  return chip;
}

function renderMemoryDraft() {
  const draft = state.memoryDraft;
  if (!draft) return;
  setMemoryOrder(draft.order);
  const fragmentMap = new Map(draft.fragments.map((fragment) => [fragment.id, fragment]));
  const orderedIds = new Set(draft.order);
  const poolFragmentNodes = draft.fragments
    .filter((fragment) => !orderedIds.has(fragment.id))
    .map(createMemoryFragment);
  const laneFragmentNodes = draft.order
    .map((id) => fragmentMap.get(id))
    .filter(Boolean)
    .map(createMemoryFragment);
  dom.memoryPool.replaceChildren(...poolFragmentNodes);
  dom.memoryLane.replaceChildren(...laneFragmentNodes);
  dom.memoryConfirm.disabled = draft.order.length !== draft.fragments.length;
  dom.memoryConfirm.setAttribute("aria-disabled", String(dom.memoryConfirm.disabled));
}

function onMemoryPointerDown(event) {
  if (event.button !== undefined && event.button > 0) return;
  const chip = event.currentTarget;
  event.preventDefault();
  state.memoryDrag = {
    id: chip.dataset.memoryId,
    source: chip.parentElement?.id ?? "",
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    element: chip,
  };
  chip.classList.add("is-dragging");
  chip.setPointerCapture(event.pointerId);
}

function onMemoryPointerMove(event) {
  const drag = state.memoryDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  if (distance > 6) {
    drag.moved = true;
    event.preventDefault();
  }
}

function clearMemoryDrag(event) {
  const drag = state.memoryDrag;
  if (!drag) return null;
  drag.element?.classList.remove("is-dragging");
  if (event && drag.element?.hasPointerCapture?.(event.pointerId)) {
    drag.element.releasePointerCapture(event.pointerId);
  }
  state.memoryDrag = null;
  return drag;
}

function onMemoryPointerUp(event) {
  const drag = state.memoryDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  const targetFragment = targetElement?.closest?.(".memory-fragment");
  const targetLane = targetElement?.closest?.("#memory-lane");
  const targetPool = targetElement?.closest?.("#memory-pool");
  const targetId = targetFragment?.dataset.memoryId ?? null;
  if (drag.moved) {
    if (targetLane) moveMemoryFragment(drag.id, targetId);
    else if (drag.source === "memory-lane" && targetPool) removeMemoryFragment(drag.id);
    state.suppressMemoryClick = true;
    window.setTimeout(() => { state.suppressMemoryClick = false; }, 0);
  }
  clearMemoryDrag(event);
}

function onMemoryPointerCancel(event) {
  clearMemoryDrag(event);
}

function openMemoryOverlay(chapter) {
  if (!chapter || !MEMORY_CHAPTER_IDS.has(chapter.id)) {
    nextChapter();
    return;
  }
  const fragments = memoryFragmentsForChapter(chapter.id);
  if (!fragments.length) {
    state.memoryByChapter[chapter.id] = [];
    state.memoryDraft = null;
    saveState();
    void playChapterOutroThenAdvance(chapter);
    return;
  }
  if (!memoryDraftMatches(state.memoryDraft, chapter.id, fragments)) {
    state.memoryDraft = { chapterId: chapter.id, fragments, order: [] };
  }
  hideOverlay();
  state.locked = true;
  dom.memoryEyebrow.textContent = t("ui.memoryEyebrow", { chapterId: chapter.id });
  dom.memoryTitle.textContent = t("ui.memoryTitle");
  dom.memoryCopy.textContent = t("ui.memoryCopy");
  renderMemoryDraft();
  dom.memoryOverlay.classList.remove("is-hidden");
  syncLanguageControls();
  saveState();
}

function hideMemoryOverlay() {
  const drag = state.memoryDrag;
  if (drag?.pointerId !== undefined && drag.element?.hasPointerCapture?.(drag.pointerId)) {
    drag.element.releasePointerCapture(drag.pointerId);
  }
  dom.memoryOverlay.classList.add("is-hidden");
  state.memoryDrag = null;
  state.suppressMemoryClick = false;
  syncLanguageControls();
}

function confirmMemory() {
  const draft = state.memoryDraft;
  if (!draft || draft.order.length !== draft.fragments.length) return;
  state.memoryByChapter[draft.chapterId] = [...draft.order];
  state.memoryDraft = null;
  ping("snap");
  saveState();
  hideMemoryOverlay();
  void playChapterOutroThenAdvance(currentChapter());
}
