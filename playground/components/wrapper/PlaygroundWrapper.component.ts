import { define } from "../../../src/utils/decorators/define/Define";
import BaseCustomEl from "../../../src/components/Base/Base";
import markup from "./PlaygroundWrapper.template.html";
import styles from "./PlaygroundWrapper.styles.scss";

// import playgroundStyles from "../../playground.styles.scss";

const observedAttributes = ["component-name"];
const stateKeys = ["componentName"] as const;

@define("playground-wrapper", { markup, styles, observedAttributes, stateKeys })
export default class PlaygroundWrapper extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	static playgroundSheet: CSSStyleSheet;

	set componentName(name: string) {
		this.state.componentName = name;
		document.title = `${name} - Documentation`;
	}
}
