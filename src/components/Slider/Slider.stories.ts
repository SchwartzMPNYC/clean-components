import { Story, Meta } from "@storybook/html";
import { easyOptionals } from "../../storyUtils/attributeHelpers";
import { styleAttr } from "../../storyUtils/cssVarHelpers";
import CleanSlider from "./Slider.component";

export default {
	title: "Slider",
	argTypes: {
		Label: {
			control: "text",
			description: "Child markup for element. Will be placed in a `<label>` element, so be aware of semantics.",
		},
		value: {
			control: "number",
		},
		min: {
			control: "number",
		},
		max: {
			control: "number",
		},
		step: {
			control: "number",
		},
		"--slider-primary-color": {
			control: "color",
			description: "Color of slider channel. Set with `--slider-primary-color`.",
		},
		"--slider-thumb-color": {
			control: "color",
			description: "Color of slider thumb. Set with `--slider-thumb-color`.",
		},
	},
	args: {
		primaryColor: "#060",
		thumbColor: "#0f0",
		Label: "Some slider",
	},
	component: CleanSlider as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	const optionalAttrs = easyOptionals(["value", "min", "max", "step"], args, "\t", "\n").trimEnd();
	const style = styleAttr(["--slider-primary-color", "--slider-thumb-color"], args);

	return `
<clean-slider${style}${optionalAttrs}>
	${args.Label}
</clean-slider>
`;
};

export const Default = Template.bind({});
