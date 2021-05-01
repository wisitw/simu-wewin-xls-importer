import { combineReducers } from 'redux'

var defaultSetting = {
  renderFrom: 1,
  renderTo:0,
  settings:{}
}

const setting = (state = defaultSetting, action) => {
  switch (action.type) {
    case 'UPDATE_SETTING':
      return {...state,...action.data};
    case 'LOG_OUT':
      return {...defaultSetting};
    default:
      return state
  }
}

const rootReducer = combineReducers({ setting })

export default rootReducer