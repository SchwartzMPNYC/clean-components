import { Story, Meta } from "@storybook/html";
import { easyBools } from "../../storyUtils/attributeHelpers";
import ExpandoCard from "./ExpandoCard.component";

export default {
	title: "ExpandoCard",
	argTypes: {
		open: {
			control: "boolean",
			defaultValue: true,
			description:
				"The open state of the ExpandoCard. Can be updated by toggling `open` attribute or `ExpandoCard.open`.",
		},
		"Summary Markup": { control: "text", description: 'HTML child wrapped in a `[slot="summary"]` element.' },
		"Content Markup": {
			control: "text",
			description: `HTML children not wrapped in a \`[slot="summary"]\` element.`,
		},
	},
	args: {
		"Summary Markup": "Title about something or other",
		"Content Markup": `
		<p>I'm more information about something or other, I can go on kinda long.</p>
		<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
		<p>
			Debitis, distinctio ducimus saepe cum quidem modi optio officia sapiente consectetur facilis eos neque
			ipsa maxime ratione eaque sunt vel repellendus tempore!
		</p>`,
	},
	component: ExpandoCard as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const bools = easyBools(["open"], args);
	return `
<clean-expando-card${bools}>
	<span slot="summary">${args["Summary Markup"]}</span>
${args["Content Markup"]}
</clean-expando-card>
	`;
};

export const Default = Template.bind({});
