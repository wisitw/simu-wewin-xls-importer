import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import rootReducer from './reducers'


const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['router'],
  stateReconciler: autoMergeLevel2
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const d = () => {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)

  return { store, persistor }
}
export default d;