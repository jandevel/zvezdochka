import React from 'react';
import './UnderConstruction.css';
import constructionImage from '../../assets/under-construction-pic.png';

const UnderConstruction = () => {
  return (
    <div className="under-construction-container">
      <img src={constructionImage} alt="Under Construction" />
      <p>Under construction...</p>
    </div>
  );
};

export default UnderConstruction;