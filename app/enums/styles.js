import StyleVariables from './stylevariables'
import Base from '../base'

var Styles = {
  'PANEL_WRAPPER': () => {
    return {
      position: 'absolute',
      left: 0,
      width: StyleVariables['PANEL_WIDTH'] - 20,
      top: StyleVariables['MENU_HEIGHT'],
      bottom: 0,
      overflow: 'hidden',
      backgroundColor: StyleVariables['COLOR_WHITE'],
      color: StyleVariables['COLOR_BLACK1'],
      padding: 10
    }
  },
  'PANEL_HELP_BUTTON': () => {
    return {
      float: 'right',
      marginRight: '20px',
      display: 'table-cell',
      cursor: 'pointer'
    }
  },
  'PANEL_BUTTON_ROW': () => {
    return {
      display: 'table-row'
    }
  },  
  'PANEL_BUTTON_CELL': () => {
    return {
      display: 'table-cell'
    }
  },  

  'MAP_WRAPPER': (infoOpen) => {
    let mapBottom = StyleVariables['INFO_MENU_HEIGHT'](infoOpen)
    return {
      position: 'absolute',
      left: StyleVariables['PANEL_WIDTH'],
      right: 0, 
      top: 0,
      bottom: mapBottom,
      overflow: 'hidden'
    }
  },
  'MAP': () => {
    return {
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }
  },

  'MENU_WRAPPER': () => {
    return {
      position: 'absolute',
      left: 0,
      width: '100%',
      bottom: StyleVariables['MENU_HEIGHT'],
      top: 0,
      overflow: 'hidden',
      backgroundColor: StyleVariables['COLOR_BLACK1']
    }
  },

  'INFO_WRAPPER': (open) => {
    return {
      position: 'absolute',
      left: StyleVariables['PANEL_WIDTH'],
      right: 0,
      bottom: 0,
      height:  StyleVariables['INFO_MENU_HEIGHT'](open),
      overflow: 'hidden',
      backgroundColor: StyleVariables['COLOR_WHITE'],
      paddingLeft: 15,
      paddingRight: 15
    }
  },
  'INFO_TOGGLE_BUTTON': () => {
    return {
      backgroundColor: StyleVariables['COLOR_GREY'],
      color: StyleVariables['COLOR_BLACK1'],
    }
  },
  'INFO_TEXT': () => {
    return {
      fontWeight: 200,
    }
  },
  'INFO_HEADING': () => {
    return {
      marginLeft: 10,
      fontWeight: 600,
      fontSize: 23,
      position: 'absolute',
      right: 20,
      top: 10
    }
  },
  'INFO_SUBHEADING': () => {
    return {
      marginLeft: 10,
      fontWeight: 500,
      fontSize: 20,
      position: 'absolute',
      right: 20,
      top: 35
    }
  },
  'INFO_VISIBLE': () => {
    return {
      width: '100%',
      display: 'inline-flex',
      height: StyleVariables['INFO_HIDDEN_HEIGHT'] - 40,
    }
  },
  'INFO_HIDDEN': () => {
    return {
      display: 'inline-flex' 

    }
  },
  'INFO_LEGEND': () => {
    return {
      margin: '0px 20px 0px 10px',
      width: '50%'
    }
  },
  'INFO_CONTROL': () => {
    return {
      margin: '0px 20px 0px 10px',
      width: '50%'
    }
  },

  'INFO_CONTROL_INPUT_WRAPPER': () => {
    return {
      height: 50
    }
  },
  'INFO_CONTROL_INPUT': () => {
    return {
      marginRight: '25px',
      top: '-15px',
      position: 'relative'
    }
  },
  'INFO_CONTROL_INPUT_LABEL': () => {
    return {
      position: 'relative',
      top: 5
    }
  },

  


  'HEADER4': () => {
    return {
      marginBottom: 0
    }
  },

  'LOGO_WRAPPER': () => {
    return {
      height: StyleVariables['MENU_HEIGHT'],
      width: StyleVariables['PANEL_WIDTH'],
      top: 0,
      left: 0,
      position: 'absolute',
      backgroundColor: StyleVariables['COLOR_ORANGE'],
      borderWidth: 0,
      cursor: 'pointer'
    }
  },
  'LOGO': () => {
    return {
      top: 15,
      left: 15,
      position: 'absolute',
      color: StyleVariables['COLOR_WHITE'],
      fontSize: 43,
    }
  },
  'LOGO_SUB': () => {
    return {
      position: 'absolute',
      fontSize: 10.5,
      fontWeight: 600,
      top: 25,
      left: 155,
      color: StyleVariables['COLOR_BLACK1']
    }
  },
}

module.exports = Styles
