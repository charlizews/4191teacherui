// grid.js
import { sendData } from './bluetooth.js';

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
const ROWS = 20;

// Board State Tracking
let boardState = {}; // Format: { "B14": { type: "start", symbol: "🚀" } }
let startCoord = null;
let destCoord = null;
let hoveredCellKey = null;

let selectedCell = null;

export function initGrid() {
  const container = document.getElementById('gridContainer');
  const coordInput = document.getElementById('coordInput');
  const itemSelect = document.getElementById('itemTypeSelect');
  const placeBtn = document.getElementById('placeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const sendBtn = document.getElementById('sendBtn');

  //const coordDisplay = document.getElementById('selectedCoord');
  const startDisplay = document.getElementById('startDisplay');
  const destDisplay = document.getElementById('destDisplay');
  const obsDisplay = document.getElementById('obsDisplay');
  const obsCount = document.getElementById('obsCount');
  const vowelDisplay = document.getElementById('vowelDisplay');
  const vowelCount = document.getElementById('vowelCount');

  // Individual Clear Buttons
  const clearStartBtn = document.getElementById('clearStartBtn');
  const clearDestBtn = document.getElementById('clearDestBtn');
  const clearObsBtn = document.getElementById('clearObsBtn');
  const clearVowelBtn = document.getElementById('clearVowelBtn');

  container.innerHTML = ''; 

  // 1. TOP ROW LABELS: Corner | A-T | Corner
  createLabelCell(container, '');
  COLS.forEach(col => createLabelCell(container, col));
  createLabelCell(container, '');

  // 2. MIDDLE ROWS: Left Label (1-20) | Grid Cells | Right Label (1-20)
  for (let r = 1; r <= ROWS; r++) {
    createLabelCell(container, r); // Left Row Label

    COLS.forEach(col => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.col = col;
      cell.dataset.row = r;
      cell.title = `${col}${r}`;

      cell.addEventListener('click', () => {
      coordInput.value = `${col}${r}`;
    });

    // ADD THESE EVENT LISTENERS BELOW THE CLICK LISTENER:
    cell.addEventListener('mouseenter', () => {
      hoveredCellKey = `${col}${r}`;
    });
    cell.addEventListener('mouseleave', () => {
      if (hoveredCellKey === `${col}${r}`) hoveredCellKey = null;
    });
    });

    container.appendChild(cell);
  };
    createLabelCell(container, r); // Right Row Label
}

// 3. BOTTOM ROW LABELS: Corner | A-T | Corner
createLabelCell(container, '');
COLS.forEach(col => createLabelCell(container, col));
createLabelCell(container, '');

// Event Listeners
placeBtn.addEventListener('click', parseAndPlace);
coordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') parseAndSelectInput();
});

// Clear Event Listeners
clearStartBtn.addEventListener('click', () => clearCategory('start'));
clearDestBtn.addEventListener('click', () => clearCategory('dest'));
clearObsBtn.addEventListener('click', () => clearCategory('obstacle'));
clearVowelBtn.addEventListener('click', () => clearCategory('vowels'));
clearAllBtn.addEventListener('click', clearEntireGrid);

// ADD THIS KEYBOARD LISTENER:
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && hoveredCellKey && document.activeElement !== coordInput) {
    if (boardState[hoveredCellKey]) {
      removeCoordinate(hoveredCellKey);
      updateUI();
    }
  }
});

function parseAndPlace() {
  const raw = coordInput.value.trim().toUpperCase();
  const match = raw.match(/^([A-T])([1-9]|1[0-9]|20)$/);
  if (!match) {
    alert("Please enter a valid coordinate from A1 to T20.");
    return;
  }

  const col = match[1];
  const row = parseInt(match[2], 10);
  const key = `${col}${row}`;
  const selectedType = itemSelect.value;

  if (boardState[key]) {
    removeCoordinate(key);
  }

  // Remove unique items (Start/Dest) if re-placed somewhere else
  if (selectedType === 'start' && startCoord) removeCoordinate(startCoord);
  if (selectedType === 'dest' && destCoord) removeCoordinate(destCoord);

  // Config for symbols & classes
  const config = getItemConfig(selectedType);

  // Place on DOM cell
  const cell = container.querySelector(`[data-col="${col}"][data-row="${row}"]`);
  if (cell) {
    cell.innerText = config.symbol;
    cell.className = `grid-cell ${config.className}`;
    boardState[key] = { type: selectedType, symbol: config.symbol };
  }

  // Track compulsory positions
  if (selectedType === 'start') {
    startCoord = key;
    startDisplay.innerText = key;
  } else if (selectedType === 'dest') {
    destCoord = key;
    destDisplay.innerText = key;
  }
  updateUI();
}

function clearCategory(category) {
  Object.keys(boardState).forEach(coord => {
    const type = boardState[coord].type;
    if (
      (category === 'start' && type === 'start') ||
      (category === 'dest' && type === 'dest') ||
      (category === 'obstacle' && type === 'obstacle') ||
      (category === 'vowels' && ['A','E','I','O','U'].includes(type))
    ) {
      removeCoordinate(coord);
    }
  });

  if (category === 'start') startCoord = null;
  if (category === 'dest') destCoord = null;

  updateUI();
}

// REPLACE YOUR EXISTING removeCoordinate FUNCTION WITH THIS:
function removeCoordinate(key) {
  if (!boardState[key]) return;

  // Reset tracked positions if Start or Dest is being removed or replaced
  if (key === startCoord) startCoord = null;
  if (key === destCoord) destCoord = null;

  delete boardState[key];

  const cell = container.querySelector(`[data-col="${key[0]}"][data-row="${key.slice(1)}"]`);
  if (cell) {
    cell.innerText = '';
    cell.className = 'grid-cell';
  }
}

function clearEntireGrid() {
  Object.keys(boardState).forEach(coord => removeCoordinate(coord));
  startCoord = null;
  destCoord = null;
  updateUI();
}

function updateUI() {
  // 1. Update Start/Dest Display
  startDisplay.innerText = startCoord || 'Not Set';
  destDisplay.innerText = destCoord || 'Not Set';

  // 2. Aggregate Obstacles
  const obstacles = Object.keys(boardState).filter(k => boardState[k].type === 'obstacle');
  obsCount.innerText = obstacles.length;
  obsDisplay.innerText = obstacles.length > 0 ? obstacles.join(', ') : 'None';

  // 3. Aggregate Vowels
  const vowels = Object.keys(boardState)
    .filter(k => ['A','E','I','O','U'].includes(boardState[k].type))
    .map(k => `${boardState[k].type}:${k}`);
  vowelCount.innerText = vowels.length;
  vowelDisplay.innerText = vowels.length > 0 ? vowels.join(', ') : 'None';

  // 4. Validate Start & Dest presence
  sendBtn.disabled = !(startCoord && destCoord);
}

sendBtn.addEventListener('click', async () => {
  let obstacles = Object.keys(boardState).filter(k => boardState[k].type === 'obstacle');
  let vowels = Object.keys(boardState)
    .filter(k => ['A','E','I','O','U'].includes(boardState[k].type))
    .map(k => `${boardState[k].type}:${k}`);

  const payload = `START:${startCoord}|DEST:${destCoord}|OBS:${obstacles.join(',')}|VOWELS:${vowels.join(',')}\n`;

  try {
    await sendData(payload);
    alert(`Mission transmitted successfully!\n${payload}`);
  } catch (err) {
    alert("Transmission failed: " + err.message);
  }
});

function getItemConfig(type) {
  switch (type) {
    case 'start':    return { symbol: '🚀', className: 'cell-start' };
    case 'dest':     return { symbol: '🏁', className: 'cell-dest' };
    case 'obstacle': return { symbol: '✖', className: 'cell-obstacle' };
    default:         return { symbol: type, className: 'cell-vowel' };
  }
}

function createLabelCell(parent, text) {
  const label = document.createElement('div');
  label.className = 'grid-label';
  label.innerText = text;
  parent.appendChild(label);
}
