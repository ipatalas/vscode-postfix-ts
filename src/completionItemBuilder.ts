import * as vsc from 'vscode'
import ts = require('typescript')

const COMPLETION_ITEM_TITLE = 'Postfix templates'

export class CompletionItemBuilder {
  private item: vsc.CompletionItem
  private code: string

  constructor (keyword: string, node: ts.Node) {
    this.item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
    this.item.detail = COMPLETION_ITEM_TITLE
    this.code = node.getText()
  }

  public static create = (keyword: string, node: ts.Node) => new CompletionItemBuilder(keyword, node)

  public command = (command: vsc.Command) => {
    this.item.command = command
    return this
  }

  public insertText = (insertText?: string) => {
    this.item.insertText = insertText
    return this
  }

  public replace = (replacement: string, position: vsc.Position, useSnippets?: boolean): CompletionItemBuilder => {
    if (useSnippets) {
      const escapedCode = this.code.replace('$', '\\$')

      this.item.insertText = new vsc.SnippetString(replacement.replace(new RegExp('{{expr}}', 'g'), escapedCode))
    } else {
      this.item.insertText = replacement.replace(new RegExp('{{expr}}', 'g'), this.code)
    }

    this.item.additionalTextEdits = [
      vsc.TextEdit.delete(new vsc.Range(position.translate(0, -this.code.length - 1), position))
    ]

    return this
  }

  public description = (description: string): CompletionItemBuilder => {
    this.item.documentation = description.replace('expr', this.code)

    return this
  }

  public build = () => this.item
}
