import { useRouter } from 'next/router'

export default function FilterSort({ categories, currentCategory, currentSort }) {
  const router = useRouter()

  const handleCategoryChange = (e) => {
    router.push({ pathname: '/', query: { ...router.query, category: e.target.value } })
  }

  const handleSortChange = (e) => {
    router.push({ pathname: '/', query: { ...router.query, sort: e.target.value } })
  }

  return (
    <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
      <div>
        <label htmlFor="categorySelect" className="form-label me-2"><strong>Kategoria:</strong></label>
        <select
          id="categorySelect"
          className="form-select d-inline-block w-auto"
          value={currentCategory || 'all'}
          onChange={handleCategoryChange}
        >
          <option value="all">Wszystkie</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sortSelect" className="form-label me-2"><strong>Sortuj:</strong></label>
        <select
          id="sortSelect"
          className="form-select d-inline-block w-auto"
          value={currentSort || ''}
          onChange={handleSortChange}
        >
          <option value="">Brak</option>
          <option value="price_asc">Cena rosnąco</option>
          <option value="price_desc">Cena malejąco</option>
          <option value="name_asc">Nazwa A-Z</option>
          <option value="name_desc">Nazwa Z-A</option>
          <option value="rating_desc">Najlepsze oceny</option>
        </select>
      </div>
    </div>
  )
}
