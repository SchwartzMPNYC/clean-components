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

export type BindNode<T> = T extends HTMLElement ? HTMLElement : Text;
export type BindingTypes = "text" | "attr" | "slot";

export interface BindingPoint {
	node?: BindNode<HTMLElement | Text>;
	nodes?: HTMLElement[];
}

export interface DataBinding {
	bindings: BindingPoint[];
	type?: BindingTypes;
	value?: string;
}

export interface DataBindings {
	[key: string | symbol]: DataBinding;
}

function buildBindingPoint(binding: DataBinding, node: HTMLElement | Text, type: BindingTypes, value?): DataBinding;
function buildBindingPoint(binding: DataBinding, node: HTMLElement[], type: BindingTypes, value?): DataBinding;
function buildBindingPoint(
	binding: DataBinding,
	node: HTMLElement | Text | HTMLElement[],
	type: BindingTypes,
	value?
): DataBinding {
	return Array.isArray(node)
		? { bindings: [...(binding?.bindings ?? []), { nodes: node }], type, value }
		: { bindings: [...(binding?.bindings ?? []), { node }], type, value };
}

const watchedDataGenerator = (target: HTMLElement): DataBindings => {
	return [...target.shadowRoot.querySelectorAll("clean-bind")].reduce((acc: DataBindings, el: HTMLElement) => {
		// Get the value we're supposed to be binding to.
		const binding = el.getAttribute("bind");

		// This create a text node to replace our <clean-bind>. If there's a default value, use it.
		const replacedTextNode = document.createTextNode(el.textContent);
		el.replaceWith(replacedTextNode);

		acc[binding] = buildBindingPoint(acc[binding], replacedTextNode, "text", el.textContent);

		return acc;
	}, {});
};

const watchedAttrsGenerator = (target: HTMLElement, boolean: boolean): DataBindings => {
	const selector = `[data-bind-${boolean ? "boolean-" : ""}attr]`;
	const datasetKey = boolean ? "bindBooleanAttr" : "bindAttr";

	// get each child with an attr binding
	return [...target.shadowRoot.querySelectorAll(selector)].reduce((acc: DataBindings, el: HTMLElement) => {
		// In the attr all values are space seperated
		el.dataset[datasetKey]
			.split(" ")
			.forEach(binding => (acc[binding] = buildBindingPoint(acc[binding], el, "attr")));

		delete el.dataset[datasetKey];

		return acc;
	}, {});
};

const watchedSlotsGenerator = (target: HTMLElement): DataBindings => {
	return [...target.shadowRoot.querySelectorAll("slot[data-bind]")].reduce(
		(acc: DataBindings, slot: HTMLSlotElement) => {
			// 	need to figure out slots with multiple children
			const [binding, value, nodes] = [slot.dataset.bind, slot.innerHTML, slot.assignedNodes() as HTMLElement[]];
			delete slot.dataset.bind;

			acc[binding] = buildBindingPoint(acc[binding], nodes, "slot", value);

			// Update the value of binding if slot changes (needed for default value passed in markup)
			slot.addEventListener(
				"slotchange",
				() =>
					(acc[binding].value = slot
						.assignedNodes()
						.reduce((acc, curr: HTMLElement) => (acc += curr.innerHTML), ""))
			);

			return acc;
		},
		{}
	);
};

// All binding stuff is very experimental.
const stateMachine = target => {
	const watchedData = watchedDataGenerator(target);

	// Bound slots
	const watchedSlots = watchedSlotsGenerator(target);

	// Bound attributes
	const watchedDataAttrs = watchedAttrsGenerator(target, false);
	const watchedBooleanAttrs = watchedAttrsGenerator(target, true);

	const proxy = new Proxy(target, {
		set: function (_, prop, newVal) {
			// default value for prop
			watchedData[prop] ??= { bindings: [], value: newVal };
			watchedSlots[prop] ??= { bindings: [], value: newVal };

			// set text bindings
			watchedData[prop].bindings.forEach(({ node }) => (node.textContent = newVal));
			watchedData[prop].value = newVal;

			// 	set slot text bindings
			watchedSlots[prop].bindings.forEach(({ nodes }) => {
				const [firstNode, ...otherNodes] = nodes;
				firstNode.innerHTML = newVal;
				otherNodes.forEach(n => n.remove());
			});

			// set attribute bindings
			// standard
			watchedDataAttrs[prop]?.bindings.forEach(({ node }) =>
				(node as HTMLElement).setAttribute(prop as string, newVal)
			);
			// boolean
			watchedBooleanAttrs[prop]?.bindings.forEach(({ node }) => {
				if (newVal) (node as HTMLElement).setAttribute(prop as string, "");
				else (node as HTMLElement).removeAttribute(prop as string);
			});

			target.reflecting = true;
			const transformedProp = propTransform(prop as string);
			if (target.constructor.reflect?.includes(transformedProp)) {
				target.setAttribute(transformedProp, newVal);
			}

			if (target.constructor.booleanReflect?.includes(transformedProp)) {
				if (newVal) target.setAttribute(transformedProp, "");
				else target.removeAttribute(transformedProp);
			}
			target.reflecting = false;

			return !!watchedData[prop];
		},
		get: function (_, prop) {
			return watchedData[prop]?.value ?? watchedSlots[prop]?.value ?? target.getAttribute(prop);
		},
		ownKeys: function () {
			return Object.keys(watchedData);
		},
	});

	for (const prop in watchedData) {
		// This makes sure that we're triggering our setters.
		// eslint-disable-next-line no-self-assign
		proxy[prop] = proxy[prop];
	}

	return proxy;
};

export default stateMachine;
