const QRCode = require('qrcode')
const PDFDocument = require('pdfkit')
const Location = require('../models/location')
const checkpointKeyLength = Number(process.env['CHECKPOINT_KEY_LENGTH'])
const sha256 = require('js-sha256').sha256

module.exports = function (checkpointKey, res) {
  Location.findOne({checkpoint: checkpointKey }, async function (err, location) {
    if (err) {
      console.log(err)
    }
    const doc = new PDFDocument()
    const appDomain = process.env.APP_DOMAIN


    for( let i = 0 ; i < 5 ; i ++ ) {
      for( let j = 0 ; j < 7 ; j ++ ) {
        let realCheckpointKey = sha256(String(Math.random())).substring(0, checkpointKeyLength)
        let checkpointLink = `${appDomain}?checkpoint=${realCheckpointKey}`
        let checkpointQrCodeUrl = await QRCode.toDataURL(checkpointLink, { margin: 0, scale: 20 })
        let checkpointQrCodeImg = Buffer.from(checkpointQrCodeUrl.replace('data:image/png;base64,', ''), 'base64')
        // let websiteLink = process.env.ABOUT_URL
        // let websiteQRCodeUrl = await QRCode.toDataURL(websiteLink, { margin: 0, scale: 4 })
        // let websiteQrCodeImg = Buffer.from(websiteQRCodeUrl.replace('data:image/png;base64,', ''), 'base64')
        // doc.image('./public-checkpoint/track-covid.png', 0, 0, { width: 600 })
        doc.image(checkpointQrCodeImg, 10 + i * 110, 10 + j * 110, { width: 100 })
        // doc.image(websiteQrCodeImg, 378, 668.5, { width: 37 })
      }
    }
    doc.pipe(res)
    doc.end()
  })
}
