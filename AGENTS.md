# AGENTS.md

VSCode extension providing postfix templates for TypeScript/JavaScript using TypeScript AST parsing for context-aware completions.

## Non-standard build commands
- npm run compile
- npm run vscode:prepublish
- node build.mjs --watch

## More details
- [docs/agents/commands.md](docs/agents/commands.md)
- [docs/agents/code-style.md](docs/agents/code-style.md)
- [docs/agents/architecture.md](docs/agents/architecture.md)
- [docs/agents/testing.md](docs/agents/testing.md)
- [docs/agents/publishing.md](docs/agents/publishing.md)
- [docs/agents/important-files.md](docs/agents/important-files.md)

## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
