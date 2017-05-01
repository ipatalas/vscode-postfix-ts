import * as ts from 'typescript'
import * as vsc from 'vscode'
export const getIndentCharacters = () => {
	if (vsc.window.activeTextEditor.options.insertSpaces) {
		return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
	} else {
		return '\t'
	}
}

const operatorMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>([
	[ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken],
	[ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken],
	[ts.SyntaxKind.GreaterThanEqualsToken, ts.SyntaxKind.LessThanToken],
	[ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.LessThanEqualsToken]
])

const reverseMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>()
operatorMapping.forEach((v, k) => reverseMapping.set(v, k))

const logicalOperatorMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>([
	[ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken],
	[ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken]
])

export const invertBinaryExpression = (expr: ts.BinaryExpression, addOrBrackets: boolean = false): string => {
	let op = operatorMapping.get(expr.operatorToken.kind) || reverseMapping.get(expr.operatorToken.kind)
	if (op) {
		return `${expr.left.getText()} ${ts.tokenToString(op)} ${expr.right.getText()}`
	}

	op = logicalOperatorMapping.get(expr.operatorToken.kind)
	if (op) {
		let left = invertExpression(expr.left, op !== ts.SyntaxKind.BarBarToken)
		let right = invertExpression(expr.right, op !== ts.SyntaxKind.BarBarToken)
		let result = `${left} ${ts.tokenToString(op)} ${right}`

		return addOrBrackets && op === ts.SyntaxKind.BarBarToken ? `(${result})` : result
	}
}

const invertExpression = (expr: ts.Expression, addOrBrackets: boolean) => {
	if (expr.kind === ts.SyntaxKind.BinaryExpression) {
		return invertBinaryExpression(expr as ts.BinaryExpression, addOrBrackets)
	}

	let text = expr.getText()
	return text.startsWith('!') ? text.substr(1) : `!${text}`
}
