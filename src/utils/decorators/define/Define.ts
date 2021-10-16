import prepStyleSheet from "./prepStyleSheet";

interface definitionMetaData {
	markup: string;
	styles?: string;
	observedAttributes?: string[];
}

const define =
	(tagName: string, { markup, styles, observedAttributes }: definitionMetaData) =>
	klass => {
		const template = document.createElement("template");
		template.innerHTML = markup;
		klass.template = template.content;

		if (styles) klass.constructedSheet = prepStyleSheet(styles);

		klass.observedAttributes = observedAttributes;

		customElements.define(tagName, klass);
	};

export default define;
