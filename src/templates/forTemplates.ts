import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseTemplate } from './baseTemplates'
import { getConfigValue, getIndentCharacters, getPlaceholderWithOptions } from '../utils'
import { inferForVarTemplate } from '../utils/infer-names';

abstract class BaseForTemplate extends BaseTemplate {
  canUse(node: ts.Node): boolean {
    return !this.inReturnStatement(node) &&
      !this.inIfStatement(node) &&
      !this.inFunctionArgument(node) &&
      !this.inVariableDeclaration(node) &&
      !this.inAssignmentStatement(node) &&
      !this.isTypeNode(node) &&
      !this.isBinaryExpression(node) &&
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
      .replace(`for (let \${1:i} = 0; \${1} < \${2:${prefix}{{expr}}${suffix}}.length; \${1}++) {\n${getIndentCharacters()}\${0}\n}`)
      .build()
  }

  override canUse(node: ts.Node) {
    return super.canUse(node)
      && !this.isArrayLiteral(node)
      && !this.isCallExpression(node)
  }
}

const getArrayItemNames = (node: ts.Node): string[] => {
  const inferVarNameEnabled = getConfigValue<boolean>('inferVariableName')
  const suggestedNames = inferVarNameEnabled ? inferForVarTemplate(node) : undefined;
  return suggestedNames?.length > 0 ? suggestedNames : ['item']
}

export class ForOfTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const itemNames = getArrayItemNames(node)

    return CompletionItemBuilder
      .create('forof', node, indentSize)
      .replace(`for (let ${getPlaceholderWithOptions(itemNames)} of \${2:{{expr}}}) {\n${getIndentCharacters()}\${0}\n}`)
      .build()
  }
}

export class ForEachTemplate extends BaseForTemplate {
  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const isAwaited = node.parent && ts.isAwaitExpression(node.parent)
    const prefix = isAwaited ? '(' : ''
    const suffix = isAwaited ? ')' : ''
    const itemNames = getArrayItemNames(node)

    return CompletionItemBuilder
      .create('foreach', node, indentSize)
      .replace(`${prefix}{{expr}}${suffix}.forEach(${getPlaceholderWithOptions(itemNames)} => \${2})`)
      .build()
  }
}