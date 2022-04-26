export const optionalContent = ([start, end]: TemplateStringsArray, content: unknown): string => {
	if (content) {
		return start + content + end;
	}

	return "";
};
