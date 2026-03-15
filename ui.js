function updateUI() {
	// This function redraws the screen using values from gameState.
	// Call it after almost every state change.

	// Dashboard
	document.getElementById('display-day').innerText = `Day ${gameState.day}`;
	document.getElementById('display-hours').innerText = gameState.getTimeDisplay();
	document.getElementById('stat-wallet').innerText = `$${Math.floor(gameState.wallet)}`;
	document.getElementById('stat-raised').innerText = `$${Math.floor(gameState.raisedFunds)}`;
	document.getElementById('awareness-text-card').innerText = `${gameState.awareness.toFixed(2)}x`;
	document.getElementById('stat-impact-fund').innerText = `$${Math.floor(gameState.impactFund)}`;
	document.getElementById('stat-lifetime-impact').innerText = gameState.lifetimePeopleServed || gameState.lifetimePeopleHelped;

	// Visibility toggles
	if (gameState.phase === 'FIELD') {
		document.getElementById('campus-stats').classList.add('hidden');
		document.getElementById('energy-container').classList.add('hidden');
		document.getElementById('field-stats').classList.remove('hidden');
	} else {
		document.getElementById('campus-stats').classList.remove('hidden');
		document.getElementById('energy-container').classList.remove('hidden');
		document.getElementById('field-stats').classList.add('hidden');
	}

	// Time bar
	const timePercent = (gameState.hoursUsed / gameState.hoursMax) * 100;
	const timeBar = document.getElementById('day-progress-bar');
	if (timeBar) timeBar.style.width = `${Math.min(100, timePercent)}%`;

	// Traffic meter UI (only in campus phase)
	if (gameState.phase === 'CAMPUS') {
		const mult = gameState.getTrafficMultiplier();
		const dot = document.getElementById('traffic-dot');
		const status = document.getElementById('traffic-status');

		if (dot && status) {
			if (mult >= 1.5) {
				dot.className = 'traffic-dot bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
				status.innerText = 'Peak Traffic';
				status.className = 'text-[8px] font-800 uppercase tracking-tight text-green-400';
			} else if (mult >= 1.0) {
				dot.className = 'traffic-dot bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';
				status.innerText = 'Moderate';
				status.className = 'text-[8px] font-800 uppercase tracking-tight text-yellow-300';
			} else {
				dot.className = 'traffic-dot bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
				status.innerText = 'Low Traffic';
				status.className = 'text-[8px] font-800 uppercase tracking-tight text-red-400';
			}
		}
	}

	// Energy bar
	const energyText = document.getElementById('energy-text');
	const energyBar = document.getElementById('energy-bar');
	if (energyText && energyBar) {
		energyText.innerText = `${Math.floor(gameState.energy)}%`;
		energyBar.style.width = `${Math.max(0, gameState.energy)}%`;
		energyBar.className = gameState.energy < 25 ? 'bg-red-500 h-full progress-bar' : 'bg-green-400 h-full progress-bar';
	}

	// Coffee logic
	const coffeeBtn = document.getElementById('btn-coffee');
	const coffeeLbl = document.getElementById('coffee-label');
	if (coffeeBtn && coffeeLbl) {
		if (gameState.coffeeUsedToday) {
			coffeeBtn.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');
			coffeeLbl.innerText = 'Caffeine Limit Met';
		} else {
			coffeeBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
			coffeeLbl.innerText = 'Double Espresso';
		}
	}

	// Rec center
	const planSteps = document.querySelectorAll('.planning-step');
	const planLabel = document.getElementById('planning-label');
	if (planLabel) planLabel.innerText = `Planning ${gameState.eventPlanningProgress}/5`;
	planSteps.forEach((s, i) => i < gameState.eventPlanningProgress ? s.classList.add('active') : s.classList.remove('active'));

	const recPlan = document.getElementById('rec-stats-plan');
	const recLaunch = document.getElementById('rec-stats-launch');
	const recTitle = document.getElementById('rec-title');
	if (recPlan && recLaunch && recTitle) {
		if (gameState.eventPlanningProgress >= 5) {
			recPlan.classList.add('hidden');
			recLaunch.classList.remove('hidden');
			recTitle.innerText = 'EVENT READY';
		} else {
			recPlan.classList.remove('hidden');
			recLaunch.classList.add('hidden');
			recTitle.innerText = 'Rec Center';
		}
	}

	// Work day
	const jobDrawer = document.getElementById('job-drawer');
	if (jobDrawer) jobDrawer.style.display = (gameState.isWorkDay() && gameState.phase === 'CAMPUS') ? 'block' : 'none';

	// Keep the optional village screen widgets in sync.
	if (typeof updateVillageScreen === 'function') {
		updateVillageScreen();
	}
}

function logAction(msg) {
	// Adds a new message to the top of the activity feed.
	const log = document.getElementById('game-log');
	if (!log) return;
	const entry = document.createElement('div');
	entry.className = 'log-entry bg-gray-50 p-3 rounded-xl mb-2';
	const timeMark = gameState.phase === 'FIELD' ? 'FIELD' : `${gameState.hoursUsed}h`;
	entry.innerHTML = `<span class="font-800 text-[10px] text-cw-blue block uppercase mb-1">${timeMark} MARK</span> ${msg}`;
	log.prepend(entry);
}

function showModal(title, desc, options) {
	// Reusable popup window.
	// options is an array like: [{ text: 'Button text', action: () => {} }]
	const overlay = document.getElementById('event-overlay');
	if (!overlay) return;
	document.getElementById('modal-title').innerText = title;
	document.getElementById('modal-desc').innerText = desc;
	const container = document.getElementById('modal-options');
	container.innerHTML = '';
	options.forEach(opt => {
		const b = document.createElement('button');
		b.className = 'w-full py-3 bg-gray-100 hover:bg-cw-blue hover:text-white rounded-xl font-800 text-xs uppercase tracking-wider transition-all';
		b.innerText = opt.text;
		b.onclick = () => {
			overlay.classList.add('hidden');
			opt.action();
		};
		container.appendChild(b);
	});
	overlay.classList.remove('hidden');
}
