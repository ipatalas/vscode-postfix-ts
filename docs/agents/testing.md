# Testing

## Running tests

```bash
npm test
npm run test-with-coverage
npm run pretest
npm run pretest && npm test
```

## Local-only focus
Use focused tests to speed up local iteration, but never commit them:
- Test.only(...)
- it.only(...)
- describe.only(...)

## Detailed references
- [docs/testing/environment.md](../testing/environment.md)
- [docs/testing/files.md](../testing/files.md)
- [docs/testing/dsl.md](../testing/dsl.md)
- [docs/testing/helpers.md](../testing/helpers.md)
- [docs/testing/debugging.md](../testing/debugging.md)
- [docs/testing/coverage.md](../testing/coverage.md)
- [docs/testing/patterns.md](../testing/patterns.md)
