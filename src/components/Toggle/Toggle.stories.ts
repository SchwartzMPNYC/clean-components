import { Story, Meta } from "@storybook/html";
import { easyBools } from "../../storyUtils/attributeHelpers";
import Toggle from "./Toggle.component";

export default {
	title: "Toggle",
	argTypes: {
		pressed: {
			control: "boolean",
		},
		mixed: {
			control: "boolean",
		},
		column: {
			control: "boolean",
		},
		reversed: {
			control: "boolean",
		},
		vertical: {
			control: "boolean",
		},
		"Label Text": {
			control: "text",
			description: "Child markup used to label the toggle.",
		},
	},
	args: {
		pressed: false,
		mixed: false,
		column: false,
		reversed: false,
		vertical: false,
		"Label Text": "Lights",
	},
	component: Toggle as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = easyBools(["pressed", "mixed", "column", "reversed", "vertical"], args);

	return `
	<clean-toggle${bools}>${args["Label Text"]}</clean-toggle>`;
};

export const Default = Template.bind({});
