declare module "*.template.html" {
	const markup: string;
	export default markup;
}

declare module "*.styles.scss" {
	const styles: string;
	export default styles;
}

type HTMLElementEvent<ElType extends HTMLElement, EvType extends Event> = EvType & { target: ElType };
