'use strict'
import * as vsc from 'vscode'
import * as ts from 'typescript'
import { findNodeAtPosition } from './utils/typescript'
import { IPostfixTemplate } from './template'
import { convertToScriptKind, getNodeForReplacement, getIndentInfo } from './utils'

export const TEMPLATE_COMMAND = 'postfix.template'

export class TemplateCommand {
  public static readonly command = TEMPLATE_COMMAND

  constructor(private templates: IPostfixTemplate[]) {
  }

  updateConfiguration(templates: IPostfixTemplate[]) {
    this.templates = templates
  }

  execute(editor: vsc.TextEditor, _: vsc.TextEditorEdit, ...args: unknown[]) {
    if (args.length !== 1) {
      console.error('Expected exactly one argument for template name, but got:', args)
      vsc.window.showWarningMessage('Expected exactly one argument for template name')
      return
    }

    const templateName = args[0]
    if (typeof templateName !== 'string') {
      console.error('Template name argument must be a string, but got:', templateName)
      vsc.window.showWarningMessage('Template name argument must be a string')
      return
    }

    let template = this.templates.find(t => t.templateName === templateName)
    if (!template) {
      console.error(`No template found with name: ${templateName}`)
      vsc.window.showWarningMessage(`No template found with name: ${templateName}`)
      return
    }

    const { document, selection } = editor
    const source = ts.createSourceFile('test.ts', document.getText(), ts.ScriptTarget.ESNext, true, convertToScriptKind(document))

    const offset = document.offsetAt(selection.active)
    let node = findNodeAtPosition(source, Math.max(0, offset - 1))
    if (!node) {
      console.error('No node found at position:', offset)
      return
    }

    // mirror completion provider: if on a property name, use the whole access expression
    if (ts.isIdentifier(node) && ts.isPropertyAccessExpression(node.parent)) {
      node = node.parent
    }

    const nodeForCanUseCheck = ts.isNonNullExpression(node) ? node.expression : node
    if (!template.canUse(nodeForCanUseCheck)) {
      template = this.templates.find(t => t.templateName === templateName && t.canUse(nodeForCanUseCheck))
      if (!template) {
        console.error('No applicable template found for node:', node.getText())
        return
      }
    }

    const replacementNode = getNodeForReplacement(node)
    const indentInfo = getIndentInfo(document, replacementNode)
    const completionItem = template.buildCompletionItem(replacementNode, indentInfo)

    if (completionItem.additionalTextEdits?.length) {
      // The completion builder always adds +1 to the end of the delete range to cover the dot.
      // In command context there is no dot, so subtract 1.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const edit = completionItem.additionalTextEdits[0]!
      const adjustedRange = new vsc.Range(
        edit.range.start,
        new vsc.Position(edit.range.end.line, edit.range.end.character - 1)
      )

      editor.edit(e => {
        if (edit.newText) {
          e.replace(adjustedRange, edit.newText)
        } else {
          e.delete(adjustedRange)
        }
      }).then(() => {
        editor.insertSnippet(completionItem.insertText as vsc.SnippetString, adjustedRange.start)
      }, (error: unknown) => {
        console.error('Failed to apply template edit:', error)
      })
    }

    if (completionItem.command) {
      vsc.commands.executeCommand(completionItem.command.command, TEMPLATE_COMMAND, completionItem.command.arguments ?? [])
    }
  }
}
