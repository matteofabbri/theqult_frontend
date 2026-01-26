
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './Icons';

interface SearchBarProps {
    className?: string;
    inputClassName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className, inputClassName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="search"
          placeholder="Search The Qult..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full bg-white border border-gray-300 rounded-md pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${inputClassName || 'py-2 text-sm'}`}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
