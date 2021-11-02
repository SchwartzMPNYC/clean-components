import prepStyleSheet from "./prepStyleSheet";

interface definitionMetaData {
	markup?: string;
	styles?: string;
	observedAttributes?: string[];
	stateKeys?: string[];
}

export const define =
	(tagName: string, { markup = "<slot></slot>", styles, observedAttributes, stateKeys = [] }: definitionMetaData) =>
	klass => {
		const template = document.createElement("template");
		template.innerHTML = markup;
		klass.template = template.content;

		if (styles) klass.constructedSheet = prepStyleSheet(styles);

		if (observedAttributes) klass.observedAttributes = observedAttributes;

		klass.stateKeys = stateKeys;

		customElements.define(tagName, klass);
	};
