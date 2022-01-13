import stateMachine from "../../utils/StateMachine/stateMachine";

export interface BaseProps<StateKeysLiteral> {
	reflect?: string[];
	booleanReflect?: string[];
	observedAttributes?: string[];
	template: Node;
	constructedSheet: CSSStyleSheet;
	stateKeys: StateKeysLiteral;
}

export interface FullShadowRoot extends ShadowRoot {
	adoptedStyleSheets: CSSStyleSheet[];
	host: HTMLElement;
}

// TODO: This should probably go with propsTransformer
const attrTransform = (attr: string): string => attr.replaceAll(/-([a-z])/g, match => match[1].toUpperCase());

export default abstract class BaseCustomEl<StateKeys extends Record<string, unknown>> extends HTMLElement {
	protected state: StateKeys;
	protected shadow: FullShadowRoot;

	public reflecting = false;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" }) as FullShadowRoot;
		this.shadow.append(document.importNode(this.baseProperties.template, true));

		if (this.baseProperties.constructedSheet)
			this.shadow.adoptedStyleSheets = [this.baseProperties.constructedSheet];

		this.state = stateMachine<StateKeys>(this);
		this._initState();
	}

	get baseProperties(): BaseProps<StateKeys> {
		return (({ reflect, booleanReflect, observedAttributes, template, constructedSheet, stateKeys }) => ({
			reflect,
			booleanReflect,
			observedAttributes,
			template,
			constructedSheet,
			stateKeys,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}))(this.constructor as any);
	}

	protected dispatch(eventName: string, detail: unknown, bubbles = false, cancelable = true, composed = false): boolean {
		return this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles, composed, cancelable }));
	}

	protected _initState() {
		const prototype = Reflect.getPrototypeOf(this);

		for (const key of Reflect.ownKeys(this.state as StateKeys)) {
			const {
				get = function () {
					return this.state[key];
				},
				set = function (newVal) {
					this.state[key] = newVal;
				},
			} = Reflect.getOwnPropertyDescriptor(prototype, key) ?? {};

			Reflect.defineProperty(prototype, key, { get, set });
		}
	}

	// By splitting these out, if a consumer needs to overwrite the attributeChangedCallback because
	// they need to support some special functionality, but still want to be able to use one or both
	// standard functionalities for attrs they can call this function in their component.
	protected handleBooleanAttrChanged = (attr: string, transformedAttr: string, newVal: string): boolean => {
		if (this.baseProperties.booleanReflect?.includes(attr)) {
			this[transformedAttr] = newVal !== null;
			return true;
		} else {
			return false;
		}
	};

	protected handleAttrChanged = (attr: string, transformedAttr: string, newVal: string): boolean => {
		if (this.baseProperties.observedAttributes?.includes(attr)) {
			this[transformedAttr] = newVal;
			return true;
		} else {
			return false;
		}
	};

	attributeChangedCallback(name: string, oldVal: string, newVal: string) {
		if (this.reflecting && oldVal === newVal) return;
		const transformedAttr = attrTransform(name);

		// This lets me easily run through these until I get to the first one that returns true then stops.
		switch (true) {
			case this.handleBooleanAttrChanged(name, transformedAttr, newVal):
				// TODO: I think that I don't actually *need* these NOOPs, but that the switch case is getting optomized out without them.
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {};
				// console.log(name, newVal);
				break;
			case this.handleAttrChanged(name, transformedAttr, newVal):
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {};
				// console.log(name, newVal);
				break;
		}
	}
}
