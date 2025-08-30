/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['imad.pl','static.komputronik.pl','eazymut.b-cdn.net','vist.eu',
      'laptophouse.pl','encrypted-tbn0.gstatic.com','static2.redcart.pl','static2.redcart.pl',
      'www.krsystem.pl','www.lg.com','cdn.x-kom.pl','images.morele.net'
    ], // <-- dodaj wszystkie zewnętrzne hosty, z których korzystasz
  },
};

export default nextConfig;
