import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "h-8" }) => {
  return (
    <Link to="/" className="flex items-center gap-2 select-none">
      <img src="/Logo.svg" alt="RemitEasy" className={className} />
    </Link>
  );
};

export default Logo;