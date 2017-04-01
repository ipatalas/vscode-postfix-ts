'use strict'
import * as vsc from 'vscode'
import { PostfixCompletionProvider } from './postfixCompletionProvider'

const DOCUMENT_SELECTOR: vsc.DocumentSelector = ['typescript', 'javascript']

export function activate (context: vsc.ExtensionContext) {
	const provider = new PostfixCompletionProvider()
	context.subscriptions.push(vsc.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, provider, '.'))
}

// tslint:disable-next-line:no-empty
export function deactivate () {
}
