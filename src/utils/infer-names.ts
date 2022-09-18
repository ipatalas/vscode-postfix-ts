import _ = require("lodash")
import pluralize = require("pluralize")
import ts = require("typescript")

const MethodCallRegex = /^(get|read|create|retrieve|select|modify|update|use|find)(?<name>[A-Z].+?)?$/
const CleanNameRegex = /((By|With|From).*$)|(Sync$)|.*(?=Items|Lines$)/

const lowerFirst = (name: string) => name && _.lowerFirst(name)

export const inferVarTemplateName = (node: ts.Node): string[] => {
  if (ts.isNewExpression(node)) {
    return [lowerFirst(inferNewExpressionVar(node))]
  } else if (ts.isCallExpression(node)) {
    const methodName = getMethodName(node)
    const name = beautifyMethodName(methodName)
    if (!name) {
      return
    }

    return getUniqueVariants(name).map(lowerFirst)
  }
}

export const inferForVarTemplate = (node: ts.Node): string[] => {
  const subjectName = getForExpressionName(node)
  if (!subjectName) {
    return
  }

  const clean = ts.isCallExpression(node)
    ? beautifyMethodName(subjectName)
    : subjectName.replace(/^(?:all)?(.+?)(?:List)?$/, "$1")

  return getUniqueVariants(clean)
    .map(pluralize.singular)
    .filter(x => x !== clean)
    .map(lowerFirst)
}

function getUniqueVariants(name?: string) {
  const cleanerVariant = name?.replace(CleanNameRegex, '')
  const uniqueValues = [...new Set([cleanerVariant, name])]
  return uniqueValues.filter(x => x)
}

function beautifyMethodName(name: string) {
  return MethodCallRegex.exec(name)?.groups?.name
}

function getForExpressionName(node: ts.Node) {
  if (ts.isIdentifier(node)) {
    return node.text
  } else if (ts.isPropertyAccessExpression(node)) {
    return node.name.text
  } else if (ts.isCallExpression(node)) {
    return getMethodName(node)
  }
}

function getMethodName(node: ts.CallExpression) {
  if (ts.isIdentifier(node.expression)) {
    return node.expression.text
  } else if (ts.isPropertyAccessExpression(node.expression)) {
    return node.expression.name.text
  }
}

function inferNewExpressionVar(node: ts.NewExpression) {
  if (ts.isIdentifier(node.expression)) {
    return node.expression.text
  } else if (ts.isPropertyAccessExpression(node.expression)) {
    return node.expression.name.text
  }
}