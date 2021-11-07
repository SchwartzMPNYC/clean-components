const classScaffold = componentName => `import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./${componentName}.template.html";
import styles from "./${componentName}.styles.scss";

const observedAttributes = [];
const stateKeys = [] as const;

@define("clean-${componentName.toLowerCase()}", {
	markup,
	styles,
	observedAttributes,
	stateKeys,
})
export default class ${componentName} extends BaseCustomEl<{ [key in typeof stateKeys[number]] }> {
	
}`;

export default classScaffold;
