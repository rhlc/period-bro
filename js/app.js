// ── Phase Data ──
const PHASES = {
  menstruation: {
    name: "Storm Mode",
    emojis: "🔥🍫🛋️☕",
    mainEmoji: "🌊",
    color: "#D32F2F",
    moodLine: "She's a warrior right now. Act accordingly.",
    coachTip: "Lead with comfort. Reduce plans, increase care, and avoid fixing mode.",
    scienceNote: "Cramps and lower energy are common in this phase, so low-pressure support helps.",
    energy: { level: 25, text: "LOW" },
    mood: { level: 40, text: "VARIABLE" },
    patience: { level: 20, text: "THIN" },
    tips: [
      "🔥 Heating pad + her favorite snack = you winning at life",
      "🍫 Chocolate is not a cliché, it's a cheat code. Use it.",
      "🛋️ Cancel plans if she wants to. No guilt trips. Ever.",
      "☕ Bring her a warm drink without being asked. Trust the process."
    ]
  },
  follicular: {
    name: "Glow Up Mode",
    emojis: "🌱☀️✨💪",
    mainEmoji: "✨",
    color: "#388E3C",
    moodLine: "She's charging up. Match her energy or get out the way.",
    coachTip: "Suggest fun plans and shared goals. This is often a good phase for momentum.",
    scienceNote: "Rising estrogen can align with better mood and social energy for many people.",
    energy: { level: 65, text: "RISING" },
    mood: { level: 75, text: "GOOD" },
    patience: { level: 60, text: "NORMAL" },
    tips: [
      "🌱 Great time to plan a date — she's feeling adventurous",
      "☀️ She might want to try new things. Be down for it.",
      "✨ Compliment the glow. She earned it.",
      "💪 Hit the gym together? She's got energy to burn."
    ]
  },
  ovulation: {
    name: "Main Character Mode",
    emojis: "🔥✨👑🎉",
    mainEmoji: "👑",
    color: "#F57C00",
    moodLine: "She's THE moment. You're the supporting cast. Embrace it.",
    coachTip: "Bring intentional energy. Plan quality time and show direct appreciation.",
    scienceNote: "Around ovulation, some people report higher energy, confidence, and sociability.",
    energy: { level: 95, text: "PEAK" },
    mood: { level: 90, text: "GREAT" },
    patience: { level: 85, text: "HIGH" },
    tips: [
      "🔥 She looks amazing and she knows it. Tell her anyway.",
      "✨ Plan something special — she's vibing and social right now",
      "👑 Let her take the lead. She's got the vision.",
      "🎉 This is peak hang time. Make the most of it, bro."
    ]
  },
  luteal: {
    name: "Handle With Care Mode",
    emojis: "☁️🧸🍪🥀",
    mainEmoji: "🧸",
    color: "#7B1FA2",
    moodLine: "Tread lightly, king. The vibes are... shifting.",
    coachTip: "Be proactive with practical help: food, chores, and gentle communication.",
    scienceNote: "In late luteal days, PMS symptoms can rise. Clarity and patience go a long way.",
    energy: { level: 35, text: "DROPPING" },
    mood: { level: 30, text: "UNPREDICTABLE" },
    patience: { level: 25, text: "LOW" },
    tips: [
      "☁️ If she seems off, don't ask \"what's wrong\" 47 times. Just be there.",
      "🧸 Comfort food run. No commentary on the order. None.",
      "🍪 If she wants ice cream at 10pm, you drive. No questions.",
      "🥀 PMS is real and it's rough. Extra kindness costs you nothing."
    ]
  }
};

const PHASE_ORDER = ["menstruation", "follicular", "ovulation", "luteal"];

// Default boundaries for 28-day cycle
const BASE_BOUNDARIES = [
  { phase: "menstruation", start: 1, end: 5 },
  { phase: "follicular", start: 6, end: 13 },
  { phase: "ovulation", start: 14, end: 16 },
  { phase: "luteal", start: 17, end: 28 }
];

const STORAGE_KEYS = {
  lastPeriod: "pb_lastPeriod",
  cycleLength: "pb_cycleLength",
  periodStarts: "pb_periodStarts"
};

const TRACKING_WINDOW = 6;
const SHORT_CYCLE_WARNING_DAYS = 15;
const MIN_CYCLE_FOR_ADAPTIVE = 15;
const MAX_CYCLE_FOR_ADAPTIVE = 60;

// ── Date Helpers (dd/mm/yyyy ↔ yyyy-mm-dd) ──
function toDisplay(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function toISO(displayDate) {
  const [d, m, y] = displayDate.split("/");
  return `${y}-${m}-${d}`;
}

function formatFriendlyDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isoToDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(startIso, endIso) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = isoToDate(startIso);
  const end = isoToDate(endIso);
  return Math.round((end - start) / msPerDay);
}

function isValidISODate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function isValidDisplayDate(str) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return false;
  const [d, m, y] = str.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d && date <= getTodayStart();
}

function setupDateInput(input) {
  input.addEventListener("input", () => {
    let val = input.value.replace(/[^\d]/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 5) {
      val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4);
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    input.value = val;
  });
}

function pluralizeDays(n) {
  return n === 1 ? "1 day" : `${n} days`;
}

function getPhaseLabel(phaseKey) {
  return PHASES[phaseKey].name;
}

function normalizePeriodStarts(periodStarts) {
  const today = getTodayStart();
  const cleaned = periodStarts.filter((isoDate) => {
    if (!isValidISODate(isoDate)) return false;
    return isoToDate(isoDate) <= today;
  });
  const uniqueSorted = Array.from(new Set(cleaned)).sort();
  return uniqueSorted;
}

function getCycleLengths(periodStarts) {
  const lengths = [];
  for (let i = 1; i < periodStarts.length; i++) {
    const diff = daysBetween(periodStarts[i - 1], periodStarts[i]);
    if (diff > 0) lengths.push(diff);
  }
  return lengths;
}

function findPreviousStart(periodStarts, newDateIso) {
  let previous = null;
  for (let i = 0; i < periodStarts.length; i++) {
    const date = periodStarts[i];
    if (date < newDateIso) {
      previous = date;
    } else {
      break;
    }
  }
  return previous;
}

function hasShortGapWarning(previousIso, newIso) {
  if (!previousIso) return false;
  return daysBetween(previousIso, newIso) < SHORT_CYCLE_WARNING_DAYS;
}

function flashButtonText(button, text, ms = 1800) {
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, ms);
}

// ── DOM Elements ──
const $ = (sel) => document.querySelector(sel);

const inputScreen = $("#input-screen");
const dashboardScreen = $("#dashboard-screen");
const settingsModal = $("#settings-modal");

// ── Cycle Calculation ──
function getScaledBoundaries(cycleLength) {
  const scale = cycleLength / 28;
  const boundaries = [];
  let prev = 0;
  for (let i = 0; i < BASE_BOUNDARIES.length; i++) {
    const base = BASE_BOUNDARIES[i];
    const start = prev + 1;
    const end = i === BASE_BOUNDARIES.length - 1
      ? cycleLength
      : Math.round(base.end * scale);
    boundaries.push({ phase: base.phase, start, end });
    prev = end;
  }
  return boundaries;
}

function getAdaptiveCycleMetrics(periodStarts, fallbackCycleLength, windowSize = TRACKING_WINDOW) {
  const derived = getCycleLengths(periodStarts).filter((len) => {
    return len >= MIN_CYCLE_FOR_ADAPTIVE && len <= MAX_CYCLE_FOR_ADAPTIVE;
  });
  const cycleLengthsUsed = derived.slice(-windowSize);

  if (cycleLengthsUsed.length === 0) {
    return {
      effectiveCycleLength: fallbackCycleLength,
      averageCycleLength: fallbackCycleLength,
      consistencyRange: null,
      cycleLengthsUsed,
      adaptiveUsed: false
    };
  }

  const total = cycleLengthsUsed.reduce((sum, n) => sum + n, 0);
  const averageCycleLength = Math.round(total / cycleLengthsUsed.length);
  const max = Math.max(...cycleLengthsUsed);
  const min = Math.min(...cycleLengthsUsed);

  return {
    effectiveCycleLength: averageCycleLength,
    averageCycleLength,
    consistencyRange: max - min,
    cycleLengthsUsed,
    adaptiveUsed: true
  };
}

function getCycleInfo(lastPeriod, cycleLength) {
  const today = getTodayStart();
  const diffDays = daysBetween(lastPeriod, `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
  const cycleDay = (diffDays % cycleLength) + 1;
  const boundaries = getScaledBoundaries(cycleLength);

  let currentPhase = "luteal";
  let phaseIndex = 0;
  for (let i = 0; i < boundaries.length; i++) {
    const b = boundaries[i];
    if (cycleDay >= b.start && cycleDay <= b.end) {
      currentPhase = b.phase;
      phaseIndex = i;
      break;
    }
  }

  const currentBoundary = boundaries[phaseIndex];
  const nextBoundary = boundaries[(phaseIndex + 1) % boundaries.length];
  const daysUntilNextPhase = currentBoundary.end - cycleDay + 1;

  const daysUntilNextPeriod = cycleLength - cycleDay + 1;
  const nextPeriodDate = addDays(today, daysUntilNextPeriod);

  const ovulationBoundary = boundaries.find((b) => b.phase === "ovulation");
  const fertileStart = Math.max(1, ovulationBoundary.start - 2);
  const fertileEnd = Math.min(cycleLength, ovulationBoundary.end + 1);
  const daysUntilOvulation = cycleDay <= ovulationBoundary.start
    ? ovulationBoundary.start - cycleDay
    : cycleLength - cycleDay + ovulationBoundary.start;

  return {
    cycleDay,
    currentPhase,
    boundaries,
    cycleLength,
    daysUntilNextPeriod,
    nextPeriodDate,
    nextPhase: nextBoundary.phase,
    daysUntilNextPhase,
    fertileStart,
    fertileEnd,
    daysUntilOvulation
  };
}

// ── Rendering ──
function renderDashboard(info, metrics) {
  const phase = PHASES[info.currentPhase];
  const container = $(".dashboard-container");
  container.setAttribute("data-phase", info.currentPhase);

  $("#phase-emoji").textContent = phase.mainEmoji;
  $("#phase-name").textContent = phase.name;
  $("#cycle-day").textContent = `Day ${info.cycleDay} of ${info.cycleLength}`;
  $("#phase-emojis").textContent = phase.emojis;
  $("#mood-line").textContent = `"${phase.moodLine}"`;

  $("#next-period").textContent = `In ${pluralizeDays(info.daysUntilNextPeriod)}`;
  $("#next-period-date").textContent = `Expected: ${formatFriendlyDate(info.nextPeriodDate)}`;

  $("#next-phase").textContent = getPhaseLabel(info.nextPhase);
  $("#next-phase-days").textContent = `Starts in ${pluralizeDays(info.daysUntilNextPhase)}`;

  $("#fertile-window").textContent = `Days ${info.fertileStart}-${info.fertileEnd}`;
  $("#ovulation-countdown").textContent = info.daysUntilOvulation === 0
    ? "Ovulation window: now"
    : `Ovulation in ${pluralizeDays(info.daysUntilOvulation)}`;

  $("#avg-cycle").textContent = `${metrics.averageCycleLength} days`;
  $("#avg-cycle-sub").textContent = metrics.adaptiveUsed
    ? `From ${metrics.cycleLengthsUsed.length} tracked cycle${metrics.cycleLengthsUsed.length === 1 ? "" : "s"}`
    : "Using configured cycle length";

  if (metrics.consistencyRange === null) {
    $("#cycle-consistency").textContent = "—";
    $("#cycle-consistency-sub").textContent = "Log more starts to measure";
  } else {
    $("#cycle-consistency").textContent = `${metrics.consistencyRange} days`;
    $("#cycle-consistency-sub").textContent = metrics.consistencyRange <= 4 ? "Fairly consistent" : "Varies across cycles";
  }

  $("#coach-tip").textContent = phase.coachTip;
  $("#science-note").textContent = `Why this helps: ${phase.scienceNote}`;

  const setVibe = (id, data) => {
    const fill = $(`#vibe-${id}`);
    const text = $(`#vibe-${id}-text`);
    fill.style.width = "0";
    requestAnimationFrame(() => {
      fill.style.width = data.level + "%";
    });
    text.textContent = data.text;
  };
  setVibe("energy", phase.energy);
  setVibe("mood", phase.mood);
  setVibe("patience", phase.patience);

  const grid = $("#tips-grid");
  grid.innerHTML = "";
  phase.tips.forEach((tip) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.textContent = tip;
    grid.appendChild(card);
  });

  const pct = info.cycleLength > 1
    ? ((info.cycleDay - 1) / (info.cycleLength - 1)) * 100
    : 0;
  $("#progress-marker").style.left = `calc(${pct}% - 2px)`;

  const segs = document.querySelectorAll(".progress-segment");
  info.boundaries.forEach((b, i) => {
    const span = b.end - b.start + 1;
    segs[i].style.flex = span;
  });
}

function renderPeriodHistory(periodStarts) {
  const historyList = $("#period-history-list");
  historyList.innerHTML = "";

  if (!periodStarts.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-empty";
    emptyItem.textContent = "No tracked period starts yet.";
    historyList.appendChild(emptyItem);
    return;
  }

  const newestFirst = [...periodStarts].reverse();
  newestFirst.forEach((isoDate) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const date = document.createElement("span");
    date.className = "history-date";
    date.textContent = toDisplay(isoDate);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "history-delete";
    del.setAttribute("data-date", isoDate);
    del.textContent = "Delete";

    li.appendChild(date);
    li.appendChild(del);
    historyList.appendChild(li);
  });
}

// ── Storage ──
function saveFallbackCycleLength(cycleLength) {
  localStorage.setItem(STORAGE_KEYS.cycleLength, String(cycleLength));
}

function syncLegacyLastPeriod(periodStarts) {
  if (periodStarts.length) {
    localStorage.setItem(STORAGE_KEYS.lastPeriod, periodStarts[periodStarts.length - 1]);
  } else {
    localStorage.removeItem(STORAGE_KEYS.lastPeriod);
  }
}

function savePeriodStarts(periodStarts) {
  const normalized = normalizePeriodStarts(periodStarts);
  localStorage.setItem(STORAGE_KEYS.periodStarts, JSON.stringify(normalized));
  syncLegacyLastPeriod(normalized);
  return normalized;
}

function loadTrackingData() {
  const fallbackCycleLength = parseInt(localStorage.getItem(STORAGE_KEYS.cycleLength), 10) || 28;
  const legacyLastPeriod = localStorage.getItem(STORAGE_KEYS.lastPeriod);
  const rawStarts = localStorage.getItem(STORAGE_KEYS.periodStarts);

  let parsedStarts = [];
  if (rawStarts) {
    try {
      const parsed = JSON.parse(rawStarts);
      if (Array.isArray(parsed)) parsedStarts = parsed;
    } catch (_) {
      parsedStarts = [];
    }
  }

  if (!parsedStarts.length && legacyLastPeriod) {
    parsedStarts = [legacyLastPeriod];
  }

  const normalized = normalizePeriodStarts(parsedStarts);
  if (JSON.stringify(normalized) !== JSON.stringify(parsedStarts)) {
    savePeriodStarts(normalized);
  } else {
    syncLegacyLastPeriod(normalized);
  }

  return {
    periodStarts: normalized,
    fallbackCycleLength
  };
}

function clearData() {
  localStorage.removeItem(STORAGE_KEYS.lastPeriod);
  localStorage.removeItem(STORAGE_KEYS.cycleLength);
  localStorage.removeItem(STORAGE_KEYS.periodStarts);
}

// ── Navigation ──
function showInput() {
  inputScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
}

function showDashboard() {
  const data = loadTrackingData();
  if (!data.periodStarts.length) {
    showInput();
    return;
  }

  inputScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");

  const metrics = getAdaptiveCycleMetrics(data.periodStarts, data.fallbackCycleLength, TRACKING_WINDOW);
  const lastPeriod = data.periodStarts[data.periodStarts.length - 1];
  const info = getCycleInfo(lastPeriod, metrics.effectiveCycleLength);
  renderDashboard(info, metrics);
}

// ── Stepper Logic ──
function setupStepper(decId, incId, displayId, hiddenId, initial) {
  let value = initial || 28;
  const display = $(displayId);
  const hidden = $(hiddenId);
  display.textContent = value;
  hidden.value = value;

  $(decId).addEventListener("click", () => {
    if (value > 21) {
      value--;
      display.textContent = value;
      hidden.value = value;
    }
  });

  $(incId).addEventListener("click", () => {
    if (value < 35) {
      value++;
      display.textContent = value;
      hidden.value = value;
    }
  });

  return {
    get: () => value,
    set: (v) => {
      value = v;
      display.textContent = v;
      hidden.value = v;
    }
  };
}

function attemptAddPeriodStart(periodStarts, newDateIso, allowShortGapOverride = false) {
  if (!isValidISODate(newDateIso)) {
    return { ok: false, reason: "invalid" };
  }

  if (periodStarts.includes(newDateIso)) {
    return { ok: false, reason: "duplicate" };
  }

  const sorted = [...periodStarts].sort();
  const previous = findPreviousStart(sorted, newDateIso);
  if (!allowShortGapOverride && hasShortGapWarning(previous, newDateIso)) {
    return { ok: false, reason: "short-gap", previousDate: previous };
  }

  const updated = savePeriodStarts([...periodStarts, newDateIso]);
  return { ok: true, periodStarts: updated };
}

function openSettingsModal(editStepper) {
  const data = loadTrackingData();
  const latest = data.periodStarts[data.periodStarts.length - 1];
  $("#edit-last-period").value = latest ? toDisplay(latest) : "";
  editStepper.set(data.fallbackCycleLength);
  $("#add-period-start").value = "";
  renderPeriodHistory(data.periodStarts);
  settingsModal.classList.remove("hidden");
}

// ── Share ──
function shareResult() {
  const data = loadTrackingData();
  if (!data.periodStarts.length) return;

  const metrics = getAdaptiveCycleMetrics(data.periodStarts, data.fallbackCycleLength, TRACKING_WINDOW);
  const info = getCycleInfo(data.periodStarts[data.periodStarts.length - 1], metrics.effectiveCycleLength);
  const phase = PHASES[info.currentPhase];

  const cycleEstimateLine = metrics.adaptiveUsed
    ? `Cycle estimate: ${metrics.effectiveCycleLength} days (from recent tracking)`
    : `Cycle estimate: ${metrics.effectiveCycleLength} days`;

  const text = [
    `Day ${info.cycleDay}: ${phase.name} ${phase.emojis}`,
    `Next phase: ${getPhaseLabel(info.nextPhase)} in ${pluralizeDays(info.daysUntilNextPhase)}`,
    `Next period: in ${pluralizeDays(info.daysUntilNextPeriod)} (${formatFriendlyDate(info.nextPeriodDate)})`,
    cycleEstimateLine,
    `Coach Play: ${phase.coachTip}`,
    "",
    "- Period Bro"
  ].join("\n");

  if (navigator.share) {
    navigator.share({ title: "Period Bro", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      flashButtonText($("#share-btn"), "Copied! ✅", 2000);
    });
  }
}

// ── Init ──
(function init() {
  setupDateInput($("#last-period"));
  setupDateInput($("#edit-last-period"));
  setupDateInput($("#add-period-start"));

  const initialCycleLength = parseInt(localStorage.getItem(STORAGE_KEYS.cycleLength), 10) || 28;
  const mainStepper = setupStepper("#cycle-dec", "#cycle-inc", "#cycle-length-display", "#cycle-length", initialCycleLength);
  const editStepper = setupStepper("#edit-cycle-dec", "#edit-cycle-inc", "#edit-cycle-length-display", "#edit-cycle-length", initialCycleLength);

  const saved = loadTrackingData();
  if (saved.periodStarts.length) {
    showDashboard();
  }

  $("#setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#last-period");
    if (!isValidDisplayDate(input.value)) {
      input.setCustomValidity("Enter a valid date (dd/mm/yyyy), not in the future");
      input.reportValidity();
      input.setCustomValidity("");
      return;
    }

    const lastPeriod = toISO(input.value);
    const cycleLength = mainStepper.get();
    saveFallbackCycleLength(cycleLength);
    savePeriodStarts([lastPeriod]);
    showDashboard();
  });

  $("#log-period-btn").addEventListener("click", () => {
    const today = getTodayStart();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const data = loadTrackingData();

    let result = attemptAddPeriodStart(data.periodStarts, todayIso);
    if (!result.ok && result.reason === "short-gap") {
      const daysGap = daysBetween(result.previousDate, todayIso);
      const allow = confirm(`This start is only ${daysGap} days after the previous one. Log anyway?`);
      if (!allow) return;
      result = attemptAddPeriodStart(data.periodStarts, todayIso, true);
    }

    if (!result.ok && result.reason === "duplicate") {
      flashButtonText($("#log-period-btn"), "Already logged today", 1800);
      return;
    }

    if (result.ok) {
      showDashboard();
      flashButtonText($("#log-period-btn"), "Logged ✅", 1500);
      if (!settingsModal.classList.contains("hidden")) {
        renderPeriodHistory(result.periodStarts);
      }
    }
  });

  $("#edit-btn").addEventListener("click", () => {
    openSettingsModal(editStepper);
  });

  $("#settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#edit-last-period");
    if (!isValidDisplayDate(input.value)) {
      input.setCustomValidity("Enter a valid date (dd/mm/yyyy), not in the future");
      input.reportValidity();
      input.setCustomValidity("");
      return;
    }

    const editedLatest = toISO(input.value);
    const cycleLength = editStepper.get();
    saveFallbackCycleLength(cycleLength);

    const data = loadTrackingData();
    const updatedStarts = [...data.periodStarts];
    if (updatedStarts.length) {
      updatedStarts[updatedStarts.length - 1] = editedLatest;
    } else {
      updatedStarts.push(editedLatest);
    }
    savePeriodStarts(updatedStarts);

    settingsModal.classList.add("hidden");
    showDashboard();
  });

  $("#add-period-btn").addEventListener("click", () => {
    const input = $("#add-period-start");
    if (!isValidDisplayDate(input.value)) {
      input.setCustomValidity("Enter a valid date (dd/mm/yyyy), not in the future");
      input.reportValidity();
      input.setCustomValidity("");
      return;
    }

    const newDateIso = toISO(input.value);
    const data = loadTrackingData();

    let result = attemptAddPeriodStart(data.periodStarts, newDateIso);
    if (!result.ok && result.reason === "short-gap") {
      const daysGap = daysBetween(result.previousDate, newDateIso);
      const allow = confirm(`This start is only ${daysGap} days after the previous one. Add anyway?`);
      if (!allow) return;
      result = attemptAddPeriodStart(data.periodStarts, newDateIso, true);
    }

    if (!result.ok && result.reason === "duplicate") {
      flashButtonText($("#add-period-btn"), "Already saved", 1500);
      return;
    }

    if (result.ok) {
      input.value = "";
      renderPeriodHistory(result.periodStarts);
      showDashboard();
      flashButtonText($("#add-period-btn"), "Added ✅", 1500);
    }
  });

  $("#period-history-list").addEventListener("click", (e) => {
    const button = e.target.closest(".history-delete");
    if (!button) return;

    const isoDate = button.getAttribute("data-date");
    if (!isoDate) return;

    if (!confirm(`Delete tracked start date ${toDisplay(isoDate)}?`)) return;

    const data = loadTrackingData();
    const filtered = data.periodStarts.filter((date) => date !== isoDate);
    const savedStarts = savePeriodStarts(filtered);

    renderPeriodHistory(savedStarts);
    if (savedStarts.length) {
      $("#edit-last-period").value = toDisplay(savedStarts[savedStarts.length - 1]);
      showDashboard();
    } else {
      settingsModal.classList.add("hidden");
      showInput();
    }
  });

  $("#cancel-btn").addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  $("#reset-btn").addEventListener("click", () => {
    if (confirm("Clear all data and start over?")) {
      clearData();
      settingsModal.classList.add("hidden");
      showInput();
    }
  });

  $("#share-btn").addEventListener("click", () => {
    shareResult();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
