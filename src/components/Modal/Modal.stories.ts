import { Story, Meta } from "@storybook/html";
import { easyBools } from "../../storyUtils/attributeHelpers";
import { optionalContent } from "../../storyUtils/optionalContent";
import Modal from "./Modal.component";
import { styleAttr } from "../../storyUtils/cssVarHelpers";

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
	title: "Modal",
	// More on argTypes: https://storybook.js.org/docs/html/api/argtypes
	argTypes: {
		open: {
			control: "boolean",
		},
		"Title Markup": {
			control: "text",
			description: `HTML children wrapped in a \`[slot="title"]\` element.`,
		},
		"Content Markup": {
			control: "text",
			description: `HTML children wrapped in a \`[slot="content"]\` element.`,
		},
		"Close Button Content Markup": {
			control: "text",
			description: `HTML children wrapped in a \`[slot="close"]\` element.`,
		},
		"--dialog-bg-color": {
			control: "color",
			description: "CSS variable for background color of dialog. Defaults to `--light`.",
		},
		"--dialog-backdrop-bg-color": {
			control: "color",
			description: "CSS variable for background color of dialog backdrop. Defaults to `#fffb`.",
		},
	},
	parameters: {
		docs: {
			// Opt-out of inline rendering
			inlineStories: true,
		},
	},
	args: {
		open: false,
		"Content Markup": `Whatever markup you want as your content.`,
	},
	component: Modal as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = easyBools(["open"], args);
	const style = styleAttr(["--dialog-bg-color", "--dialog-backdrop-bg-color"], args);

	return `
<clean-modal${bools}${style}>${optionalContent`
	<span slot="title">
		${args["Title Markup"]}
	</span>`}${optionalContent`
	<span slot="close">
		${args["Close Button Content Markup"]}
	</span>`}${optionalContent`
	<div slot="content">
		${args["Content Markup"]}
	</div>`}
</clean-modal>`;
};

export const Default = Template.bind({});
Default.args = {};
