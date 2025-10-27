import { useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = 'Search by protein ID, e.g., A0A1B0GTQ4 or A0A1B0GTQ4,A0AV02',
}: SearchBarProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const validateProteinIds = (ids: string[]): boolean => {
    // UniProt ID pattern: starts with letter, followed by at least 5 alphanumeric chars
    const proteinIdPattern = /^[A-Z][A-Z0-9]{5,}$/;
    return ids.every((id) => proteinIdPattern.test(id));
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Empty input does nothing
    if (!input.trim()) {
      return;
    }

    // Clear previous error
    setError('');

    // Parse and validate protein IDs
    const proteinIds = input
      .split(',')
      .map((id) => id.trim().toUpperCase())
      .filter((id) => id.length > 0);

    if (proteinIds.length === 0) {
      return;
    }

    if (!validateProteinIds(proteinIds)) {
      setError(
        'Invalid protein ID format. Please use valid UniProt IDs (e.g., A0A1B0GTQ4)'
      );
      return;
    }

    // Navigate to subgraph page with query params
    const queryString = proteinIds.join(',');
    router.push(`/subgraph?proteins=${queryString}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Clear error on new input
    if (error) {
      setError('');
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white rounded-full shadow-lg border border-gray-300 flex items-center px-4 py-3 w-[600px] max-w-[90vw]">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 outline-none text-gray-700 text-sm"
              aria-label="Search proteins by ID"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Search
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-sm max-w-[600px]">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

