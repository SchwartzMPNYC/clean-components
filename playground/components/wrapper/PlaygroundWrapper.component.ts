import { define } from "../../../src/utils/decorators/define/Define";
import BaseCustomEl from "../../../src/components/Base/Base";
import markup from "bundle-text:./PlaygroundWrapper.template.html";
import styles from "bundle-text:./PlaygroundWrapper.styles.scss";

import playgroundStyles from "bundle-text:../../playground.styles.scss";

const observedAttributes = ["component-name"];

@define("playground-wrapper", { markup, styles, observedAttributes })
export default class PlaygroundWrapper extends BaseCustomEl {
	static playgroundSheet: CSSStyleSheet;

	get componentName(): string {
		return this.state.componentName;
	}

	set componentName(name: string) {
		this.state.componentName = name;
		document.title = `${name} - Documentation`;
	}

	connectedCallback() {
		// Add the playground styles to the page. I don't expect more than one of these to ever be used, but just being safe
		if (!PlaygroundWrapper.playgroundSheet) {
			PlaygroundWrapper.playgroundSheet = new CSSStyleSheet();

			// TODO: typing
			// @ts-expect-error
			PlaygroundWrapper.playgroundSheet.replaceSync(playgroundStyles);

			// TODO: typing
			// @ts-expect-error
			document.adoptedStyleSheets = [PlaygroundWrapper.playgroundSheet];
		}
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
