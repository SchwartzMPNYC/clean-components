import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import styles from "./Tab.styles.scss";

const observedAttributes = ["selected"];

export type TabChild = HTMLElement | Tab;
export type TabselectedstatechangeEventDetails = {
	tab: TabChild;
	isAttrRemoval?: boolean;
};

@define("clean-tab", {
	styles,
	observedAttributes,
})
export default class Tab extends BaseCustomEl {
	private static booleanReflect = ["selected"];

	public get selected(): boolean {
		return this.state.selected;
	}
	public set selected(newSelected: boolean) {
		if (newSelected !== this.state.selected) {
			this.state.selected = newSelected;
		}
	}

	connectedCallback() {
		this.selected = this.hasAttribute("selected");
		Tab.initTab(this, this.selected);

		super._initState();
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

	static tabPreselectedState(tab): boolean {
		return (tab as Tab).selected ?? tab.hasAttribute("clean-selected");
	}

	static setTabState(tab: TabChild, selected: boolean) {
		tab.ariaSelected = selected ? "true" : "false";
		tab.tabIndex = selected ? 0 : -1;

		if (tab instanceof Tab) tab.selected = selected;
	}
}
