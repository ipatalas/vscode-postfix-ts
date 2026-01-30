# AGENTS.md - Developer Guide for vscode-postfix-ts

This file contains essential guidelines for AI coding agents working on the vscode-postfix-ts project.

## Project Overview

VSCode extension providing postfix templates for TypeScript/JavaScript. Uses TypeScript AST parsing to offer context-aware code completions (e.g., `expr.if` → `if (expr)`).

## Essential Commands

```bash
npm ci                     # Install dependencies
npm run compile            # Development build (with sourcemaps)
npm run vscode:prepublish  # Production build (minified, no sourcemaps)
node build.mjs --watch     # Watch mode for development
npm run lint               # Lint code
npm test                   # Run all tests (see TESTING.md for details)
npm run package            # Package extension
```

## Code Style

**Formatting:**
- 2-space indentation
- See `.eslintrc.js` and `.editorconfig` for complete rules

**Import conventions:**
```typescript
import * as vsc from 'vscode'        // VSCode API - ALWAYS use this format
import * as ts from 'typescript'      // TypeScript API - ALWAYS use this format
import * as _ from 'lodash'          // External libraries
import { CompletionItemBuilder } from '../completionItemBuilder'  // Named imports for local modules
```

## Key Architecture Patterns

### Template System
All templates extend `BaseTemplate` or `BaseExpressionTemplate`:

1. **Implement `canUse(node: ts.Node)`** - Context checking (can this template be used here?)
2. **Implement `buildCompletionItem(node, indentInfo)`** - Generate completion snippet
3. **Use `CompletionItemBuilder`** - Fluent API for creating VSCode completion items

Example structure:
```typescript
export class MyTemplate extends BaseExpressionTemplate {
  buildCompletionItem(node: ts.Node, indentInfo?: IndentInfo) {
    return CompletionItemBuilder
      .create(this.templateName, node, indentInfo)
      .replace('template {{expr}} output')
      .build()
  }

  override canUse(node: ts.Node) {
    return super.canUse(node) && !this.inReturnStatement(node)
  }
}
```

### AST Navigation
- Use TypeScript compiler API (`ts.*` functions)
- Leverage helpers from `src/utils/typescript.ts` (e.g., `findNodeAtPosition`, `isStringLiteral`)
- Check for `NonNullExpression` wrappers (TypeScript's `!` operator)

### Configuration
- Get config: `getConfigValue<Type>(name)` from `src/utils.ts`
- Config namespace: `postfix.*`
- Supports both built-in and custom templates

### Code Replacement
- Templates use `{{expr}}` placeholder for expression
- Modifiers available: `{{expr:upper}}`, `{{expr:lower}}`, `{{expr:capitalize}}`
- Use VSCode snippet syntax for cursors: `$0`, `${1:placeholder}`

## Important Files

- `src/extension.ts` - Extension entry point and activation
- `src/postfixCompletionProvider.ts` - Main completion provider logic
- `src/completionItemBuilder.ts` - Fluent builder for completions
- `src/templates/baseTemplates.ts` - Base classes for all templates
- `src/utils/typescript.ts` - TypeScript AST helper functions
- `src/utils/multiline-expressions.ts` - Multiline expression handling
- `build.mjs` - esbuild build configuration
- `.eslintrc.js` - ESLint rules and code style enforcement

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide including:
- Custom test DSL format
- Running and writing tests
- Test utilities and helpers
- Coverage configuration

## Extension Publishing

- Package: `npm run package` (creates `.vsix` file)
- Publish: `npm run deploy` (requires publisher credentials)
- Always run production build before packaging
- Version follows semver in `package.json`

## Important Notes

**DO:**
- Always use `import * as vsc from 'vscode'` and `import * as ts from 'typescript'`
- Check for `NonNullExpression` wrappers when working with AST nodes
- Use helpers from `src/utils/typescript.ts` for AST navigation
- Run production build before packaging the extension

**DON'T:**
- Don't use named imports for `vscode` or `typescript` modules
- Don't duplicate linter/formatter rules - refer to config files instead
- Don't commit focused tests (`it.only()`, `describe.only()`)
- Don't package without running production build first
