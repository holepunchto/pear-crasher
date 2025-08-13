const process = require('process')

const [swap] = global.Pear.app.args

const setupCrashHandlers = require('../../..')
setupCrashHandlers('testProcess', swap, true)

const main = async () => {
  const pipe = require('pear-pipe')()
  pipe.write(`${process.pid}\n`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  await new Promise((resolve, reject) => reject(new Error('Test unhandled rejection')))
}
main()
