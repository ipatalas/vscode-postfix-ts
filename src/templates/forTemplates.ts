import * as ts from 'typescript'
import * as pluralize from "pluralize";
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { getConfigValue, getIndentCharacters } from '../utils'

abstract class BaseForTemplate extends BaseTemplate {
  canUse(node: ts.Node): boolean {
    return !this.inReturnStatement(node) &&
      !this.inIfStatement(node) &&
      !this.inFunctionArgument(node) &&
      !this.inVariableDeclaration(node) &&
      !this.inAssignmentStatement(node) &&
      !this.isTypeNode(node) &&
      (this.isIdentifier(node) ||
        this.isPropertyAccessExpression(node) ||
        this.isElementAccessExpression(node) ||
        this.isCallExpression(node) ||
        this.isArrayLiteral(node))
  }

  protected isArrayLiteral = (node: ts.Node) => node.kind === ts.SyntaxKind.ArrayLiteralExpression
}

export class ForTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const isAwaited = node.parent && ts.isAwaitExpression(node.parent)
    const prefix = isAwaited ? '(' : ''
    const suffix = isAwaited ? ')' : ''

    return CompletionItemBuilder
      .create('for', node, indentSize)
      .replace(`for (let \${1:i} = 0; \${1} < \${2:${prefix}{{expr}}${suffix}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }

  override canUse(node: ts.Node) {
    return super.canUse(node)
      && !this.isArrayLiteral(node)
      && !this.isCallExpression(node)
  }
}

const getArrayItemName = (node: ts.Node) => {
  const inferVarNameEnabled = getConfigValue<boolean>('inferVariableName')
  let subjectName = 'item'

  if (inferVarNameEnabled) {
    if (ts.isIdentifier(node)) {
      subjectName = node.text
    }

    const clean = subjectName.replace(/^(?:all)?(.+?)(?:List)?$/, "$1")
    const singular = pluralize.singular(clean)

    if (singular !== clean) {
      return singular
    }
  }

  return subjectName
}

export class ForOfTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const itemName = getArrayItemName(node)

    return CompletionItemBuilder
      .create('forof', node, indentSize)
      .replace(`for (let \${1:${itemName}} of \${2:{{expr}}}) {\n${getIndentCharacters()}\${0}\n}`, true)
      .build()
  }
}

export class ForEachTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const isAwaited = node.parent && ts.isAwaitExpression(node.parent)
    const prefix = isAwaited ? '(' : ''
    const suffix = isAwaited ? ')' : ''
    const itemName = getArrayItemName(node)

    return CompletionItemBuilder
      .create('foreach', node, indentSize)
      .replace(`${prefix}{{expr}}${suffix}.forEach(\${1:${itemName}} => \${2})`, true)
      .build()
  }
}