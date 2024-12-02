import React from 'react';
import { useState } from 'react';
// import {ExpandLessIcon, ExpandMoreIcon} from '@mui/icons-material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Expandable = ({ preview, content }) => {

    const[isOpen, setIsOpen] = useState(false);

  return (
    <div className="expandable">
        <div className="preview">
          <div className="text">
            {preview}
          </div>
          <button style={{backgroundColor:'white', border:'0px'}} onClick={() => setIsOpen(!isOpen)}>
            {!isOpen ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
          </button>
        </div>

        <div>
          {isOpen && (<div className='content'>{content}</div>)}
        </div>
    </div>
  );
};

export default Expandable;