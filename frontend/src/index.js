import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { createGlobalStyle } from 'styled-components';

import rootReducer from './reducers';
import App from './App';
import Reset from './components/Reset';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

const GlobalStyle = createGlobalStyle`
  body {
    background-color: black;
    overflow: hidden;
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <Reset/>
    <GlobalStyle />
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

