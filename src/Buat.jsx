import React, { useState, useRef } from 'react';
import firebase from 'firebase';
import 'firebase/storage';
import { useAuth } from './contexts/AuthProvider';

import DashboardWindow from './DashboardWindow';
import EditorJs from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
// import Table from "@editorjs/table";
import DatePicker from 'react-datepicker';
import ImageTool from '@editorjs/image';
import Switch from 'react-switch';
import { toast } from 'react-toastify';
import * as FirebaseServices from './services/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import { Redirect } from 'react-router-dom';

function Buat(props) {
  const { currentUser } = useAuth();

  const tools = {
    // table: Table,
    header: Header,
    list: List,
    image: {
      class: ImageTool,
      config: {
        uploader: {
          async uploadByFile(file) {
            var storageRef = storage.ref();
            var imagesRef = storageRef.child('post-assets').child('images/' + file.name);
            var uploadTask = await imagesRef.put(file);
            console.log('Uploaded successfully!', uploadTask);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            return {
              success: 1,
              file: {
                url: downloadURL,
              },
            };
          },
        },
      },
    },
  };

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [published, setPublished] = useState(false);
  const [image, setImage] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [excerpt, setExcerpt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const editorRef = useRef(null);
  const storage = firebase.storage();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (isSubmitting) return;
    if (!title) {
      toast.error('Judul tidak boleh kosong!');
      return;
    }

    setIsSubmitting(true);

    const savedData = await editorRef.current.save();
    const dateSaved = new Date();
    const now = dateSaved.valueOf().toString();

    const strippedTitle = title
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    savedData.isPublished = published;
    savedData.publishTime = date.valueOf();
    savedData.title = title;
    savedData.slug = strippedTitle;
    savedData.id = now;
    savedData.excerpt = excerpt;
    savedData.author = currentUser.uid;

    if (image !== null) {
      const uploadTask = storage.ref(`berita/${image.name}`).put(image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref('berita')
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              savedData.imgUrl = url;
              FirebaseServices.createNewsPost(savedData);
              setIsSubmitting(false);
              toast.success('Berita berhasil disimpan!');
            });
        }
      );
    } else {
      savedData.imgUrl = '';
      FirebaseServices.createNewsPost(savedData);
      setIsSubmitting(false);
      toast.success('Berita berhasil disimpan!');
    }
  }

  function handleImgChange(e) {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  function handleExcerptChange(e) {
    setExcerpt(e.target.value);
  }

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-xl text-center mb-8">Tambahkan Berita</h1>
          <div style={{ maxWidth: '750px' }}>
            <input
              type="text"
              placeholder="Judul Berita"
              className="block w-full focus:outline-none text-2xl mb-2 font-bold text-red-500"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="shadow-lg w-full rounded-lg border border-gray-200 pt-4">
              <EditorJs tools={tools} instanceRef={(instance) => (editorRef.current = instance)} />
            </div>
          </div>

          <div
            className={`fixed flex bg-white shadow-2xl rounded-lg border border-gray-200 top-4 bottom-4 right-4 z-10 overflow-hidden transition duration-200 ease-in-out ${
              expanded ? 'post-menu-expanded' : 'post-menu-minimized'
            }`}
          >
            <div
              className="relative border-r border-gray-300 cursor-pointer flex flex-col items-center justify-center bg-red-400 hover:bg-red-500 transition duration-150 ease-in-out"
              style={{ height: '100%', width: '4rem' }}
              onClick={() => setExpanded(!expanded)}
            >
              <p className="absolute post-menu-text font-bold text-white">{expanded ? 'Tutup menu' : 'Buka menu'}</p>
            </div>
            <div
              className={`bg-white flex flex-col gap-4 mb-4 py-4 px-8 overflow-y-scroll `}
              style={{ width: '25rem', height: '100%' }}
            >
              <div className="">
                <h4 className="mb-2">Tanggal</h4>
                <DatePicker
                  showTimeInput
                  selected={date}
                  onChange={(newDate) => setDate(newDate)}
                  className="border border-gray-200 rounded-lg shadow-lg px-2 cursor-pointer"
                  dateFormat="dd/MM/yyyy - hh:mm aa"
                />
              </div>

              <div className="">
                <h4 className="mb-2">Publish</h4>
                <Switch checked={published} onChange={() => setPublished(!published)} />
              </div>

              <div className="">
                <h4 className="mb-2">Gambar Berita</h4>
                <img src={imgPreview || ''} alt="" className="w-48 mb-4" />
                <input type="file" name="thumbnail" onChange={handleImgChange} />
              </div>

              <div className="">
                <h4 className="mb-2">Intisari</h4>
                <textarea
                  name="excerpt"
                  rows="4"
                  className="w-full py-1 px-2 border border-gray-500 rounded-lg"
                  value={excerpt}
                  onChange={handleExcerptChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="text-center mt-10 cursor-pointer" style={{ maxWidth: '750px' }}>
            <button
              className="inline-block bg-red-400 hover:bg-red-500 transition duration-150 ease-in-out py-3 px-5 rounded-lg text-white font-bold"
              onClick={isSubmitting ? null : handleSave}
              disabled={isSubmitting}
            >
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

export default Buat;
