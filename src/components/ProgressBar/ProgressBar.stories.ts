import { Story, Meta } from "@storybook/html";
import { booleanAttribute, optionalAttribute } from "../../storyUtils/attributeHelpers";
import { styleTag } from "../../storyUtils/cssVarHelpers";
import ProgressBar from "./ProgressBar.component";

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
	title: "Progress Bar",
	// More on argTypes: https://storybook.js.org/docs/html/api/argtypes
	argTypes: {
		Name: {
			control: "text",
			description: "Provides an accessible name for the progress bar. Child markup without a `[slot]` attribute.",
		},
		value: {
			control: { type: "number" },
			description: "The fill value. Defaults to Min when not set or `null` when indeterminate.",
		},
		indeterminate: {
			control: "boolean",
			description: "To be used if progress cannot be determined somehow.",
		},
		max: {
			control: "number",
			description: "Defaults to 100 when there are no segments. Set to Segment count+1 when there are segments.",
		},
		min: {
			control: "number",
			description: "Defaults to 0.",
		},
		Segments: {
			control: "text",
			description:
				'Child elements with a `[slot="marker"] attribute. Will be used to give the progress bar segments automatically.',
		},
		Indicators: {
			control: "select",
			options: ["none", "indicators", "overlap-indicators", "overlap-indicators-descending"],
		},
		valueMinText: {
			control: "text",
			description:
				"Provide a custom value string for the 0 value when segments are in use. Defaults to `Not started`.",
		},
		valueMaxText: {
			control: "text",
			description:
				"Provide a custom value string for the max value when segments are in use. Defaults to `Completed`.",
		},
		"--clean-progress-bar_color": {
			control: "color",
			description: "CSS Variable for setting color of text in component.",
		},
		"--clean-progress-bar_complete-color": {
			control: "color",
			description: "CSS Variable for setting filled color in component.",
		},
		"--clean-progress-bar_incomplete-color": {
			control: "color",
			description: "CSS Variable for setting unfilled color in component.",
		},
		"--clean-progress-bar__marker_color": {
			control: "color",
			description: "CSS Variable for setting indicator color in component.",
		},
		"--clean-progress-bar__bar_height": {
			control: "text",
			description: "CSS Variable for setting component bar height.",
		},
	},
	args: {
		Name: "Loaded",
		indeterminate: false,
	},
	component: ProgressBar as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const { value, max, min, indeterminate, Name, Segments, valueMinText, valueMaxText, Indicators } = args;

	const style = styleTag(
		[
			"--clean-progress-bar_color",
			"--clean-progress-bar_complete-color",
			"--clean-progress-bar_incomplete-color",
			"--clean-progress-bar__marker_color",
			"--clean-progress-bar__bar_height",
		],
		args
	);

	const optionalAttrs = [
		optionalAttribute("value", indeterminate ? null : value),
		optionalAttribute("max", max),
		optionalAttribute("min", min),
		optionalAttribute("value-min-text", valueMinText),
		optionalAttribute("value-max-text", valueMaxText),
	].join("");

	const bools = [
		booleanAttribute("indeterminate", indeterminate),
		booleanAttribute(Indicators, Indicators && Indicators !== "none"),
	].join("");

	const segmentMarkup = (Segments || "")
		?.split("\n")
		.reduce((segments: string, segment: string) => (segments += `\t${segment}\n`), "");

	return `
${style}
<clean-progressbar${optionalAttrs}${bools}> 
	${Name} 
${segmentMarkup.trim() ? segmentMarkup : ""}</clean-progressbar>
`;
};

export const Default = Template.bind({});
Default.args = {
	Name: "Loaded",
	value: 50,
};

export const Segmented = Template.bind({});
Segmented.args = {
	value: 3,
	Segments: `<div slot="marker">Step 1</div>
<div slot="marker">Step 2</div>
<div slot="marker">Step 3</div>
<div slot="marker">Step 4</div>
<div slot="marker">Step 5</div>`,
	Indicators: "indicators",
};
