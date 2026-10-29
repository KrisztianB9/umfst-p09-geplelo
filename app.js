(function () {
  "use strict";

  const { wpm, pontossag } = window.TypingStats;
  const texts = window.CLINICAL_TEXTS;
  const HISTORY_KEY = "lexitype-results-v1";
  const MAX_HISTORY = 10;

  const elements = {
    prompt: document.querySelector("#prompt-text"),
    stage: document.querySelector("#text-stage"),
    stageHint: document.querySelector("#text-stage-hint"),
    input: document.querySelector("#typing-input"),
    focusButton: document.querySelector("#focus-button"),
    focusMessage: document.querySelector("#focus-message"),
    skipButton: document.querySelector("#skip-button"),
    retryButton: document.querySelector("#retry-button"),
    roundState: document.querySelector("#round-state"),
    stateLabel: document.querySelector("#state-label"),
    wpm: document.querySelector("#wpm-value"),
    accuracy: document.querySelector("#accuracy-value"),
    time: document.querySelector("#time-value"),
    errors: document.querySelector("#errors-value"),
    resultPanel: document.querySelector("#result-panel"),
    resultTitle: document.querySelector("#result-title"),
    resultDescription: document.querySelector("#result-description"),
    chart: document.querySelector("#history-chart"),
    emptyChart: document.querySelector("#empty-chart"),
    attemptCount: document.querySelector("#attempt-count")
  };

  let target = "";
  let targetChars = [];
  let typedChars = [];
  let spans = [];
  let startedAt = null;
  let timerId = null;
  let attempts = 0;
  let errors = 0;
  let composing = false;
  let finished = false;
  let cursorIndex = 0;
  let lastTextIndex = -1;
  let history = readHistory();

  function readHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter((item) => item && Number.isFinite(item.wpm) && Number.isFinite(item.accuracy)).slice(-MAX_HISTORY);
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    } catch {
      elements.focusMessage.lastElementChild.textContent = "A böngésző nem engedélyezte a helyi mentést.";
    }
  }

  function pickText() {
    if (texts.length < 2) return texts[0] || "glomerulonephritis";
    let index = Math.floor(Math.random() * texts.length);
    if (index === lastTextIndex) index = (index + 1) % texts.length;
    lastTextIndex = index;
    return texts[index];
  }

  function beginRound(chooseNewText = true) {
    if (timerId !== null) window.clearInterval(timerId);
    if (chooseNewText || !target) target = pickText();
    targetChars = Array.from(target.normalize("NFC"));
    typedChars = [];
    spans = [];
    startedAt = null;
    attempts = 0;
    errors = 0;
    finished = false;
    composing = false;
    cursorIndex = 0;
    elements.input.value = "";
    elements.resultPanel.hidden = true;
    elements.stage.disabled = false;
    elements.stage.classList.remove("is-focused");
    elements.stageHint.textContent = "KATTINTS IDE, VAGY KEZDJ EL GÉPELNI";
    elements.focusMessage.lastElementChild.textContent = "Kattints a szövegre vagy kezdj el gépelni.";
    elements.roundState.classList.remove("is-running", "is-complete");
    elements.stateLabel.textContent = "KÉSZEN ÁLL";
    elements.wpm.textContent = "0";
    elements.accuracy.textContent = "100";
    elements.time.textContent = "00:00";
    elements.errors.textContent = "0";
    renderPrompt();
    drawHistory();
  }

  function renderPrompt() {
    const fragment = document.createDocumentFragment();
    spans = targetChars.map((character, index) => {
      const span = document.createElement("span");
      span.className = index === 0 ? "char current" : "char";
      span.textContent = character;
      fragment.append(span);
      return span;
    });
    elements.prompt.replaceChildren(fragment);
  }

  function startClock() {
    if (startedAt !== null || finished) return;
    startedAt = performance.now();
    elements.roundState.classList.add("is-running");
    elements.stateLabel.textContent = "FOLYAMATBAN";
    elements.stageHint.textContent = "GÉPELJ TOVÁBB A BEFEJEZÉSHEZ";
    timerId = window.setInterval(updateMetrics, 100);
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function getCorrectCount(chars = typedChars) {
    let correct = 0;
    for (let index = 0; index < chars.length; index += 1) {
      if (chars[index] === targetChars[index]) correct += 1;
    }
    return correct;
  }

  function updateMetrics() {
    if (startedAt === null) return;
    const elapsed = performance.now() - startedAt;
    const correct = getCorrectCount();
    elements.wpm.textContent = String(Math.round(wpm(correct, elapsed)));
    elements.accuracy.textContent = String(pontossag(correct, attempts));
    elements.time.textContent = formatTime(elapsed);
    elements.errors.textContent = String(errors);
  }

  function setCharacterState(index) {
    const span = spans[index];
    if (!span) return;
    span.classList.remove("correct", "incorrect", "current");
    if (index < typedChars.length) {
      span.classList.add(typedChars[index] === targetChars[index] ? "correct" : "incorrect");
    } else if (index === typedChars.length && !finished) {
      span.classList.add("current");
    }
  }

  function updateTypedText(rawValue) {
    if (finished) return;
    const nextChars = Array.from(rawValue.normalize("NFC")).slice(0, targetChars.length);
    const current = typedChars;
    const previousCursor = cursorIndex;
    if (previousCursor !== null) spans[previousCursor]?.classList.remove("current");
    let prefix = 0;
    while (prefix < current.length && prefix < nextChars.length && current[prefix] === nextChars[prefix]) prefix += 1;

    let oldSuffix = current.length - 1;
    let newSuffix = nextChars.length - 1;
    while (oldSuffix >= prefix && newSuffix >= prefix && current[oldSuffix] === nextChars[newSuffix]) {
      oldSuffix -= 1;
      newSuffix -= 1;
    }

    const inserted = nextChars.slice(prefix, newSuffix + 1);
    if (inserted.length > 0) {
      attempts += inserted.length;
      for (let offset = 0; offset < inserted.length; offset += 1) {
        if (inserted[offset] !== targetChars[prefix + offset]) errors += 1;
      }
    }
    typedChars = nextChars;
    elements.input.value = nextChars.join("");

    // only revisit the changed range, the spans were created once at round start
    const end = Math.max(current.length, nextChars.length, oldSuffix + 1, newSuffix + 1);
    for (let index = prefix; index < end; index += 1) setCharacterState(index);
    setCharacterState(prefix - 1);
    setCharacterState(previousCursor);
    cursorIndex = nextChars.length < targetChars.length ? nextChars.length : null;
    if (cursorIndex !== null) setCharacterState(cursorIndex);
    if (startedAt !== null) updateMetrics();

    if (typedChars.length === targetChars.length) finishRound();
  }

  function finishRound() {
    if (finished) return;
    finished = true;
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
    const elapsed = startedAt === null ? 0 : performance.now() - startedAt;
    const correct = getCorrectCount();
    const finalWpm = Math.round(wpm(correct, elapsed));
    const finalAccuracy = pontossag(correct, attempts);
    elements.wpm.textContent = String(finalWpm);
    elements.accuracy.textContent = String(finalAccuracy);
    elements.time.textContent = formatTime(elapsed);
    elements.errors.textContent = String(errors);
    elements.roundState.classList.remove("is-running");
    elements.roundState.classList.add("is-complete");
    elements.stateLabel.textContent = "KÖR TELJESÍTVE";
    elements.stageHint.textContent = "A KÖR VÉGET ÉRT";
    elements.stage.disabled = true;
    setCharacterState(targetChars.length - 1);
    history.push({ wpm: finalWpm, accuracy: finalAccuracy, date: new Date().toISOString() });
    history = history.slice(-MAX_HISTORY);
    saveHistory();
    elements.resultTitle.textContent = finalAccuracy >= 95 ? "Pontos munka." : "Kör teljesítve.";
    elements.resultDescription.textContent = `${finalWpm} WPM · ${finalAccuracy}% pontosság · ${errors} hiba`;
    elements.resultPanel.hidden = false;
    drawHistory();
  }

  function focusTyping() {
    if (finished) return;
    elements.input.focus({ preventScroll: true });
    elements.stage.classList.add("is-focused");
    elements.focusMessage.lastElementChild.textContent = "A gépelésre fókuszálva. Beillesztés nem számít.";
  }

  function resizeCanvas() {
    const rect = elements.chart.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (elements.chart.width !== width || elements.chart.height !== height) {
      elements.chart.width = width;
      elements.chart.height = height;
    }
    const context = elements.chart.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context, width: rect.width, height: rect.height };
  }

  function drawHistory() {
    const { context, width, height } = resizeCanvas();
    const padding = { left: 37, right: 12, top: 14, bottom: 25 };
    const plotWidth = Math.max(0, width - padding.left - padding.right);
    const plotHeight = Math.max(0, height - padding.top - padding.bottom);
    const values = history.slice(-MAX_HISTORY);
    elements.attemptCount.textContent = `${values.length} / 10 próba`;
    elements.emptyChart.hidden = values.length > 0;
    context.clearRect(0, 0, width, height);

    const maxValue = Math.max(40, ...values.map((entry) => entry.wpm));
    const step = maxValue <= 80 ? 20 : maxValue <= 160 ? 40 : 50;
    const ceiling = Math.ceil(maxValue / step) * step;
    context.font = '9px "DM Mono", monospace';
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let value = 0; value <= ceiling; value += step) {
      const y = padding.top + plotHeight - value / ceiling * plotHeight;
      context.beginPath();
      context.strokeStyle = "#edf2f0";
      context.lineWidth = 1;
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
      context.fillStyle = "#a1adaf";
      context.fillText(String(value), padding.left - 9, y);
    }

    if (values.length === 0) return;
    const xAt = (index) => padding.left + (values.length === 1 ? plotWidth / 2 : index / (values.length - 1) * plotWidth);
    const yAt = (value) => padding.top + plotHeight - value / ceiling * plotHeight;
    const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
    gradient.addColorStop(0, "rgba(20, 134, 111, .18)");
    gradient.addColorStop(1, "rgba(20, 134, 111, 0)");
    context.beginPath();
    values.forEach((entry, index) => {
      const x = xAt(index);
      const y = yAt(entry.wpm);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    if (values.length > 1) {
      context.lineTo(xAt(values.length - 1), padding.top + plotHeight);
      context.lineTo(xAt(0), padding.top + plotHeight);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
    }
    context.beginPath();
    values.forEach((entry, index) => {
      const x = xAt(index);
      const y = yAt(entry.wpm);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = "#178970";
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
    values.forEach((entry, index) => {
      const x = xAt(index);
      const y = yAt(entry.wpm);
      context.beginPath();
      context.fillStyle = "#fff";
      context.arc(x, y, 4.2, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#16866f";
      context.arc(x, y, 2.5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#95a3a5";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(String(index + 1), x, height - 15);
    });
  }

  elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "Tab") event.preventDefault();
    if (event.key === "Backspace" || event.key === "Delete" || Array.from(event.key).length === 1) startClock();
  });
  elements.input.addEventListener("beforeinput", (event) => {
    if (event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop" || event.inputType === "insertLineBreak" || event.inputType === "insertParagraph") {
      event.preventDefault();
      return;
    }
    if (event.inputType === "insertText" || event.inputType === "insertCompositionText") startClock();
  });
  elements.input.addEventListener("paste", (event) => event.preventDefault());
  elements.input.addEventListener("drop", (event) => event.preventDefault());
  elements.input.addEventListener("compositionstart", () => { composing = true; });
  elements.input.addEventListener("compositionend", () => {
    composing = false;
    startClock();
    updateTypedText(elements.input.value);
  });
  elements.input.addEventListener("input", (event) => {
    if (composing || event.isComposing) return;
    if (startedAt === null && elements.input.value.length > 0) startClock();
    updateTypedText(elements.input.value);
  });
  elements.input.addEventListener("blur", () => {
    elements.stage.classList.remove("is-focused");
    if (!finished) elements.focusMessage.lastElementChild.textContent = "Fókusz elveszett? Kattints a szövegre a folytatáshoz.";
  });
  elements.stage.addEventListener("click", focusTyping);
  elements.focusButton.addEventListener("click", focusTyping);
  elements.skipButton.addEventListener("click", () => beginRound(true));
  elements.retryButton.addEventListener("click", () => {
    beginRound(true);
    focusTyping();
  });
  window.addEventListener("resize", drawHistory);
  window.addEventListener("storage", (event) => {
    if (event.key === HISTORY_KEY) {
      history = readHistory();
      drawHistory();
    }
  });

  beginRound(true);
})();
