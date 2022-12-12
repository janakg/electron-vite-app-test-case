import hbjs from './hbjs'
import hbWasm from './hb.wasm?url'

//Hint::: Got the wasm file loader outside for better debugging, alternatively we can use vite-wasm plugin or rollup plugins
async function initWasm(opts = {}, url) {
  let result
  console.log('asset url -->', url)
  if (url.startsWith('data:')) {
    const urlContent = url.replace(/^data:.*?base64,/, '')
    let bytes
    if (typeof Buffer === 'function' && typeof Buffer.from === 'function') {
      bytes = Buffer.from(urlContent, 'base64')
    } else if (typeof atob === 'function') {
      const binaryString = atob(urlContent)
      bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
    } else {
      throw new Error(
        'Failed to decode base64-encoded data URL, Buffer and atob are not supported'
      )
    }
    result = await WebAssembly.instantiate(bytes, opts)
  } else {
    const response = await fetch(url)
    const contentType = response.headers.get('Content-Type') || ''
    if (
      'instantiateStreaming' in WebAssembly &&
      contentType.startsWith('application/wasm')
    ) {
      result = await WebAssembly.instantiateStreaming(response, opts)
    } else {
      const buffer2 = await response.arrayBuffer()
      result = await WebAssembly.instantiate(buffer2, opts)
    }
  }
  return result?.instance
}

export default async function getHBWasm() {
  const inst = await initWasm({}, hbWasm)
  return hbjs(inst)
}
