import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './views/Home';
import Browse from './views/Browse';
import Detail from './views/Detail';

function App() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/search" component={Browse} />
      <Route path="/details/:id" component={Detail} />
    </Switch>
  );
}

export default App;
