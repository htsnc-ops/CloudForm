import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from '../components/Auth/Login';
import ClientsList from '../components/Clients/ClientsList';
import TerminalView from '../components/Terminal/TerminalView';
import BrowserView from '../components/Browser/BrowserView';

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/clients" component={ClientsList} />
        <Route path="/terminal" component={TerminalView} />
        <Route path="/browser" component={BrowserView} />
      </Switch>
    </Router>
  );
};

export default Routes;