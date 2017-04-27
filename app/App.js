import React from 'react';
import Header from './Components/Header';
import Content from './Components/Content';
import Favicon from 'react-favicon';

import faviconUrl from './Assets/favicon.ico';

export default class App extends React.Component {
  render() {
    return (<div className="wrapper">
              <Header/>
              <Content/>
              <Favicon url={ faviconUrl }/>
            </div>)
  }

};