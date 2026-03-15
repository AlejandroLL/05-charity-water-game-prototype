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
	totalImpactFund: 0,
	lifetimePeopleHelped: 0,
	lifetimePeopleServed: 0,
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

function triggerMorningRoutine() {
	// Runs at the start of each new day.
	// Resets time values and asks the breakfast question.
	if (gameState.day >= 15) {
		endSemester();
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
	const impactOverlay = document.getElementById('impact-overlay');
	const gameMap = document.getElementById('game-map');
	const villagePhase = document.getElementById('village-phase');
	const villageScreen = document.getElementById('village-screen');

	if (impactOverlay) impactOverlay.classList.add('hidden');
	if (gameMap) gameMap.classList.add('hidden');
	if (villagePhase) villagePhase.classList.add('hidden');
	if (villageScreen) villageScreen.classList.remove('hidden');

	logAction("Arrived at the Field Office. Let's start building.");
	updateUI();
}

function endSemester() {
	// Calculate semester impact and move to the village screen.
	const semesterImpact = gameState.raisedFunds * gameState.awareness;

	// impactFund is spendable now; totalImpactFund tracks all semesters combined.
	gameState.impactFund += semesterImpact;
	gameState.totalImpactFund += semesterImpact;

	transitionToVillage();
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
	gameState.lifetimePeopleServed += impact;

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
	gameState.totalImpactFund = 0;
	gameState.lifetimePeopleHelped = 0;
	gameState.lifetimePeopleServed = 0;

	document.getElementById('game-map').classList.remove('hidden');
	document.getElementById('village-phase').classList.add('hidden');
	const villageScreen = document.getElementById('village-screen');
	if (villageScreen) villageScreen.classList.add('hidden');

	logAction("A new semester begins! Let's reach even more people.");
	triggerMorningRoutine();
	updateUI();
}
