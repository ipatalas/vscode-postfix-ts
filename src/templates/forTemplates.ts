import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { getIndentCharacters } from '../utils'

abstract class BaseForTemplate extends BaseTemplate {
  canUse (node: ts.Node): boolean {
    return !this.inReturnStatement(node) &&
      !this.inIfStatement(node) &&
      (this.isIdentifier(node) ||
        this.isPropertyAccessExpression(node) ||
        this.isElementAccessExpression(node) ||
        this.isCallExpression(node) ||
        this.isArrayLiteral(node))
  }

  protected isArrayLiteral = (node: ts.Node) => node.kind === ts.SyntaxKind.ArrayLiteralExpression
}

export class ForTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, position: vsc.Position, suffix: string, indentSize?: number) {
    return CompletionItemBuilder
      .create('for', node, indentSize)
      .description('for (let i = 0; i < expr.Length; i++)')
      .replace(`for (let \${1:i} = 0; \${1} < \${2:{{expr}}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }

  canUse (node: ts.Node) {
    return super.canUse(node) && !this.isArrayLiteral(node) && !this.isCallExpression(node)
  }
}

export class ForOfTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, position: vsc.Position, suffix: string, indentSize?: number) {
    return CompletionItemBuilder
      .create('forof', node, indentSize)
      .description('for (let item of expr)')
      .replace(`for (let \${1:item} of \${2:{{expr}}}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class ForEachTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, position: vsc.Position, suffix: string, indentSize?: number) {
    return CompletionItemBuilder
      .create('foreach', node, indentSize)
      .description('expr.forEach()')
      .replace(`{{expr}}.forEach(\${1:item} => \${2})`, true)
      .build()
  }
}

export const build = () => [
  new ForTemplate(),
  new ForOfTemplate(),
  new ForEachTemplate()
]
