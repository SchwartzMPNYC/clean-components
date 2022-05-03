import { define } from "../../utils/decorators/define/Define";
import { selector } from "../../utils/decorators/selector";
import BaseCustomEl from "../Base/Base";
import markup from "./Slider.template.html";
import styles from "./Slider.styles.scss";

const stateKeys = ["value", "min", "max", "step"] as const;

@define("clean-slider", {
	markup,
	styles,
	observedAttributes: ["value", "min", "max", "step"],
	stateKeys,
	reflect: ["min", "max", "step"],
})
export default class CleanSlider extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	@selector('[type="range"]') private rangeInput: HTMLInputElement;
	@selector('[type="number"]') private numberInput: HTMLInputElement;

	public set value(newValue: number) {
		this.state.value = Number(newValue);
		// I really don't wanna do a type conversion if the browser will do it implicitly.
		this.rangeInput.value = this.value as unknown as string;
		this.numberInput.value = this.value as unknown as string;
		this.updateCssVars();
	}

	public set max(newValue: number) {
		this.state.max = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public set min(newValue: number) {
		this.state.min = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public set step(newValue: number) {
		this.state.step = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	private get offset(): `${number}%` {
		return `${((this.value - this.min) / (this.max - this.min)) * 100}%`;
	}

	private get width() {
		return String(this.value).length;
	}

	constructor() {
		super();
		this.max = 255;
		this.min = 0;
		this.step = 1;
		this.value = this.min;
	}

	connectedCallback() {
		this.listen(this.rangeInput, "input", this._handleInput);
		this.listen(this.numberInput, "input", this._handleInput);
	}

	private _handleInput = event => {
		this.value = Math.min(Math.max(event.target.value, this.min), this.max);
		this.dispatch("update", { slider: this, value: this.value });
	};

	private updateCssVars() {
		this.shadow.host.style.setProperty("--offset", this.offset);
		this.shadow.host.style.setProperty("--length", String(this.width));
	}
}
