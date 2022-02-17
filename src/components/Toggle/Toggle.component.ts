import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Toggle.template.html";
import styles from "./Toggle.styles.scss";

const observedAttributes = ["pressed"];
const stateKeys = ["pressed", "role"] as const;

@define("clean-toggle", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
	reflect: ["tabindex", "role"],
})
export default class Toggle extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	public tabIndex = 0;
	public role = "button";

	set pressed(newPressed: "true" | "false" | "mixed") {
		this.state.pressed = newPressed;
		this.setAttribute("aria-pressed", newPressed);
	}

	constructor() {
		super();
		this.pressed = "mixed";
	}

	connectedCallback() {
		this.listen(this, "click", this._togglePressed);
		this.listen(this, "keydown", this._handleKeyDown);
	}

	private _handleKeyDown(event: HTMLElementEvent<Toggle, KeyboardEvent>) {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			this._toggle();
		}
	}

	private _toggle() {
		this.pressed === "true" ? (this.pressed = "false") : (this.pressed = "true");
	}
}
