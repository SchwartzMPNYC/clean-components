import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "./Tab.styles.scss";

const observedAttributes = ["selected"];
const stateKeys = ["selected"] as const;

export type TabChild = HTMLElement | Tab;
export type TabselectedstatechangeEventDetails = {
	tab: TabChild;
	isAttrRemoval?: boolean;
};

@define("clean-tab", {
	styles,
	observedAttributes,
	stateKeys,
})
export default class Tab extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private static booleanReflect = ["selected"];
	public selected: boolean = this.hasAttribute("selected");

	connectedCallback() {
		Tab.initTab(this, this.selected);
	}

	attributeChangedCallback(name: string, oldVal: string, newVal: string) {
		if (this.reflecting) return;
		if (oldVal !== newVal) {
			if (name === "selected") {
				Tab.dispatchTabChangeEvent(this, newVal !== "");
			}
		}
	}

	private static dispatchTabChangeEvent(tab: TabChild, isAttrRemoval?: boolean) {
		const detail: TabselectedstatechangeEventDetails = { tab, isAttrRemoval };
		// This is static for the non-clean tab implementation so no custom dispatch function
		tab.dispatchEvent(new CustomEvent("tabselectedstatechange", { detail }));
	}

	static initTab(tab: TabChild, preselectedState: boolean): void {
		tab.setAttribute("role", "tab");
		Tab.setTabState(tab, preselectedState);
		tab.addEventListener("click", () => Tab.dispatchTabChangeEvent(tab));
		tab.addEventListener("keydown", event => {
			if (event.key === " " || event.key === "Enter") {
				event.preventDefault();
				Tab.dispatchTabChangeEvent(tab);
			}
		});

		// for use in non-library tabs
		tab.removeAttribute("clean-selected");
	}

	static tabPreselectedState(tab: TabChild): boolean {
		return (tab as Tab).selected ?? tab.hasAttribute("clean-selected");
	}

	static setTabState(tab: TabChild, selected: boolean) {
		tab.setAttribute("aria-selected", selected ? "true" : "false");
		tab.tabIndex = selected ? 0 : -1;

		if (tab instanceof Tab) tab.selected = selected;
	}
}
