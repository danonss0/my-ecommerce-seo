import Link from "next/link"
import { useRouter } from "next/router"

export default function FilterSort({ categories, currentCategory, currentSort }) {
  const router = useRouter()

  const handleSortChange = (e) => {
    router.push({
      pathname: "/",
      query: { ...router.query, sort: e.target.value }
    })
  }

  return (
    <div className="card shadow-sm p-3 mb-4">
      {/* Kategorie */}
      <h5 className="mb-3">Kategorie</h5>
      <ul className="list-unstyled categories-list">
        <li>
          <Link
            href={{ pathname: "/", query: { ...router.query, category: "all" } }}
            className={`category-link ${currentCategory === "all" ? "active" : ""}`}
          >
            Wszystkie
          </Link>
        </li>
        {categories.map(cat => (
          <li key={cat}>
            <Link
              href={{ pathname: "/", query: { ...router.query, category: cat } }}
              className={`category-link ${currentCategory === cat ? "active" : ""}`}
            >
              {cat}
            </Link>
          </li>
        ))}
      </ul>

      <hr />

      {/* Sortowanie */}
      <div>
        <label htmlFor="sort-select" className="form-label fw-semibold">Sortuj:</label>
        <select
          id="sort-select"
          className="form-select form-select-sm shadow-sm"
          value={currentSort}
          onChange={handleSortChange}
        >
          <option value="">Domyślnie</option>
          <option value="price_asc">Cena: rosnąco</option>
          <option value="price_desc">Cena: malejąco</option>
          <option value="name_asc">Nazwa: A-Z</option>
          <option value="name_desc">Nazwa: Z-A</option>
          <option value="rating_desc">Najwyżej oceniane</option>
        </select>
      </div>

      <style jsx>{`
        .categories-list li {
          margin-bottom: 0.5rem;
        }

        .category-link {
          display: block;
          padding: 6px 10px;
          color: #495057;
          font-weight: 500;
          border-left: 3px solid transparent;
          border-radius: 0 4px 4px 0;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .category-link:hover {
          background-color: #f8f9fa;
          color: #0d6efd;
        }

        .category-link.active {
          background-color: #e7f1ff;
          color: #0d6efd;
          border-left-color: #0d6efd;
        }
      `}</style>
    </div>
  )
}
