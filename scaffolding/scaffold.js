import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { argv, exit } from "process";

import classScaffold from "./classScaffold.mjs";
import styleScaffold from "./stylesScaffold.mjs";
import demoScaffold from "./demoScaffold.mjs";

const componentName = argv[2];

if (componentName == null) {
	console.log('Please pass me a component name, like "Radio"');
	exit();
}

if (argv.slice(2).includes("--help")) {
	console.log(
		"I'll create a scaffolding for a clean component, with basic component.ts, template.html, styles.scss, and template.demo files."
	);
	console.log("Just pass me a component name and I'll do my magic.");
	console.log("You can also use -- --force if the directory already exists, and I'll get rid of anything in my way.");
	exit();
}

const folder = `src/components/${componentName}`;

if (argv.slice(2).includes("--force")) {
	console.log("Used force. Will blow away files if need");
} else if (existsSync(folder)) {
	console.log(
		`Folder ${folder} already exists. Please get rid of it and try again, or if you're sure run with -- --force.`
	);
	exit();
}

const files = [
	{ suffix: "component.ts", scaffold: classScaffold(componentName) },
	{ suffix: "template.html", scaffold: "<slot></slot>" },
	{ suffix: "styles.scss", scaffold: styleScaffold },
	{ suffix: "demo.html", scaffold: demoScaffold(componentName) },
];

console.log(`creating folder for ${componentName}`);
mkdir(folder, { recursive: true }).catch(console.error);

for (const { suffix, scaffold } of files) {
	const fileName = `${folder}/${componentName}.${suffix}`;
	writeFile(fileName, scaffold)
		.then(() => console.log(`created ${fileName} with default content.`))
		.catch(console.error);
}
