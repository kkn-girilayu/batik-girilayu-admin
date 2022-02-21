import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import { Redirect } from 'react-router-dom';
import { useAuth } from './contexts/AuthProvider';
import { updateProfile } from './services/firestore';
import DashboardWindow from './DashboardWindow';
import { toast } from 'react-toastify';

export default function EditProfile() {
  const { currentUser, updateEmail } = useAuth();

  useEffect(() => {
    const db = firebase.firestore();

    async function getData() {
      const currentUserData = await db.collection('admin').doc(currentUser.uid).get();

      if (currentUserData.data()) {
        setUserData(currentUserData.data());
      }
    }
    getData();
  }, [currentUser.uid]);

  const storage = firebase.storage();

  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    img: '',
  });
  const [nameEdit, setNameEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [bioEdit, setBioEdit] = useState(false);
  const [email, setEmail] = useState('');
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState('');

  function handleImgChange(e) {
    if (e.target.files[0]) {
      setImg(e.target.files[0]);
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function handleSave() {
    if (img !== null) {
      const uploadTask = storage.ref(`admin/${img.name}`).put(img);
      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref('admin')
            .child(img.name)
            .getDownloadURL()
            .then((url) => {
              const dataUpload = { ...userData };
              dataUpload.img = url;
              updateProfile(currentUser.uid, dataUpload)
                .then(() => {
                  toast.success('Profil berhasil diperbarui');

                  if (email && email !== currentUser.email) {
                    updateEmail(email)
                      .then(() => toast.success('Email berhasil diganti'))
                      .catch((err) => {
                        if (err.code === 'auth/requires-recent-login') {
                          return toast.error('Email gagal diganti: Mohon login ulang');
                        }
                        toast.error('Email gagal diganti');
                        console.log(err);
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  toast.error(err.message);
                });
            });
        }
      );
    } else {
      updateProfile(currentUser.uid, userData)
        .then(() => {
          toast.success('Profil berhasil diperbarui');

          if (email && email !== currentUser.email) {
            updateEmail(email)
              .then(() => toast.success('Email berhasil diganti'))
              .catch((err) => {
                if (err.code === 'auth/requires-recent-login') {
                  return toast.error('Email gagal diganti: Mohon login ulang');
                }
                toast.error('Email gagal diganti');
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.message);
        });
    }

    updateProfile(currentUser.uid, userData);
  }

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-3xl mb-8">Edit Profile</h1>

          <div className="w-full border border-gray-300 py-6 px-6 rounded-lg">
            <div className="flex">
              <div className="w-56 mr-8 flex-shrink-0 overflow-hidden">
                <div
                  className="w-48 h-48 bg-gray-300 img-overlay"
                  style={{
                    backgroundImage: userData.img ? `url(${userData.img})` : `url(${imgPreview})`,
                  }}
                ></div>
                <input type="file" name="profile" className="mt-4 max-w-56" onChange={handleImgChange} />
                <small className="block mt-4 text-gray-400">Gunakan gambar dengan aspek rasio 1:1 (kotak)</small>
              </div>
              <div className="">
                <div className="">
                  <h4 className="mb-0 mt-0">Nama</h4>
                  <div className="flex items-center">
                    {!nameEdit ? (
                      <>
                        <p className="text-gray-700">{userData.name ? userData.name : '<kosong>'}</p>
                        <button className="ml-6 text-sm text-red-500" onClick={() => setNameEdit(true)}>
                          Ubah
                        </button>
                      </>
                    ) : (
                      <input
                        type="text"
                        className="border-2 border-gray-400 rounded-md py-1 px-2"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      />
                    )}
                  </div>
                </div>
                <div className="">
                  <h4 className="mb-0">Email</h4>
                  <div className="flex items-center">
                    {!emailEdit ? (
                      <>
                        <p className="text-gray-700">{currentUser.email}</p>
                        <button className="ml-6 text-sm text-red-500" onClick={() => setEmailEdit(true)}>
                          Ubah
                        </button>
                      </>
                    ) : (
                      <input
                        type="email"
                        className="border-2 border-gray-400 rounded-md py-1 px-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    )}
                  </div>
                </div>
                <div className="">
                  <h4 className="mb-0">Bio</h4>
                  {!bioEdit ? (
                    <>
                      <p className="text-gray-700">{userData.bio ? userData.bio : '<kosong>'}</p>
                      <button className="mt-4 text-sm text-red-500" onClick={() => setBioEdit(true)}>
                        Ubah
                      </button>
                    </>
                  ) : (
                    <textarea
                      className="border-2 border-gray-400 rounded-md py-1 px-2 w-full"
                      value={userData.bio}
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    ></textarea>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button className="py-2 px-4 bg-red-400 text-white font-bold rounded-lg" onClick={handleSave}>
              Simpan
            </button>
          </div>
        </DashboardWindow>
      ) : (
        <Redirect to="/login" />
      )}
    </>
  );
}
