import * as vsc from 'vscode'
import * as ts from 'typescript'
import * as glob from 'glob'
import * as _ from 'lodash'
import { IPostfixTemplate } from './template'
import { CustomTemplate } from './templates/customTemplate'

let currentSuggestion = undefined

export class PostfixCompletionProvider implements vsc.CompletionItemProvider {
  private templates: IPostfixTemplate[] = []
  constructor () {
    this.loadBuiltinTemplates()
    this.loadCustomTemplates()
  }

  provideCompletionItems (document: vsc.TextDocument, position: vsc.Position, token: vsc.CancellationToken): vsc.CompletionItem[] | vsc.CompletionList | Thenable<vsc.CompletionItem[] | vsc.CompletionList> {
    const line = document.lineAt(position.line)
    const dotIdx = line.text.lastIndexOf('.', position.character)

    if (dotIdx === -1) {
      return []
    }

    const codePiece = line.text.substring(line.firstNonWhitespaceCharacterIndex, dotIdx)

    let source = ts.createSourceFile('test.ts', codePiece, ts.ScriptTarget.ES5, true)
    const code = line.text.substr(line.firstNonWhitespaceCharacterIndex)

    const currentNode = findNodeAtPosition(source, dotIdx - line.firstNonWhitespaceCharacterIndex - 1)

    if (!currentNode) {
      return []
    }

    if (this.isInsideComment(document, position)) {
      return []
    }

    return this.templates
      .filter(t => t.canUse(currentNode))
      .map(t => t.buildCompletionItem(code, position, currentNode, line.text.substring(dotIdx, position.character)))
  }

  resolveCompletionItem (item: vsc.CompletionItem, token: vsc.CancellationToken): vsc.ProviderResult<vsc.CompletionItem> {
    currentSuggestion = item.label
    return item
  }

  private isInsideComment (document: vsc.TextDocument, position: vsc.Position) {
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

  function visitNode (node: ts.Node, depth: number = 0) {
    const start = node.getStart(source)
    const end = node.getEnd()

    if (start <= character && character < end) {
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
