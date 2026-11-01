/**
 * Storefront editorial photos (Unsplash licence: free commercial use, no attribution required).
 * Chosen without visible third-party brand logos. Swap for the store's own shoots when available.
 */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70`;

export const PHOTOS = {
  hero: { src: unsplash("1706675780107-7c43cc487928"), alt: "Floodlit football stadium during a night match" },
  jerseys: { src: unsplash("1560272564-c83b66b1ad12"), alt: "Player in a dark jersey striking a football" },
  trousers: { src: unsplash("1603291697926-7e5822ed1ac5"), alt: "Player running with the ball in training kit" },
  accessories: { src: unsplash("1574629810360-7efbbe195018"), alt: "Football at a player's feet on the pitch" },
  cricket: { src: unsplash("1593341646782-e0b495cff86d"), alt: "Cricket batsman driving the ball in a spray of dust" },
  sale: { src: unsplash("1618787113620-fc01359c1c78"), alt: "Silhouette of a player heading a ball at sunset" },
} as const;
