import * as vsc from 'vscode'
import * as ts from 'typescript'

import { IndentInfo, IPostfixTemplate } from './template'
import { AllTabs, AllSpaces } from './utils/multiline-expressions'
import { loadBuiltinTemplates, loadCustomTemplates } from './utils/templates'
import { findClosestParent, findNodeAtPosition } from './utils/typescript'
import { CustomTemplate } from './templates/customTemplate'
import { getHtmlLikeEmbedText } from './htmlLikeSupport'

let currentSuggestion = undefined

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
  private templates: IPostfixTemplate[] = []
  private customTemplateNames: string[] = []
  private mergeMode: 'append' | 'override'

  constructor() {
    this.mergeMode = vsc.workspace.getConfiguration('postfix.customTemplate').get('mergeMode', 'append')

    const customTemplates = loadCustomTemplates()
    this.customTemplateNames = customTemplates.map(t => t.templateName)

    this.templates = [
      ...loadBuiltinTemplates(),
      ...customTemplates
    ]
  }

  provideCompletionItems(document: vsc.TextDocument, position: vsc.Position, _token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
    const line = document.lineAt(position.line)
    const dotIdx = line.text.lastIndexOf('.', position.character - 1)
    const wordRange = document.getWordRangeAtPosition(position)
    const isCursorOnWordAfterDot = (wordRange?.start ?? position).character === dotIdx + 1

    if (dotIdx === -1 || !isCursorOnWordAfterDot) {
      return []
    }

    const { currentNode, fullSource, fullCurrentNode } = this.getNodeBeforeTheDot(document, position, dotIdx)

    if (!currentNode || this.shouldBeIgnored(fullSource, position)) {
      return []
    }

    const indentInfo = this.getIndentInfo(document, currentNode)
    const replacementNode = this.getNodeForReplacement(currentNode)

    try {
      return this.templates
        .filter(t => {
          let canUseTemplate = t.canUse(ts.isNonNullExpression(fullCurrentNode) ? fullCurrentNode.expression : fullCurrentNode)

          if (this.mergeMode === 'override') {
            canUseTemplate &&= (t instanceof CustomTemplate || !this.customTemplateNames.includes(t.templateName))
          }

          return canUseTemplate
        })
        .flatMap(t => t.buildCompletionItem(replacementNode, indentInfo))
    } catch (err) {
      console.error('Error while building postfix autocomplete items:')
      console.error(err)

      return []
    }
  }

  resolveCompletionItem(item: vsc.CompletionItem, _token: vsc.CancellationToken): vsc.ProviderResult<vsc.CompletionItem> {
    currentSuggestion = (item.label as vsc.CompletionItemLabel)?.label || item.label
    return item
  }

  private getNodeForReplacement = (node: ts.Node) => {
    if (ts.isTemplateSpan(node)) {
      return node.parent
    }

    if (ts.isPrefixUnaryExpression(node.parent) || ts.isPropertyAccessExpression(node.parent)) {
      return node.parent
    }

    if (ts.isTypeReferenceNode(node.parent) || (node.parent.parent && ts.isTypeReferenceNode(node.parent.parent))) {
      return findClosestParent(node, ts.SyntaxKind.TypeReference)
    }

    return node
  }

  private getHtmlLikeEmbeddedText(document: vsc.TextDocument, position: vsc.Position) {
    const knownHtmlLikeLangs = [
      'html',
      'vue',
      'svelte'
    ]

    if (knownHtmlLikeLangs.includes(document.languageId)) {
      return getHtmlLikeEmbedText(document, document.offsetAt(position))
    }

    return undefined
  }

  private getNodeBeforeTheDot(document: vsc.TextDocument, position: vsc.Position, dotIdx: number) {
    const dotOffset = document.offsetAt(position.with({ character: dotIdx }))
    const speciallyHandledText = this.getHtmlLikeEmbeddedText(document, position)

    if (speciallyHandledText === null) {
      return {}
    }

    const fullText = speciallyHandledText ?? document.getText()

    const codeBeforeTheDot = fullText.slice(0, dotOffset)

    const scriptKind = this.convertToScriptKind(document)
    const source = ts.createSourceFile('test.ts', codeBeforeTheDot, ts.ScriptTarget.ESNext, true, scriptKind)
    const fullSource = ts.createSourceFile('test.ts', fullText, ts.ScriptTarget.ESNext, true, scriptKind)

    const typedTemplate = document.getText(document.getWordRangeAtPosition(position))

    const findNormalizedNode = (source: ts.SourceFile) => {
      const beforeTheDotPosition = ts.getPositionOfLineAndCharacter(source, position.line, dotIdx - 1)
      let node = findNodeAtPosition(source, beforeTheDotPosition)
      if (node && ts.isIdentifier(node) && ts.isPropertyAccessExpression(node.parent)
        && (node.parent.name.text != typedTemplate || ts.isPrefixUnaryExpression(node.parent.parent))) {
        node = node.parent
      }
      return node
    }

    return { currentNode: findNormalizedNode(source), fullSource, fullCurrentNode: findNormalizedNode(fullSource) }
  }

  private convertToScriptKind(document: vsc.TextDocument) {
    switch (document.languageId) {
      case 'javascript':
        return ts.ScriptKind.JS
      case 'typescript':
        return ts.ScriptKind.TS
      case 'javascriptreact':
        return ts.ScriptKind.JSX
      case 'typescriptreact':
        return ts.ScriptKind.TSX
      default:
        return ts.ScriptKind.Unknown
    }
  }

  private getIndentInfo(document: vsc.TextDocument, node: ts.Node): IndentInfo {
    const source = node.getSourceFile()
    const position = ts.getLineAndCharacterOfPosition(source, node.getStart(source))

    const line = document.lineAt(position.line)
    const whitespaces = line.text.substring(0, line.firstNonWhitespaceCharacterIndex)
    let indentSize = 0

    if (AllTabs.test(whitespaces)) {
      indentSize = whitespaces.length
    } else if (AllSpaces.test(whitespaces)) {
      indentSize = whitespaces.length / (vsc.window.activeTextEditor.options.tabSize as number)
    }

    return {
      indentSize,
      leadingWhitespace: whitespaces
    }
  }

  private shouldBeIgnored(fullSource: ts.SourceFile, position: vsc.Position) {
    const pos = fullSource.getPositionOfLineAndCharacter(position.line, position.character)
    const node = findNodeAtPosition(fullSource, pos)

    return node && (isComment(node) || isJsx(node))

    function isComment(node: ts.Node) {
      return [
        ts.SyntaxKind.JSDocComment,
        ts.SyntaxKind.MultiLineCommentTrivia,
        ts.SyntaxKind.SingleLineCommentTrivia
      ].includes(node.kind)
    }

    function isJsx(node: ts.Node) {
      const jsx = findClosestParent(node, ts.SyntaxKind.JsxElement)
      const jsxFragment = findClosestParent(node, ts.SyntaxKind.JsxFragment)
      const jsxExpression = findClosestParent(node, ts.SyntaxKind.JsxExpression)

      return (!!jsx || !!jsxFragment) && !jsxExpression
    }
  }
}

export const getCurrentSuggestion = () => currentSuggestion
export const resetCurrentSuggestion = () => currentSuggestion = undefined
