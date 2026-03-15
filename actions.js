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
