import stateMachine from "../../utils/StateMachine/stateMachine";

class BaseCustomEl extends HTMLElement {
	protected state;
	protected shadow: ShadowRoot;
	protected template;
	protected reflecting = false;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
		// @ts-expect-error
		// TODO: typing fun
		this.shadow.append(document.importNode(this.constructor.template, true));

		// @ts-expect-error
		// TODO: update types
		if (this.constructor.constructedSheet)
			// @ts-expect-error
			this.shadow.adoptedStyleSheets = [this.constructor.constructedSheet];

		this.state = stateMachine(this);
	}

	connectedCallback() {
		this._initState();
	}

	protected _initState() {
		Object.entries(this.state).forEach(([key, value]) => (this.state[key] = value ?? this[key]));
	}
}

export default BaseCustomEl;
