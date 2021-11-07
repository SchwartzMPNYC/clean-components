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

import type BaseCustomEl from "../../components/Base/Base";

const propTransform = (prop: string) => prop.replaceAll(/[A-Z]/g, match => "-" + match.toLowerCase());

interface AttrBinding {
	point: HTMLElement | Element;
	alias?: string;
}

interface IfBinding {
	point: HTMLElement | Element;
	negate: boolean;
}

interface SlotBinding {
	point: HTMLSlotElement;
	allowNext: boolean;
}

export interface StateKey {
	textBindings: Text[];
	attrBindings: AttrBinding[];
	booleanAttrBindings: AttrBinding[];
	slotBindings: SlotBinding[];
	ifBindings: IfBinding[];
	value: unknown;
}

const stateMachine = <StateKeys>(target: BaseCustomEl<Record<string, unknown>>) => {
	const state: { [key: string | symbol]: StateKey } = {};

	const { stateKeys } = target.baseProperties;

	for (const key of stateKeys as unknown as string[]) {
		state[key] = {
			textBindings: [],
			attrBindings: [],
			booleanAttrBindings: [],
			slotBindings: [],
			ifBindings: [],
			value: null,
		};
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll("clean-bind")) {
		const key = bindPoint.getAttribute("bind");
		const replacedTextNode = document.createTextNode(bindPoint.textContent);

		if (bindPoint.textContent) state[key].value = bindPoint.textContent;
		bindPoint.replaceWith(replacedTextNode);
		state[key].textBindings.push(replacedTextNode);
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll<HTMLSlotElement>("slot[data-bind]")) {
		const key = bindPoint.dataset.bind;
		delete bindPoint.dataset.bind;
		state[key].value = bindPoint.assignedNodes();

		const point = { point: bindPoint, allowNext: true };
		state[key].slotBindings.push(point);

		bindPoint.addEventListener("slotchange", () => {
			// when we update the children ourselves, it triggers the slot change event in the next tick.
			if (point.allowNext) state[key].value = bindPoint.assignedNodes();
			point.allowNext = true;
		});
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll<HTMLElement>("[data-bind-attr]")) {
		bindPoint.dataset.bindAttr.split(" ").forEach(bind => {
			const [key, alias] = bind.split(":");
			state[key].attrBindings.push({ point: bindPoint, alias });
		});

		delete bindPoint.dataset.bindAttr;
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll<HTMLElement>("[data-bind-boolean-attr]")) {
		bindPoint.dataset.bindBooleanAttr.split(" ").forEach(bind => {
			const [key, alias] = bind.split(":");
			state[key].booleanAttrBindings.push({ point: bindPoint, alias });
		});

		delete bindPoint.dataset.bindBooleanAttr;
	}

	for (const bindPoint of target.shadowRoot.querySelectorAll<HTMLElement>("[data-if")) {
		const key = bindPoint.dataset.if;
		const negate = key[0] === "!";

		state[negate ? key.slice(1) : key].ifBindings.push({ point: bindPoint, negate });

		delete bindPoint.dataset.if;
	}

	const proxy = new Proxy(target, {
		set(_, prop: string, newVal) {
			state[prop].value = newVal;

			state[prop].textBindings.forEach((bindPoint: Text) => (bindPoint.textContent = newVal));
			state[prop].slotBindings.forEach((slotBinding: SlotBinding) => {
				slotBinding.point.assignedNodes().forEach((el: HTMLElement) => el.remove());

				if (typeof newVal === "string") slotBinding.point.replaceChildren(newVal);
				else if (newVal instanceof Array)
					slotBinding.point.replaceChildren(...[...newVal].map((node: Node) => node.cloneNode(true)));
				else slotBinding.point.replaceChildren(newVal.cloneNode());

				slotBinding.allowNext = false;
			});

			state[prop].attrBindings.forEach(({ point, alias }: AttrBinding) => {
				if (newVal !== null) point.setAttribute(alias ?? prop, newVal);
				else point.removeAttribute(alias ?? prop);
			});
			state[prop].booleanAttrBindings.forEach(({ point, alias }: AttrBinding) => {
				if (newVal) point.setAttribute(alias ?? prop, "");
				else point.removeAttribute(alias ?? prop);
			});

			const transformedProp = propTransform(prop);
			target.reflecting = true;
			if (target.baseProperties.reflect?.includes(transformedProp)) target.setAttribute(prop, newVal);

			if (target.baseProperties.booleanReflect?.includes(transformedProp)) {
				if (newVal) target.setAttribute(transformedProp, "");
				else target.removeAttribute(transformedProp);
			}
			target.reflecting = false;

			state[prop].ifBindings.forEach(({ point, negate }) => {
				if ((newVal && !negate) || (!newVal && negate)) {
					// might wanna see if I can find a better way to not render than just hiding.
					point.removeAttribute("hidden");
				} else {
					point.setAttribute("hidden", "");
				}
			});

			return !!state[prop];
		},
		get(_, prop) {
			return state[prop].value;
		},
		ownKeys() {
			return Reflect.ownKeys(state);
		},
	});

	return proxy as unknown as StateKeys;
};

export default stateMachine;
