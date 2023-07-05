import React, { useState, useEffect } from "react";
import {useNavigate} from  "react-router-dom";
import { auth } from '../services/server';
import {
    Link
} from 'react-router-dom';
const Login = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  useEffect(() => {
        init();
  }, []);
    const navigate = useNavigate();

  const init = () => {
    const token = sessionStorage.removeItem("SERVER_API_TOKEN");
      console.log("signed out");
  }
    const usernameHandler = (e) => {
        setUsername(e.target.value);
        console.log("setUsername", e.target.value);
    };
    const passwordHandler = (e) => {
        setPassword(e.target.value);
        console.log("setPassword", e.target.value);
    };
    const donate = async () => {
        console.log("donate");
    }
    const login = async () => {
        const un = username;
        const pw = password;
       
        const token = await auth(un,pw);
        if (token) {
            console.log("responseData.token", token)
            setToken(token);
            navigate("/");
        }

    }
    return (
        <div>
            <p><input type="text" name="username" id="username" value={username} onChange={usernameHandler} placeholder="user name" /></p>
            <p><input type="password" name="password" id="password" value={password} onChange={passwordHandler} placeholder="password" /></p>
            <p><button onClick={login}>Login</button></p>
            <p><Link to="/reg">Register</Link></p>
        </div>)
}
export default Login;