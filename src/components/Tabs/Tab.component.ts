import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "./Tab.styles.scss";

const observedAttributes = ["selected"];
const stateKeys = ["selected"] as const;

export type TabselectedstatechangeEventDetails = {
	tab: Tab;
	isAttrRemoval?: boolean;
};

@define("clean-tab", {
	styles,
	observedAttributes,
	stateKeys,
	booleanReflect: ["selected"],
})
export default class Tab extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private _selected: boolean = this._initSelectionState();

	get selected(): boolean {
		return this._selected;
	}

	set selected(selected: boolean) {
		this.setAttribute("aria-selected", selected ? "true" : "false");
		this.tabIndex = selected ? 0 : -1;
		this._selected = selected;
	}

	connectedCallback() {
		this.setAttribute("role", "tab");
		this.selected = this._selected;

		this.listen(this.parentElement, "tabselection", this._listenToParent);
		this.listen(this, "click", this._handleClick);
		this.listen(this, "keydown", this._handleKeydown);
	}

	attributeChangedCallback(name: string, oldVal: string, newVal: string) {
		if (this.reflecting) return;
		if (oldVal !== newVal) {
			if (name === "selected") {
				this._dispatchTabChangeEvent(newVal !== "");
			}
		}
	}

	private _initSelectionState(): boolean {
		const parentElSelectedIndex = this.parentElement.getAttribute('selected-index');

		if (parentElSelectedIndex) {
			this.removeAttribute('selected');
			return this === this.parentElement.children[Number(parentElSelectedIndex)];
		} else {
			return this.hasAttribute("selected");
		}
	}

	private _listenToParent = ({ detail: { tab } }) => {
		this.selected = tab === this;
	};

	private _handleClick = () => {
		this._dispatchTabChangeEvent();
	};

	private _handleKeydown = (event: KeyboardEvent) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			this._dispatchTabChangeEvent();
		}
	};

	private _dispatchTabChangeEvent(isAttrRemoval?: boolean) {
		this.dispatch("tabselectedstatechange", { tab: this, isAttrRemoval } as TabselectedstatechangeEventDetails);
	}
}
