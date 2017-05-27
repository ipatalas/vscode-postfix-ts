export function delay (timeout) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeout)
  })
}

// for some reason editor.action.triggerSuggest needs more delay at the beginning when the process is not yet warmed up
// let's start from high delays and then slowly go to lower delays
let delaySteps = [2000, 1200, 700, 400, 300, 200, 100]

export const getCurrentDelay = () => (delaySteps.length > 1) ? delaySteps.shift() : delaySteps[0]
