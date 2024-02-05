import React from 'react';
import ReactDOM from 'react-dom'
import './style.css'
import store from './app/store'
import { Provider } from 'react-redux'
import App from 'App'

const React = require('react');

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
