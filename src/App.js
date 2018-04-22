import React, { Component } from 'react';
import logo from './logo.svg';
import Main from './Main'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Anime Page</h1>
        </header>
        <Main />
      </div>
    );
  }
}

export default App;
