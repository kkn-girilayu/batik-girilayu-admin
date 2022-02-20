import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import DashboardWindow from './DashboardWindow';

import firebase from 'firebase';
import { deleteCataloguePost } from './services/firestore';
import { toast } from 'react-toastify';
import BlogItem from './components/BlogItem';

import { useAuth } from './contexts/AuthProvider';

function ProdukPage() {
  const { currentUser } = useAuth();
  const [postData, setPostData] = useState([]);

  useEffect(() => {
    const db = firebase.firestore();

    async function getData() {
      const blogPost = await db.collection('katalog').orderBy('id', 'desc').get();
      setPostData(blogPost.docs.map((doc) => doc.data()));
    }
    getData();
  }, []);

  return (
    <>
      {currentUser ? (
        <DashboardWindow>
          <h1 className="font-bold text-3xl mb-8">Postingan Berita</h1>

          <div className="w-full border border-gray-300 py-3 px-3 rounded-lg">
            {postData.length === 0 ? (
              <>
                <p className="text-center">Loading...</p>
              </>
            ) : (
              <>
                {postData.map((blog) => (
                  <BlogItem
                    key={blog.id}
                    id={blog.id}
                    slug={blog.slug}
                    isPublished={blog.isPublished}
                    title={blog.title}
                    imgUrl={blog.images[0].thumbnail}
                    normalPrice={blog.normalPrice}
                    discountPrice={blog.discountPrice}
                    editPath="edit-produk"
                    webPath="katalog"
                    onDelete={(id) => {
                      deleteCataloguePost(id).then(toast.error('Berhasil dihapus'));
                      setTimeout(() => {
                        window.location.reload(false);
                      }, 2000);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </DashboardWindow>
      ) : (
        <Redirect to="/login" />
      )}
    </>
  );
}

export default ProdukPage;
