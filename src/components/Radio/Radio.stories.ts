import { Story, Meta } from "@storybook/html";
import { booleanAttribute } from "../../storyUtils/attributeHelpers";
import Radio from "./Radio.component";

export default {
	title: "Radio",
	argTypes: {
		"Checked Index": {
			control: { type: "number", min: 0, max: 2 },
			description: "**Storybook only:** Index of element to put `checked` boolean attribute on.",
		},
		name: {
			control: "text",
			description: "Used to group multiple radios for selection logic.",
		},
	},
	args: {
		"Checked Index": 1,
		name: "storybook-radios",
	},
	component: Radio as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const [checked1, checked2, checked3] = new Array(3)
		.fill(null)
		.map((_, i) => booleanAttribute("checked", i === args["Checked Index"]));

	return `
<fieldset style="display: flex; gap: .5rem;">
	<legend>Radio group</legend>
	<clean-radio name="${args.name}"${checked1}>Radio 1</clean-radio>
	<clean-radio name="${args.name}"${checked2}>Radio 2</clean-radio>
	<clean-radio name="${args.name}"${checked3}>Radio 3</clean-radio>
</fieldset>
`;
};

export const Default = Template.bind({});
