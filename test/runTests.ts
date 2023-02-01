import * as path from 'path'
import * as cp from 'child_process'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../')

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './index')

    // Download VS Code, unzip it and run the integration test
    const oldSpawn = cp.spawn
    //@ts-expect-error monkey patching to filter out electron error output noise
    cp.spawn = (command, args, options) => {
      const child = oldSpawn(command, args, options)
      child.stderr.on = (event, listener) => {
        if (event === 'data') {
          return
        }
        return child.stderr.addListener(event, listener)
      }
      return child
    }
    await runTests({ extensionDevelopmentPath, extensionTestsPath })
  } catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
}

main()
