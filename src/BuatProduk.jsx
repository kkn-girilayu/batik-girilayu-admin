import React, { useState, useRef } from 'react';
import firebase from 'firebase';
import 'firebase/storage';
import { useAuth } from './contexts/AuthProvider';

import DashboardWindow from './DashboardWindow';
import EditorJs from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
// import Table from "@editorjs/table";
import ImageTool from '@editorjs/image';
import Switch from 'react-switch';
import { toast } from 'react-toastify';
import * as FirebaseServices from './services/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import { Redirect } from 'react-router-dom';

function BuatProduk() {
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
  const [normalPrice, setNormalPrice] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const [published, setPublished] = useState(false);
  const [image, setImage] = useState([]);
  const [imgPreview, setImgPreview] = useState([]);
  const [excerpt, setExcerpt] = useState('');
  const [details, setDetails] = useState([]);
  const [newDetails, setNewDetails] = useState({ title: '', content: '' });
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
    savedData.title = title;
    savedData.slug = strippedTitle;
    savedData.normalPrice = parseInt(normalPrice);
    savedData.discountPrice = discountPrice ? parseInt(discountPrice) : null;
    savedData.id = now;
    savedData.excerpt = excerpt;
    savedData.details = details;
    savedData.author = currentUser.uid;

    if (image.length > 0) {
      const imgInsert = [];
      image.forEach((img, idx) => {
        const uploadTask = storage.ref(`katalog/${img.name}`).put(img);
        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {
            console.log(error);
          },
          () => {
            storage
              .ref(`katalog/${img.name}`)
              .getDownloadURL()
              .then((url) => {
                imgInsert.push({ original: url, thumbnail: url, filename: img.name });

                if (idx + 1 === image.length) {
                  savedData.images = imgInsert;
                  FirebaseServices.createCataloguePost(savedData).then(() => {
                    toast.success('Produk berhasil disimpan!');
                    setIsSubmitting(false);
                  });
                }
              });
          }
        );
      });
    } else {
      savedData.images = [];
      FirebaseServices.createCataloguePost(savedData).then(() => {
        toast.success('Produk berhasil disimpan!');
        setIsSubmitting(false);
      });
    }
  }

  function handleImgChange(e) {
    if (e.target.files[0]) {
      if (e.target.files[0].size < 2097152) {
        setImage([...image, e.target.files[0]]);
        setImgPreview([...imgPreview, URL.createObjectURL(e.target.files[0])]);
      } else {
        toast.error('Ukuran file terlalu besar!');
      }
    }
  }

  function handleExcerptChange(e) {
    setExcerpt(e.target.value);
  }

  function handleAddDetails() {
    if (newDetails.title !== '' && newDetails.content !== '') {
      setDetails([...details, newDetails]);
      setNewDetails({ title: '', content: '' });
    }
  }

  function handleRemoveDetails(pos) {
    const detailsCopy = [...details];
    detailsCopy.splice(pos, 1);
    setDetails(detailsCopy);
  }

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-xl text-center mb-8">Tambahkan Produk</h1>
          <div style={{ maxWidth: '750px' }}>
            <input
              type="text"
              placeholder="Judul Produk"
              className="block w-full focus:outline-none text-2xl mb-2 font-bold text-red-500"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="shadow-lg w-full rounded-lg border border-gray-200 pt-4">
              <EditorJs tools={tools} instanceRef={(instance) => (editorRef.current = instance)} />
            </div>
          </div>

          {/* SIDE MENU */}
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
                <h4 className="mb-2">Harga</h4>
                <p className="text-sm">Harga normal</p>
                <input
                  type="number"
                  placeholder="Tulis tanpa titik (contoh: 150000)"
                  className="block w-full py-1 px-2 rounded-lg focus:outline-none text-sm mb-2 border border-gray-200"
                  value={normalPrice || ''}
                  onChange={(e) => setNormalPrice(e.target.value)}
                  required
                />
                <p className="text-sm">Harga diskon</p>
                <input
                  type="number"
                  placeholder="Tulis tanpa titik (contoh: 150000)"
                  className="block w-full py-1 px-2 rounded-lg focus:outline-none text-sm mb-2 border border-gray-200"
                  value={discountPrice || ''}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  required
                />
              </div>

              <div className="">
                <h4 className="mb-2">Publish</h4>
                <Switch checked={published} onChange={() => setPublished(!published)} />
              </div>

              <div className="">
                <h4 className=" mb-0">Gambar Produk</h4>
                <small className="block mb-4">Ukuran gambar maksimal 2MB</small>

                {imgPreview.map((img, idx) => (
                  <div key={idx * 100} className="flex shadow-md rounded-xl p-4 border-gray-200 border mb-3">
                    <div className="flex-grow">
                      <img className="max-h-24" src={img} alt="" />
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => {
                    setImgPreview([]);
                  }}
                  className={`bg-red-500 px-4 py-2 mb-3 rounded-lg font-bold text-center text-white cursor-pointer ${
                    imgPreview.length > 0 ? 'block' : 'hidden'
                  }`}
                >
                  Hapus semua
                </div>
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

              <div className="">
                <h4 className="mb-2">Detail</h4>
                {details.map((detailItem, idx) => (
                  <div key={idx} className="flex shadow-md rounded-xl p-4 border-gray-200 border mb-3">
                    <div className="flex-grow">
                      <div className="">
                        <h5 className="my-0">{detailItem.title}</h5>
                        <p>{detailItem.content}</p>
                      </div>
                    </div>
                    <div
                      onClick={() => handleRemoveDetails(idx)}
                      className="flex justify-center items-center transition-all font-bold bg-white hover:bg-red-500 hover:text-white rounded-md px-4 cursor-pointer"
                    >
                      X
                    </div>
                  </div>
                ))}

                <div className="flex shadow-md rounded-lg p-4 border-gray-200 border mb-3">
                  <div className="flex-grow">
                    <div className="">
                      <input
                        type="text"
                        placeholder="Judul detail"
                        className="block w-full py-1 px-2 rounded-md focus:outline-none text-sm mb-2 font-bold border border-gray-200"
                        value={newDetails.title}
                        onChange={(e) => setNewDetails({ ...newDetails, title: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Isi detail"
                        className="block w-full py-1 px-2 rounded-md focus:outline-none text-sm mb-2 border border-gray-200"
                        value={newDetails.content}
                        onChange={(e) => setNewDetails({ ...newDetails, content: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div
                  onClick={handleAddDetails}
                  className="bg-blue-500 px-4 py-2 rounded-lg font-bold text-center text-white cursor-pointer"
                >
                  Tambah
                </div>
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

export default BuatProduk;
