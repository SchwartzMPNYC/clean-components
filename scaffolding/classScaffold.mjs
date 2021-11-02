const classScaffold = componentName => `import { define } from "../../utils/decorators/define/Define";
import BaseCustomEl from "../Base/Base";
import markup from "./${componentName}.template.html";
import styles from "./${componentName}.styles.scss";

@define("clean-${componentName.toLowerCase()}", {
	markup,
	styles,
	observedAttributes: [],
})
export default class ${componentName} extends BaseCustomEl {
	
}`;

export default classScaffold;
