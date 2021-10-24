import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Slider.template.html";
import styles from "./Slider.styles.scss";

@define("clean-slider", {
	markup,
	styles,
	observedAttributes: ["value", "min", "max", "step", "name"],
})
export default class CleanSlider extends BaseCustomEl {
	private rangeInput: HTMLInputElement = this.shadow.querySelector('[type="range"]');
	private numberInput: HTMLInputElement = this.shadow.querySelector('[type="number"]');

	// this makes it sprout min, max, step even if the attrs aren't set explicitly
	private static reflect = ["min", "max", "step"];

	// THIS was binding I think???  Must revert these changes and check
	// private name: string;
	public get name(): string {
		return this.state.name;
	}
	public set name(newName: string) {
		this.state.name = newName;
	}

	public get value() {
		return this.state.value;
	}
	public set value(newValue) {
		this.state.value = Number(newValue);
		// probably better to manage this explicitly like I've got commented out here, but testing using the binding for it in the template
		this.rangeInput.value = this.value;
		this.numberInput.value = this.value;
		this.updateCssVars();
	}

	public get max() {
		return this.state.max;
	}
	public set max(newValue) {
		this.state.max = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public get min() {
		return this.state.min;
	}
	public set min(newValue) {
		this.state.min = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	public get step() {
		return this.state.step;
	}
	public set step(newValue) {
		this.state.step = Number(newValue);
		this.value = Math.max(this.min, Math.min(this.value, this.max));
		this.updateCssVars();
	}

	private get offset() {
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
		this.dispatchEvent(new CustomEvent("update", { detail: { name: this.name, value: this.value } }));
	};

	attributeChangedCallback(name, oldVal, newVal) {
		if (oldVal !== newVal) {
			switch (name) {
				case "value":
				case "min":
				case "max":
				case "step":
					this[name] = Number(newVal);
					break;
				case "name":
					this.name = newVal;
			}
		}
	}

	private updateCssVars() {
		// TODO: Typing
		// @ts-expect-error
		this.shadow.host.style.setProperty("--offset", this.offset);
		// @ts-expect-error
		this.shadow.host.style.setProperty("--length", this.width);
	}
}
