import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "./Tabs.styles.scss";
import Tab, { TabselectedstatechangeEventDetails } from "./Tab.component";

const observedAttributes = ["selected-index", "manual-activation"];
const stateKeys = ["selectedIndex", "manualActivation"] as const;

@define("clean-tabs", {
	styles,
	observedAttributes,
	stateKeys,
	reflect: ["selected-index"],
	booleanReflect: ["manual-activation"],
})
export default class Tabs extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private _tabs: Tab[];
	private _focusIndex = 0;
	private _initSelectionRequired = false;

	public manualActivation = false;
	private get automaticActivation(): boolean {
		return !this.manualActivation;
	}

	set selectedIndex(newIndex: number | string) {
		const newIndexAsNumber = Number(newIndex);

		if (newIndexAsNumber !== this.state.selectedIndex) {
			this.state.selectedIndex = newIndexAsNumber;
			this._focusIndex = newIndexAsNumber;

			if (this.isConnected)
				this.dispatch("tabselection", { tab: this.selectedTab, tabIndex: this.state.selectedIndex });
			else this._initSelectionRequired = true;
		}
	}

	get selectedTab(): Tab {
		return this._tabs?.[this.selectedIndex] ?? null;
	}

	connectedCallback() {
		this.setAttribute("role", "tablist");
		this._tabs = [...this.children] as Tab[];

		if (this._initSelectionRequired) {
			this._tabs[this.selectedIndex].selected = true;
			this._initSelectionRequired = false;
		}

		this._tabs.forEach((tab: Tab, tabIndex: number) => {
			// Tabs will emit this event when selected, so watch for that
			this.listen(
				tab,
				"tabselectedstatechange",
				({ detail }: CustomEvent<TabselectedstatechangeEventDetails>) => {
					this.selectedIndex = detail.isAttrRemoval ? null : tabIndex;
				}
			);
		});

		// The keyboard interactions actually take place on this element rather than the tabs
		this.listen(this, "keydown", this.handleKeypress);
	}

	private handleKeypress(event: KeyboardEvent): void {
		// Early return to support browser keyboard shortcuts
		if (event.altKey) return;

		switch (event.key) {
			case "ArrowRight":
				this._focusIndex = (this._focusIndex + 1) % this._tabs.length;
				event.preventDefault();
				break;
			case "ArrowLeft":
				this._focusIndex = this._focusIndex !== 0 ? this._focusIndex - 1 : this._tabs.length - 1;
				event.preventDefault();
				break;
			case "Home":
				this._focusIndex = 0;
				event.preventDefault();
				break;
			case "End":
				this._focusIndex = this._tabs.length - 1;
				event.preventDefault();
				break;
		}

		if (this.automaticActivation) {
			this.selectedIndex = this._focusIndex;
		}

		this.getTab(this._focusIndex).focus();
	}

	private getTab(index: number) {
		return this._tabs[index];
	}
}
