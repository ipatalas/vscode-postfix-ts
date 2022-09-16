import * as vsc from 'vscode'
import ts = require('typescript')
import { adjustMultilineIndentation } from './utils/multiline-expressions'
import { SnippetParser } from 'vscode-snippet-parser'
import { getConfigValue } from './utils'

const RegexExpression = '{{expr(?::(upper|lower|capitalize))?}}'

export class CompletionItemBuilder {
  private item: vsc.CompletionItem
  private code: string
  private node: ts.Node

  private constructor(keyword: string, node: ts.Node, indentSize?: number) {
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
    this.addCodeBlockDescription(this.replaceExpression(replacement, this.code))
    // don't have unscaped $ in replacement? not a snippet.
    if (useSnippets && !/(?<!\\)\$/.test(replacement)) {
      useSnippets = false
    }

    const src = this.node.getSourceFile()
    const nodeStart = ts.getLineAndCharacterOfPosition(src, this.node.getStart(src))
    const nodeEnd = ts.getLineAndCharacterOfPosition(src, this.node.getEnd())

    const rangeToDelete = new vsc.Range(
      new vsc.Position(nodeStart.line, nodeStart.character),
      new vsc.Position(nodeEnd.line, nodeEnd.character + 1) // accomodate 1 character for the dot
    )

    if (useSnippets) {
      const escapedCode = this.code.replace(/\$/g, '\\$')

      this.item.insertText = new vsc.SnippetString(this.replaceExpression(replacement, escapedCode));
      this.item.additionalTextEdits = [
        vsc.TextEdit.delete(rangeToDelete)
      ]
    } else {
      this.item.insertText = ''
      this.item.additionalTextEdits = [
        vsc.TextEdit.replace(rangeToDelete, this.replaceExpression(replacement, this.code))
      ]
    }

    return this
  }

  public description = (description: string): CompletionItemBuilder => {
    if (!description) {
      return this
    }

    this.item.documentation = new vsc.MarkdownString(description)

    return this
  }

  private addCodeBlockDescription = (replacement: string) => {
    const addCodeBlock = (md: vsc.MarkdownString) => {
      const code = this.replaceExpression(replacement, this.code);
      const snippetPreviewMode = getConfigValue<'raw' | 'inserted'>('snippetPreviewMode')
      return md.appendCodeblock(snippetPreviewMode === 'inserted' ? new SnippetParser().text(code) : code, 'ts');
    }

    if (!this.item.documentation) {
      const md = new vsc.MarkdownString();
      addCodeBlock(md);
      this.item.documentation = md
    } else {
      addCodeBlock(this.item.documentation as vsc.MarkdownString)
    }
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
    'capitalize': (x: string) => x.substring(0, 1).toUpperCase() + x.substring(1),
  }
}
