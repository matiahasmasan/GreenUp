export default function AddonFilter({ showOnlyWithAddons, onToggle }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 border border-gray-300 rounded-lg bg-white">
      <input
        type="checkbox"
        id="addon-filter"
        checked={showOnlyWithAddons}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-4 h-4 text-green-500 rounded cursor-pointer accent-green-500"
      />
      <label
        htmlFor="addon-filter"
        className="cursor-pointer text-sm font-small text-gray-700"
      >
        Show products with add-ons
      </label>
    </div>
  );
}
