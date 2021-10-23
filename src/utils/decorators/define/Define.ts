import prepStyleSheet from "./prepStyleSheet";

interface definitionMetaData {
	markup?: string;
	styles?: string;
	observedAttributes?: string[];
}

export const define =
	(tagName: string, { markup = '<slot></slot>', styles, observedAttributes }: definitionMetaData) =>
	klass => {
		const template = document.createElement("template");
		template.innerHTML = markup;
		klass.template = template.content;

		if (styles) klass.constructedSheet = prepStyleSheet(styles);

		if (observedAttributes) klass.observedAttributes = observedAttributes;

		customElements.define(tagName, klass);
	};