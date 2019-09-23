import * as ts from 'typescript'
import * as _ from 'lodash'

export const findNodeAtPosition = (source: ts.SourceFile, character: number) => {
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
