import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import DashboardWindow from './DashboardWindow';
import { deleteNewsPost } from './services/firestore';
import { toast } from 'react-toastify';

import firebase from 'firebase';
import BlogItem from './components/BlogItem';

import { useAuth } from './contexts/AuthProvider';

function Dashboard(props) {
  const { currentUser } = useAuth();
  const [postData, setPostData] = useState([]);

  useEffect(() => {
    const db = firebase.firestore();

    async function getData() {
      const blogPost = await db.collection('berita').orderBy('publishTime', 'desc').get();
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
                    date={blog.publishTime}
                    imgUrl={blog.imgUrl}
                    editPath="edit"
                    webPath="berita"
                    onDelete={(id) => {
                      deleteNewsPost(id).then(toast.error('Berhasil dihapus'));
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

export default Dashboard;
