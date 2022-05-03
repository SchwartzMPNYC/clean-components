import { define } from "../../utils/decorators/define/Define";
import { selector } from "../../utils/decorators/selector";
import BaseCustomEl from "../Base/Base";
import markup from "./ProgressBar.template.html";
import styles from "./ProgressBar.styles.scss";

const observedAttributes = ["value", "min", "max", "value-min-text", "value-max-text", "indeterminate"];
const stateKeys = ["value", "min", "max", "valueMinText", "valueMaxText", "indeterminate"] as const;
const booleanReflect = ["indeterminate"];

const markerLineTemplate = '<div aria-hidden="true" part="progressbar marker-lines" class="marker-lines"></div>';

@define("clean-progressbar", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
	booleanReflect,
})
export default class ProgressBar extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private static _fillPercentageCssVariable = "--clean-progress-bar_completion";

	private static _markerLineTemplateContent: DocumentFragment;

	static {
		const template = document.createElement("template");
		template.innerHTML = markerLineTemplate;
		this._markerLineTemplateContent = template.content;
	}

	@selector("#progress") private _bar: HTMLDivElement;
	@selector('slot[name="marker"]') private _markerSlot: HTMLSlotElement;
	@selector("#marker-lines-wrapper") private _markerLinesWrapper: HTMLDivElement
	private _markers: Element[];

	set value(value: number | string) {
		const numberVal = Number(value);

		if (numberVal === this.value) return;

		if (isNaN(numberVal)) {
			this.removeAttribute("aria-valuenow");
		} else {
			this.state.value = numberVal;
			this.indeterminate = false;

			this._setFillPercentageVariable();
			this.setValueText();

			const stringValue = String(this.value);
			this._bar.setAttribute("aria-valuenow", stringValue);
			if (this.hasAttribute("value")) this.setAttribute("value", stringValue);
		}
	}

	get value(): number {
		return this.state.value ?? 0;
	}

	set min(min: number | string) {
		const numberMin = Number(min);

		if (numberMin === this.min) return;

		if (isNaN(numberMin)) {
			this.removeAttribute("aria-valuemin");
		} else {
			this.state.min = numberMin;

			const stringMin = String(this.min);
			this._bar.setAttribute("aria-valuemin", stringMin);
			this._setFillPercentageVariable();
			if (this.hasAttribute("min")) this.setAttribute("min", stringMin);
		}
	}

	get min(): number {
		return this.state.min ?? 0;
	}

	set max(max: number | string) {
		const numberMax = Number(max);

		if (numberMax === this.max) return;

		if (isNaN(numberMax)) {
			this.removeAttribute("aria-valuemax");
		} else {
			this.state.max = numberMax;

			const stringMax = String(this.max);
			this._bar.setAttribute("aria-valuemax", stringMax);
			this._setFillPercentageVariable();
			if (this.hasAttribute("max")) this.setAttribute("max", stringMax);
		}
	}

	get max(): number {
		return this.state.max ?? 100;
	}

	set indeterminate(indeterminate: boolean) {
		if (indeterminate === this.indeterminate) return;
		this.state.indeterminate = indeterminate;
		if (indeterminate) {
			this.value = null;
			this._setFillPercentageVariable();
			this.setValueText();
		}
	}

	get valueMinText() {
		return this.state.valueMinText ?? "Not started";
	}

	get valueMaxText() {
		return this.state.valueMaxText ?? "Completed";
	}

	private _handleMarkers = () => {
		this._markers = this._markerSlot.assignedElements();
		this.max = this._markers.length + 1;
		this.min = 0;
		this._setFillPercentageVariable();
		this.setValueText();

		this._markerLinesWrapper.replaceChildren(...this._markers.map(() => ProgressBar._markerLineTemplateContent.cloneNode(true)));
	};

	private _setFillPercentageVariable() {
		if (this.indeterminate) {
			this._bar.style.removeProperty(ProgressBar._fillPercentageCssVariable);
		} else if (this._markers?.length) {
			this._bar.style.setProperty(
				ProgressBar._fillPercentageCssVariable,
				`${Math.min(Math.max((this.value / (this.max - 1)) * 100 - 50 / this._markers.length, 0), 100)}%`
			);
		} else {
			this._bar.style.setProperty(
				ProgressBar._fillPercentageCssVariable,
				`${Math.min(Math.max(((this.value - this.min) / (this.max - this.min)) * 100, 0), 100)}%`
			);
		}
	}

	connectedCallback() {
		this.listen(this._markerSlot, "slotchange", this._handleMarkers);
		this.value ??= this.min;
	}

	setValueText(userSetText?: string) {
		if (userSetText) this._bar.setAttribute("aria-valuetext", userSetText);
		else if (this.indeterminate || !this._markers?.length) this._bar.removeAttribute("aria-valuetext");
		else if (this.value === 0) this._bar.setAttribute("aria-valuetext", this.valueMinText);
		else if (this.value === this.max) this._bar.setAttribute("aria-valuetext", this.valueMaxText);
		else this._bar.setAttribute("aria-valuetext", this._markers[this.value - 1].textContent);
	}
}
