import * as vsc from 'vscode'
import ts = require('typescript')
import { adjustMultilineIndentation } from './utils/multiline-expressions'

const COMPLETION_ITEM_TITLE = 'Postfix templates'
const RegexExpression = '{{expr(?::(upper|lower|capitalize))?}}'

export class CompletionItemBuilder {
  private item: vsc.CompletionItem
  private code: string
  private node: ts.Node

  constructor(keyword: string, node: ts.Node, indentSize?: number) {
    if (ts.isAwaitExpression(node.parent)) {
      node = node.parent
    }

    this.node = node
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
      const escapedCode = this.code.replace(/\$/g, '\\$')

      this.item.insertText = new vsc.SnippetString(this.replaceExpression(replacement, escapedCode))
    } else {
      this.item.insertText = this.replaceExpression(replacement, this.code)
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
    this.item.documentation = this.replaceExpression(description, this.code, `expr|${RegexExpression}`)

    return this
  }

  public build = () => this.item

  private replaceExpression = (replacement: string, code: string, customRegex?: string) => {
    const re = new RegExp(customRegex || RegexExpression, 'g')

    return replacement.replace(re, (_match, p1) => {
      if (p1 && this.filters[p1]) {
        return this.filters[p1](code)
      }
      return code;
    })
  }

  private filters: {[key: string]: (x: string) => string} = {
    'upper': (x: string) => x.toUpperCase(),
    'lower': (x: string) => x.toLowerCase(),
    'capitalize': (x: string) => x.substr(0, 1).toUpperCase() + x.substr(1),
  }
}
