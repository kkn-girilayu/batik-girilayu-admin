import React, { useState, useEffect } from "react";
import { ReactComponent as Logo } from "./assets/logo.svg";
import { useAuth } from "./contexts/AuthProvider";
import { useHistory } from "react-router-dom";

function Login(props) {
  const { login, currentUser } = useAuth();
  const history = useHistory();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    pass: "",
  });

  function handleChange(e, field) {
    const currForm = { ...loginForm };
    switch (field) {
      case "email":
        currForm.email = e.target.value;
        setLoginForm(currForm);
        break;
      case "pass":
        currForm.pass = e.target.value;
        setLoginForm(currForm);
        break;

      default:
        break;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    console.log(loginForm);
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.pass);
      setLoading(false);
      history.push("/dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.message);
      setTimeout(() => {
        setError(null);
      }, 4000);
    }
  }

  useEffect(() => {
    if (currentUser) {
      history.push("/dashboard");
    }
  }, [currentUser, history]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100 relative z-20">
      <div className="w-2/4 max-w-xl shadow-lg rounded-lg mx-auto px-10 py-10 bg-white">
        <Logo />
        {error && (
          <div className="py-4 text-center bg-red-500 text-white rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <form>
          <label htmlFor="email" className="font-bold">
            Email
          </label>
          <input
            type="email"
            onChange={(e) => {
              handleChange(e, "email");
            }}
            value={loginForm.email}
            className="block w-full rounded-lg focus:shadow-lg hover:shadow-lg focus:outline-none border-2 border-gray-400 focus:border-red-500 mb-8 py-1 px-2 transition animation-150"
          />
          <label htmlFor="password" className="font-bold">
            Password
          </label>
          <input
            type="password"
            onChange={(e) => {
              handleChange(e, "pass");
            }}
            value={loginForm.pass}
            className="block w-full rounded-lg focus:shadow-lg hover:shadow-lg focus:outline-none border-2 border-gray-400 focus:border-red-500 mb-8 py-1 px-2 transition animation-150"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="block mx-auto disabled:opacity-20 focus:shadow-lg focus:outline-none bg-red-400 hover:bg-red-500 focus:bg-red-500 transition animation-150 py-2 px-4 rounded-lg text-white font-bold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
