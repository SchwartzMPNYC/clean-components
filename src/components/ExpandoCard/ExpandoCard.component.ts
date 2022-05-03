import { define } from "../../utils/decorators/define/Define";
import { selector } from "../../utils/decorators/selector";
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
	@listener("_syncNativeDetailsWithWrapper", "toggle")
	@selector("details")
	private _detailsEl: HTMLDetailsElement;

	@selector(".details-content") public contentEl: HTMLDivElement;
	public summary: string;
	public open = this.hasAttribute("open");

	connectedCallback() {
		this.listen(this._detailsEl, "toggle", this._syncNativeDetailsWithWrapper);
	}

	private _syncNativeDetailsWithWrapper = () => {
		this.open = this._detailsEl.open;
	};
}
