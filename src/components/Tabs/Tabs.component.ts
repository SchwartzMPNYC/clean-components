import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "bundle-text:./Tabs.styles.scss";
import Tab, { TabChild, TabselectedstatechangeEventDetails } from "./Tab.component";

const observedAttributes = ["selected-index", "manual-activation"];

@define("clean-tabs", {
	styles,
	observedAttributes,
})
export default class Tabs extends BaseCustomEl {
	private static reflect = ["selected-index"];
	private static booleanReflect = ["manual-activation"];

	get manualActivation(): boolean {
		return this.state.manualActivation ?? false;
	}
	set manualActivation(newManualActivation: boolean) {
		this.state.manualActivation = newManualActivation;
	}

	get #automaticActivation(): boolean {
		return !this.manualActivation;
	}

	#tabs: TabChild[];
	get selectedIndex(): number {
		return this.state.selectedIndex;
	}
	set selectedIndex(newIndex: number | string) {
		const newIndexAsNumber = Number(newIndex);

		if (newIndexAsNumber !== this.state.selectedIndex) {
			this.state.selectedIndex = newIndexAsNumber;
			this.#focusIndex = newIndexAsNumber;
			this.#unsetSelectedTabs();
			if (newIndex !== null) {
				Tab.setTabState(this.selectedTab, true);
			}
			this.#dispatchTabChange(this.selectedTab, this.state.selectedIndex);
		}
	}

	#focusIndex = 0;

	get selectedTab(): TabChild {
		return this.#tabs[this.selectedIndex] ?? null;
	}

	connectedCallback() {
		this.setAttribute("role", "tablist");
		this.#tabs = [...this.children] as TabChild[];

		this.#tabs.forEach((tab: TabChild, tabIndex: number) => {
			const preselectedState = Tab.tabPreselectedState(tab);
			// Make sure our tab is initialized for non-clean-tab tabs
			if (!(tab instanceof Tab)) Tab.initTab(tab, preselectedState);

			// If tab has a preselected attribute set it to the selected val
			if (preselectedState) {
				this.state.selectedIndex = tabIndex;
				this.#focusIndex = tabIndex;
			}

			// Tabs will emit this event when selected, so watch for that
			tab.addEventListener(
				"tabselectedstatechange",
				({ detail }: CustomEvent<TabselectedstatechangeEventDetails>) => {
					this.selectedIndex = detail.isAttrRemoval ? null : tabIndex;
				}
			);
		});

		// The keyboard interactions actually take place on this element rather than the tabs
		this.addEventListener("keydown", this.#handleKeypress);

		super._initState();
	}

	attributeChangedCallback(name: string, oldVal: string, newVal: string) {
		if (this.reflecting) return;
		if (newVal === oldVal) return;

		switch (name) {
			case "selected-index":
				this.selectedIndex = newVal;
				break;

			case "manual-activation":
				this.manualActivation = newVal !== null;
		}
	}

	#handleKeypress({ key }: KeyboardEvent): void {
		switch (key) {
			case "ArrowRight":
				this.#focusIndex = (this.#focusIndex + 1) % this.#tabs.length;
				break;
			case "ArrowLeft":
				this.#focusIndex = this.#focusIndex !== 0 ? this.#focusIndex - 1 : this.#tabs.length - 1;
				break;
			case "Home":
				this.#focusIndex = 0;
				break;
			case "End":
				this.#focusIndex = this.#tabs.length - 1;
				break;
		}

		if (this.#automaticActivation) {
			this.selectedIndex = this.#focusIndex;
		}

		this.#getTab(this.#focusIndex).focus();
	}

	#getTab(index: number) {
		return this.#tabs[index];
	}

	#unsetSelectedTabs(): void {
		this.querySelectorAll('[aria-selected="true"]').forEach((tab: TabChild) => Tab.setTabState(tab, false));
	}

	#dispatchTabChange(tab: TabChild, tabIndex: number): void {
		this.dispatchEvent(new CustomEvent("tabselection", { detail: { tab, tabIndex } }));
	}
}
