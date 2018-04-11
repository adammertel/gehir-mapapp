import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import MapTopics from './enums/maptopics';
import dispatcher from './dispatcher';
import Base from './base';
import Actions from './enums/actions.js';
import injectTapEventPlugin from 'react-tap-event-plugin';

import 'leaflet/dist/leaflet.css';
require('./app.css');
injectTapEventPlugin();

// initial app state
window['dispatcher'] = dispatcher;
window['appUpdate'] = null;
window['data'] = {};
window['map'] = false;
window['newwRefreshMap'] = false;

window['windowWidth'] = 0;

const initTopic = MapTopics.MITHORIG;

window['appState'] = {
  windowWidth: 500,
  infoOpen: false,
  activeBaseLayer: 'awmc',
  activeMapTopic: initTopic.label,
  mapCenter: initTopic.originLatLng,
  mapZoom: initTopic.originZoom,
  modal: 'welcome',
  activeOverlays: [],
  controlOptions: {
    isis: {
      artefactDistance: 60000,
      templeDistance: 100000,
      circleStep: 30000
    },
    christrome: {
      churchRadius: 80,
      mode: 'regions'
    },
    mithorig: {
      gridSize: 7000,
      dubious: true,
      definitive: true,
      probable: true
    }
  }
};

window.onresize = function(event) {
  checkWidnowWidth();
};

var checkWidnowWidth = () => {
  dispatcher.dispatch(Actions['WIDTH_CHANGE'], { newWidth: window.innerWidth });
};

Object.keys(MapTopics).map(mapTopicKey => {
  const mapTopic = MapTopics[mapTopicKey];
  mapTopic.dataFiles.map(dataFile => {
    Base.requestDataFile(
      dataFile.path + '.' + dataFile.type,
      data => (window['data'][dataFile.name] = data)
    );
  });
  checkWidnowWidth();
});

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement('div'))
);
