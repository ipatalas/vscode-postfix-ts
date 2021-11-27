import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'
import { CastTemplate } from '../templates/castTemplates'
import { ConsoleTemplate } from '../templates/consoleTemplates'
import { CustomTemplate } from '../templates/customTemplate'
import { ForTemplate, ForOfTemplate, ForEachTemplate } from '../templates/forTemplates'
import { IfTemplate, ElseTemplate, IfEqualityTemplate, IfTypeofEqualityTemplate } from '../templates/ifTemplates'
import { NewTemplate } from '../templates/newTemplate'
import { NotTemplate } from '../templates/notTemplate'
import { PromisifyTemplate } from '../templates/promisifyTemplate'
import { ReturnTemplate } from '../templates/returnTemplate'
import { VarTemplate } from '../templates/varTemplates'

export const loadCustomTemplates = () => {
  const config = vsc.workspace.getConfiguration('postfix')
  const templates = config.get<ICustomTemplateDefinition[]>('customTemplates')
  if (templates) {
    return templates.map(t => new CustomTemplate(t.name, t.description, t.body, t.when))
  }
}

export const loadBuiltinTemplates = () => {
  const templates: IPostfixTemplate[] = [
    new CastTemplate('cast'),
    new CastTemplate('castas'),
    new ConsoleTemplate('log'),
    new ConsoleTemplate('warn'),
    new ConsoleTemplate('error'),
    new ForTemplate(),
    new ForOfTemplate(),
    new ForEachTemplate(),
    new IfTemplate(),
    new ElseTemplate(),
    new IfEqualityTemplate('null', '===', null),
    new IfEqualityTemplate('notnull', '!==', null),
    new IfEqualityTemplate('undefined', '===', undefined, true),
    new IfEqualityTemplate('notundefined', '!==', undefined, true),
    new IfTypeofEqualityTemplate('undefined', '===', undefined),
    new IfTypeofEqualityTemplate('notundefined', '!==', undefined),
    new NewTemplate(),
    new NotTemplate(),
    new PromisifyTemplate(),
    new ReturnTemplate(),
    new VarTemplate('var'),
    new VarTemplate('let'),
    new VarTemplate('const')
  ]

  return templates
}

interface ICustomTemplateDefinition {
  name: string
  description: string
  body: string,
  when: string[]
}
