// Village screen helpers
// This file manages the optional #village-screen section.

const villageProjectSites = [
	{
		name: 'Site A - Hillside Community',
		focus: 'Household filters and hygiene training'
	},
	{
		name: 'Site B - Valley School District',
		focus: 'School-safe taps and storage tanks'
	},
	{
		name: 'Site C - Market Center',
		focus: 'Public access points and maintenance team'
	}
];

function renderProjectSites() {
	const grid = document.getElementById('project-sites-grid');
	if (!grid) return;

	// Build cards once, then only update values later.
	if (grid.childElementCount > 0) return;

	villageProjectSites.forEach((site) => {
		const card = document.createElement('article');
		card.className = 'bg-white rounded-2xl border border-slate-200 p-4 shadow-sm';
		card.innerHTML = `
			<h4 class="font-800 text-slate-800 mb-2">${site.name}</h4>
			<p class="text-xs text-slate-500 mb-3">${site.focus}</p>
			<p class="text-[10px] uppercase tracking-widest font-800 text-cw-blue">Status: Ready for Funding</p>
		`;
		grid.appendChild(card);
	});
}

function updateVillageImpactFund() {
	const impactEl = document.getElementById('village-total-impact-fund');
	if (!impactEl || typeof gameState === 'undefined') return;
	const totalFund = gameState.totalImpactFund || gameState.impactFund;
	impactEl.innerText = `$${Math.floor(totalFund)}`;
}

function updateVillageScreen() {
	renderProjectSites();
	updateVillageImpactFund();
}
