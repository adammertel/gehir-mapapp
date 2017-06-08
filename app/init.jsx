import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import MapTopics from './enums/maptopics'
import dispatcher from './dispatcher'
import Base from './base'
import Actions from './enums/actions.js'


// initial app state
window['dispatcher'] = dispatcher
window['appUpdate'] = null
window['data'] = {}

window['appState'] = {
  infoOpen: false,
  activeBaseLayer: 'awmc',
  activeMapTopic: MapTopics.OVERVIEW.label,
  mapCenter: [20, 20],
  mapZoom: 5,
  activeOverlays: [],
}

Object.keys(MapTopics).map( mapTopicKey => {
  const mapTopic = MapTopics[mapTopicKey]
  mapTopic.dataFiles.map( dataFile => {
    window['data'][dataFile.name] = Base.requestDataFile(dataFile.path + '.' + dataFile.type)
  })
})

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement('div'))
)

dispatcher.dispatch(Actions['MAP_TOPIC_CHANGE'], {newTopic: MapTopics.OVERVIEW.label})