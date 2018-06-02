const fs = require('fs-extra')
const { DOMParser, XMLSerializer } = require('xmldom')
const { NodeList } = require('xmldom/dom')

NodeList.prototype.find = Array.prototype.find
NodeList.prototype.forEach = Array.prototype.forEach
NodeList.prototype.filter = Array.prototype.filter

const save = 'saves/Chris_187014416'

const findLocation = (doc, name) => doc
  .getElementsByTagName('SaveGame')[0]
  .getElementsByTagName('locations')[0]
  .getElementsByTagName('GameLocation')
  .find(tag => (
    tag.getElementsByTagName('name').find(({ textContent }) => textContent === name)
  ))

const processSave = async () => {
  const xml = await fs.readFile(save, 'utf8')
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml)

  const terrainFeatures = findLocation(doc, 'Farm').getElementsByTagName('terrainFeatures')[0]

  terrainFeatures
    .getElementsByTagName('item')
    .forEach((feature) => {
      const type = feature.getElementsByTagName('TerrainFeature')[0].getAttribute('xsi:type')

      if (type === 'Tree') {
        terrainFeatures.removeChild(feature)
      }
    })

  const xmlSerializer = new XMLSerializer()
  const xmlBuffer = xmlSerializer.serializeToString(doc)
  await fs.writeFile(`${save}_modded`, xmlBuffer)
}

processSave().catch(console.error)
