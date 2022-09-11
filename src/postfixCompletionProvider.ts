import * as vsc from 'vscode'
import * as ts from 'typescript'
import * as _ from 'lodash'

import { IPostfixTemplate } from './template'
import { AllTabs, AllSpaces } from './utils/multiline-expressions'
import { loadBuiltinTemplates, loadCustomTemplates } from './utils/templates'
import { findNodeAtPosition } from './utils/typescript'
import { CustomTemplate } from './templates/customTemplate'

let currentSuggestion = undefined

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
  private templates: IPostfixTemplate[] = []
  private customTemplateNames: string[] = []
  private mergeMode: 'append' | 'override';

  constructor() {
    this.mergeMode = vsc.workspace.getConfiguration('postfix.customTemplate').get('mergeMode')

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

    const currentNode = this.getNodeBeforeTheDot(document, position, dotIdx)

    if (!currentNode || this.isInsideComment(document, position)) {
      return []
    }

    const indentSize = this.getIndentSize(document, currentNode)
    const replacementNode = this.getNodeForReplacement(currentNode)

    try {
      return this.templates
        .filter(t => {
          let canUseTemplate = t.canUse(currentNode)

          if (this.mergeMode === 'override') {
            canUseTemplate &&= (t instanceof CustomTemplate || !this.customTemplateNames.includes(t.templateName))
          }

          return canUseTemplate
        })
        .map(t => t.buildCompletionItem(replacementNode, indentSize))
    } catch (err) {
      console.error('Error while building postfix autocomplete items:')
      console.error(err)

      return []
    }
  }

  resolveCompletionItem(item: vsc.CompletionItem, _token: vsc.CancellationToken): vsc.ProviderResult<vsc.CompletionItem> {
    currentSuggestion =  (item.label as vsc.CompletionItemLabel)?.label || item.label
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
      return this.findClosestParent(node, ts.SyntaxKind.TypeReference)
    }

    const binaryExpression = this.findClosestParent(node, ts.SyntaxKind.BinaryExpression);

    return binaryExpression ?? node
  }

  private findClosestParent(node: ts.Node, kind: ts.SyntaxKind): ts.Node {
    while (node && node.kind !== kind) {
      node = node.parent
    }

    return node
  }

  private getNodeBeforeTheDot(document: vsc.TextDocument, position: vsc.Position, dotIdx: number) {
    const codeBeforeTheDot = document.getText(new vsc.Range(
      new vsc.Position(0, 0),
      new vsc.Position(position.line, dotIdx)
    ))

    const source = ts.createSourceFile('test.ts', codeBeforeTheDot, ts.ScriptTarget.ES5, true)
    const beforeTheDotPosition = ts.getPositionOfLineAndCharacter(source, position.line, dotIdx - 1)

    let currentNode = findNodeAtPosition(source, beforeTheDotPosition)

    if (ts.isIdentifier(currentNode) && ts.isPropertyAccessExpression(currentNode.parent)) {
      currentNode = currentNode.parent
    }

    return currentNode
  }

  private getIndentSize(document: vsc.TextDocument, node: ts.Node): number | undefined {
    const source = node.getSourceFile()
    const position = ts.getLineAndCharacterOfPosition(source, node.getStart(source))

    const line = document.lineAt(position.line)
    const whitespaces = line.text.substring(0, line.firstNonWhitespaceCharacterIndex)

    if (AllTabs.test(whitespaces)) {
      return whitespaces.length
    }

    if (AllSpaces.test(whitespaces)) {
      return whitespaces.length / (vsc.window.activeTextEditor.options.tabSize as number)
    }
  }

  private isInsideComment(document: vsc.TextDocument, position: vsc.Position) {
    const source = ts.createSourceFile('test.ts', document.getText(), ts.ScriptTarget.ES5, true)
    const pos = source.getPositionOfLineAndCharacter(position.line, position.character)
    const nodeKind = findNodeAtPosition(source, pos).kind
    const commentKind = [
      ts.SyntaxKind.JSDocComment,
      ts.SyntaxKind.MultiLineCommentTrivia,
      ts.SyntaxKind.SingleLineCommentTrivia
    ]

    return _.includes(commentKind, nodeKind)
  }
}

export const getCurrentSuggestion = () => currentSuggestion
export const resetCurrentSuggestion = () => currentSuggestion = undefined
