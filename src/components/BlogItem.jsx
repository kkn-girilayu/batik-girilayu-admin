import React, { useState } from 'react';

import { ReactComponent as View } from '../assets/view.svg';
import { ReactComponent as Edit } from '../assets/edit.svg';
import { ReactComponent as Delete } from '../assets/delete.svg';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/helpers';

function BlogItem(props) {
  const [onAlert, setOnAlert] = useState(false);

  const date = new Date(props.date);

  return (
    <div className="blog-item flex justify-between items-center border-b py-4 relative">
      <div className="flex items-center gap-6">
        <div
          className="post-thumb w-52 h-28 flex-shrink-0 bg-gray-300 rounded-md"
          style={{ backgroundImage: `url(${props.imgUrl})` }}
        ></div>
        <div className="flex-grow self-start">
          <h3 className="font-bold text-lg my-0">{props.title}</h3>
          {props.isPublished ? (
            <small className="inline-block py-1 px-3 mb-3 mt-1 rounded-full bg-green-400 font-bold text-white">
              Publik
            </small>
          ) : (
            <small className="inline-block py-1 px-3 mb-3 mt-1 rounded-full bg-gray-400 font-bold text-white">
              Private
            </small>
          )}

          <small className="block">{props.date ? date.toDateString() : null}</small>

          {props.normalPrice && props.discountPrice ? (
            <>
              <small className="block line-through"> {formatCurrency(props.normalPrice)}</small>
              <small className="block"> {formatCurrency(props.discountPrice)}</small>
            </>
          ) : props.normalPrice ? (
            <small className="block"> {formatCurrency(props.normalPrice)}</small>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          href={`${process.env.REACT_APP_WEB_URL}${props.webPath}/${props.slug}`}
          target="_blank"
          rel="noreferrer"
          className="py-2 px-2"
        >
          <View />
        </a>

        <Link to={`/${props.editPath}/${props.id}`} className="py-2 px-2">
          <Edit />
        </Link>

        <Link to="#" className="py-2 px-2" onClick={() => setOnAlert(true)}>
          <Delete />
        </Link>
      </div>

      {onAlert && (
        <>
          <div className="absolute right-8 text-center w-64 h-24 bg-white rounded-lg border border-gray-400 shadow-lg flex flex-col justify-center items-center z-10">
            <h4 className="my-0 mb-3">Yakin akan hapus?</h4>
            <div className="flex gap-4">
              <button
                className="bg-white hover:bg-gray-300 transition duration-150 ease-in-out py-1.5 px-6 rounded-lg border-2 border-gray-500"
                onClick={() => setOnAlert(false)}
              >
                Batal
              </button>
              <button
                className="bg-red-500 hover:bg-red-400 transition duration-150 ease-in-out py-1.5 px-6 rounded-lg text-white font-bold"
                onClick={() => props.onDelete(props.id)}
              >
                Hapus
              </button>
            </div>
          </div>

          <div
            className="absolute right-0 top-0 left-0 bottom-0 bg-black opacity-40 rounded-lg"
            onClick={() => setOnAlert(false)}
          ></div>
        </>
      )}
    </div>
  );
}

export default BlogItem;
