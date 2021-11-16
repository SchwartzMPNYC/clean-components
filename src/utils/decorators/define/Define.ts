import prepStyleSheet from "./prepStyleSheet";

interface definitionMetaData {
	markup?: string;
	styles?: string;
	observedAttributes?: string[];
	stateKeys?: { [index: number]: string };
}

export const define =
	(
		tagName: `clean-${string}`,
		{ markup = "<slot></slot>", styles, observedAttributes, stateKeys = [] }: definitionMetaData
	) =>
	(
		klass: CustomElementConstructor & {
			template?: DocumentFragment;
			constructedSheet?: CSSStyleSheet;
			observedAttributes?: string[];
			stateKeys?: { [index: number]: string };
		}
	) => {
		const template = document.createElement("template");
		template.innerHTML = markup;
		klass.template = template.content;

		if (styles) klass.constructedSheet = prepStyleSheet(styles);

		if (observedAttributes) klass.observedAttributes = observedAttributes;

		klass.stateKeys = stateKeys;

		customElements.define(tagName, klass);
	};
