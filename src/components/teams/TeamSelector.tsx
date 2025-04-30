interface TeamSelectorProps {
    onSelect: (size: 2 | 3) => void;
    selected: 2 | 3 | null;
}

export default function TeamSelector({
    onSelect,
    selected
}: TeamSelectorProps): React.ReactElement {
    return (
        <div className="mb-8 flex justify-center gap-4">
            <button
                onClick={() => onSelect(2)}
                className={`rounded-lg px-8 py-4 text-2xl font-bold transition-all ${
                    selected === 2
                        ? 'bg-blue-600 text-white'
                        : 'border-2 border-gray-200 bg-white text-gray-800 hover:border-blue-600'
                }`}
            >
                2v2
            </button>
            <button
                onClick={() => onSelect(3)}
                className={`rounded-lg px-8 py-4 text-2xl font-bold transition-all ${
                    selected === 3
                        ? 'bg-blue-600 text-white'
                        : 'border-2 border-gray-200 bg-white text-gray-800 hover:border-blue-600'
                }`}
            >
                3v3
            </button>
        </div>
    );
}
