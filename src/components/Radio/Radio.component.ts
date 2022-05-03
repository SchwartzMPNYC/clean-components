import { define } from "../../utils/decorators/define/Define";
import { selector } from "../../utils/decorators/selector";
import BaseCustomEl from "../Base/Base";
import markup from "./Radio.template.html";
import styles from "./Radio.styles.scss";

const stateKeys = ["checked", "disabled", "name", "labelContent"] as const;

@define("clean-radio", {
	markup,
	styles,
	observedAttributes: ["checked", "disabled", "name"],
	stateKeys,
	booleanReflect: ["checked", "disabled"],
	reflect: ["name"],
})
export default class Radio extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private static radios: Radio[] = [];
	@selector("input") private radio: HTMLInputElement;

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
		this.listen(this.radio, "change", this._syncFromNativeRadio);
		this.listen(this.radio, "keydown", this._handleKeydown);
		this.listen(this.radio, "focusin", this._handleFocusIn);
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

	private _syncFromNativeRadio = () => {
		this.checked = this.radio.checked;
	};

	private _handleKeydown = ({ key }: KeyboardEvent): void => {
		switch (key) {
			case "ArrowDown":
			case "ArrowRight": {
				const radioGroup = this.radioGroup;
				const newRadio = radioGroup[(this._indexInRadioGroup + 1) % radioGroup.length];
				newRadio.radio.focus();
				newRadio.checked = true;
				break;
			}
			case "ArrowUp":
			case "ArrowLeft": {
				const radioGroup = this.radioGroup;
				const indexInGroup = this._indexInRadioGroup;
				const newRadio = radioGroup[indexInGroup === 0 ? radioGroup.length - 1 : indexInGroup - 1];
				newRadio.radio.focus();
				newRadio.checked = true;
				break;
			}
		}
	};

	private _handleFocusIn = ({ relatedTarget }: FocusEvent) => {
		const relatedIsRadio = relatedTarget instanceof Radio;
		if (!this.checked && (!relatedIsRadio || (relatedIsRadio && !this.radioGroup.includes(relatedTarget))))
			Radio.radios.find(radio => radio.name === this.name && radio.checked)?.radio.focus();
	};
}
