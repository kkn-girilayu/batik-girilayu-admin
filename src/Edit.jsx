import React, { useState, useRef, useEffect } from 'react';
import firebase from 'firebase';
import 'firebase/storage';
import { useParams, Redirect } from 'react-router-dom';
import { useAuth } from './contexts/AuthProvider';

import DashboardWindow from './DashboardWindow';
import EditorJs from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
// import Table from "@editorjs/table";
import ImageTool from '@editorjs/image';
import DatePicker from 'react-datepicker';
import Switch from 'react-switch';
import { toast } from 'react-toastify';
import * as FirebaseServices from './services/firestore';
import 'react-datepicker/dist/react-datepicker.css';

function Edit(props) {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [loadState, setLoadState] = useState('Loading...');
  const [postData, setPostData] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [published, setPublished] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [lastEdit, setLastEdit] = useState(new Date());
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const editorRef = useRef(null);
  const storage = firebase.storage();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const db = firebase.firestore();

    async function getData() {
      const blogPost = await db.collection('berita').doc(id).get();

      if (blogPost.data() === undefined) {
        setLoadState('Berita tidak ditemukan!');
        return;
      }
      setPostData(blogPost.data());
      setTitle(blogPost.data().title);
      setPublished(blogPost.data().isPublished);
      setDate(new Date(blogPost.data().publishTime));
      setExcerpt(blogPost.data().excerpt);
      setLastEdit(new Date(blogPost.data().lastEdit));
      setCategory(blogPost.data().category);
    }
    getData();
  }, [id]);

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
            console.log(downloadURL);
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

  async function handleSave() {
    if (isSubmitting) return;
    if (!title) {
      toast.error('Judul tidak boleh kosong!');
      return;
    }

    setIsSubmitting(true);

    const savedData = await editorRef.current.save();

    const strippedTitle = title
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    savedData.isPublished = published;
    savedData.publishTime = date.valueOf();
    savedData.title = title;
    savedData.slug = strippedTitle;
    savedData.id = postData.id;
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
              console.log(savedData);
              setIsSubmitting(false);
              FirebaseServices.updateNewsPost(savedData).then(() => toast.success('Berita berhasil disimpan!'));
            });
        }
      );
    } else if (postData.imgUrl) {
      savedData.imgUrl = postData.imgUrl;
      console.log(savedData);
      setIsSubmitting(false);
      FirebaseServices.updateNewsPost(savedData).then(() => toast.success('Berita berhasil disimpan!'));
    } else {
      savedData.imgUrl = '';
      console.log(savedData);
      setIsSubmitting(false);
      FirebaseServices.updateNewsPost(savedData).then(() => toast.success('Berita berhasil disimpan!'));
    }
  }

  function handleImgChange(e) {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  function imgOutput() {
    if (imgPreview) {
      return <img src={imgPreview} alt="" className="w-48 mb-4" />;
    } else if (postData.imgUrl) {
      return <img src={postData.imgUrl} alt="" className="w-48 mb-4" />;
    } else {
      return <img src="" alt="" className="w-48 mb-4" />;
    }
  }

  function handleExcerptChange(e) {
    setExcerpt(e.target.value);
    console.log(excerpt);
  }
  function handleCatChange(e) {
    setCategory(e.target.value);
    console.log(category);
  }

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const timeStr = `${lastEdit.getHours()}:${
    lastEdit.getMinutes() < 10 ? `0${lastEdit.getMinutes()}` : lastEdit.getMinutes()
  }`;

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-xl text-center mb-8">Edit Berita</h1>
          {!postData.blocks || postData === undefined ? (
            <>
              <p className="text-center py-10 font-bold">{loadState}</p>
            </>
          ) : (
            <>
              <div style={{ maxWidth: '750px' }}>
                <input
                  type="text"
                  placeholder="Judul berita"
                  className="block w-full focus:outline-none text-2xl mb-2 font-bold text-red-500"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <small className="block mb-4 text-gray-400">
                  Terakhir diedit:{' '}
                  {`${lastEdit.getDate()} ${months[lastEdit.getMonth()]} ${lastEdit.getFullYear()} - ${timeStr}`}
                </small>
                <div className="shadow-lg w-full rounded-lg border border-gray-200 pt-4">
                  <EditorJs tools={tools} instanceRef={(instance) => (editorRef.current = instance)} data={postData} />
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
                  <p className="absolute post-menu-text font-bold text-white">
                    {expanded ? 'Tutup menu' : 'Buka menu'}
                  </p>
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
                      className="border border-gray-500 rounded-lg px-2 py-1 cursor-pointer"
                      dateFormat="dd/MM/yyyy - hh:mm aa"
                    />
                  </div>

                  <div className="">
                    <h4 className="mb-2">Publish</h4>
                    <Switch checked={published} onChange={() => setPublished(!published)} />
                  </div>

                  <div className="">
                    <h4 className="mb-2">Gambar Berita</h4>
                    {imgOutput()}
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
                  className={`inline-block bg-red-400 hover:bg-red-500 disabled transition duration-150 ease-in-out py-3 px-5 rounded-lg text-white font-bold`}
                  onClick={isSubmitting ? null : handleSave}
                  disabled={isSubmitting}
                >
                  Simpan
                </button>
              </div>
            </>
          )}
        </DashboardWindow>
      ) : (
        <Redirect to="/login" />
      )}
    </>
  );
}

export default Edit;
