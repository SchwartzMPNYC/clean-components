export interface SelectorDecoratorOpts {
	asGetter?: boolean;
	searchNonShadow?: boolean;
	all?: boolean
}

export interface SelectorDecoratorConfig extends SelectorDecoratorOpts {
	property: string;
	selector: string;
	all: boolean
}
