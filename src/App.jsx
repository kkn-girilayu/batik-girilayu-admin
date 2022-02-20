import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Buat from './Buat';
import BuatProduk from './BuatProduk';
import ChangePassword from './ChangePassword';
import { AuthProvider } from './contexts/AuthProvider';

import Dashboard from './Dashboard';
import Edit from './Edit';
import EditProduk from './EditProduk';
import EditProfile from './EditProfile';
import Login from './Login';
import ProdukPage from './ProdukPage';
import SideMenu from './SideMenu';

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
            <Route path="/berita" exact>
              <Dashboard />
            </Route>
            <Route path="/produk" exact>
              <ProdukPage />
            </Route>
            <Route path="/edit/:id" exact>
              <Edit />
            </Route>
            <Route path="/edit-produk/:id" exact>
              <EditProduk />
            </Route>
            <Route path="/buat" exact>
              <Buat />
            </Route>
            <Route path="/buat-produk" exact>
              <BuatProduk />
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
