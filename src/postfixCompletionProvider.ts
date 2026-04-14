import * as vsc from 'vscode'
import * as ts from 'typescript'

import { IPostfixTemplate } from './template'
import { findNodeAtPosition } from './utils/typescript'
import { CustomTemplate } from './templates/customTemplate'
import { getHtmlLikeEmbedText } from './htmlLikeSupport'
import { convertToScriptKind, getIndentInfo, getNodeForReplacement } from './utils'

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
  private templates: IPostfixTemplate[] = []
  private customTemplateNames: string[] = []
  private mergeMode!: 'append' | 'override'

  constructor(templates: IPostfixTemplate[]) {
    this.updateConfiguration(templates)
  }

  updateConfiguration(templates: IPostfixTemplate[]) {
    this.mergeMode = vsc.workspace.getConfiguration('postfix.customTemplate').get('mergeMode', 'append')
    this.customTemplateNames = templates.filter(t => t instanceof CustomTemplate).map(t => t.templateName)
    this.templates = templates
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

    if (!currentNode || !fullCurrentNode || this.shouldBeIgnored(fullSource, position)) {
      return []
    }

    const indentInfo = getIndentInfo(document, currentNode)
    const node = this.isTypeReference(fullCurrentNode) ? fullCurrentNode : currentNode
    const replacementNode = getNodeForReplacement(node)

    try {
      return this.templates
        .filter(t => {
          let canUseTemplate = t.canUse(ts.isNonNullExpression(node) ? node.expression : node)

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

  private isTypeReference = (node: ts.Node) => {
    const typeRef = ts.findAncestor(node, ts.isTypeReferenceNode)
    return !!typeRef
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

    const scriptKind = convertToScriptKind(document)
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

  private shouldBeIgnored(fullSource: ts.SourceFile, position: vsc.Position) {
    const pos = fullSource.getPositionOfLineAndCharacter(position.line, position.character)
    const node = findNodeAtPosition(fullSource, pos)

    return node && (isComment(node) || isJsx(node))

    function isComment(node: ts.Node) {
      return [
        ts.SyntaxKind.JSDoc,
        ts.SyntaxKind.MultiLineCommentTrivia,
        ts.SyntaxKind.SingleLineCommentTrivia
      ].includes(node.kind)
    }

    function isJsx(node: ts.Node) {
      const jsx = ts.findAncestor(node, ts.isJsxElement)
      const jsxFragment = ts.findAncestor(node, ts.isJsxFragment)
      const jsxExpression = ts.findAncestor(node, ts.isJsxExpression)

      return (!!jsx || !!jsxFragment) && !jsxExpression
    }
  }
}
