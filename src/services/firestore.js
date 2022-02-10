import firebase from "firebase";
import "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

export const createBlogPost = (item) => {
  return db
    .collection("blog")
    .doc(item.id)
    .set({
      ...item,
      lastEdit: new Date().valueOf(),
    });
};

export const updateBlogPost = (item) => {
  return db
    .collection("blog")
    .doc(item.id)
    .set({
      ...item,
      lastEdit: new Date().valueOf(),
    });
};

export const deleteBlogPost = (id) => {
  return db.collection("blog").doc(id).delete();
};

export const getBlogPost = () => {
  return db.collection("blog").orderBy("time", "desc").get();
};

export function updateProfile(uid, item) {
  return db.collection("admin").doc(uid).set(item);
}

export const uploadImage = (file) => {
  const uploadTask = storage.ref(`blog/${file.name}`).put(file);
  return uploadTask.on(
    "state_changed",
    (snapshot) => {},
    (error) => {
      console.log(error);
    },
    () => {
      storage
        .ref("blog")
        .child(file.name)
        .getDownloadURL()
        .then((url) => {
          return { url };
        });
    }
  );
};
