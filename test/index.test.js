'use strict'
// Stub Pear early so pear-ref (pear-run) doesn't die on load
global.Pear = {}
const run = require('pear-run')
const { test } = require('brittle')
const path = require('path')
const fs = require('fs')
const os = require('os')
const Helper = require('./helper')

const dirname = __dirname

test('crasher uncaught exception', async function (t) {
  t.plan(2)

  const dir = path.join(dirname, 'fixtures', 'crasher-uncaught-exception', 'index.js')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const swap = path.join(os.tmpdir(), `${Date.now()}`)
  await fs.promises.mkdir(swap)
  const pipe = run(dir, [swap])
  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)

  const crashlogPath = path.join(swap, 'testProcess.crash.log')
  await Helper.untilExists(crashlogPath)
  t.ok(fs.existsSync(crashlogPath), 'Crash log file should be created')

  await Helper.untilHandler(async () => {
    const logContent = await fs.promises.readFile(crashlogPath, 'utf8')
    return logContent.includes('Test uncaught exception')
  })
  const logContent = await fs.promises.readFile(crashlogPath, 'utf8')
  t.ok(logContent.includes('Test uncaught exception'), 'Log should contain the error message')
})

test('crasher unhandled rejection', async function (t) {
  t.plan(2)

  const dir = path.join(dirname, 'fixtures', 'crasher-unhandled-rejection', 'index.js')

  const teardown = Helper.rig()
  t.teardown(teardown)

  const swap = path.join(os.tmpdir(), `${Date.now()}`)
  await fs.promises.mkdir(swap)
  const pipe = run(dir, [swap])
  pipe.on('error', (err) => {
    if (err.code === 'ENOTCONN') return // when the other side destroys the pipe
    throw err
  })

  const pid = await Helper.untilResult(pipe)
  await Helper.untilExit(pid)

  const crashlogPath = path.join(swap, 'testProcess.crash.log')
  await Helper.untilExists(crashlogPath)
  t.ok(fs.existsSync(crashlogPath), 'Crash log file should be created')

  await Helper.untilHandler(async () => {
    const logContent = await fs.promises.readFile(crashlogPath, 'utf8')
    return logContent.includes('Test unhandled rejection')
  })
  const logContent = await fs.promises.readFile(crashlogPath, 'utf8')
  t.ok(logContent.includes('Test unhandled rejection'), 'Log should contain the error message')
})
