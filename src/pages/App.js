import React from 'react';
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import "../styles/base.css";
import '../styles/App.css';

import HomePage from './Home'


const App = ({ store, persistor }) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
    </PersistGate>
  </Provider>
)

export default App;
