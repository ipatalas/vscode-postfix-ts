import * as ts from 'typescript'
import * as _ from 'lodash'

export const findNodeAtPosition = (source: ts.SourceFile, character: number): ts.Node | undefined => {
  const matchingNodes: INode[] = []
  source.statements.forEach(visitNode)
  const sortedNodes = _.orderBy(matchingNodes, [m => m.width, m => m.depth], ['asc', 'desc'])

  if (sortedNodes.length > 0) {
    return sortedNodes[0].node
  }

  function visitNode(node: ts.Node, depth = 0) {
    const start = node.getStart(source)
    const end = node.getEnd()
    const isToken = ts.isToken(node) && !ts.isIdentifier(node) && !ts.isTypeNode(node) && !isStringLiteral(node)

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

export const findClosestParent = <T extends ts.Node = ts.Node>(node: ts.Node, ...kind: ts.SyntaxKind[]): T | undefined => {
  while (node && !kind.includes(node.kind)) {
    node = node.parent
  }

  return node as T
}

export const isAssignmentBinaryExpression = (node: ts.BinaryExpression) => {
  return [
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    // Bitwise assignments
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.LessThanLessThanToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    // relatively new
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.QuestionQuestionToken,
    ts.SyntaxKind.BarBarEqualsToken,
  ].includes(node.operatorToken.kind)
}

export const isStringLiteral = (node: ts.Node) => {
  return ts.isTemplateSpan(node) || ts.isStringLiteralLike(node)
    || (ts.isExpressionStatement(node) && ts.isStringLiteralLike(node.expression))
}

interface INode {
  width: number
  depth: number
  node: ts.Node
}
