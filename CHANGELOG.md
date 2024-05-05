# Change Log

## [1.13.2] - 2024-05-05
### Added:
- option to enable extension based on .enablepostfix file [#116](https://github.com/ipatalas/vscode-postfix-ts/issues/116)

## [1.13.1] - 2023-09-08
### Added:
- option to define custom template as array of strings [#115](https://github.com/ipatalas/vscode-postfix-ts/issues/115)

## [1.13.0] - 2023-04-23
### Added:
- `forin` template
- `call` template
### Changed:
- Updated dependencies to support TypeScript 5.0

## [1.12.1] - 2023-03-02
### Fixed:
- Merged PR [#110](https://github.com/ipatalas/vscode-postfix-ts/pull/110) - fix for #108 and #109 - thx @zardoy for reporting and fixing!

## [1.12.0] - 2023-02-01
### Added:
- [.null & .undefined postfixes in if](https://github.com/ipatalas/vscode-postfix-ts/issues/89)
- [Svelte/Vue/Html support](https://github.com/ipatalas/vscode-postfix-ts/issues/97) - thx @zardoy for great work!
- long awaited `await` template
- option to disable particular built-in templates (see `postfix.disabledBuiltinTemplates`)
### Fixed:
- [Incorrect '\\\\' escaping](https://github.com/ipatalas/vscode-postfix-ts/issues/94)
- [Doesn't work correctly in complex binary expressions](https://github.com/ipatalas/vscode-postfix-ts/issues/88)
- Merged PR [#100](https://github.com/ipatalas/vscode-postfix-ts/pull/100) - fix for #99

## [1.11.3] - 2022-10-10
### Fixed:
- Fixed binary exrpression regression [#80](https://github.com/ipatalas/vscode-postfix-ts/issues/80)
- Merged PR [#86](https://github.com/ipatalas/vscode-postfix-ts/pull/86)
- [Incorrect JSX behavior](https://github.com/ipatalas/vscode-postfix-ts/issues/82)
- [Incorrect multiline indentation](https://github.com/ipatalas/vscode-postfix-ts/pull/83)

## [1.11.2] - 2022-09-21
### Fixed:
- Oooops, last release was incorrectly published, fixing manually for now - no changes here, only republish.

## [1.11.1] - 2022-09-20
### Fixed:
- [Don't display choice when only one variant is available](https://github.com/ipatalas/vscode-postfix-ts/issues/76)
- [Binary expression with equals regression](https://github.com/ipatalas/vscode-postfix-ts/issues/77)
- Merged PR [#78](https://github.com/ipatalas/vscode-postfix-ts/pull/70) - improvement for fix for #77

## [1.11.0] - 2022-09-18
### Added:
- Infer variable names for some templates [#63](https://github.com/ipatalas/vscode-postfix-ts/issues/63) - many thanks to @zardoy for great ideas and part of the implementation
- Merged PR [#73](https://github.com/ipatalas/vscode-postfix-ts/pull/73) - minor improvement for custom templates management
### Fixed:
- [Doesn't always work in binary expression](https://github.com/ipatalas/vscode-postfix-ts/issues/67)
- [Templates did not work inside nested method declaration](https://github.com/ipatalas/vscode-postfix-ts/issues/66)
- Merged PR [#70](https://github.com/ipatalas/vscode-postfix-ts/pull/70) - Fix for [#69](https://github.com/ipatalas/vscode-postfix-ts/issues/69)
- [Editor jumping when inserting a snippet](https://github.com/ipatalas/vscode-postfix-ts/pull/73) - credits to @zaradoy again

## [1.10.1] - 2022-06-26
### Changed:
- Merged PR [#61](https://github.com/ipatalas/vscode-postfix-ts/pull/61) - Print render text instead of raw body
### Fixed:
- [Incorrect insertion when in mid of expression](https://github.com/ipatalas/vscode-postfix-ts/issues/60)
- [Postfixes should be suggested only after .](https://github.com/ipatalas/vscode-postfix-ts/issues/64)

## [1.10.0] - 2022-05-22
### Added:
- Merged PR [#52](https://github.com/ipatalas/vscode-postfix-ts/pull/52) - Bundle extension to reduce size and improve startup time (thanks @jasonwilliams!)
- Merged PR [#54](https://github.com/ipatalas/vscode-postfix-ts/pull/54) - Fancy suggestions with syntax highlighting (thanks @zardoy!)
- Sensible default for custom template description if left empty
### Fixed:
- [Does not work with strings](https://github.com/ipatalas/vscode-postfix-ts/issues/48)
- [Incorrect expanding of $a.$a with double {{expr}} in snippet](https://github.com/ipatalas/vscode-postfix-ts/issues/55)

## [1.9.4] - 2021-05-01
### Added:
- New option to determine how to merge custom templates if they have the same name (fixes [#40](https://github.com/ipatalas/vscode-postfix-ts/issues/40))
### Fixed:
- [TM_CURRENT_LINE can not get correct value](https://github.com/ipatalas/vscode-postfix-ts/issues/45)

## [1.9.3] - 2021-02-28
### Added:
- New `.promisify` template (Type.promisify -> Promise<Type>)
### Fixed:
- ["when" on TypeScript types](https://github.com/ipatalas/vscode-postfix-ts/issues/41)

## [1.9.2] - 2020-08-09
### Fixed:
- [Using .log for object](https://github.com/ipatalas/vscode-postfix-ts/issues/37)

## [1.9.1] - 2019-11-17
### Added:
- Support for two different modes for `.undefined` and `.notundefined` templates. See [#27](https://github.com/ipatalas/vscode-postfix-ts/issues/27)
### Fixed:
- [Postfix does not work in function expression with variable declaration](https://github.com/ipatalas/vscode-postfix-ts/issues/26)
- [await'ed expression - wrong replacement](https://github.com/ipatalas/vscode-postfix-ts/issues/28)
- [return template does not work in some cases](https://github.com/ipatalas/vscode-postfix-ts/issues/29)

## [1.9.0] - 2019-09-25
### Added:
- Support for multiline expressions!
- New `.new` template for expressions (Type.new -> new Type())
- Support for `new SomeType().` scope
### Changed:
- [Show more templates in return statement](https://github.com/ipatalas/vscode-postfix-ts/commit/ba3f09c90a6a7dcffb93fdfbf748c7a1b2b9aa3c#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- [Do not show all templates when expression is a function argument](https://github.com/ipatalas/vscode-postfix-ts/commit/3518a7a75dd75d6dc0320313f11e8b897d86e268#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- [Do not show all templates when expression is inside variable declaration or assignment](https://github.com/ipatalas/vscode-postfix-ts/commit/d1c69a3de69e11c40f89d091c8d438b1e42f5279#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- Description in autocomplete now show the actual replacement instead of abstract one
### Fixed:
- [Binary expressions did not work when surrounded by brackets](https://github.com/ipatalas/vscode-postfix-ts/commit/52111da175ec3058184e199a5e65ee19fb90a296#diff-579bc502e2c0744db6d55afe38b9f3d9)
- Reload extension only when it's own configuration has been changed ([my bad!](https://github.com/ipatalas/vscode-postfix-ts/commit/8515485bfec38af2723be9b939066b1197725e46))

## [1.8.2] - 2019-09-01
### Changed:
- Merged PR [#25](https://github.com/ipatalas/vscode-postfix-ts/pull/25) - Enable extension in JSX/TSX by default

## [1.8.1] - 2018-10-21
### Fixed:
- Fixed issue [#17](https://github.com/ipatalas/vscode-postfix-ts/issues/17) - suggestions should not be shown inside comments

## [1.8.0] - 2018-07-01
### Added:
- Merged [#16](https://github.com/ipatalas/vscode-postfix-ts/pull/16) - cast templates (thanks @Coffee0127!)

## [1.7.0] - 2018-05-30
### Added:
- Enable usage of multiple '{{here}}' placeholder in a custom template (PR from @AdrieanKhisbe, thanks!)

## [1.6.0] - 2017-06-10
### Added:
- Support for array access expressions so that `expr[i]` will display suggestions as well
- Support for simple custom templates

## [1.5.1] - 2017-05-27
### Added:
- Fixed issue #9 - snippets always on top of suggestions

## [1.5.0] - 2017-05-13
### Added:
- Ability to activate extension in files other than JS/TS

## [1.4.0] - 2017-05-03
### Improved:
- `not` templates now really invert expressions (issue #7)

## [1.3.0] - 2017-04-11
### Added:
- New `foreach` template (issue #6) and general improvements in `for*` templates

## [1.2.0] - 2017-04-09
### Added:
- `not` template can now negate different parts of the expression (selected from Quick Pick)

### Fixed:
- Fixed issue #4 - Console templates are no longer suggested on console expression itself
- Fixed issue #5 - Already negated expressions can now be "un-negated" by using `not` template on them again

## [1.1.1] - 2017-04-05
### Added:
- Support for postfix templates on unary expressions (ie. i++)

### Fixed:
- Some fixes after adding basic tests

## [1.1.0] - 2017-04-03
### Added:
- Console templates (PR from @jrieken, thanks!)

## [1.0.0] - 2017-04-02

- Initial release
