import * as ts from 'typescript'
import * as vsc from 'vscode'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { getIndentCharacters } from '../utils'

abstract class BaseForTemplate extends BaseTemplate {
  abstract buildCompletionItem (code: string, position: vsc.Position, node: ts.Node, suffix: string)

  canUse (node: ts.Node): boolean {
    return !this.inReturnStatement(node) &&
      !this.inIfStatement(node) &&
      (this.isIdentifier(node) ||
        this.isPropertyAccessExpression(node.parent) ||
        this.isElementAccessExpression(node) ||
        this.isCallExpression(node) ||
        this.isArrayLiteral(node))
  }

  protected isArrayLiteral = (node: ts.Node) => node.kind === ts.SyntaxKind.ArrayLiteralExpression
}

export class ForTemplate extends BaseForTemplate {
  buildCompletionItem (code: string, position: vsc.Position) {
    return CompletionItemBuilder
      .create('for', code)
      .description('for (let i = 0; i < expr.Length; i++)')
      .replace(`for (let \${1:i} = 0; \${1} < \${2:{{expr}}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`, position, true)
      .build()
  }

  canUse (node: ts.Node) {
    return super.canUse(node) && !this.isArrayLiteral(node) && !this.isCallExpression(node)
  }
}

export class ForOfTemplate extends BaseForTemplate {
  buildCompletionItem (code: string, position: vsc.Position) {
    return CompletionItemBuilder
      .create('forof', code)
      .description('for (let item of expr)')
      .replace(`for (let \${1:item} of \${2:{{expr}}}) {\n${getIndentCharacters()}\${0}\n}`, position, true)
      .build()
  }
}

export class ForEachTemplate extends BaseForTemplate {
  buildCompletionItem (code: string, position: vsc.Position) {
    return CompletionItemBuilder
      .create('foreach', code)
      .description('expr.forEach()')
      .replace(`{{expr}}.forEach(\${1:item} => \${2})`, position, true)
      .build()
  }
}

export const build = () => [
  new ForTemplate(),
  new ForOfTemplate(),
  new ForEachTemplate()
]
