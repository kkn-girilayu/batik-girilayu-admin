import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthProvider';
import DashboardWindow from './DashboardWindow';

export default function ChangePassword() {
  const { currentUser, updatePassword } = useAuth();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');

  function handlePass() {
    if (pass1 !== pass2) {
      return toast.error('Password tidak sama');
    }

    if (!pass1 || !pass2) {
      return toast.error('Password tidak boleh kosong');
    }

    updatePassword(pass1)
      .then(() => {
        toast.success('Password berhasil diganti');
      })
      .catch((err) => {
        console.log(err);
        if (err.code === 'auth/requires-recent-login') {
          toast.error('Mohon login ulang');
        }
      });
  }

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-3xl mb-8">Ganti Password</h1>

          <div className="w-96 mx-auto mt-12 border border-gray-300 py-10 px-8 rounded-lg">
            <div className="">
              <h4 className="mb-2 mt-0">Password baru</h4>
              <input
                type="password"
                className="w-full py-2 px-2 border border-gray-400 rounded-md"
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
              />
            </div>
            <div className="">
              <h4 className="mb-2">Konfirmasi Password Baru</h4>
              <input
                type="password"
                className="w-full py-2 px-2 border border-gray-400 rounded-md"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
              />
            </div>

            <div className="text-center mt-10">
              <button className="py-2 px-4 bg-red-400 text-white font-bold rounded-lg" onClick={handlePass}>
                Ganti Password
              </button>
            </div>
          </div>
        </DashboardWindow>
      ) : (
        <Redirect to="/login" />
      )}
    </>
  );
}
