import * as vsc from 'vscode'

const COMPLETION_ITEM_TITLE = 'Postfix templates'

export class CompletionItemBuilder {
	private item: vsc.CompletionItem

	constructor (private keyword: string, private code: string) {
		this.item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
		this.item.detail = COMPLETION_ITEM_TITLE
	}

	public static create = (keyword: string, code: string) => new CompletionItemBuilder(keyword, code)

	public replace = (replacement: string, position: vsc.Position, useSnippets?: boolean): CompletionItemBuilder => {
		const codeBeforeTheDot = this.code.substr(0, this.code.lastIndexOf('.'))

		if (useSnippets) {
			const escapedCode = codeBeforeTheDot.replace('$', '\\$')

			this.item.insertText = new vsc.SnippetString(replacement.replace('{{expr}}', escapedCode))
		} else {
			this.item.insertText = replacement.replace('{{expr}}', codeBeforeTheDot)
		}
		// since this item needs to replace entire line it's range needs to be extended backwards to the beginning of the line/expression
		this.item.range = new vsc.Range(position.translate(0, -this.code.length), position)
		// setting custom `range` also requires a change on `filterText` because the text is now matched on entire range
		this.item.filterText = codeBeforeTheDot + '.' + this.keyword

		return this
	}

	public description = (description: string): CompletionItemBuilder => {
		this.item.documentation = description

		return this
	}

	public build = () => this.item
}
