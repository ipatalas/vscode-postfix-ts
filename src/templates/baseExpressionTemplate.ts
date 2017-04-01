import * as ts from 'typescript'
import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'

export abstract class BaseExpressionTemplate implements IPostfixTemplate {
	abstract buildCompletionItem (code: string, position: vsc.Position, node: ts.Node)

	canUse = (node: ts.Node) => node.kind === ts.SyntaxKind.ExpressionStatement
}
