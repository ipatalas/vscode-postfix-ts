const fs = require('fs')

const LANGUAGE = 'postfix'
const ACTIVATION_EVENT = `onLanguage:${LANGUAGE}`
const task = process.argv.length > 2 && process.argv[2]

const tasksMap = new Map([
	['removeLanguage', removeContributeLanguage],
	['addLanguage', addContributeLanguage]
])

function removeContributeLanguage() {
	let pkg = readPackageJson()
	delete pkg.contributes.languages
	pkg.activationEvents = pkg.activationEvents.filter(x => x !== ACTIVATION_EVENT)
	writePackageJson(pkg)
}

function addContributeLanguage() {
	let pkg = readPackageJson()
	pkg.contributes.languages = [{id: LANGUAGE}]
	pkg.activationEvents = pkg.activationEvents.filter(x => x !== ACTIVATION_EVENT).concat(ACTIVATION_EVENT)
	writePackageJson(pkg)
}

const writePackageJson = (content) => fs.writeFileSync('./package.json', JSON.stringify(content, undefined, '\t'))
const readPackageJson = () => require('./package.json')

const taskToExecute = tasksMap.get(task)
taskToExecute && taskToExecute()
