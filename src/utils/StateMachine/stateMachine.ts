// TODO: move into own entity
// const frameWorkPipes = {
// 	toUpperCase: (string: string) => string.toUpperCase(),
// 	toSentenceCase: (string: string) => string[0].toUpperCase() + string.slice(1),
// 	reverse: (string: string) => [...string].reverse().join(""),
// 	spongeBobMocking: (string: string) =>
// 		[...string].reduce(
// 			(acc, curr, index) => (acc += index % 2 === 1 ? curr.toUpperCase() : curr.toLowerCase()),
// 			""
// 		),
// };

// const pipeGenerator = (el: HTMLElement) =>
// 	el
// 		.getAttribute("pipes")
// 		?.split("|")
// 		.reduceRight(
// 			(composed: (any) => any , curr: string) =>
// 				(...args) => composed(frameWorkPipes[curr](...args)),
// 			(...args) => args
// 		);

const propTransform = (prop: string) => prop.replaceAll(/[A-Z]/g, match => "-" + match.toLowerCase());

const stateMachine = target => {
	const state = {};

	for (const key of target.constructor.stateKeys) {
		state[key] = {
			textBindings: [],
			attrBindings: [],
			booleanAttrBindings: [],
			slotBindings: [],
			value: null,
		};
	}

	for (const bindPoint of (target as HTMLElement).shadowRoot.querySelectorAll("clean-bind")) {
		const key = bindPoint.getAttribute("bind");
		const replacedTextNode = document.createTextNode(bindPoint.textContent);

		if (bindPoint.textContent) state[key].value = bindPoint.textContent;
		bindPoint.replaceWith(replacedTextNode);
		state[key].textBindings.push(replacedTextNode);
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll("slot[data-bind]") as HTMLSlotElement[]) {
		const key = bindPoint.dataset.bind;
		delete bindPoint.dataset.bind;

		state[key].value = bindPoint.assignedNodes();
		state[key].slotBindings.push(bindPoint);

		bindPoint.addEventListener("slotchange", () => {
			state[key].value = bindPoint.assignedNodes();
		});
	}

	for (const bindPoint of (target as HTMLElement).shadowRoot.querySelectorAll("[data-bind-attr]")) {
		(bindPoint as HTMLElement).dataset.bindAttr.split(" ").forEach(key => {
			state[key].attrBindings.push(bindPoint);
		});

		delete (bindPoint as HTMLElement).dataset.bindAttr;
	}

	for (const bindPoint of (target as HTMLElement).shadowRoot.querySelectorAll("[data-bind-boolean-attr]")) {
		(bindPoint as HTMLElement).dataset.bindBooleanAttr.split(" ").forEach(key => {
			state[key].booleanAttrBindings.push(bindPoint);
		});

		delete (bindPoint as HTMLElement).dataset.bindBooleanAttr;
	}

	const proxy = new Proxy(target, {
		set(_, prop: string, newVal) {
			state[prop].value = newVal;

			state[prop].textBindings.forEach((bindPoint: Text) => (bindPoint.textContent = newVal));
			state[prop].slotBindings.forEach((bindpoint: HTMLSlotElement) => {
				bindpoint.innerHTML = newVal;
				bindpoint.assignedNodes().forEach((el: HTMLElement) => el.remove());
			});
			state[prop].attrBindings.forEach((bindPoint: HTMLElement) => bindPoint.setAttribute(prop, newVal));
			state[prop].booleanAttrBindings.forEach((bindPoint: HTMLElement) => {
				if (newVal) bindPoint.setAttribute(prop, "");
				else bindPoint.removeAttribute(prop);
			});

			const transformedProp = propTransform(prop);
			target.reflecting = true;
			if (target.constructor.reflect?.includes(transformedProp)) target.setAttribute(prop, newVal);

			if (target.constructor.booleanReflect?.includes(transformedProp)) {
				if (newVal) target.setAttribute(transformedProp, "");
				else target.removeAttribute(transformedProp);
			}
			target.reflecting = false;

			return !!state[prop];
		},
		get(_, prop) {
			return state[prop].value;
		},
		ownKeys() {
			return Reflect.ownKeys(state);
		},
	});

	return proxy;
};

export default stateMachine;
