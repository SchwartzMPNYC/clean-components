import prepStyleSheet from "./prepStyleSheet";

interface StaticCleanProperties {
	observedAttributes?: string[];
	reflect?: string[];
	booleanReflect?: string[];
	stateKeys?: { [index: number]: string };
}

interface definitionMetaData extends StaticCleanProperties {
	markup?: string;
	styles?: string;
}

export const define =
	(
		tagName: `${string}-${string}`,
		{ markup = "<slot></slot>", styles, observedAttributes, stateKeys, reflect, booleanReflect }: definitionMetaData
	) =>
	(
		klass: CustomElementConstructor &
			StaticCleanProperties & {
				template?: DocumentFragment;
				constructedSheet?: CSSStyleSheet;
			}
	) => {
		const template = document.createElement("template");
		template.innerHTML = markup;
		klass.template = template.content;

		if (styles) klass.constructedSheet = prepStyleSheet(styles);
		if (observedAttributes) klass.observedAttributes = observedAttributes;
		if (stateKeys) klass.stateKeys = stateKeys;
		if (reflect) klass.reflect = reflect;
		if (booleanReflect) klass.booleanReflect = booleanReflect;

		customElements.define(tagName, klass);
	};
