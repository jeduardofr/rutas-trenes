const $continue = document.getElementById('continue');
const $textarea = document.getElementById('rules');
const $conclusions = document.getElementById('conclusions');

const COLORS = {
	GREEN: 'verde',
	RED: 'rojo'
}

const STATE = {
	BUSY: 'ocupada',
	FREE: 'libre'
}

function createDefaultStation() {
	return STATE.FREE;
}

function createDefaultTrafficLight() {
	return COLORS.GREEN;
}

function createSystem() {
	return {
		S1: createDefaultStation(),
		S2: createDefaultStation(),
		S3: createDefaultStation(),
		S4: createDefaultStation(),
		S5: createDefaultStation(),
		L1: createDefaultTrafficLight(),
		L2: createDefaultTrafficLight(),
		L3: createDefaultTrafficLight(),
		L4: createDefaultTrafficLight(),
		L5: createDefaultTrafficLight(),
		L6: createDefaultTrafficLight(),
		U1: createDefaultTrafficLight(),
		U2: createDefaultTrafficLight(),
		U3: createDefaultTrafficLight(),
		U4: createDefaultTrafficLight(),
		U5: createDefaultTrafficLight(),
		U6: createDefaultTrafficLight(),
		U7: createDefaultTrafficLight(),
		U8: createDefaultTrafficLight(),
	}
}

function createInferences(rules) {
	const inferences = {
		R1:  { if: () => rules['U1'] === COLORS.GREEN, so: () => rules['L1'] = COLORS.RED },
		R2:  { if: () => rules['U6'] === COLORS.GREEN, so: () => rules['L6'] = COLORS.RED },
		R3:  { if: () => rules['S1'] === STATE.BUSY,   so: () => rules['U2'] = COLORS.RED },
		R4:  { if: () => rules['S2'] === STATE.BUSY,   so: () => rules['L2'] = COLORS.RED },
		R5:  { if: () => rules['S3'] === STATE.BUSY,   so: () => rules['U3'] = COLORS.RED },
		R6:  { if: () => rules['S3'] === STATE.BUSY,   so: () => rules['U4'] = COLORS.RED },
		R7:  { if: () => rules['S4'] === STATE.BUSY,   so: () => rules['U5'] = COLORS.RED },
		R8:  { if: () => rules['S5'] === STATE.BUSY,   so: () => rules['L5'] = COLORS.RED },

		R9:  { if: () => (rules['U3'] === COLORS.RED && rules['L3'] === COLORS.RED) || (rules['U5'] === COLORS.RED && rules['L5'] === COLORS.RED), so: () => rules['U1'] = COLORS.RED },
		R10: { if: () => (rules['U3'] === COLORS.RED && rules['L3'] === COLORS.RED) || (rules['U5'] === COLORS.RED && rules['L5'] === COLORS.RED), so: () => rules['L1'] = COLORS.RED },
		R11: { if: () => (rules['U2'] === COLORS.RED && rules['L2'] === COLORS.RED) || (rules['U4'] === COLORS.RED && rules['L4'] === COLORS.RED), so: () => rules['U6'] = COLORS.RED },
		R12: { if: () => (rules['U2'] === COLORS.RED && rules['L2'] === COLORS.RED) || (rules['U4'] === COLORS.RED && rules['L4'] === COLORS.RED), so: () => rules['L6'] = COLORS.RED },

		R13: { if: () => rules['U2'] === COLORS.RED || rules['L2'] === COLORS.RED, so: () => rules['U7'] = COLORS.RED },
		R14: { if: () => rules['U5'] === COLORS.RED || rules['L5'] === COLORS.RED, so: () => rules['U8'] = COLORS.RED },

		R15: { if: () => rules['U3'] === COLORS.GREEN, so: () => rules['U4'] = COLORS.RED },
		R16: { if: () => rules['L3'] === COLORS.GREEN, so: () => rules['L4'] = COLORS.RED },
		R17: { if: () => rules['U2'] === COLORS.GREEN, so: () => rules['L2'] = COLORS.RED },
		R18: { if: () => rules['U3'] === COLORS.GREEN, so: () => rules['L3'] = COLORS.RED },
		R19: { if: () => rules['U4'] === COLORS.GREEN, so: () => rules['L4'] = COLORS.RED },
		R20: { if: () => rules['U5'] === COLORS.GREEN, so: () => rules['L5'] = COLORS.RED },
		R21: { if: () => rules['U1'] === COLORS.GREEN || rules['L1'] === COLORS.GREEN, so: () => rules['U7'] = COLORS.RED },
		R22: { if: () => rules['U6'] === COLORS.GREEN || rules['L6'] === COLORS.GREEN, so: () => rules['U8'] = COLORS.RED },
	}

	return {
		S1: [inferences.R3],
		S2: [inferences.R4],
		S3: [inferences.R5, inferences.R6],
		S4: [inferences.R7],
		S5: [inferences.R8],

		U1: [inferences.R1, inferences.R21],
		U6: [inferences.R2, inferences.R22],

		U2: [inferences.R11, inferences.R12, inferences.R13,inferences.R17],
		U3: [inferences.R9, inferences.R10, inferences.R15, inferences.R18],
		U4: [inferences.R11, inferences.R12, inferences.R19],
		U5: [inferences.R9, inferences.R10, inferences.R14, inferences.R20],

		L1: [inferences.R21],
		L6: [inferences.R22],

		L2: [inferences.R11, inferences.R12, inferences.R13],
		L3: [inferences.R9, inferences.R10, inferences.R16],
		L4: [inferences.R11, inferences.R12],
		L5: [inferences.R9, inferences.R10, inferences.R14],
	}
}

function computeResults(rules) {
	const results = Object.assign(createSystem(), rules);
	const inferences = createInferences(results);

	for (const key of Object.keys(results)) {
		if (!inferences[key]) continue;
		for (const inf of inferences[key]) {
			if (inf.if()) {
				inf.so();
			}
		}
	}

	for (const key of Object.keys(inferences)) {
		if (!inferences[key]) continue;
		for (const inf of inferences[key]) {
			if (inf.if()) {
				inf.so();
			}
		}
	}

	for (const key of Object.keys(rules)) {
		delete results[key];
	}

	return results;
}

function parseRules(text) {
	return text
		.split(/\n/)
		.map(rule => rule.replace(/\s/g, ''))
		.filter(rule => rule.length)
		.map(rule => {
			const [target, value] = rule.split('=');
			return { target: target.toUpperCase(), value: value };
		})
		.reduce((map, rule) => {
			map[rule.target] = rule.value;
			return map;
		}, {});
}

function displayConclusions(results) {
	for (const child of Array.from($conclusions.children)) {
		$conclusions.removeChild(child);
	}

	for (const [rule, value] of Object.entries(results)) {
		const li = document.createElement('li');
		li.textContent = `${rule} = ${value}`;
		li.classList.add("inline-block", "bg-neutral-900", "text-slate-400", "px-4", "py-2", "rounded-md", "border", "border-slate-400");
		$conclusions.appendChild(li);
	}
}

$continue.addEventListener('click', function (e) {
	e.preventDefault();

	const rules = parseRules($textarea.value);
	const results = computeResults(rules);

	displayConclusions(results);
});

