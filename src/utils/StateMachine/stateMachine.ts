// TODO: move into own entity
const frameWorkPipes = {
	toUpperCase: (string: string) => string.toUpperCase(),
	toSentenceCase: (string: string) => string[0].toUpperCase() + string.slice(1),
	reverse: (string: string) => [...string].reverse().join(""),
	spongeBobMocking: (string: string) =>
		[...string].reduce(
			(acc, curr, index) =>
				(acc += index % 2 === 1 ? curr.toUpperCase() : curr.toLowerCase()),
			""
		)
};

const propTransform = (prop: string) => 
	prop.replaceAll(/[A-Z]/g, match => '-' + match.toLowerCase());

// All binding stuff is very experimental.
const stateMachine = (target) => {
	const pipeGenerator = (el) =>
		el
			.getAttribute("pipes")
			?.split("|")
			.reduceRight(
				(composed, curr) => (...args) => composed(frameWorkPipes[curr](...args)),
				(...args) => args
			);

	// Bound text nodes & state management
	const watchedData = [...target.shadow.querySelectorAll("clean-bind")].reduce(
		(acc, el) => {
			const binding = el.getAttribute("bind");

			const node = document.createTextNode(el.textContent);
			el.replaceWith(node);

			acc[binding] = {
				bindings: [
					...(acc[binding]?.bindings ?? []),
					{ node, pipes: pipeGenerator(el) }
				],
				type: "text",
				value: null
			};
			return acc;
		},
		{}
	);

	// Bound slots
	const watchedSlots = [
		...target.shadow.querySelectorAll("slot[data-bind]")
	].reduce((acc, slot) => {
		// 			need to figure out slots with multiple children
		const [binding, value, nodes] = [
			slot.dataset.bind,
			slot.textContent,
			slot.assignedNodes()
		];
		delete slot.dataset.bind;

		acc[binding] = {
			bindings: [
				...(acc[binding]?.bindings ?? []),
				{ nodes, pipes: pipeGenerator(slot) }
			],
			type: "slot",
			value
		};

		// Update the value of binding if slot changes (needed for default value passed in markup)
		slot.addEventListener(
			"slotchange",
			() =>
				(acc[binding].value = slot
					.assignedNodes()
					.reduce((acc, curr) => (acc += curr.textContent), ""))
		);

		return acc;
	}, {});

	// Bound attributes
	const watchedDataAttrs = [
		// get all ELs with the bind target
		...target.shadow.querySelectorAll("[data-bind-attr]")
	].reduce((acc, el) => {
		// attributes to bind are space seperated, process each one individually
		el.dataset.bindAttr.split(" ").forEach(
			(bindAttr) =>
				(acc[bindAttr] = {
					bindings: [...(acc[bindAttr]?.bindings ?? []), el],
					type: "attr"
				})
		);

		delete el.dataset.bindAttr;

		return acc;
	}, {});
	const watchedBooleanAttrs = [
		// get all ELs with the bind target
		...target.shadow.querySelectorAll("[data-bind-boolean-attr]")
	].reduce((acc, el) => {
		// attributes to bind are space seperated, process each one individually
		el.dataset.bindBooleanAttr.split(" ").forEach(
			(bindAttr) =>
				(acc[bindAttr] = {
					bindings: [...(acc[bindAttr]?.bindings ?? []), el],
					type: "attr"
				})
		);

		delete el.dataset.bindBooleanAttr;

		return acc;
	}, {});

	const proxy = new Proxy(target, {
		set: function (_, prop, newVal) {
			// default value for prop
			watchedData[prop] ??= { bindings: [], value: newVal };
			watchedSlots[prop] ??= { bindings: [], value: newVal };

			// set text bindings
			watchedData[prop].bindings.forEach(
				({ node, pipes }) => (node.textContent = pipes?.(newVal) ?? newVal)
			);
			watchedData[prop].value = newVal;

			// 	set slot text bindings
			watchedSlots[prop].bindings.forEach(({ nodes, pipes }) => {
				// node.textContent = pipes?.(newVal) ?? newVal;
				const [firstNode, ...otherNodes] = nodes;
				firstNode.textContent = newVal;
				otherNodes.forEach((n) => n.remove());
			});

			// set attribute bindings
			// standard
			watchedDataAttrs[prop]?.bindings.forEach((node) =>
				node.setAttribute(prop, newVal)
			);
			// boolean
			watchedBooleanAttrs[prop]?.bindings.forEach((node) => {
				if (newVal) node.setAttribute(prop, "");
				else node.removeAttribute(prop);
			});

			target.reflecting = true;
			if (target.constructor.reflect?.includes(prop)) {
				target.setAttribute(prop, newVal);
			}

			if (target.constructor.booleanReflect?.includes(prop)) {
				if (newVal) target.setAttribute(prop, "");
				else target.removeAttribute(prop);
			}
			target.reflecting = false;

			return !!watchedData[prop];
		},
		get: function (_, prop) {
			return (
				watchedData[prop]?.value ??
				watchedSlots[prop]?.value ??
				target.getAttribute(prop)
			);
		},
		ownKeys: function () {
			return Object.keys(watchedData);
		}
	});

	for (const prop in watchedData) {
		proxy[prop] = proxy[prop];
	}

	return proxy;
};

export default stateMachine;