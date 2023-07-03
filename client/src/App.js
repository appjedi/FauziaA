import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import Donate from './components/donate';
import Reg from './components/register';

import React, { useState } from "react";
function App() {
  const [token, setToken] = useState("");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {token ?
          <Donate token={token} />
          :
          <div>
            <Login setToken={setToken} />
            <Reg setToken={setToken} />
          </div>
        }
      </header>
    </div>
  );
}

export default App;
