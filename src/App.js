import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';

import HomeView from './components/HomeView/HomeView';
import SearchView from './components/SearchView/SearchView'
import FilterView from './components/FilterViews/FilterView';
import MainNav from './components/NavViews/MainNav';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fade: 'in',
    }
  }

  renderHeaderComponent = () => {
    return (
      <>
        <Route
          path="/"
          component={MainNav}
        />
      </>
    );
  }

  renderMainComponent = () => {
    return (
      <>
        <Switch>
          <Route
            exact path="/"
            component={HomeView}
          />
          <Route
            path="/search"
            component={SearchView}
          />
          {['/starships/:shipId',
          '/people/:peopleId',
          '/planets/:planetId', 
          "/vehicles/:vehicleId", 
          "/characters/:characterId", 
          "/films/:filmId", 
          "/species/:speciesId"]
            .map(path => {
              return (
                <Route
                key={path}
                path={path}
                component={FilterView}
                />
              );
            })}
        </Switch>
      </>
    );
  }

  render() {
    return (
      <div className="container">
        <header role="banner">
          {this.renderHeaderComponent()}
        </header>
          <main role="main">
            {this.renderMainComponent()}
          </main>
      </div>
    );
  }
}