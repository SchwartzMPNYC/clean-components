import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Slider.template.html";
import styles from "./Slider.styles.scss";

@define("clean-slider", {
	markup,
	styles,
	observedAttributes: ["value", "min", "max", "step", "label"],
})
export default class CleanSlider extends BaseCustomEl {
	private rangeInput: HTMLInputElement = this.shadow.querySelector('[type="range"]');
	private numberInput: HTMLInputElement = this.shadow.querySelector('[type="number"]');

	// this makes it sprout min, max, step even if the attrs aren't set explicitly
	private static reflect = ["min", "max", "step"];

	// THIS was binding I think???  Must revert these changes and check
	// private name: string;
	public get label(): string {
		return this.state.label;
	}
	public set label(newLabel: string) {
		this.state.label = newLabel;
	}

	public get value(): number {
		return this.state.value;
	}
	public set value(newValue: number | string) {
		this.state.value = Number(newValue);
		// I really don't wanna do a type conversion if the browser will do it implicitly.
		this.rangeInput.value = this.value as unknown as string;
		this.numberInput.value = this.value as unknown as string;
		this.updateCssVars();
	}

	public get max(): number {
		return this.state.max;
	}
	public set max(newValue: number | string) {
		this.state.max = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public get min(): number {
		return this.state.min;
	}
	public set min(newValue: number | string) {
		this.state.min = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public get step(): number {
		return this.state.step;
	}
	public set step(newValue: number | string) {
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
		this.rangeInput.addEventListener("input", this._handleInput);
		this.numberInput.addEventListener("input", this._handleInput);

		super._initState();
	}

	disconnectedCallback() {
		this.rangeInput.removeEventListener("input", this._handleInput);
		this.numberInput.removeEventListener("input", this._handleInput);
	}

	private _handleInput = event => {
		this.value = Math.min(Math.max(event.target.value, this.min), this.max);
		this.dispatchEvent(new CustomEvent("update", { detail: { slider: this, value: this.value } }));
	};

	private updateCssVars() {
		// TODO: Typing
		// @ts-expect-error
		this.shadow.host.style.setProperty("--offset", this.offset);
		// @ts-expect-error
		this.shadow.host.style.setProperty("--length", this.width);
	}
}
