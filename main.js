// main.js

// 1. Import functions from separate module files
import { connectToRobot } from './bluetooth.js';
import { initGrid } from './grid.js';
// Later you can add:
// import { setObstacles } from './obstacles.js';
// import { verifyStudentWork } from './grading.js';

// 2. Select DOM Elements
const connectBtn = document.getElementById('connectBtn');
const startBtn = document.getElementById('startBtn');
const statusBadge = document.getElementById('statusBadge');

const connectionView = document.getElementById('connectionView');
const gridView = document.getElementById('gridView');

// 3. Main Connection Event Listener
connectBtn.addEventListener('click', async () => {
  try {
    statusBadge.innerText = `Searching for Robot...`;
    statusBadge.className = "badge status-connecting";

    // Call the imported Bluetooth module function
    const deviceName = await connectToRobot();

    // Update UI on success
    statusBadge.innerText = `Status: Connected to ${deviceName}`;
    statusBadge.className = "badge status-connected";
    connectBtn.disabled = true;
    connectBtn.innerText = "Connected";
    
    // Enable the Start button to move to the next page
    if (startBtn) {
      startBtn.disabled = false;
    }

  } catch (error) {
    console.error("Bluetooth Connection Error:", error);
    statusBadge.innerText = `Status: ${error.message}`;
    statusBadge.className = "badge status-disconnected";
  }

  // Start Button Listener (Redirects to grid page)
    if (startBtn) {
        startBtn.addEventListener('click', () => {
        connectionView.classList.add('hidden');
        gridView.classList.remove('hidden');
        
        // Render the grid
        initGrid();
        });
    }
})
