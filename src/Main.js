import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './views/Home';
import Search from './components/Search';

function Main() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/search" component={Search} />
    </Switch>
  );
}

export default Main;
