import * as vsc from 'vscode'
import * as ts from 'typescript'
import { CompletionItemBuilder } from './completionItemBuilder'

const COMPLETION_ITEM_TITLE = 'Postfix templates'

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
	provideCompletionItems (document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
		const currentCharacter = document.getText(new vsc.Range(position.translate(0, -1), position))

		let line = document.lineAt(position.line)
		let dotIdx = line.text.lastIndexOf('.', position.character)
		let codePiece = line.text.substring(line.firstNonWhitespaceCharacterIndex, dotIdx)

		let source = ts.createSourceFile('test.ts', codePiece, ts.ScriptTarget.ES5, true)
		let statement = source.statements[0]
		let code = line.text.substr(line.firstNonWhitespaceCharacterIndex)

		if (statement.kind === ts.SyntaxKind.ExpressionStatement) {
			return [
				this.createVarCompletionItem('var', code, position),
				this.createVarCompletionItem('let', code, position),
				this.createVarCompletionItem('const', code, position),
				this.createIfCompletionItem(code, position),
				this.createElseCompletionItem(code, position, statement as ts.ExpressionStatement),
				this.createIfEqualityCompletionItem('null', ts.SyntaxKind.EqualsEqualsToken, null, code, position),
				this.createIfEqualityCompletionItem('notnull', ts.SyntaxKind.ExclamationEqualsToken, null, code, position),
				this.createIfEqualityCompletionItem('undefined', ts.SyntaxKind.EqualsEqualsToken, undefined, code, position),
				this.createIfEqualityCompletionItem('notundefined', ts.SyntaxKind.ExclamationEqualsToken, undefined, code, position),
				this.createReturnCompletionItem(code, position),
				this.createForCompletionItem(code, position)
			]
		}

		return []
	}

	private createVarCompletionItem (keyword: string, text: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create(keyword, text)
			.description(`${keyword} name = expr`)
			.replace(keyword + ' ${1:name} = {{expr}}$0', position, true)
			.build()
	}

	private createReturnCompletionItem (text: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('return', text)
			.description(`return expr`)
			.replace('return {{expr}}', position)
			.build()
	}

	private createIfCompletionItem (text: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('if', text)
			.description(`if (expr)`)
			.replace(`if ({{expr}}) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}

	private createForCompletionItem (text: string, position: vsc.Position) {
		return CompletionItemBuilder
			.create('for', text)
			.description('for (let i = 0; i < expr.Length; i++)')
			.replace(`for (let \${1:i} = 0; \${1} < \${2:{{expr}}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}

	private createElseCompletionItem (text: string, position: vsc.Position, expr: ts.ExpressionStatement) {
		let replacement = '{{expr}}'
		if (expr.expression.kind === ts.SyntaxKind.BinaryExpression) {
			replacement = `(${replacement})`
		}

		return CompletionItemBuilder
			.create('else', text)
			.description(`if (!expr)`)
			.replace(`if (!${replacement}) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}

	private createIfEqualityCompletionItem (keyword: string, operator: ts.SyntaxKind.EqualsEqualsToken | ts.SyntaxKind.ExclamationEqualsToken, operand: string, code: string, position: vsc.Position) {
		const map = new Map<ts.EqualityOperator, string>([
			[ts.SyntaxKind.EqualsEqualsToken, '=='],
			[ts.SyntaxKind.ExclamationEqualsToken, '!=']
		])

		return CompletionItemBuilder
			.create(keyword, code)
			.description(`if (expr ${map.get(operator)} ${operand})`)
			.replace(`if ({{expr}} ${map.get(operator)} ${operand}) {\n${getIndentCharacters()}\${0}\n}`, position, true)
			.build()
	}
}

const getIndentCharacters = () => {
	if (vsc.window.activeTextEditor.options.insertSpaces) {
		return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
	} else {
		return '\t'
	}
}
