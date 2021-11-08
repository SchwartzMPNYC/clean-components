import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Radio.template.html";
import styles from "./Radio.styles.scss";

const stateKeys = ["checked", "disabled", "name"] as const;

@define("clean-radio", {
	markup,
	styles,
	observedAttributes: ["checked", "disabled", "name"],
	stateKeys,
})
export default class Radio extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private static booleanReflect = ["checked", "disabled"];
	private static reflect = ["name"];

	private static radios: Radio[] = [];
	private radio: HTMLInputElement = this.shadow.querySelector("input");

	public disabled: boolean;
	public name: string;

	set checked(newChecked: boolean) {
		this.state.checked = newChecked;
		this.radio.checked = newChecked;
		if (newChecked === true) this.highlander();
	}

	public get radioGroup() {
		return Radio.radios.filter(radio => radio.name === this.name);
	}

	private get _indexInRadioGroup() {
		return this.radioGroup.findIndex(radio => radio === this);
	}

	connectedCallback() {
		this.radio.addEventListener("change", () => (this.checked = this.radio.checked));
		this.radio.addEventListener("keydown", this._handleKeydown);
		this.radio.addEventListener("focusin", this._handleFocusIn);
		Radio.radios.push(this);
	}

	disconnectedCallback() {
		Radio.radios.filter(radio => radio !== this);
	}

	// THERE CAN ONLY BE ONE!
	private highlander() {
		Radio.radios
			.filter(radio => radio !== this && radio.name === this.name && radio.checked)
			.forEach(radio => (radio.checked = false));
	}

	private _handleKeydown = ({ key }: KeyboardEvent): void => {
		switch (key) {
			case "ArrowDown":
			case "ArrowRight": {
				const radioGroup = this.radioGroup;
				radioGroup[(this._indexInRadioGroup + 1) % radioGroup.length].radio.focus();
				break;
			}
			case "ArrowUp":
			case "ArrowLeft": {
				const radioGroup = this.radioGroup;
				const indexInGroup = this._indexInRadioGroup;
				radioGroup[indexInGroup === 0 ? radioGroup.length - 1 : indexInGroup - 1].radio.focus();
				break;
			}
		}
	};

	private _handleFocusIn = ({ relatedTarget }: FocusEvent) => {
		const relatedIsRadio = relatedTarget instanceof Radio
		if (!this.checked && (!relatedIsRadio || (relatedIsRadio && !this.radioGroup.includes(relatedTarget as Radio))) )
			Radio.radios.find(radio => radio.name === this.name && radio.checked)?.radio.focus();
	};
}
