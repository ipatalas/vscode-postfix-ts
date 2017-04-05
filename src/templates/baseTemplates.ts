import * as ts from 'typescript'
import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'

export abstract class BaseTemplate implements IPostfixTemplate {
	abstract buildCompletionItem (code: string, position: vsc.Position, node: ts.Node, suffix: string)
	abstract canUse (node: ts.Node): boolean

	protected isSimpleExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.ExpressionStatement
	protected isPropertyAccessExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.PropertyAccessExpression
	protected isBinaryExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.BinaryExpression
	protected isCallExpression = (node: ts.Node) => node.kind === ts.SyntaxKind.CallExpression
	protected inReturnStatement = (node: ts.Node) => node.kind === ts.SyntaxKind.ReturnStatement || (node.parent && this.inReturnStatement(node.parent))
	protected inIfStatement = (node: ts.Node) => node.kind === ts.SyntaxKind.IfStatement || (node.parent && this.inIfStatement(node.parent))
}

export abstract class BaseExpressionTemplate extends BaseTemplate {
	abstract buildCompletionItem (code: string, position: vsc.Position, node: ts.Node)

	canUse (node: ts.Node) {
		return node.parent &&
			!this.inReturnStatement(node.parent) &&
			!this.inIfStatement(node.parent) &&
			(this.isSimpleExpression(node.parent) ||
			 this.isPropertyAccessExpression(node.parent) ||
			 this.isBinaryExpression(node.parent) ||
			 this.isCallExpression(node.parent))
	}
}
