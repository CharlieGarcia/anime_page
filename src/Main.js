import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './views/Home';
import Browse from './views/Browse';

function Main({ props }) {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/browse" component={Browse} />
    </Switch>
  );
}

export default Main;
