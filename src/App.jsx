import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Buat from "./Buat";
import ChangePassword from "./ChangePassword";
import { AuthProvider } from "./contexts/AuthProvider";

import Dashboard from "./Dashboard";
import Edit from "./Edit";
import EditProfile from "./EditProfile";
import Login from "./Login";
import SideMenu from "./SideMenu";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Route path="/" exact>
            <Redirect to="/login" />
          </Route>
          <Route path="/login" exact>
            <Login />
          </Route>
          <Route path="/edit" exact>
            <Redirect to="/login" />
          </Route>

          <div className="">
            <SideMenu />
            <Route path="/dashboard" exact>
              <Dashboard />
            </Route>
            <Route path="/edit/:id" exact>
              <Edit />
            </Route>
            <Route path="/buat" exact>
              <Buat />
            </Route>
            <Route path="/edit-profile" exact>
              <EditProfile />
            </Route>
            <Route path="/ganti-password" exact>
              <ChangePassword />
            </Route>
          </div>
        </Router>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
}

export default App;
