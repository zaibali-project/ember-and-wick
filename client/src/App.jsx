import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, Flame, Leaf, Search, Sparkles } from "lucide-react";
import CartDrawer from "./components/CartDrawer";
import Header from "./components/Header";
import ProductArtwork from "./components/ProductArtwork";
import ProductCard from "./components/ProductCard";
import ProductDialog from "./components/ProductDialog";
import { getProducts, placeOrder } from "./api";

const filters = ["All candles", "Woodsy", "Floral", "Fresh"];

function readSavedBag() {
  try {
    const saved = window.localStorage.getItem("ember-and-wick-bag");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sortOrder, setSortOrder] = useState("featured");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(readSavedBag);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderMessage, setOrderMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    getProducts()
      .then((data) => active && setProducts(data.products))
      .catch(() => active && setLoadError("We couldn't load the collection just now. Please try again in a moment."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("ember-and-wick-bag", JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const matches = products.filter((product) => {
      const filterMatch =
        activeFilter === "All candles" ||
        (activeFilter === "Woodsy" && ["woody", "smoky", "earthy"].some((note) => product.notes.join(" ").toLowerCase().includes(note))) ||
        (activeFilter === "Floral" && ["floral", "jasmine", "rose", "lavender", "gardenia"].some((note) => `${product.family} ${product.notes.join(" ")}`.toLowerCase().includes(note))) ||
        (activeFilter === "Fresh" && ["fresh", "citrus", "linen", "bergamot", "neroli", "green"].some((note) => `${product.family} ${product.notes.join(" ")}`.toLowerCase().includes(note)));
      const searchMatch = !search || `${product.name} ${product.family} ${product.notes.join(" ")}`.toLowerCase().includes(search);
      return filterMatch && searchMatch;
    });

    return [...matches].sort((a, b) => sortOrder === "price-low" ? a.price - b.price : sortOrder === "price-high" ? b.price - a.price : a.featuredOrder - b.featuredOrder);
  }, [products, activeFilter, searchTerm, sortOrder]);

  const addToCart = useCallback((product, personalization = "") => {
    setCart((items) => {
      const existing = items.find((item) => item.slug === product.slug && item.personalization === personalization);
      if (existing) return items.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + 1, 9) } : item);
      return [...items, { slug: product.slug, name: product.name, tone: product.tone, size: product.size, price: product.price, personalization, quantity: 1 }];
    });
    setOrderMessage(null);
    setToast(`${product.name} has been added to your bag.`);
  }, []);

  function updateQuantity(item, quantity) {
    if (quantity <= 0) return removeItem(item);
    setCart((items) => items.map((entry) => entry === item ? { ...entry, quantity: Math.min(quantity, 9) } : entry));
    setOrderMessage(null);
  }

  function removeItem(item) {
    setCart((items) => items.filter((entry) => entry !== item));
    setOrderMessage(null);
  }

  async function handleCheckout(email) {
    setIsSubmitting(true);
    setOrderMessage(null);
    try {
      const response = await placeOrder({ email, items: cart.map((item) => ({ slug: item.slug, quantity: item.quantity, personalization: item.personalization })) });
      setOrderMessage({ success: true, message: `Confirmation ${response.order.reference} · ${response.order.message}` });
      setCart([]);
    } catch (error) {
      setOrderMessage({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="home" className="site-shell">
      <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} onOpenCart={() => { setCartOpen(true); setOrderMessage(null); }} />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span /> THE SLOW HOURS COLLECTION</p>
            <h1 id="hero-title">A softer kind<br />of <em>every day.</em></h1>
            <p className="hero-description">Small-batch candles for the moments that make a house feel like yours. Poured slowly, with nothing but good things inside.</p>
            <a className="primary-button hero-button" href="#collection">Find your fragrance <ArrowRight size={16} /></a>
            <div className="hero-promises">
              <span><Leaf size={15} /> Plant-based wax</span><i aria-hidden="true" /><span><Flame size={15} /> 40-hour burn</span>
            </div>
          </div>
          <div className="hero-art" aria-label="A softly glowing handcrafted candle on a warm, sunlit backdrop">
            <div className="hero-sun" />
            <span className="hero-note hero-note-top">LIGHT, WHEN YOU NEED IT</span>
            <div className="hero-candle-wrap"><ProductArtwork tone="linen" name="Sunday Linen" /></div>
            <span className="hero-note hero-note-bottom">POURED WITH A LITTLE MORE CARE <span>↓</span></span>
            <div className="hero-art-counter">NO. 01 — SLOW LIVING</div>
          </div>
        </section>

        <section id="collection" className="collection-section" aria-labelledby="collection-title">
          <div className="collection-intro">
            <div>
              <p className="eyebrow"><span className="small-asterisk">✳</span> MEET YOUR NEW WIND-DOWN</p>
              <h2 id="collection-title">The candle collection</h2>
              <p className="collection-description">Four carefully considered fragrances. Each one a little invitation to stay a while.</p>
            </div>
            <span className="collection-count">{products.length.toString().padStart(2, "0")} POURED WITH CARE</span>
          </div>

          <div className="collection-toolbar">
            <div className="filter-list" role="group" aria-label="Filter candles by fragrance">
              {filters.map((filter) => (
                <button key={filter} className={`filter-button ${activeFilter === filter ? "active" : ""}`} onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter}>{filter}</button>
              ))}
            </div>
            <div className="toolbar-actions">
              {searchOpen && (
                <label className="collection-search">
                  <Search size={16} />
                  <input aria-label="Search candle fragrances" autoFocus placeholder="Find a fragrance" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                  <button onClick={() => { setSearchOpen(false); setSearchTerm(""); }} aria-label="Close search">×</button>
                </label>
              )}
              <button className="toolbar-icon-button" aria-label="Search fragrances" onClick={() => setSearchOpen((open) => !open)}><Search size={17} /></button>
              <label className="sort-control" htmlFor="sort-products">Sort by
                <select id="sort-products" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
                </select>
                <ArrowDown size={14} />
              </label>
            </div>
          </div>

          {loadError ? (
            <div className="collection-message" role="alert"><p>{loadError}</p><button className="text-button" onClick={() => { setLoadError(""); getProducts().then((data) => setProducts(data.products)).catch(() => setLoadError("We couldn't load the collection just now. Please try again in a moment.")); }}>Try again <ArrowRight size={15} /></button></div>
          ) : visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product) => <ProductCard key={product.slug} product={product} onView={setSelectedProduct} onAdd={addToCart} />)}
            </div>
          ) : (
            <div className="collection-message"><p>No candles found for that little search.</p><button className="text-button" onClick={() => { setSearchTerm(""); setActiveFilter("All candles"); }}>See all candles <ArrowRight size={15} /></button></div>
          )}
        </section>

        <section className="story-section" id="our-story" aria-labelledby="story-title">
          <div className="story-art">
            <div className="story-ring" />
            <div className="story-orbit story-orbit-one" />
            <div className="story-orbit story-orbit-two" />
            <ProductArtwork tone="garden" name="Still Garden" />
            <Sparkles className="story-sparkle" size={22} />
            <span className="story-art-caption">SMALL BATCH · BIG FEELING</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">A NOTE FROM THE WORKSHOP</p>
            <h2 id="story-title">Made slowly.<br />Lit <em>often.</em></h2>
            <p>We believe a candle can be more than a nice smell. It can be a tiny invitation to close your laptop, put the kettle on and remember where you are.</p>
            <p>So we pour each one by hand, using plant-based wax, clean fragrance and vessels you’ll want to keep long after the flame goes out.</p>
            <a className="text-button" href="#newsletter">A little more about us <ArrowRight size={15} /></a>
          </div>
        </section>

        <section className="newsletter-section" id="newsletter">
          <span className="newsletter-sparkle">✳</span>
          <p className="eyebrow">ONLY THE GOOD STUFF</p>
          <h2>Letters for <em>slower days.</em></h2>
          <p>The occasional note on scent, setting the mood and small things worth noticing.</p>
          <NewsletterForm />
          <span className="newsletter-small">No noise, no funny business. Unsubscribe whenever.</span>
        </section>
      </main>
      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#home">ember <span>&amp;</span> wick<small>SCENTED SLOW LIVING</small></a>
        <p>Poured with care, wherever you call home.</p>
        <span>© 2026 EMBER &amp; WICK · A DEMO SHOP MADE WITH CARE.</span>
      </footer>
      {selectedProduct && <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onChangeQuantity={updateQuantity} onRemove={removeItem} onCheckout={handleCheckout} orderMessage={orderMessage} isSubmitting={isSubmitting} />}
      {toast && <div className="toast" role="status"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubscribed(true);
    setEmail("");
  }

  return subscribed ? (
    <p className="newsletter-confirmation" role="status"><Check size={16} /> You’re on the list. Make yourself at home.</p>
  ) : (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="newsletter-email">Your email address</label>
      <input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <button type="submit" aria-label="Subscribe to our newsletter"><ArrowRight size={17} /></button>
    </form>
  );
}
