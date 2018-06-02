const fs = require('fs-extra')
const { DOMParser, XMLSerializer } = require('xmldom')
const { NodeList } = require('xmldom/dom')

NodeList.prototype.find = Array.prototype.find
NodeList.prototype.forEach = Array.prototype.forEach
NodeList.prototype.filter = Array.prototype.filter
NodeList.prototype.reduce = Array.prototype.reduce

const save = 'saves/Chris_187014416'
const terrainToRemove = ['Tree', 'Grass']
const objectsToRemove = ['Twig', 'Stone', 'Weeds']

const findLocation = (doc, name) => doc
  .getElementsByTagName('SaveGame')[0]
  .getElementsByTagName('locations')[0]
  .getElementsByTagName('GameLocation')
  .find(tag => (
    tag.getElementsByTagName('name').find(({ textContent }) => textContent === name)
  ))

const removeChildren = (node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

const logTypes = (location) => {
  const objectTypes = location
    .getElementsByTagName('objects')[0]
    .getElementsByTagName('item')
    .reduce((out, item) => {
      const type = item
        .getElementsByTagName('value')[0]
        .getElementsByTagName('Object')[0]
        .getElementsByTagName('name')[0]
        .textContent

      out.add(type)
      return out
    }, new Set())

  console.log('Object Types', Array.from(objectTypes))

  const featureTypes = location
    .getElementsByTagName('terrainFeatures')[0]
    .getElementsByTagName('item')
    .reduce((out, feature) => {
      const type = feature.getElementsByTagName('TerrainFeature')[0].getAttribute('xsi:type')

      out.add(type)
      return out
    }, new Set())

  console.log('Feature Types', Array.from(featureTypes))
}

const processSave = async () => {
  const xml = await fs.readFile(save, 'utf8')
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml)

  const farm = findLocation(doc, 'Farm')

  logTypes(farm)

  const terrainFeatures = farm.getElementsByTagName('terrainFeatures')[0]
  terrainFeatures
    .getElementsByTagName('item')
    .forEach((feature) => {
      const type = feature.getElementsByTagName('TerrainFeature')[0].getAttribute('xsi:type')

      if (terrainToRemove.includes(type)) {
        terrainFeatures.removeChild(feature)
      }
    })

  const objects = farm.getElementsByTagName('objects')[0]

  objects
    .getElementsByTagName('item')
    .forEach((item) => {
      const type = item
        .getElementsByTagName('value')[0]
        .getElementsByTagName('Object')[0]
        .getElementsByTagName('name')[0]
        .textContent

      if (objectsToRemove.includes(type)) {
        objects.removeChild(item)
      }
    })

  removeChildren(farm.getElementsByTagName('resourceClumps')[0])

  const xmlSerializer = new XMLSerializer()
  const xmlBuffer = xmlSerializer.serializeToString(doc)
  await fs.writeFile(`${save}_modded`, xmlBuffer)
}

processSave().catch(console.error)
