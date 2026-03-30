import React from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, showModal }) {

  if (showModal) {
    return (createPortal(<div className="modal">{children}</div>, document.body));
  }

  return null;
}
