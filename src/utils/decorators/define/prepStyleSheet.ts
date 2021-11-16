const prepStyleSheet = (targetSheet) => {
	const constructedSheet = new CSSStyleSheet();

    // TODO: fix typing
    // @ts-expect-error typing - replace sync not added
	constructedSheet.replaceSync(targetSheet);

	return constructedSheet;
};

export default prepStyleSheet;