import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./ExpandoCard.template.html";
import styles from "./ExpandoCard.styles.scss";

@define("clean-expando-card", {
	markup,
	styles,
	observedAttributes: ["open"],
})
export default class ExpandoCard extends BaseCustomEl {
	private static booleanReflect = ["open"];
	private _detailsEl: HTMLDetailsElement = this.shadow.querySelector("details");
	private _contentEl: HTMLDivElement = this._detailsEl.querySelector(".details-content");

	public get summary() {
		return this.state.summary;
	}
	public set summary(newSummary) {
		this.state.summary = newSummary;
	}

	public get open() {
		return this.state.open;
	}
	public set open(newOpen) {
		this.state.open = Boolean(newOpen);
	}

	public get content() {
		return this._contentEl;
	}

	constructor() {
		super();
		this.open = this.hasAttribute("open");
	}

	connectedCallback() {
		super.connectedCallback();
		this._detailsEl.addEventListener("toggle", () => (this.open = this._detailsEl.open));
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (oldVal !== newVal && name === "open") {
			this.state.open = newVal !== null;
		}
	}
}
