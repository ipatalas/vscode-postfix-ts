# Custom test DSL

## Basic format
Test('description | input{template} >> expected output')

## Syntax
- description — human-readable test description
- | — separator between description and test case
- input — code before applying the template
- {template} — template name in braces (e.g., {let}, {if})
- >> — separator between input and expected output
- expected output — code after applying the template

Example:
Test('let template | obj.call(){let} >> let name = obj.call()')

## Parsing behavior
The DSL parser in test/dsl.ts:
1) Splits input and expected output using >>
2) Extracts the template name from {template}
3) Replaces {template} with .template trigger
4) Calculates cursor position after typing the trigger

## Multiline format
Use runTestMultiline:
runTestMultiline(it, `description
| input line 1           >> expected line 1
| input line 2{template} >> expected line 2
`)

## QuickPick tests
Use runTestQuickPick:
QuickPick('description | input{template} >> expected', trimWhitespaces?, skipSuggestions?, cancelQuickPick?)

Parameters:
- trimWhitespaces — trim whitespace during comparison
- skipSuggestions — select nth suggestion
- cancelQuickPick — cancel the quick pick
