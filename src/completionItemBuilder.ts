import * as vsc from 'vscode'
import ts = require('typescript')
import { adjustMultilineIndentation } from './utils'

const COMPLETION_ITEM_TITLE = 'Postfix templates'

export class CompletionItemBuilder {
  private item: vsc.CompletionItem
  private code: string

  constructor(keyword: string, private node: ts.Node, indentSize?: number) {
    this.item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
    this.item.detail = COMPLETION_ITEM_TITLE
    this.code = adjustMultilineIndentation(node.getText(), indentSize)
  }

  public static create = (keyword: string, node: ts.Node, indentSize?: number) => new CompletionItemBuilder(keyword, node, indentSize)

  public command = (command: vsc.Command) => {
    this.item.command = command
    return this
  }

  public insertText = (insertText?: string) => {
    this.item.insertText = insertText
    return this
  }

  public replace = (replacement: string, useSnippets?: boolean): CompletionItemBuilder => {
    if (useSnippets) {
      const escapedCode = this.code.replace('$', '\\$')

      this.item.insertText = new vsc.SnippetString(replacement.replace(new RegExp('{{expr}}', 'g'), escapedCode))
    } else {
      this.item.insertText = replacement.replace(new RegExp('{{expr}}', 'g'), this.code)
    }

    const src = this.node.getSourceFile()
    const nodeStart = ts.getLineAndCharacterOfPosition(src, this.node.getStart(src))
    const nodeEnd = ts.getLineAndCharacterOfPosition(src, this.node.getEnd())

    const rangeToDelete = new vsc.Range(
      new vsc.Position(nodeStart.line, nodeStart.character),
      new vsc.Position(nodeEnd.line, nodeEnd.character + 1) // accomodate 1 character for the dot
    )

    this.item.additionalTextEdits = [
      vsc.TextEdit.delete(rangeToDelete)
    ]

    return this
  }

  public description = (description: string): CompletionItemBuilder => {
    this.item.documentation = description.replace('expr', this.code)

    return this
  }

  public build = () => this.item
}
