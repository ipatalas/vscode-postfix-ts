/// <reference types="vscode" />
import * as vsc from 'vscode'
import ts = require('typescript')
import { adjustMultilineIndentation } from './utils/multiline-expressions'

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
    this.item = new vsc.CompletionItem({label: keyword, description: 'POSTFIX'}, vsc.CompletionItemKind.Snippet)
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
    // don't show empty annoying window if we don't have text
    if (!description) return this
    const md = new vsc.MarkdownString()
    md.appendCodeblock(this.replaceExpression(description, this.code, `expr|${RegexExpression}`), 'ts')
    this.item.documentation = md

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
