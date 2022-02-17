import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./ExpandoCard.template.html";
import styles from "./ExpandoCard.styles.scss";

const stateKeys = ["open", "content", "summary"] as const;

@define("clean-expando-card", {
	markup,
	styles,
	observedAttributes: ["open"],
	stateKeys,
	booleanReflect: ["open"],
})
export default class ExpandoCard extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	private _detailsEl: HTMLDetailsElement = this.shadow.querySelector("details");

	public contentEl: HTMLDivElement = this._detailsEl.querySelector(".details-content");
	public summary: string;
	public open = this.hasAttribute("open");

	connectedCallback() {
		this.listen(this._detailsEl, "toggle", this._syncNativeDetailsWithWrapper);
	}

	private _syncNativeDetailsWithWrapper = () => {
		this.open = this._detailsEl.open;
	};
}
