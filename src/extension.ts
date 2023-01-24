'use strict'
import * as vsc from 'vscode'
import * as ts from 'typescript'
import { PostfixCompletionProvider } from './postfixCompletionProvider'
import { notCommand, NOT_COMMAND } from './notCommand'

let completionProvider: vsc.Disposable

export function activate(context: vsc.ExtensionContext): void {
  registerCompletionProvider(context)

  context.subscriptions.push(vsc.commands.registerTextEditorCommand(NOT_COMMAND, async (editor: vsc.TextEditor, _: vsc.TextEditorEdit, ...args: ts.BinaryExpression[]) => {
    const [...expressions] = args

    await notCommand(editor, expressions)
  }))

  context.subscriptions.push(vsc.workspace.onDidChangeConfiguration(e => {
    if (!e.affectsConfiguration('postfix')) {
      return
    }

    if (completionProvider) {
      const idx = context.subscriptions.indexOf(completionProvider)
      context.subscriptions.splice(idx, 1)
      completionProvider.dispose()
    }

    registerCompletionProvider(context)
  }))
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {
}

function registerCompletionProvider(context: vsc.ExtensionContext) {
  const provider = new PostfixCompletionProvider()

  const TESTS_SELECTOR: vsc.DocumentSelector = ['postfix', 'html']
  const DOCUMENT_SELECTOR: vsc.DocumentSelector =
    process.env.NODE_ENV === 'test' ? TESTS_SELECTOR : <string[]>vsc.workspace.getConfiguration('postfix').get('languages')

  completionProvider = vsc.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, provider, '.')
  context.subscriptions.push(completionProvider)
}
