import * as vsc from 'vscode'
import * as ts from 'typescript'
import * as glob from 'glob'
import * as path from 'path'
import { CompletionItemBuilder } from './completionItemBuilder'
import { IPostfixTemplate } from './template'
import { build } from './templates/varTemplates'

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
	private templates: IPostfixTemplate[] = []
	constructor () {
		let files = glob.sync('./templates/*.js', { cwd: __dirname })
		files.forEach(path => {
			let builder: () => IPostfixTemplate | IPostfixTemplate[] = require(path).build
			if (builder) {
				let tpls = builder()
				if (Array.isArray(tpls)) {
					this.templates.push(...tpls)
				} else {
					this.templates.push(tpls)
				}
			}
		})
	}

	provideCompletionItems (document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
		const currentCharacter = document.getText(new vsc.Range(position.translate(0, -1), position))

		let line = document.lineAt(position.line)
		let dotIdx = line.text.lastIndexOf('.', position.character)
		let codePiece = line.text.substring(line.firstNonWhitespaceCharacterIndex, dotIdx)

		let source = ts.createSourceFile('test.ts', codePiece, ts.ScriptTarget.ES5, true)
		let statement = source.statements[0]
		let code = line.text.substr(line.firstNonWhitespaceCharacterIndex)

		return this.templates
			.filter(t => t.canUse(statement))
			.map(t => t.buildCompletionItem(code, position, statement))
	}
}

const getIndentCharacters = () => {
	if (vsc.window.activeTextEditor.options.insertSpaces) {
		return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
	} else {
		return '\t'
	}
}
