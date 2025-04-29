
import { Link } from 'react-router';
import { Brain, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Brain className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-lg font-bold">10xCards</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex space-x-4">
            <Link to="/about" className="text-neutral-500 hover:text-neutral-700 transition-colors">
            About
    </Link>
           
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-neutral-700" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} 10xCards. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

