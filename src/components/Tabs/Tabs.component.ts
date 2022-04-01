import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "./Tabs.styles.scss";
import Tab, { TabChild, TabselectedstatechangeEventDetails } from "./Tab.component";

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
	private tabs: TabChild[];
	private focusIndex = 0;

	public manualActivation = false;
	private get automaticActivation(): boolean {
		return !this.manualActivation;
	}

	set selectedIndex(newIndex: number | string) {
		const newIndexAsNumber = Number(newIndex);

		if (newIndexAsNumber !== this.state.selectedIndex) {
			this.state.selectedIndex = newIndexAsNumber;
			this.focusIndex = newIndexAsNumber;
			this.unsetSelectedTabs();
			if (newIndex !== null) {
				Tab.setTabState(this.selectedTab, true);
			}
			this.dispatch("tabselection", { tab: this.selectedTab, tabIndex: this.state.selectedIndex });
		}
	}

	get selectedTab(): TabChild {
		return this.tabs[this.selectedIndex] ?? null;
	}

	connectedCallback() {
		this.setAttribute("role", "tablist");
		this.tabs = [...this.children] as TabChild[];

		this.tabs.forEach((tab: TabChild, tabIndex: number) => {
			const preselectedState = Tab.tabPreselectedState(tab);
			// Make sure our tab is initialized for non-clean-tab tabs
			if (!(tab instanceof Tab)) Tab.initTab(tab, preselectedState);

			// If tab has a preselected attribute set it to the selected val
			if (preselectedState) {
				this.state.selectedIndex = tabIndex;
				this.focusIndex = tabIndex;
			}

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
				this.focusIndex = (this.focusIndex + 1) % this.tabs.length;
				event.preventDefault();
				break;
			case "ArrowLeft":
				this.focusIndex = this.focusIndex !== 0 ? this.focusIndex - 1 : this.tabs.length - 1;
				event.preventDefault();
				break;
			case "Home":
				this.focusIndex = 0;
				event.preventDefault();
				break;
			case "End":
				this.focusIndex = this.tabs.length - 1;
				event.preventDefault();
				break;
		}

		if (this.automaticActivation) {
			this.selectedIndex = this.focusIndex;
		}

		this.getTab(this.focusIndex).focus();
	}

	private getTab(index: number) {
		return this.tabs[index];
	}

	private unsetSelectedTabs(): void {
		this.querySelectorAll('[aria-selected="true"]').forEach((tab: TabChild) => Tab.setTabState(tab, false));
	}
}
