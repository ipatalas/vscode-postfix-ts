# Test environment

Tests run in a headless VS Code instance using:
- Mocha
- Custom DSL for template tests
- c8 for coverage (configured in .c8rc.json)
- @vscode/test-electron

## Compilation requirement
Tests must be compiled to out/test/ before running. The pretest script handles this.
