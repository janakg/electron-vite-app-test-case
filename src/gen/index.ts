import path from 'path'
import { cwd } from 'process'
import getHBWasm from 'hbuzz'

async function init() {
  try {
    const hb = await getHBWasm()
    console.log('hb', hb)
  } catch (e) {
    console.error(e)
  }
}

init()

console.log('ExecPath', process.execPath)
console.log('CWD', cwd())

process.on('message', (m) => {
  console.log('Got message:', m)
  //@ts-ignore
  process.send(`Hash of ${m} is: "something from child"`)
})
