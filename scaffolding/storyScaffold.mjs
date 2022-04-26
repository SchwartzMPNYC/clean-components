const demoScaffold = (componentName) => `import { Story, Meta } from "@storybook/html";
import ${componentName} from "./${componentName}.component";

export default {
	title: "${componentName}",
	argTypes: {},
	component: ${componentName} as unknown as HTMLElement,
} as Meta;

const Template: Story = args => {
	return \`\`;
};

export const Default = Template.bind({});
`;

export default demoScaffold;