'use strict'
import * as vsc from 'vscode'
import { PostfixCompletionProvider } from './postfixCompletionProvider'
import { notCommand, NOT_COMMAND } from './notCommand'

const DOCUMENT_SELECTOR: vsc.DocumentSelector = ['typescript', 'javascript']

export function activate (context: vsc.ExtensionContext) {
	const provider = new PostfixCompletionProvider()
	context.subscriptions.push(vsc.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, provider, '.'))
	context.subscriptions.push(vsc.commands.registerTextEditorCommand(NOT_COMMAND, (editor: vsc.TextEditor, _: vsc.TextEditorEdit, ...args: any[]) => {
		let [position, suffix, ...expressions] = args

		notCommand(editor, position, suffix, expressions)
	}))
}

// tslint:disable-next-line:no-empty
export function deactivate () {
}
