# Debugging tests

## Focused runs (local only)
Use focused tests to speed up local iteration, but never commit them:
- Test.only(...)
- it.only(...)
- describe.only(...)

## Verbose output
NODE_ENV=test DEBUG=* npm test

## VS Code Extension Host debugging
1) Open the project in VS Code
2) Press F5 to launch Extension Development Host
3) Set breakpoints in test files
4) Run tests from the debug console

## Common failures
Timeout errors:
- VS Code UI not ready — increase delay in test utilities
- Extension not activated — check activation events

Template not found:
- Template name mismatch in DSL
- Template disabled in configuration
- Template not registered in extension

Unexpected output:
- Check whitespace (use trimWhitespaces: true)
- Check line endings (EOL differences)
- Check cursor position calculation
