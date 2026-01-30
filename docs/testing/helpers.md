# Test helpers

## Runners (test/runner.ts)
- runTest (alias: Test) — single-line template test
- runTestMultiline — multiline template test
- runTestQuickPick (alias: QuickPick) — quick pick interaction test
- runTestMultilineQuickPick — multiline quick pick test

Example:
import { runTest as Test } from './runner'

Test('template name | input{mytemplate} >> expected output')

## Utilities (test/utils.ts)
- testTemplate(dsl, options) — execute a template test
- testTemplateWithQuickPick(dsl, trimWhitespaces, skipSuggestions, cancelQuickPick)
- runWithCustomTemplate(template, callback) — temporary custom template registration
- delay(ms) — UI delays for suggestion/quick pick

Important: UI delays are required for suggestion widgets; helpers handle this automatically.

## Custom template tests
import { runWithCustomTemplate } from './utils'

const customTemplate = {
  name: 'mytemplate',
  body: 'custom {{expr}} output',
  when: ['expression']
}

runWithCustomTemplate(customTemplate, () => {
  Test('custom template | input{mytemplate} >> custom input output')
})
