import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './views/Home';
import Browse from './views/Browse';

function App() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/search" component={Browse} />
    </Switch>
  );
}

export default App;
