// This object stores all game values in one place.
// Think of it like the "single source of truth" for the game.
const gameState = {
	day: 1,
	hoursUsed: 0,
	hoursMax: 12,
	wallet: 50,
	raisedFunds: 0,
	energy: 100,
	awareness: 1.0,
	eventPlanningProgress: 0,
	coffeeUsedToday: false,

	// Phase 2 stats
	impactFund: 0,
	lifetimePeopleHelped: 0,
	phase: 'CAMPUS', // 'CAMPUS' or 'FIELD'

	isWorkDay: function() {
		const dow = ((this.day - 1) % 7) + 1;
		return dow === 2 || dow === 4;
	},
	getTimeDisplay: function() {
		return `${this.hoursUsed} / ${this.hoursMax}h`;
	},
	getTrafficMultiplier: function() {
		const h = this.hoursUsed;
		if (h <= 2) return 0.5;
		if (h <= 7) return 1.5;
		if (h <= 10) return 1.0;
		return 0.3;
	}
};

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
	document.getElementById('stat-lifetime-impact').innerText = gameState.lifetimePeopleHelped;

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

function triggerMorningRoutine() {
	// Runs at the start of each new day.
	// Resets time values and asks the breakfast question.
	if (gameState.day >= 15) {
		triggerPayday();
		return;
	}

	gameState.hoursUsed = 0;
	gameState.hoursMax = 12;
	gameState.coffeeUsedToday = false;

	const options = [
		{
			text: 'Breakfast ($10, +0⚡)',
			action: () => {
				gameState.wallet -= 10;
				gameState.energy = 100;
				logAction('Healthy breakfast eaten.');
				updateUI();
			}
		},
		{
			text: 'Fast Food ($4, -10⚡)',
			action: () => {
				gameState.wallet -= 4;
				gameState.energy = 90;
				logAction('Quick greasy meal.');
				updateUI();
			}
		},
		{
			text: 'Skip ($0, -5⚡)',
			action: () => {
				gameState.energy = 95;
				logAction('Skipped breakfast. Feeling a bit low.');
				updateUI();
			}
		}
	];

	showModal('Morning Routine', `Day ${gameState.day}: How do you start your day?`, options);
}

function triggerPayday() {
	// End of semester summary before entering the field phase.
	const totalImpact = gameState.raisedFunds * gameState.awareness;
	gameState.impactFund = totalImpact;

	document.getElementById('summary-raised').innerText = `$${Math.floor(gameState.raisedFunds)}`;
	document.getElementById('summary-awareness').innerText = `${gameState.awareness.toFixed(2)}x`;
	document.getElementById('summary-total').innerText = `$${Math.floor(totalImpact)}`;

	document.getElementById('impact-overlay').classList.remove('hidden');
}

function transitionToVillage() {
	// Switch from campus gameplay to field impact gameplay.
	gameState.phase = 'FIELD';
	document.getElementById('impact-overlay').classList.add('hidden');
	document.getElementById('game-map').classList.add('hidden');
	document.getElementById('village-phase').classList.remove('hidden');
	logAction("Arrived at the Field Office. Let's start building.");
	updateUI();
}

function buyProject(type) {
	// Field phase purchase system.
	// type chooses which project card the user clicked.
	let cost = 0;
	let impact = 0;
	let name = '';

	if (type === 'BIOSAND') {
		cost = 50;
		impact = 12;
		name = 'BioSand Filters';
	}
	if (type === 'WELL') {
		cost = 2500;
		impact = 250;
		name = 'Hand-Piped Well';
	}
	if (type === 'DRILL') {
		cost = 10000;
		impact = 1200;
		name = 'Deep Drilled Well';
	}

	if (gameState.impactFund < cost) {
		showModal('Insufficient Funds', 'Your impact fund cannot cover this project yet.', [{ text: 'Back to Office', action: () => {} }]);
		return;
	}

	gameState.impactFund -= cost;
	gameState.lifetimePeopleHelped += impact;

	logAction(`DEPLOYED: ${name}. You've provided clean water for ${impact} people!`);

	showModal('Project Success', `Fantastic! The ${name} is complete. You just helped ${impact} people get access to clean water.`, [{ text: 'Great!', action: () => {} }]);
	updateUI();
}

function resetSemester() {
	// Resets core values so the player can run another campaign.
	gameState.day = 1;
	gameState.hoursUsed = 0;
	gameState.hoursMax = 12;
	gameState.wallet = 50;
	gameState.raisedFunds = 0;
	gameState.energy = 100;
	gameState.awareness = 1.0;
	gameState.eventPlanningProgress = 0;
	gameState.coffeeUsedToday = false;
	gameState.phase = 'CAMPUS';
	gameState.impactFund = 0;

	document.getElementById('game-map').classList.remove('hidden');
	document.getElementById('village-phase').classList.add('hidden');

	logAction("A new semester begins! Let's reach even more people.");
	triggerMorningRoutine();
	updateUI();
}

function handleDonationClick() {
	// Moves money from wallet to raised funds using the input box value.
	const el = document.getElementById('donation-input');
	const val = parseInt(el.value, 10);
	if (isNaN(val) || val <= 0) return;
	if (gameState.wallet < val) {
		logAction('Not enough cash in your wallet!');
		return;
	}
	gameState.wallet -= val;
	gameState.raisedFunds += val;
	el.value = '';
	logAction(`Donated $${val} from personal savings.`);
	updateUI();
}

function performAction(type) {
	// Main action router for campus phase buttons/cards.
	// type tells us which action to run.
	if (gameState.phase !== 'CAMPUS') return;
	const traffic = gameState.getTrafficMultiplier();

	const checkTime = (cost) => {
		// Helper: makes sure the action fits in the remaining hours.
		if (gameState.hoursUsed + cost > gameState.hoursMax) {
			logAction('Out of time! You must rest at the Dorms.');
			return false;
		}
		return true;
	};

	switch (type) {
		// Strategy action: one coffee per day.
		case 'COFFEE':
			if (gameState.coffeeUsedToday || gameState.wallet < 5) return;
			gameState.wallet -= 5;
			gameState.energy = Math.min(100, gameState.energy + 10);
			gameState.hoursMax += 2;
			gameState.coffeeUsedToday = true;
			logAction('Caffeine boost! Day expanded.');
			break;
		// Strategy action: gain a little money with no time cost.
		case 'SACRIFICE':
			gameState.wallet += 6;
			logAction('Saved $6 via personal budget cuts.');
			break;
		// Work shift appears on work days and trades energy/time for cash.
		case 'WORK':
			if (!checkTime(4) || gameState.energy < 30) return;
			gameState.wallet += 45;
			gameState.energy -= 30;
			gameState.hoursUsed += 4;
			logAction('Worked TA shift. Earned $45.');
			break;
		// Tabling scales with traffic.
		case 'TABLE': {
			if (!checkTime(2) || gameState.energy < 20) return;
			const baseYield = 5 + Math.floor(Math.random() * 6);
			const actualYield = Math.floor(baseYield * traffic);
			gameState.energy -= 20;
			gameState.awareness += 0.10 * traffic;
			gameState.raisedFunds += actualYield;
			gameState.hoursUsed += 2;
			logAction(`Tabling: Aware +${(0.10 * traffic).toFixed(2)}, Raised $${actualYield}.`);
			break;
		}
		// Rec center has two stages: planning, then launching.
		case 'REC_ACTION':
			if (gameState.eventPlanningProgress < 5) {
				if (!checkTime(3) || gameState.wallet < 15 || gameState.energy < 10) return;
				gameState.wallet -= 15;
				gameState.energy -= 10;
				gameState.hoursUsed += 3;
				gameState.eventPlanningProgress++;
				logAction('Planning local fundraiser...');
			} else {
				if (!checkTime(4) || gameState.energy < 60) return;
				const baseBigYield = 150 + Math.floor(Math.random() * 150);
				const actualBigYield = Math.floor(baseBigYield * traffic);
				gameState.energy -= 60;
				gameState.awareness += 2.5 * traffic;
				gameState.raisedFunds += actualBigYield;
				gameState.hoursUsed += 4;
				gameState.eventPlanningProgress = 0;
				logAction(`EVENT COMPLETE! Awareness +${(2.5 * traffic).toFixed(1)}, Raised $${actualBigYield}.`);
			}
			break;
		// Rest action inside the same day.
		case 'NAP':
			if (!checkTime(2)) return;
			gameState.energy = Math.min(100, gameState.energy + 20);
			gameState.hoursUsed += 2;
			logAction('2h Nap taken. Energy +20%.');
			break;
		// End the day and move to the next morning routine.
		case 'REST':
			gameState.day++;
			triggerMorningRoutine();
			break;
	}
	updateUI();
}

window.onload = () => {
	// Start the first day as soon as the page finishes loading.
	triggerMorningRoutine();
	updateUI();
};
 