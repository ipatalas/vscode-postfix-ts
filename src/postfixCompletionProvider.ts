import * as vsc from 'vscode'
import * as ts from 'typescript'
import * as glob from 'glob'
import * as _ from 'lodash'

import { IPostfixTemplate } from './template'
import { CustomTemplate } from './templates/customTemplate'
import { AllTabs, AllSpaces } from './utils'

let currentSuggestion = undefined

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
  private templates: IPostfixTemplate[] = []

  constructor() {
    this.loadBuiltinTemplates()
    this.loadCustomTemplates()
  }

  provideCompletionItems(document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
    const line = document.lineAt(position.line)
    const dotIdx = line.text.lastIndexOf('.', position.character)

    if (dotIdx === -1) {
      return []
    }

    const currentNode = this.getNodeBeforeTheDot(document, position, dotIdx)

    if (!currentNode || this.isInsideComment(document, position)) {
      return []
    }

    const indentSize = this.getIndentSize(document, currentNode)

    try {
      return this.templates
        .filter(t => t.canUse(currentNode))
        .map(t => t.buildCompletionItem(currentNode, position, line.text.substring(dotIdx, position.character), indentSize))
    } catch (err) {
      console.error('Error while building postfix autocomplete items:')
      console.error(err)

      return []
    }
  }

  resolveCompletionItem(item: vsc.CompletionItem, _token: vsc.CancellationToken): vsc.ProviderResult<vsc.CompletionItem> {
    currentSuggestion = item.label
    return item
  }

  private getNodeBeforeTheDot(document: vsc.TextDocument, position: vsc.Position, dotIdx: number) {
    const codeBeforeTheDot = document.getText(new vsc.Range(
      new vsc.Position(0, 0),
      new vsc.Position(position.line, dotIdx)
    ))

    const source = ts.createSourceFile('test.ts', codeBeforeTheDot, ts.ScriptTarget.ES5, true)
    const beforeTheDotPosition = ts.getPositionOfLineAndCharacter(source, position.line, dotIdx - 1)

    let currentNode = findNodeAtPosition(source, beforeTheDotPosition)

    if (currentNode && ts.isIdentifier(currentNode) && ts.isPropertyAccessExpression(currentNode.parent)) {
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

  private loadCustomTemplates = () => {
    const config = vsc.workspace.getConfiguration('postfix')
    const templates = config.get<ICustomTemplateDefinition[]>('customTemplates')
    if (templates) {
      this.templates.push(...templates.map(t => new CustomTemplate(t.name, t.description, t.body, t.when)))
    }
  }

  private loadBuiltinTemplates = () => {
    let files = glob.sync('./templates/*.js', { cwd: __dirname })
    files.forEach(path => {
      let builder: () => IPostfixTemplate | IPostfixTemplate[] = require(path).build
      if (builder) {
        let tpls = builder()
        if (Array.isArray(tpls)) {
          this.templates.push(...tpls)
        } else {
          this.templates.push(tpls)
        }
      }
    })
  }
}

export const getCurrentSuggestion = () => currentSuggestion
export const resetCurrentSuggestion = () => currentSuggestion = undefined

const findNodeAtPosition = (source: ts.SourceFile, character: number) => {
  let matchingNodes: INode[] = []
  source.statements.forEach(visitNode)
  let sortedNodes = _.orderBy(matchingNodes, [m => m.width, m => m.depth], ['asc', 'desc'])

  return sortedNodes.length > 0 && sortedNodes[0].node

  function visitNode(node: ts.Node, depth: number = 0) {
    const start = node.getStart(source)
    const end = node.getEnd()
    const isToken = ts.isToken(node) && !ts.isIdentifier(node)

    if (!isToken && start <= character && character < end) {
      matchingNodes.push({
        depth,
        node,
        width: end - start
      })
    }

    node.getChildren(source).forEach(n => visitNode(n, depth + 1))
  }
}

interface INode {
  width: number
  depth: number
  node: ts.Node
}

interface ICustomTemplateDefinition {
  name: string
  description: string
  body: string,
  when: string[]
}
