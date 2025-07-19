type SearchBarProps = {
  query: string,
  onChange: (q: string) => void,
  onSearch: () => void,
};

export function SearchBar({ query, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Search songs..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded bg-neutral-800 text-white w-full"
      />
      <button
        onClick={onSearch}
        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded text-white"
      >
        Search
      </button>
    </div>
  );
}
