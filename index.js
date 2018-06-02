const fs = require('fs-extra')
const { DOMParser, XMLSerializer } = require('xmldom')

const save = 'saves/Chris_187014416'

const processSave = async () => {
  const xml = await fs.readFile(save, 'utf8')
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml)

  const locations = doc
    .getElementsByTagName('SaveGame')[0]
    .getElementsByTagName('locations')[0]
    .getElementsByTagName('GameLocation')

  const farm = Array.prototype.find.call(locations, tag => tag.getAttribute('xsi:type') === 'Farm')

  const xmlSerializer = new XMLSerializer()
  const xmlBuffer = xmlSerializer.serializeToString(doc)
  await fs.writeFile(`${save}_modded`, xmlBuffer)
}

processSave().catch(console.error)
