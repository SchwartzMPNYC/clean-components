import { Story, Meta } from "@storybook/html";
import { booleanAttribute, easyBools, optionalAttribute } from "../../storyUtils/attributeHelpers";
import Tooltip from "./Tooltip.component";

export default {
	title: "Tooltip",
	argTypes: {
		open: {
			// control: "boolean",
			// defaultValue: false,
			description:
				"The open state of the Tool tip. Can be updated by toggling `Toolip.open` or using the `Tooltip.show()`/`Tooltip.hide()` functions.",
		},
		clickable: {
			control: "boolean",
			defaultValue: false,
			description:
				"Set the tooltip to only open/close on click (ie, a toggletip). Can be set with the boolean attribute `clickable` or by setting `Toolip.clickable`.",
		},
		Position: {
			control: "multi-select",
			options: ["block-start", "block-end", "inline-start", "inline-end"],
			description: `Set of boolean attributes for setting positioning:
			\`block-start\`,\`block-end\`,\`inline-start\`,\`inline-end\`.
			Not setting a value defaults it to center for that axis.
			\`block-*\` and \`inline-*\` can be combined.`,
		},
		delay: {
			control: "number",
			description: "Hundreds of milliseconds to delay opening/closing the tooltip. Defaults to 3 if unset.",
		},
		labelling: {
			control: "boolean",
			defaultValue: false,
			description: "Sets the `aria-labelledby` value for the trigger button to be the content of the tooltip.",
		},
		"Trigger Markup": {
			control: "text",
			description: 'HTML child wrapped in a `[slot="trigger-content"]` element.',
		},
		"Content Markup": {
			control: "text",
			description: `HTML children wrapped in a \`[slot="content"]\` element.`,
		},
	},
	args: {
		"Trigger Markup": "Title about something or other",
		"Content Markup": `An element who's content will be displayed on mouseover or focus, and should usually be associated with the trigger with aria.`,
	},
	component: Tooltip as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = [
		easyBools(["clickable", "labelling"], args),
		(args.Position ?? []).map(position => booleanAttribute(position, true)).join(" "),
	].join("");

	return `
<clean-tooltip${bools}${optionalAttribute("delay", args.delay)}>
	<span slot="trigger-content">${args["Trigger Markup"]}</span>
	<span slot="content">
		${args["Content Markup"]}
	</span>
</clean-tooltip>
`;
};

export const Default = Template.bind({});
