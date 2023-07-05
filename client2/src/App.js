import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import Dashboard from './components/dashboard';

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link
} from 'react-router-dom';
import Register from './components/register';
function App() {
  const [token, setToken] = useState("");
  useEffect(() => {
        init();
  }, []);
  const init = () => {
    const token = sessionStorage.getItem("SERVER_API_TOKEN");
    if (token)
    {
      setToken(token);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to my donation site</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <ul>
            <li><Link to="/signout">Signout</Link></li>
          </ul>
        </div>
        <Routes>
          <Route path="/" element={
            token ?
              <Dashboard token={token} />
              : <Login setToken={setToken} />} />
          <Route path="/reg" element={<Register setToken={setToken} />} />
          <Route path="/home" element={
            token ?
              <Dashboard token={token} />
              : <Login setToken={setToken} />} />
          <Route path="/signout" element={<Login setToken={setToken} />}/>
      
        </Routes>
      </header>
    </div>
  );
}

export default App;
