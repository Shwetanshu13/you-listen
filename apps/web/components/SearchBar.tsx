import { Search, X } from "lucide-react";

type SearchBarProps = {
  query: string;
  onChange: (q: string) => void;
  onSearch?: () => void; // Make onSearch optional
};

export function SearchBar({ query, onChange, onSearch }: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for songs, artists, albums..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
          className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 text-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search suggestions or recent searches could go here */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 -z-10 blur-xl opacity-50" />
    </div>
  );
}
