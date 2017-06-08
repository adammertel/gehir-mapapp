import React from 'react'
import Styles from '../../enums/styles'

import MapOverlays from '../../enums/mapoverlays'

import Checkbox from 'material-ui/Checkbox'
import FontIcon from 'material-ui/FontIcon'

export default class PanelOverlaysList extends React.Component {

    componentDidMount () {
    }

    render () {
      return (
        <div>
          <h4>Ovelays:</h4>
          <div className="panel-overlays-list">
            {
              Object.keys(MapOverlays).map( mapOverlayKey => {
                let mapOverlay = MapOverlays[mapOverlayKey];
                return(
                  <div key={mapOverlayKey} style={Styles['PANEL_BUTTON_ROW']()}>
                    <Checkbox
                      label={mapOverlay.name}
                      onClick={this.props.handleChangeOverlays.bind(this, mapOverlay.id)}
                      checked={appState.activeOverlays.indexOf(mapOverlay.id) != -1}
                      style={Styles['PANEL_BUTTON_CELL']()}   
                    />
                    <FontIcon
                      data-tip={mapOverlay.info}
                      style={Styles['PANEL_HELP_BUTTON']()} 
                      className="material-icons md-48"
                    >
                      help
                    </FontIcon>
                  </div>
                );
             })
            }
          </div>
        </div>
      );
    }
}
