import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-dark-border mt-auto bg-dark-bg py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <p className="text-sm text-light-muted">
              &copy; {new Date().getFullYear()} RemitEasy. Built on Solana.
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-light-muted hover:text-primary transition-colors p-2 -m-2">
              <Twitter size={20} />
            </a>
            <a href="github.com/thetruesammyjay" className="text-light-muted hover:text-primary transition-colors p-2 -m-2">
              <Github size={20} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;