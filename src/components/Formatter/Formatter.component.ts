import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Formatter.template.html";

const observedAttributes = [];
const stateKeys = [] as const;

@define("clean-formatter", {
	markup,
	observedAttributes,
	stateKeys,
})
export default class Formatter extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	static _slots: HTMLTemplateElement[] = [];
	static get slots() {
		return Formatter._slots;
	}
	static set slots(newSlots) {
		Formatter._slots = newSlots;
		document.querySelectorAll<Formatter>("clean-formatter").forEach(formatter => formatter._updateContent());
	}

	private _slot = this.shadow.querySelector("slot");
	// this lets us keep track keep track of multiple slots to prevent formatting from clearing them.
	private _allowNextChildSlotUpdate = new Map();

	get templateIndex() {
		return Number(this.getAttribute("template") ?? 0);
	}

	connectedCallback() {
		this._slot.addEventListener("slotchange", this._updateSlot);
		if (Formatter.slots.length) this._updateContent();

		this.shadow.addEventListener("slotchange", this._format);
	}

	// This whole damn thing could probably be skipped if FireFox wasn't the only browser to support
	// the `onslotchange` attribute...
	// Will probably want to include some more formatting options.
	private _format = ({ target: slot }: HTMLElementEvent<HTMLSlotElement, Event>) => {
		if (slot !== this._slot) {
			if (this._allowNextChildSlotUpdate.get(slot)) {
				let textContent: string = null;
				if (slot.dataset.pattern) {
					textContent = [...slot.assignedNodes()].reduce((a, c) => a + c.textContent, "");

					const formatter = new RegExp(slot.dataset.pattern);

					textContent = formatter.exec(textContent)[0];
				}

				if (slot.dataset.numberFormatterLocation) {
					textContent &&= [...slot.assignedNodes()].reduce((a, c) => a + c.textContent, "");

					const formatterOpts: Intl.NumberFormatOptions = {};
					if (slot.dataset.numberFormatterCurrency) {
						formatterOpts.currency = slot.dataset.numberFormatterCurrency;
						formatterOpts.style = "currency";
					}

					formatterOpts.maximumFractionDigits = slot.dataset.numberFormatterMaxFraction as unknown as number;
					formatterOpts.minimumFractionDigits = slot.dataset.numberFormatterMinFraction as unknown as number;
					formatterOpts.minimumIntegerDigits = slot.dataset.numberFormatterMinInteger as unknown as number;

					textContent = new Intl.NumberFormat(slot.dataset.numberFormatterLocation, formatterOpts).format(
						Number(textContent ?? [...slot.assignedNodes()].reduce((a, c) => a + c.textContent, ""))
					);
				}

				if (textContent) {
					const assignedElements = slot.assignedElements();

					if (assignedElements.length) assignedElements[0].textContent = textContent;
					else this.textContent = textContent;

					this._allowNextChildSlotUpdate.set(slot, false);
				}
			} else this._allowNextChildSlotUpdate.set(slot, true);
		}
	};

	private _updateSlot = () => {
		Formatter.slots = this._slot.assignedElements() as HTMLTemplateElement[];
		this._updateContent();
	};

	private _updateContent = () => {
		this.shadow.append(
			document.importNode((Formatter.slots[this.templateIndex]).content, true)
		);

		this.shadow.querySelectorAll("slot").forEach(slot => this._allowNextChildSlotUpdate.set(slot, true));
	};
}
