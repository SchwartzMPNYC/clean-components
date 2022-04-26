import { optionalContent } from "./optionalContent";

export const styleAttr = (cssVarNames: string[], args: Record<string, string>) =>
	optionalContent` style="${cssVarNames
		.map(cssVar => (args[cssVar] ? ` ${cssVar}: ${args[cssVar]};` : ""))
		.join("")
		.trim()}"`;

export const styleTag = (cssVarNames: string[], args: Record<string, string>) =>
	optionalContent`
<style>
	:root {
		${cssVarNames
			.map(cssVar => (args[cssVar] ? ` ${cssVar}: ${args[cssVar]};` : ""))
			.join("\n\t\t")
			.trimEnd()}
	}
</style>`;
