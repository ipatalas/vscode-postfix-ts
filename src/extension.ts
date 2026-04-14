'use strict'
import * as vsc from 'vscode'
import * as ts from 'typescript'
import { PostfixCompletionProvider } from './postfixCompletionProvider'
import { notCommand, NOT_COMMAND } from './notCommand'
import { TEMPLATE_COMMAND, TemplateCommand } from './templateCommand'
import { loadBuiltinTemplates, loadCustomTemplates } from './utils/templates'

const TESTS_SELECTOR: vsc.DocumentSelector = ['postfix', 'html']
const DOCUMENT_SELECTOR: vsc.DocumentSelector =
  process.env.NODE_ENV === 'test'
    ? TESTS_SELECTOR
    : vsc.workspace.getConfiguration('postfix').get('languages') ?? ['javascript', 'typescript', 'javascriptreact', 'typescriptreact']

export function activate(context: vsc.ExtensionContext): void {
  const templates = loadAllTemplates()

  const provider = new PostfixCompletionProvider(templates)
  context.subscriptions.push(vsc.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, provider, '.'))

  context.subscriptions.push(vsc.commands.registerTextEditorCommand(NOT_COMMAND, (editor: vsc.TextEditor, _: vsc.TextEditorEdit, ...args: ts.BinaryExpression[]) => {
    const [...expressions] = args

    notCommand(editor, expressions)
  }))

  const templateCommand = new TemplateCommand(templates)
  context.subscriptions.push(vsc.commands.registerTextEditorCommand(TEMPLATE_COMMAND, templateCommand.execute.bind(templateCommand)))

  context.subscriptions.push(vsc.workspace.onDidChangeConfiguration(e => {
    if (!e.affectsConfiguration('postfix')) {
      return
    }

    const templates = loadAllTemplates()
    provider.updateConfiguration(templates)
    templateCommand.updateConfiguration(templates)
  }))
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {
}

function loadAllTemplates() {
  return [
    ...loadBuiltinTemplates(),
    ...loadCustomTemplates()
  ]
}
