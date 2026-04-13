import * as path from 'path'
import Mocha from 'mocha'
import { glob } from 'glob'

export async function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })

  mocha.timeout(process.env.DEBUGGING ? 999999 : 5000)

  const testsRoot = path.resolve(__dirname, '..')
  const files = await glob('**/**.test.js', { cwd: testsRoot })

  files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

  await new Promise<void>((resolve, reject) => {
    mocha.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`))
      } else {
        resolve()
      }
    })
  })
}
