import { SelectorDecoratorConfig, SelectorDecoratorOpts } from ".";

export function selector(selector: string, queryConfig: SelectorDecoratorOpts = {}): PropertyDecorator {
	return (klass: { querySelectList: SelectorDecoratorConfig[] }, property: string) => {
		klass.querySelectList ??= [];
		klass.querySelectList.push({ property, selector, all: false, ...queryConfig });

		return {};
	};
}
