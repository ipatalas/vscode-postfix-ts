# Architecture & templates

## Template system
All templates extend BaseTemplate or BaseExpressionTemplate.

Required methods:
1. canUse(node: ts.Node) — context checking
2. buildCompletionItem(node, indentInfo) — completion snippet

Use CompletionItemBuilder to build items.

## AST navigation
- Use TypeScript compiler API (ts.*)
- Prefer helpers in src/utils/typescript.ts
- Check for NonNullExpression wrappers when working with AST nodes

## Configuration
- Read config with getConfigValue<Type>(name) from src/utils.ts
- Config namespace is postfix.*
- Supports built-in and custom templates

## Code replacement
- Use {{expr}} placeholder for expression
- Modifiers: {{expr:upper}}, {{expr:lower}}, {{expr:capitalize}}
- Use VS Code snippet cursors: $0, ${1:placeholder}
