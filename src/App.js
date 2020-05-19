import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Dashboard from './Dashboard.js';

class App extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <BrowserRouter>
                    <div style={{ background: 'white' }}>
                        <Switch>
                            <Route path="/" component={ Dashboard } exact></Route>
                        </Switch>
                    </div>
                </BrowserRouter>
            </div>
        );
    }

}

export default App;
