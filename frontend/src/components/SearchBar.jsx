import { inputClass } from "./Button";

const sortOptions = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SearchBar({
  search,
  category,
  sort,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <form
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]"
      onSubmit={(event) => event.preventDefault()}
    >
      <label>
        <span className="sr-only">Search products</span>
        <input
          className={inputClass}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
        />
      </label>
      <label>
        <span className="sr-only">Category</span>
        <select
          className={inputClass}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Sort</span>
        <select
          className={inputClass}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value || "newest"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
