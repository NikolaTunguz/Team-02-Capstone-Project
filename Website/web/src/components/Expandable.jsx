import React from 'react';
import { useState } from 'react';
// import {ExpandLessIcon, ExpandMoreIcon} from '@mui/icons-material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Expandable = ({ preview, content, style }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
      <div className="expandable" style={{...style, paddingTop: '1rem'}}>
          <div className="preview">
              <div className="text"
              style={{ fontSize: '1.1rem' }} 
              >{preview}</div>
              <button style={{ backgroundColor: 'white', border: '0px' }} onClick={() => setIsOpen(!isOpen)}>
                  {!isOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </button>
          </div>
          <div>{isOpen && <div className="content">{content}</div>}</div>
      </div>
  );
};

export default Expandable;