import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Reg from './components/register';

import React, { useState } from "react";
import {

  Routes,
  Route,
  Link
} from 'react-router-dom';
import Register from './components/register';
function App() {
  const [token, setToken] = useState("");

  return (
    <div className="App">

      <header className="App-header">
        <h1>Welcome to my donation site</h1>
        <img src={logo} className="App-logo" alt="logo" />
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



        </Routes>
      </header>
    </div>
  );
}

export default App;
