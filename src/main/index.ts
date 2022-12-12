import { app } from 'electron'
import fetch from 'node-fetch'

import { makeAppSetup, makeAppWithSingleInstanceLock } from './factories'
import { MainWindow, registerAboutWindowCreationByIPC } from './windows'

import getHBWasm from 'hbuzz'
import fontBlob from '/Roboto-Black.ttf'

function render_font(hb: any, fontData: any, text: any) {
  const splits = fontData.split(';base64,')
  const header = splits[0] // Header data type
  const content = splits[1] // Base64 content
  var fontBlob = Buffer.from(content, 'base64')

  var blob = hb.createBlob(fontBlob)
  var face = hb.createFace(blob, 0)
  var font = hb.createFont(face)
  font.setScale(100, 100) // Optional, if not given will be in font upem

  var buffer = hb.createBuffer()
  buffer.addText(text || 'abc')
  buffer.guessSegmentProperties()
  // buffer.setDirection('ltr'); // optional as can be set by guessSegmentProperties also
  hb.shape(font, buffer) // features are not supported yet
  var result = buffer.json(font)

  var glyphs: any = {}
  result.forEach(function (x: any) {
    if (glyphs[x.g]) return
    glyphs[x.g] = {
      name: font.glyphName(x.g),
      path: font.glyphToPath(x.g),
      json: font.glyphToJson(x.g),
    }
  })

  var unicodes = face.collectUnicodes()

  buffer.destroy()
  font.destroy()
  face.destroy()
  blob.destroy()

  console.log('result', result)
  return { shape: result, glyphs: glyphs, unicodes: unicodes }
}

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady()
  await makeAppSetup(MainWindow)

  const hb = await getHBWasm()
  console.log('hb', hb)
  console.log('fontBlob --->', fontBlob)

  render_font(hb, fontBlob, 'hello electron vite')
  registerAboutWindowCreationByIPC()
})
