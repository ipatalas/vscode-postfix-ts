# Code style

## Formatting
- 2-space indentation
- See .eslintrc.js and .editorconfig for exact rules

## Import conventions
Use these module import patterns:
- import * as vsc from 'vscode'
- import * as ts from 'typescript'
- import * as _ from 'lodash'
- Use named imports for local modules, e.g. import { CompletionItemBuilder } from '../completionItemBuilder'

## Prohibited
- Do not use named imports for vscode or typescript modules
