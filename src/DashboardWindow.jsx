import React from 'react';

function DashboardWindow(props) {
  return <div className="relative w-4/5 ml-auto py-10 px-20">{props.children}</div>;
}

export default DashboardWindow;
