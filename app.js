/* ── PET-Sena Simulator ── */

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyo0uTULNfSbX51b8ALYC0TwUKvOf6bg2KbGkqkrexoWY2Lfmz2kMbXqd79Yu3GFxG9/exec";

let drawnNumbers = [];
let participants = [];

const DEMO_DATA = [
  { name: "LUCAS",      numbers: [3,  14, 22, 35, 47, 58] },
  { name: "YUMI",       numbers: [7,  19, 25, 33, 42, 56] },
  { name: "RAJA",       numbers: [1,  10, 22, 30, 47, 59] },
  { name: "MARÍLIA",    numbers: [5,  16, 28, 35, 44, 52] },
  { name: "MARIA",      numbers: [2,  14, 22, 38, 47, 60] },
  { name: "JOÃO PEDRO", numbers: [9,  21, 31, 37, 51, 55] },
  { name: "LINA",       numbers: [4,  13, 22, 35, 49, 57] },
  { name: "VICTOR",     numbers: [6,  18, 26, 35, 42, 47] },
];

/* ── Helpers ── */

function generateDraw() {
  const nums = new Set();
  while (nums.size < 6) nums.add(Math.floor(Math.random() * 60) + 1);
  return [...nums].sort((a, b) => a - b);
}

function getScore(pNums) {
  return pNums.filter(n => drawnNumbers.includes(n)).length;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/*     Render    */
function renderDrawn() {
  const el = document.getElementById("drawnBalls");
  if (!drawnNumbers.length) {
    el.innerHTML = '<span class="no-draw">Nenhum número escolhido - Clique em "Sortear Números" para gerar novos.</span>';
    return;
  }
  el.innerHTML = drawnNumbers
    .map(n => `<div class="ball ball-lg">${pad(n)}</div>`)
    .join("");
}

function renderParticipants() {
  const el = document.getElementById("participantsList");

  if (!participants.length) {
    el.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-ticket" style="font-size:32px;display:block;margin-bottom:8px;opacity:.4"></i>
        Nenhum participante ainda. Bora entrar galera!!
      </div>`;
    return;
  }

  const scored = participants.map(p => ({ ...p, score: getScore(p.numbers) }));
  const maxScore = Math.max(...scored.map(s => s.score));

  if (drawnNumbers.length > 0) {
    scored.sort((a, b) => b.score - a.score);
  }

  el.innerHTML = scored.map(p => {
    const isWinner = drawnNumbers.length > 0 && p.score === maxScore && maxScore > 0;

    const balls = p.numbers
      .map(n => {
        const hit = drawnNumbers.includes(n);
        return `<div class="ball ball-sm${hit ? " ball-hit" : ""}">${pad(n)}</div>`;
      })
      .join("");

    const scoreHtml = drawnNumbers.length > 0
      ? `<span class="p-score${isWinner ? " best" : ""}">
           ${p.score}/6
           ${isWinner ? '<span class="winner-badge">⭐ top</span>' : ""}
         </span>`
      : "";

    return `
      <div class="participant-card${isWinner ? " winner" : ""}">
        <span class="p-name">${p.name}</span>
        <div class="p-balls">${balls}</div>
        ${scoreHtml}
      </div>`;
  }).join("");

  const statusEl = document.getElementById("statusBar");
  if (drawnNumbers.length > 0) {
    statusEl.textContent = `${participants.length} participantes · maior acerto: ${maxScore}/6`;
  } else {
    statusEl.textContent = `${participants.length} participantes carregados`;
  }
}

/* Event listeners */
document.getElementById("drawBtn").addEventListener("click", () => {
  drawnNumbers = generateDraw();
  renderDrawn();
  renderParticipants();
});

document.getElementById("demoBtn").addEventListener("click", () => {
  participants = DEMO_DATA.map(p => ({ ...p }));
  renderParticipants();
  document.getElementById("statusBar").textContent =
    `${participants.length} participantes carregados para demonstração`;
});

document.getElementById("clearBtn").addEventListener("click", () => {
  drawnNumbers = [];
  participants = [];
  document.getElementById("statusBar").textContent = "";
  renderDrawn();
  renderParticipants();
});

document.getElementById("fetchBtn").addEventListener("click", async () => {
  const btn = document.getElementById("fetchBtn");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Atualizando...';
  btn.disabled = true;

  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    if (data.participants && Array.isArray(data.participants)) {
      participants = data.participants;
      renderParticipants();
      document.getElementById("statusBar").textContent =
        `${participants.length} participantes carregados da planilha`;
    } else {
      document.getElementById("statusBar").textContent =
        "Dados em formato inválido da planilha...";
    }
  } catch (e) {
    document.getElementById("statusBar").textContent =
      "Could not reach sheet — check SHEET_URL or CORS settings";
  }

  btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Atualizar';
  btn.disabled = false;
});
