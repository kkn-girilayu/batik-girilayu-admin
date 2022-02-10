import React, { createContext, useEffect, useState, useContext } from "react";
import firebase from "firebase";
import "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider(props) {
  const auth = firebase.auth();
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  function login(email, pass) {
    return auth.signInWithEmailAndPassword(email, pass);
  }

  function logout() {
    return auth.signOut();
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  const value = {
    currentUser,
    login,
    logout,
    updatePassword,
    updateEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        props.children
      ) : (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
