//@ts-check
import * as process from "node:process";
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const LANGUAGE = 'postfix'

function pretest() {
  const pkg = readPackageJson()
  pkg.contributes.languages = [{ id: LANGUAGE }]
  // Activate the extension right after start to avoid delay and failure in first test
  pkg.activationEvents = ['*']
  // Don't use bundler for tests as it breaks template usage tests
  pkg.main = './src/extension'
  writePackageJson(pkg)
}

const writePackageJson = (content) => {
  mkdirSync('./out', { recursive: true, })
  writeFileSync('./out/package.json', JSON.stringify(content, undefined, '\t'))
}
const readPackageJson = () => JSON.parse(readFileSync('package.json', 'utf8'))

const taskToExecute = { pretest }[process.argv[2] ?? '']
taskToExecute?.()
