import { define } from "../../../src/utils/decorators/define/Define";
import BaseCustomEl from "../../../src/components/Base/Base";
import markup from "./PlaygroundWrapper.template.html";
import styles from "./PlaygroundWrapper.styles.scss";

// import playgroundStyles from "../../playground.styles.scss";

const observedAttributes = ["component-name"];
const stateKeys = ["componentName"];

@define("playground-wrapper", { markup, styles, observedAttributes, stateKeys })
export default class PlaygroundWrapper extends BaseCustomEl {
	static playgroundSheet: CSSStyleSheet;

	get componentName(): string {
		return this.state.componentName;
	}

	set componentName(name: string) {
		this.state.componentName = name;
		document.title = `${name} - Documentation`;
	}

	attributeChangedCallback(name: string, oldVal: string, newVal: string): void {
		if (oldVal !== newVal) {
			switch (name) {
				case "component-name":
					this.componentName = newVal;
					break;
			}
		}
	}
}
