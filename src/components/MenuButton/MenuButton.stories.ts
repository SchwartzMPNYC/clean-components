import { Story, Meta } from "@storybook/html";
import { easyBools } from "../../storyUtils/attributeHelpers";
import { styleTag } from "../../storyUtils/cssVarHelpers";
import MenuButton from "./MenuButton.component";

export default {
	title: "Menu Button",
	argTypes: {
		expanded: {
			control: "boolean",
		},
		split: {
			disabled: true,
		},
		"open-up": {
			control: "boolean",
		},
		"Trigger Button Markup": {
			control: "text",
			description: "Child markup used in the trigger button.",
		},
		"Options Markup": {
			control: "text",
			description: 'Child markup used for the menu options. Must be wrapped in a [slot="list-items"] element.',
		},
		"--menu-color": {
			control: "color",
		},
		"--menu-bg-color": {
			control: "color",
		},
		"--menu-button_list-item--highlighted_color": {
			control: "color",
		},
		"--menu-button_list-item--highlighted_bg-color": {
			control: "color",
		},
		"--menu-button__default-borders": {
			control: "text",
		},
		"--menu-button__toggle_border": {
			control: "text",
		},
		"--menu-button__list_border": {
			control: "text",
		},
		"--menu-button__list-item_internal-border": {
			control: "text",
		},
	},
	args: {
		expanded: false,
		"open-up": false,
		"Trigger Button Markup": "Menu",
		"Options Markup": `
		<span>A</span>
		<span>Really</span>
		<span>Cool</span>
		<span>List of items</span>
		<button class="func-programatic-add" onclick="alert('This function stays in place.')">
			I'm an actual button
		</button>
		<a href="#">I'm an actual link</a>
	`,
	},
	component: MenuButton as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = easyBools(["expanded", "open-up", "split"], args);
	const style = styleTag(
		[
			"--menu-color",
			"--menu-bg-color",
			"--menu-button_list-item--highlighted_color",
			"--menu-button_list-item--highlighted_bg-color",
			"--menu-button__default-borders",
			"--menu-button__toggle_border",
			"--menu-button__list_border",
			"--menu-button__list-item_internal-border",
		],
		args
	);

	const splitBtn = args.split ? `<button slot="split-button-main">Split button</button>\n` : "";

	return `
${style}
<clean-menu-button${bools}>
	${splitBtn}
	${args["Trigger Button Markup"]}
	<slot slot="list-items">${args["Options Markup"]}</slot>
</clean-menu-button>`;
};

export const Default = Template.bind({});

export const Split = Template.bind({});
Split.args = {
	split: true,
	"Trigger Button Markup": `
	<span id="split-button-menu-name" hidden>Additional items</span>
	<span aria-labelledby="split-button-main split-button-menu-name">▼</span>`,
};
