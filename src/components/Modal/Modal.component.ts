import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./Modal.template.html";
import styles from "./Modal.styles.scss";

import dialogMarkup from "./Modal.dialog.template.html";

// TODO: set focus return target as part of state?
// TODO: allow focus return target id as an attribute?
const observedAttributes = ["open"];
const stateKeys = ["open"] as const;

const enum focusRedirectElements {
	start = "start",
	end = "end",
}

const ALL_FOCUSABLE_SELECTOR =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), summary:not(:disabled)';

@define("clean-modal", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
	booleanReflect: ["open"],
})
export default class Modal extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	public static focusableQuerySelectorString = ALL_FOCUSABLE_SELECTOR;

	private static _dialogTemplateContent: DocumentFragment;

	static {
		const template = document.createElement('template');
		template.innerHTML = dialogMarkup;
		this._dialogTemplateContent = template.content;
	}

	// private _template = this.shadow.querySelector("template");
	private _backdrop = this.shadow.querySelector<HTMLDivElement>(".backdrop");

	private _closeButton: HTMLButtonElement;
	private _dialog: HTMLDivElement;

	public focusReturnTarget: HTMLElement;

	// Appears unused because it's being referenced in the template directly.
	private _redirectFocus(place: string) {
		if (place === focusRedirectElements.start) {
			const focusable = this.querySelectorAll<HTMLElement>(Modal.focusableQuerySelectorString);
			focusable[focusable.length - 1].focus();
		} else {
			this._closeButton.focus();
		}
	}

	private _findElements() {
		this._closeButton = this.shadow.querySelector("button");
		this._dialog = this.shadow.querySelector<HTMLDivElement>('[role="dialog"]');
	}

	private _escHandler = ({ key }: KeyboardEvent) => {
		if (key === "Escape") this.hide();
	};

	/**
	 * Can be used to toggle the state open and closed.
	 *
	 * If you're setting the state open then you *must* also manually set the focusReturnTarget.
	 */
	public set open(newState: boolean) {
		newState ? this.show() : this.hide();
	}

	/**
	 * Primary way to show modal.
	 * @param focusReturnTarget The HTMLElement to focus when the modal closes. Defaults to the active element.
	 */
	public show(focusReturnTarget = document.activeElement as HTMLElement) {
		if (this.state.open) return;
		this.focusReturnTarget = focusReturnTarget;
		this.state.open = true;

		this._backdrop.append(Modal._dialogTemplateContent.cloneNode(true));

		this._findElements();
		this._closeButton.addEventListener("click", () => this.hide());
		this._dialog.focus();

		document.body.addEventListener("keydown", this._escHandler);
	}

	/**
	 * Primary way to hide modal.
	 * @param focusReturnTarget The HTMLElement to focus when the modal closes. Defaults to this.focusReturnTarget.
	 */
	public hide(focusReturnTarget = this.focusReturnTarget) {
		focusReturnTarget?.focus?.();
		this.state.open = false;

		this._backdrop.replaceChildren();
		document.body.removeEventListener("keydown", this._escHandler);
	}
}
