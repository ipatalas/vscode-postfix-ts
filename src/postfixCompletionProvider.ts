import * as vsc from 'vscode'
import * as ts from 'typescript'

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
				this.createReturnCompletionItem(code, position)
			]
		}

		return []
	}

	private createVarCompletionItem (keyword: string, text: string, position: vsc.Position) {
		let textBeforeDot = text.substr(0, text.lastIndexOf('.'))

		let item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
		item.detail = COMPLETION_ITEM_TITLE
		item.insertText = new vsc.SnippetString(keyword + ' ${1:name} = ' + textBeforeDot)
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -text.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = textBeforeDot + '.' + keyword

		return item
	}

	private createReturnCompletionItem (text: string, position: vsc.Position) {
		let textBeforeDot = text.substr(0, text.lastIndexOf('.'))

		let item = new vsc.CompletionItem('return', vsc.CompletionItemKind.Snippet)
		item.detail = COMPLETION_ITEM_TITLE
		item.insertText = 'return ' + textBeforeDot
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -text.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = textBeforeDot + '.return'

		return item
	}

	private createIfCompletionItem (text: string, position: vsc.Position) {
		let textBeforeDot = text.substr(0, text.lastIndexOf('.'))

		let item = new vsc.CompletionItem('if', vsc.CompletionItemKind.Snippet)
		item.detail = COMPLETION_ITEM_TITLE
		item.insertText = new vsc.SnippetString(`if (${textBeforeDot}) {\n${getIndentCharacters()}\${0}\n}`)
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -text.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = textBeforeDot + '.if'

		return item
	}

	private createElseCompletionItem (text: string, position: vsc.Position, expr: ts.ExpressionStatement) {
		let textBeforeDot = text.substr(0, text.lastIndexOf('.'))
		let replacement = textBeforeDot
		if (expr.expression.kind === ts.SyntaxKind.BinaryExpression) {
			replacement = `(${replacement})`
		}

		let item = new vsc.CompletionItem('else', vsc.CompletionItemKind.Snippet)
		item.detail = COMPLETION_ITEM_TITLE
		item.insertText = new vsc.SnippetString(`if (!${replacement}) {\n${getIndentCharacters()}\${0}\n}`)
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -text.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = textBeforeDot + '.else'

		return item
	}

	private createIfEqualityCompletionItem (keyword: string, operator: ts.SyntaxKind.EqualsEqualsToken | ts.SyntaxKind.ExclamationEqualsToken, operand: string, code: string, position: vsc.Position) {
		let codeBeforeDot = code.substr(0, code.lastIndexOf('.'))

		const map = new Map<ts.EqualityOperator, string>([
			[ts.SyntaxKind.EqualsEqualsToken, '=='],
			[ts.SyntaxKind.ExclamationEqualsToken, '!=']
		])

		let item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
		item.detail = COMPLETION_ITEM_TITLE
		item.insertText = new vsc.SnippetString(`if (${codeBeforeDot} ${map.get(operator)} ${operand}) {\n${getIndentCharacters()}\${0}\n}`)
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -code.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = codeBeforeDot + '.' + keyword

		return item
	}
}

const getIndentCharacters = () => {
	if (vsc.window.activeTextEditor.options.insertSpaces) {
		return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
	} else {
		return '\t'
	}
}
