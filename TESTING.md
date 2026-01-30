# Testing Guide

This document provides comprehensive information about testing in vscode-postfix-ts.

## Test Environment

Tests run in a headless VSCode instance using:
- **Mocha** - Test framework
- **Custom DSL** - Domain-specific language for concise template testing
- **c8** - Code coverage tracking (configured in `.c8rc.json`)
- **@vscode/test-electron** - VSCode extension testing harness

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test-with-coverage

# Compile TypeScript before running tests
npm run pretest

# Full test pipeline (compile + run)
npm run pretest && npm test
```

**Note:** Tests must be compiled to `out/test/` before running. The `pretest` script handles this automatically.

## Test File Structure

The test suite is organized as follows:

- `test/extension.singleline.test.ts` - Single-line template tests (let, var, if, for, etc.)
- `test/extension.multiline.test.ts` - Multiline template tests
- `test/extension.svelte-vue-html.test.ts` - Framework-specific tests (Svelte, Vue, HTML)
- `test/template.usage.test.ts` - Template usage and configuration tests
- `test/utils.test.ts` - Utility function tests
- `test/runner.ts` - Test runner functions and DSL execution
- `test/dsl.ts` - DSL parser implementation
- `test/utils.ts` - Test utilities and helpers
- `test/runTests.ts` - VSCode test harness entry point
- `test/index.ts` - Mocha configuration

## Custom Test DSL

This project uses a custom DSL (Domain-Specific Language) to make template tests concise and readable.

### Basic DSL Format

```typescript
Test('description | input{template} >> expected output')
```

### DSL Syntax Breakdown

**Components:**
- `description` - Human-readable test description
- `|` - Separator between description and test case
- `input` - The code before applying the template
- `{template}` - Template name in curly braces (e.g., `{let}`, `{if}`, `{for}`)
- `>>` - Separator between input and expected output
- `expected output` - The code after applying the template

**Example:**
```typescript
Test('let template | obj.call(){let} >> let name = obj.call()')
```

This test:
1. Types `obj.call().let` in the editor
2. Triggers the `let` template
3. Expects the result to be `let name = obj.call()`

### DSL Parsing

The DSL parser (`test/dsl.ts`) converts test strings into executable test cases:

```typescript
{
  input: 'obj.call().let',        // Text inserted into editor
  template: 'let',                 // Template name
  expected: 'let name = obj.call()', // Expected result
  cursorPosition: {                // Cursor position after typing
    line: 0,
    character: 14  // After '.let'
  }
}
```

The parser:
1. Splits input from expected output using `>>`
2. Extracts template name from `{template}` placeholder
3. Replaces `{template}` with `.template` (the trigger)
4. Calculates cursor position after typing the trigger

### Multiline DSL Format

For multiline tests, use `runTestMultiline`:

```typescript
runTestMultiline(it, `
description
| input line 1
| input line 2{template}
>> expected line 1
>> expected line 2
`)
```

**Leading `| ` markers** indicate input lines and are stripped during parsing.

### QuickPick Tests

Some templates show a quick pick menu (e.g., for choosing variable names). Use `runTestQuickPick`:

```typescript
QuickPick('description | input{template} >> expected', trimWhitespaces?, skipSuggestions?, cancelQuickPick?)
```

**Parameters:**
- `trimWhitespaces` - Whether to trim whitespace in comparison
- `skipSuggestions` - Number of suggestions to skip (selects nth item)
- `cancelQuickPick` - Whether to cancel the quick pick

## Test Runner Functions

All test runners are in `test/runner.ts`:

### `runTest` (alias: `Test`)
```typescript
Test('description | input{template} >> expected')
```
Single-line template test.

### `runTestMultiline`
```typescript
runTestMultiline(it, `
description
| input{template}
>> expected
`)
```
Multiline template test.

### `runTestQuickPick` (alias: `QuickPick`)
```typescript
QuickPick('description | input{template} >> expected', trimWhitespaces, skipSuggestions, cancelQuickPick)
```
Template test with quick pick interaction.

### `runTestMultilineQuickPick`
```typescript
runTestMultilineQuickPick(it, `
description
| input{template}
>> expected
`, trimWhitespaces, skipSuggestions, cancelQuickPick)
```
Multiline template test with quick pick interaction.

## Writing New Tests

### Basic Template Test

```typescript
import { runTest as Test } from './runner'

describe('My Template Tests', () => {
  Test('template name | input{mytemplate} >> expected output')
})
```

### Test with Options

```typescript
const withTrimWhitespaces = { trimWhitespaces: true }
Test('description | input{template} >> expected', withTrimWhitespaces)
```

### Focused Tests

To run only specific tests during development:

```typescript
// Run only this test
Test.only('description | input{template} >> expected')

// Run only this describe block
describe.only('My Template Tests', () => {
  // tests here
})
```

**Note:** There's no direct Mocha CLI for running individual test files. Use `it.only()` or `describe.only()` to focus on specific tests.

### Custom Template Tests

To test custom user-defined templates:

```typescript
import { runWithCustomTemplate } from './utils'

const customTemplate = {
  name: 'mytemplate',
  body: 'custom {{expr}} output',
  when: ['expression']
}

runWithCustomTemplate(customTemplate, () => {
  Test('custom template | input{mytemplate} >> custom input output')
})
```

## Test Utilities

### Key Helpers (`test/utils.ts`)

**`testTemplate(dsl, options)`**
Executes a template test from DSL string.

**`testTemplateWithQuickPick(dsl, trimWhitespaces, skipSuggestions, cancelQuickPick)`**
Executes a template test with quick pick interaction.

**`runWithCustomTemplate(template, callback)`**
Temporarily registers a custom template for testing.

**`delay(ms)`**
Adds delay for VSCode UI (suggestion widget, quick pick, etc.).

**Important:** Tests require delays for VSCode's suggestion UI to appear and respond. The test utilities handle this automatically.

## Coverage

Coverage is tracked using c8 and configured in `.c8rc.json`.

```bash
# Run tests with coverage report
npm run test-with-coverage
```

Coverage reports:
- Terminal output (summary)
- Detailed HTML report (if configured)
- Only includes `src/` directory (excludes tests, build files)

## Common Testing Patterns

### Testing Expression Templates

```typescript
Test('let template - binary expression | a * 3{let} >> let name = a * 3')
Test('let template - method call | obj.call(){let} >> let name = obj.call()')
Test('let template - property access | obj.a.b{let} >> let name = obj.a.b')
```

### Testing Control Flow Templates

```typescript
Test('if template | expr{if} >> if (expr) {\n\t\n}')
Test('else template | expr{else} >> if (!expr) {\n\t\n}')
```

### Testing Loop Templates

```typescript
Test('for template | arr{for} >> for (let i = 0; i < arr.length; i++) {\n\t\n}')
Test('forof template | arr{forof} >> for (const item of arr) {\n\t\n}')
```

### Testing with Non-Null Assertions

```typescript
Test('let template - non-null | test!{let} >> let name = test!')
Test('let template - chained | obj.call()!{let} >> let name = obj.call()!')
```

### Testing String Literals

```typescript
Test('let template - string #1 | "a string"{let} >> let name = "a string"')
Test('let template - template literal | `a ${value} string`{let} >> let name = `a ${value} string`')
```

## Debugging Tests

### Enable Verbose Output

Set environment variable for detailed test output:

```bash
NODE_ENV=test DEBUG=* npm test
```

### VSCode Extension Host Debugging

1. Open the project in VSCode
2. Press F5 to launch Extension Development Host
3. Set breakpoints in test files
4. Run tests from the debug console

### Common Test Failures

**Timeout errors:**
- VSCode UI not ready - increase delay in test utilities
- Extension not activated - check activation events

**Template not found:**
- Template name mismatch in DSL
- Template disabled in configuration
- Template not registered in extension

**Unexpected output:**
- Check whitespace (use `trimWhitespaces: true` option)
- Check line endings (EOL differences)
- Check cursor position calculation

## Test Environment Variables

```bash
NODE_ENV=test    # Set automatically by test scripts
```

## CI/CD Integration

Tests are designed to run in headless environments:
- No display required (uses Xvfb on Linux if needed)
- Deterministic output
- Exit codes indicate pass/fail

## Best Practices

1. **Use descriptive test names** - Include template name and scenario
2. **Test edge cases** - Non-null assertions, nested expressions, etc.
3. **Keep tests focused** - One assertion per test
4. **Use DSL for template tests** - More concise than manual setup
5. **Group related tests** - Use `describe` blocks
6. **Test both positive and negative cases** - Valid and invalid inputs
7. **Don't commit `.only()`** - Focused tests are for local development only
