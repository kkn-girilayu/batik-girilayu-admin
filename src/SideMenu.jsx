import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from './assets/logo.png';
import { useAuth } from './contexts/AuthProvider';

function SideMenu(props) {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  }

  return (
    <div className="w-1/5 bg-blue-50 h-screen text-center py-14" style={{ position: 'fixed', top: 0 }}>
      <Link to="/berita">
        <img src={logo} className="h-16 block mx-auto mb-8" />
      </Link>

      <div className="py-8">
        <Link
          to="/buat"
          className="bg-red-400 hover:bg-red-500 transition duration-150 ease-in-out py-3 px-5 rounded-lg text-white font-bold"
        >
          Buat posting baru
        </Link>
      </div>

      <ul className="mt-10">
        <li className="mb-4">
          <NavLink className="text-gray-500" activeClassName="font-bold text-gray-600" to="/berita">
            Berita
          </NavLink>
        </li>
        <li className="mb-4">
          <NavLink className="text-gray-500" activeClassName="font-bold text-gray-600" to="/ganti-password">
            Ganti Password
          </NavLink>
        </li>
      </ul>

      <div className="mt-14">
        <Link className="text-red-500" to="#" onClick={handleLogout}>
          Log out
        </Link>
      </div>
    </div>
  );
}

export default SideMenu;
