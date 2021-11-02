import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./ExpandoCard.template.html";
import styles from "./ExpandoCard.styles.scss";

@define("clean-expando-card", {
	markup,
	styles,
	observedAttributes: ["open"],
	stateKeys: ["open", "content", "summary"],
})
export default class ExpandoCard extends BaseCustomEl {
	private static booleanReflect = ["open"];
	private _detailsEl: HTMLDetailsElement = this.shadow.querySelector("details");

	public contentEl: HTMLDivElement = this._detailsEl.querySelector(".details-content");
	public summary: string;
	public open = this.hasAttribute("open");

	connectedCallback() {
		this._detailsEl.addEventListener("toggle", () => (this.open = this._detailsEl.open));
	}
}
