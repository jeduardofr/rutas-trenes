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

const DIR = {
	LEFT: 'izquierda',
	RIGHT: 'derecha'
}

const roads = {
	R1: [{ x: 40, y: 80 }, { x: 120, y: 80 }],
	R2: [{ x: 40, y: 240 }, { x: 120, y: 240 }],

	R3: [{ x: 200, y: 160 }, { x: 280, y: 160 }],

	R4: [{ x: 360, y: 80 }, { x: 440, y: 80 }],
	R5: [{ x: 360, y: 240 }, { x: 440, y: 240 }],

	R6: [{ x: 520, y: 160 }, { x: 600, y: 160 }],

	R7: [{ x: 680, y: 80 }, { x: 760, y: 80 }],
	R8: [{ x: 680, y: 240 }, { x: 760, y: 240 }],
}

const roadConnections = {
	RC1: [{ x: 120, y: 80 }, { x: 200, y: 160 }],
	RC2: [{ x: 120, y: 240 }, { x: 200, y: 160 }],

	RC3: [{ x: 280, y: 160 }, { x: 360, y: 80 }],
	RC4: [{ x: 280, y: 160 }, { x: 360, y: 240 }],

	RC5: [{ x: 440, y: 80 }, { x: 520, y: 160 }],
	RC6: [{ x: 440, y: 240 }, { x: 520, y: 160 }],

	RC7: [{ x: 600, y: 160 }, { x: 680, y: 80 }],
	RC8: [{ x: 600, y: 160 }, { x: 680, y: 240 }],
}

const coordsByRule = {
	S1: { x: 60, y: 70 },
	S2: { x: 60, y: 230 },
	S3: { x: 380, y: 70 },
	S4: { x: 700, y: 70 },
	S5: { x: 700, y: 230 },

	U1: { x: 110, y: 70, dir: DIR.RIGHT },
	U2: { x: 210, y: 150, dir: DIR.LEFT },
	U3: { x: 270, y: 150, dir: DIR.RIGHT },
	U4: { x: 530, y: 150, dir: DIR.LEFT },
	U5: { x: 590, y: 150, dir: DIR.RIGHT },
	U6: { x: 690, y: 70, dir: DIR.LEFT },
	U7: { x: 370, y: 70, dir: DIR.LEFT },
	U8: { x: 430, y: 70, dir: DIR.RIGHT },

	L1: { x: 110, y: 250, dir: DIR.RIGHT },
	L2: { x: 210, y: 170, dir: DIR.LEFT },
	L3: { x: 270, y: 170, dir: DIR.RIGHT },
	L4: { x: 530, y: 170, dir: DIR.LEFT },
	L5: { x: 590, y: 170, dir: DIR.RIGHT },
	L6: { x: 690, y: 250, dir: DIR.LEFT },
}

let resultsToRender = {};

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
		const div = document.createElement('div');
		div.textContent = `${rule} = ${value}`;
		div.classList.add("inline-block", "bg-neutral-900", "text-slate-400", "px-4", "py-2", "rounded-md", "border", "border-slate-400");

		li.appendChild(div);
		$conclusions.appendChild(li);
	}
}

$continue.addEventListener('click', function (e) {
	e.preventDefault();

	const rules = parseRules($textarea.value);
	const results = computeResults(rules);

	displayConclusions(results);
	resultsToRender = { ...rules, ...results };
	console.warn(resultsToRender);
});

function diagram(ctx) {
	ctx.setup = function() {
		ctx.createCanvas(800, 300);
		ctx.background(255);
		ctx.textSize(12);
	}

	ctx.draw = function() {
		ctx.background(255);

		let solution = [];
		if (Object.keys(resultsToRender).length) {
			solution = ['R1', 'R3', 'R5', 'R6', 'R7', 'RC1', 'RC4', 'RC6', 'RC7'];
		}

		for (const [rule, road] of Object.entries(roads)) {
			const [start, end] = road;
			ctx.stroke(0);
			if (solution.includes(rule)) ctx.stroke(194, 232, 18);
			ctx.line(start.x, start.y, end.x, end.y);
			ctx.stroke(0);
		}

		ctx.strokeWeight(2);
		for (const [rule, road] of Object.entries(roadConnections)) {
			const [start, end] = road;
			ctx.stroke(0);
			if (solution.includes(rule)) ctx.stroke(194, 232, 18);
			ctx.line(start.x, start.y, end.x, end.y);
			ctx.stroke(0);
		}

		ctx.strokeWeight(1);
		ctx.fill(255);
		for (const [rule, value] of Object.entries(resultsToRender)) {
			if (rule in coordsByRule) {
				switch (true) {
					case rule.startsWith('S'): {
						ctx.fill(255);
						const coords = coordsByRule[rule];
						if (value === STATE.BUSY) ctx.fill(0, 0, 255);
						ctx.rect(coords.x, coords.y, 40, 20);

						ctx.fill(0);
						if (value === STATE.BUSY) ctx.fill(255);
						ctx.text(rule, coords.x + 15, coords.y + 15);
						ctx.fill(0);
					} break;
					case rule.startsWith('U') || rule.startsWith('L'): {
						ctx.fill(255);
						const coords = coordsByRule[rule];
						if (value === COLORS.GREEN) ctx.fill(0, 255, 0);
						else ctx.fill(255, 0, 0);
						ctx.circle(coords.x, coords.y, 10);

						ctx.fill(0);
						if (rule.startsWith('U')) {
							ctx.text(rule, coords.x, coords.y - 10);
							ctx.line(coords.x, coords.y - 25, coords.x + 10, coords.y - 25);
							if (coords.dir === DIR.RIGHT) {
								ctx.line(coords.x + 5, coords.y - 30, coords.x + 10, coords.y - 25);
								ctx.line(coords.x + 5, coords.y - 20, coords.x + 10, coords.y - 25);
							} else {
								ctx.line(coords.x, coords.y - 25, coords.x + 5, coords.y - 30);
								ctx.line(coords.x, coords.y - 25, coords.x + 5, coords.y - 20);
							}
						} else {
							ctx.text(rule, coords.x, coords.y + 20);
							ctx.line(coords.x, coords.y + 25, coords.x + 10, coords.y + 25);
							if (coords.dir === DIR.RIGHT) {
								ctx.line(coords.x + 5, coords.y + 30, coords.x + 10, coords.y + 25);
								ctx.line(coords.x + 5, coords.y + 20, coords.x + 10, coords.y + 25);
							} else {
								ctx.line(coords.x, coords.y + 25, coords.x + 5, coords.y + 30);
								ctx.line(coords.x, coords.y + 25, coords.x + 5, coords.y + 20);
							}
						}
					} break;
				}
			}
		}
	}
}

new p5(diagram, 'diagram');

