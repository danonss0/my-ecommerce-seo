// pages/sitemap.xml.js
import { products } from '../data/products'

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const urls = ['','/cart', ...products.map(p => `/product/${p.id}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${baseUrl}${u}</loc></url>`).join('')}
  </urlset>`
  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()
  return { props: {} }
}
