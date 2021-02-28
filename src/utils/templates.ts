import * as vsc from 'vscode'
import * as glob from 'glob'
import { IPostfixTemplate } from '../template'
import { CustomTemplate } from '../templates/customTemplate'

export const loadCustomTemplates = () => {
  const config = vsc.workspace.getConfiguration('postfix')
  const templates = config.get<ICustomTemplateDefinition[]>('customTemplates')
  if (templates) {
    return templates.map(t => new CustomTemplate(t.name, t.description, t.body, t.when))
  }
}

export const loadBuiltinTemplates = () => {
  const templates: IPostfixTemplate[] = []

  const files = glob.sync('../templates/*.js', { cwd: __dirname })

  files.forEach(path => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const builder: () => IPostfixTemplate | IPostfixTemplate[] = require(path).build
    if (builder) {
      const tpls = builder()
      if (Array.isArray(tpls)) {
        templates.push(...tpls)
      } else {
        templates.push(tpls)
      }
    }
  })

  return templates
}

interface ICustomTemplateDefinition {
  name: string
  description: string
  body: string,
  when: string[]
}
