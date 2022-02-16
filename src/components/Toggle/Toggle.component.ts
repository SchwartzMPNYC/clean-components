import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Toggle.template.html";
import styles from "./Toggle.styles.scss";

const observedAttributes = ["pressed", "mixed"];
const stateKeys = ["pressed", "mixed", "role"] as const;

@define("clean-toggle", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
	reflect: ["tabindex", "role"],
	booleanReflect: ["pressed", "mixed"],
})
export default class Toggle extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	public tabIndex = 0;
	public role = "button";
	private _inited = false;

	set pressed(pressed: boolean) {
		if (this.state.pressed === pressed) return;
		this.state.pressed = pressed;
		this.state.mixed = false;
		this._visiblyToggle();
	}

	set mixed(mixed: boolean) {
		if (this.state.mixed === mixed) return;
		this.state.mixed = mixed;
		if (mixed) this.state.pressed = false;
		this._visiblyToggle();
	}

	constructor() {
		super();
		this.pressed ??= false;
		this.mixed ??= false;
	}

	connectedCallback() {
		this.listen(this, "click", this._togglePressed);
		this.listen(this, "keydown", this._handleKeyDown);
		this._inited = true;
	}

	private _visiblyToggle() {
		// prettier-ignore
		const state: "true" | "false" | "mixed" = this.mixed 
			? "mixed" 
			: this.pressed 
				? "true" 
				: "false";

		this.setAttribute("aria-pressed", state);
	}

	private _handleKeyDown(event: HTMLElementEvent<Toggle, KeyboardEvent>) {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			this._togglePressed();
		}
	}

	private _togglePressed() {
		this.pressed = !this.pressed;
		this.dispatch("clean-toggle-change", { pressed: this.pressed, mixed: this.mixed });
	}
}
