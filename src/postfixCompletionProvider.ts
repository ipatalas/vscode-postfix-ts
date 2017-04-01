import * as vsc from 'vscode'
import * as ts from 'typescript'

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
	provideCompletionItems (document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
		const currentCharacter = document.getText(new vsc.Range(position.translate(0, -1), position))

		let line = document.lineAt(position.line)
		let dotIdx = line.text.lastIndexOf('.', position.character)
		let codePiece = line.text.substring(line.firstNonWhitespaceCharacterIndex, dotIdx)

		let source = ts.createSourceFile('test.ts', codePiece, ts.ScriptTarget.ES5, true)
		let statement = source.statements[0]
		let code = line.text.substr(line.firstNonWhitespaceCharacterIndex)

		console.log(code)

		if (statement.kind === ts.SyntaxKind.ExpressionStatement) {
			return [
				this.createVarCompletionItem('var', code, position),
				this.createVarCompletionItem('let', code, position),
				this.createVarCompletionItem('const', code, position)
			]
		}

		return []
	}

	createVarCompletionItem (keyword: string, text: string, position: vsc.Position) {
		let textBeforeDot = text.substr(0, text.lastIndexOf('.'))

		let item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
		item.detail = 'Postfix templates'
		item.insertText = new vsc.SnippetString(keyword + ' ${1:name} = ' + textBeforeDot)
		// since this item needs to replace entire line it's range needs to be moved backwards to the beginning of the line
		item.range = new vsc.Range(position.translate(0, -text.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		item.filterText = textBeforeDot + '.' + keyword

		return item
	}
}
