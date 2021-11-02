const demoScaffold = (componentName) => `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<script src="../../../playground/components/wrapper/PlaygroundWrapper.component.ts" type="module"></script>
		<link rel="stylesheet" href="../../../playground/playground.scss">
	</head>
	<body>
		<playground-wrapper component-name="${componentName}">
			<script src="./${componentName}.component.ts" type="module"></script>
		</playground-wrapper>
	</body>
</html>`;

export default demoScaffold;