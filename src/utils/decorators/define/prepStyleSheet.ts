const prepStyleSheet = (targetSheet) => {
	const constructedSheet = new CSSStyleSheet();

    // @ts-expect-error
    // TODO: fix typing
	constructedSheet.replaceSync(targetSheet);

	return constructedSheet;
};

export default prepStyleSheet;