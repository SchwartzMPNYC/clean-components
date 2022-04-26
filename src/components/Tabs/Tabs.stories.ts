import { Story, Meta } from "@storybook/html";
import { booleanAttribute, optionalAttribute } from "../../storyUtils/attributeHelpers";

import Tabs from "./Tabs.component";
import Tab from "./Tab.component";
Tab;

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
	title: "Tabs",
	// More on argTypes: https://storybook.js.org/docs/html/api/argtypes
	argTypes: {
		manualActivation: {
			control: "boolean",
			defaultValue: false,
			description:
				"Determines if a child tab is automagically selected on keyboard focus. Can be toggled with boolean attribute `manual-activation` or `Tabs.manualActivation`.",
		},
		selectedIndex: {
			control: { type: "range", min: 0, max: 2, step: 1 },
			defaultValue: 1,
			description:
				"Sets the active tab. Can be toggled with attribute `selected-index` or `Tabs.selectedIndex`. 0 based.",
		},
		"Selected with Index or Attribute": {
			control: "inline-radio",
			options: ["index", "attr"],
			description:
				"**Storybook only**: used to render story using either boolean `selected` attributes or the `selected-index` attribute.",
		},
	},
	args: {
		"Selected with Index or Attribute": "index",
	},
	component: Tabs as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = [booleanAttribute("manual-activation", args.manualActivation)].join("");
	const selectedIndexOrAttribute = args["Selected with Index or Attribute"];

	const attrs = optionalAttribute("selected-index", selectedIndexOrAttribute === "index" ? args.selectedIndex : null);

	const [selected1, selected2, selected3] = new Array(3)
		.fill(null)
		.map((_, i) => booleanAttribute("selected", selectedIndexOrAttribute === "attr" && i === args.selectedIndex));

	return `
<clean-tabs${bools}${attrs}>
	<clean-tab${selected1}>Tab 1</clean-tab>
	<clean-tab${selected2}>Tab 2</clean-tab>
	<clean-tab${selected3}>Tab 3</clean-tab>
</clean-tabs>
`;
};

export const Default = Template.bind({});
