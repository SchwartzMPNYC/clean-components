export const optionalAttribute = (attributeName: string, value: unknown, frontSpacer = " ", endSpacer = "") =>
	value != null ? `${frontSpacer}${attributeName}="${value}"${endSpacer}` : "";

export const easyOptionals = (attributesList: string[], args: Record<string, boolean>, frontSpacer = " ", endSpacer = "") =>
	attributesList.map(bool => optionalAttribute(bool, args[bool], frontSpacer, endSpacer)).join("");


export const booleanAttribute = (attributeName: string, present: boolean, frontSpacer = " ", endSpacer = "") =>
	present ? `${frontSpacer}${attributeName}${endSpacer}` : "";

export const easyBools = (attributesList: string[], args: Record<string, boolean>) =>
	attributesList.map(bool => booleanAttribute(bool, args[bool])).join("");
