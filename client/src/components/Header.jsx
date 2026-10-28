import { ShoppingBag } from "lucide-react";

export default function Header({ cartCount, onOpenCart }) {
  return (
    <>
      <div className="announcement">
        <span>A little ritual goes a long way</span>
        <span className="announcement-divider" aria-hidden="true">
          ·
        </span>
        <span>Free delivery on orders over $75</span>
      </div>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Ember and Wick home">
          ember <span>&amp;</span> wick
          <small>SCENTED SLOW LIVING</small>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#collection">Shop candles</a>
          <a href="#our-story">Our story</a>
          <a href="#newsletter">A note from us</a>
        </nav>
        <button className="icon-button bag-button" onClick={onOpenCart} aria-label={`Open bag, ${cartCount} items`}>
          <ShoppingBag size={19} strokeWidth={1.5} />
          <span>Bag</span>
          {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
        </button>
      </header>
    </>
  );
}
