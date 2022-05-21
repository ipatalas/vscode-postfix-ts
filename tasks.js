const fs = require('fs')

const LANGUAGE = 'postfix'
const ACTIVATION_EVENT = `onLanguage:${LANGUAGE}`
const task = process.argv.length > 2 && process.argv[2]

const tasksMap = new Map([
	['prerun', prerun],
	['pretest', pretest]
])

function prerun() {
	let pkg = readPackageJson()
	delete pkg.contributes.languages
	pkg.activationEvents = [
		'onLanguage:javascript',
		'onLanguage:typescript',
		'onLanguage:javascriptreact',
		'onLanguage:typescriptreact'
	]
	pkg.main = './out/extension'
	writePackageJson(pkg)
}

function pretest() {
	let pkg = readPackageJson()
	pkg.contributes.languages = [{id: LANGUAGE}]
	pkg.activationEvents = [ACTIVATION_EVENT]
	// Don't use bundler for tests as it breaks template usage tests
	pkg.main = './out/src/extension'
	writePackageJson(pkg)
}

const writePackageJson = (content) => fs.writeFileSync('./package.json', JSON.stringify(content, undefined, '\t'))
const readPackageJson = () => require('./package.json')

const taskToExecute = tasksMap.get(task)
taskToExecute && taskToExecute()
