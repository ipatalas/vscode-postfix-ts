import * as vsc from 'vscode'

const COMPLETION_ITEM_TITLE = 'Postfix templates'

export class CompletionItemBuilder {
  private item: vsc.CompletionItem

  constructor (private keyword: string, private code: string) {
    this.item = new vsc.CompletionItem(keyword, vsc.CompletionItemKind.Snippet)
    this.item.detail = COMPLETION_ITEM_TITLE
  }

  public static create = (keyword: string, code: string) => new CompletionItemBuilder(keyword, code)

  public command = (command: vsc.Command) => {
    this.item.command = command
    return this
  }

  public insertText = (insertText?: string) => {
    this.item.insertText = insertText
    return this
  }

  public replace = (replacement: string, position: vsc.Position, useSnippets?: boolean): CompletionItemBuilder => {
    const dotIdx = this.code.lastIndexOf('.')
    const codeBeforeTheDot = this.code.substr(0, dotIdx)

    if (useSnippets) {
      const escapedCode = codeBeforeTheDot.replace('$', '\\$')

      this.item.insertText = new vsc.SnippetString(replacement.replace(new RegExp('{{expr}}', 'g'), escapedCode))
    } else {
      this.item.insertText = replacement.replace(new RegExp('{{expr}}', 'g'), codeBeforeTheDot)
    }

    this.item.additionalTextEdits = [
      vsc.TextEdit.delete(new vsc.Range(position.translate(0, -codeBeforeTheDot.length - 1), position))
    ]

    return this
  }

  public description = (description: string): CompletionItemBuilder => {
    this.item.documentation = description

    return this
  }

  public build = () => this.item
}
