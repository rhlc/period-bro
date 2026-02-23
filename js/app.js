// ── Phase Data ──
const PHASES = {
  menstruation: {
    name: "Storm Mode",
    emojis: "🔥🍫🛋️☕",
    mainEmoji: "🌊",
    color: "#D32F2F",
    moodLine: "She's a warrior right now. Act accordingly.",
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

function getCycleInfo(lastPeriod, cycleLength) {
  const now = new Date();
  const last = new Date(lastPeriod + "T00:00:00");
  const diffMs = now - last;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % cycleLength) + 1;
  const boundaries = getScaledBoundaries(cycleLength);

  let currentPhase = "luteal";
  for (const b of boundaries) {
    if (cycleDay >= b.start && cycleDay <= b.end) {
      currentPhase = b.phase;
      break;
    }
  }

  return { cycleDay, currentPhase, boundaries, cycleLength };
}

// ── Rendering ──
function renderDashboard(info) {
  const phase = PHASES[info.currentPhase];
  const container = $(".dashboard-container");
  container.setAttribute("data-phase", info.currentPhase);

  $("#phase-emoji").textContent = phase.mainEmoji;
  $("#phase-name").textContent = phase.name;
  $("#cycle-day").textContent = `Day ${info.cycleDay} of ${info.cycleLength}`;
  $("#mood-line").textContent = `"${phase.moodLine}"`;

  // Vibe bars
  const setVibe = (id, data) => {
    const fill = $(`#vibe-${id}`);
    const text = $(`#vibe-${id}-text`);
    // Trigger reflow for animation
    fill.style.width = "0";
    requestAnimationFrame(() => {
      fill.style.width = data.level + "%";
    });
    text.textContent = data.text;
  };
  setVibe("energy", phase.energy);
  setVibe("mood", phase.mood);
  setVibe("patience", phase.patience);

  // Tips
  const grid = $("#tips-grid");
  grid.innerHTML = "";
  phase.tips.forEach((tip) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.textContent = tip;
    grid.appendChild(card);
  });

  // Progress marker position
  const pct = ((info.cycleDay - 1) / (info.cycleLength - 1)) * 100;
  $("#progress-marker").style.left = `calc(${pct}% - 2px)`;

  // Scale segments to match actual boundaries
  const segs = document.querySelectorAll(".progress-segment");
  info.boundaries.forEach((b, i) => {
    const span = b.end - b.start + 1;
    segs[i].style.flex = span;
  });
}

// ── Storage ──
function saveData(lastPeriod, cycleLength) {
  localStorage.setItem("pb_lastPeriod", lastPeriod);
  localStorage.setItem("pb_cycleLength", String(cycleLength));
}

function loadData() {
  const lastPeriod = localStorage.getItem("pb_lastPeriod");
  const cycleLength = parseInt(localStorage.getItem("pb_cycleLength"), 10);
  if (lastPeriod && cycleLength) return { lastPeriod, cycleLength };
  return null;
}

function clearData() {
  localStorage.removeItem("pb_lastPeriod");
  localStorage.removeItem("pb_cycleLength");
}

// ── Navigation ──
function showInput() {
  inputScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
}

function showDashboard(lastPeriod, cycleLength) {
  inputScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  const info = getCycleInfo(lastPeriod, cycleLength);
  renderDashboard(info);
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

// ── Share ──
function shareResult(lastPeriod, cycleLength) {
  const info = getCycleInfo(lastPeriod, cycleLength);
  const phase = PHASES[info.currentPhase];
  const text = `Day ${info.cycleDay}: ${phase.name} ${phase.emojis}\n"${phase.moodLine}"\n\n— Period Bro 🩸`;

  if (navigator.share) {
    navigator.share({ title: "Period Bro", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = $("#share-btn");
      const original = btn.textContent;
      btn.textContent = "Copied! ✅";
      setTimeout(() => { btn.textContent = original; }, 2000);
    });
  }
}

// ── Init ──
(function init() {
  // Set max date to today
  const today = new Date().toISOString().split("T")[0];
  $("#last-period").setAttribute("max", today);
  $("#edit-last-period").setAttribute("max", today);

  const mainStepper = setupStepper("#cycle-dec", "#cycle-inc", "#cycle-length-display", "#cycle-length");
  const editStepper = setupStepper("#edit-cycle-dec", "#edit-cycle-inc", "#edit-cycle-length-display", "#edit-cycle-length");

  // Check for saved data
  const saved = loadData();
  if (saved) {
    showDashboard(saved.lastPeriod, saved.cycleLength);
  }

  // Setup form
  $("#setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const lastPeriod = $("#last-period").value;
    const cycleLength = mainStepper.get();
    saveData(lastPeriod, cycleLength);
    showDashboard(lastPeriod, cycleLength);
  });

  // Edit button → open modal
  $("#edit-btn").addEventListener("click", () => {
    const data = loadData();
    if (data) {
      $("#edit-last-period").value = data.lastPeriod;
      editStepper.set(data.cycleLength);
    }
    settingsModal.classList.remove("hidden");
  });

  // Settings form save
  $("#settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const lastPeriod = $("#edit-last-period").value;
    const cycleLength = editStepper.get();
    saveData(lastPeriod, cycleLength);
    settingsModal.classList.add("hidden");
    showDashboard(lastPeriod, cycleLength);
  });

  // Cancel
  $("#cancel-btn").addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  // Close modal on backdrop click
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  // Reset
  $("#reset-btn").addEventListener("click", () => {
    if (confirm("Clear all data and start over?")) {
      clearData();
      settingsModal.classList.add("hidden");
      showInput();
    }
  });

  // Share
  $("#share-btn").addEventListener("click", () => {
    const data = loadData();
    if (data) shareResult(data.lastPeriod, data.cycleLength);
  });

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
