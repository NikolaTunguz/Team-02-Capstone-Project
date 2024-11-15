import React from 'react';
import { useState } from 'react';


const Expandable = ({ preview, content }) => {

    const[isOpen, setIsOpen] = useState(false);

  return (
    <div className="expandable">
        <div className="preview">
            {preview}
            <button onClick={() => setIsOpen(!isOpen)}>
                {!isOpen ? 'show':'hide'}
            </button>
        </div>
            {isOpen && (<div className='content'>{content}</div>)}
    </div>
  );
};

export default Expandable;