import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import ProductArtwork from "./ProductArtwork";
import { formatPrice } from "../data/display";

export default function ProductDialog({ product, onClose, onAdd }) {
  const [personalization, setPersonalization] = useState("");
  const [added, setAdded] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleAdd() {
    onAdd(product, personalization);
    setAdded(true);
    window.setTimeout(onClose, 550);
  }

  return (
    <div className="overlay product-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button ref={closeRef} className="close-button dialog-close" onClick={onClose} aria-label="Close product details">
          <X size={20} />
        </button>
        <div className="dialog-art" aria-hidden="true">
          <ProductArtwork tone={product.tone} name={product.name} />
        </div>
        <div className="dialog-copy">
          <a className="back-link" href="#collection" onClick={onClose}>
            <ArrowLeft size={14} /> BACK TO THE COLLECTION
          </a>
          <p className="eyebrow">{product.family} · THE SLOW HOURS COLLECTION</p>
          <h2 id="dialog-title">{product.name}</h2>
          <p className="dialog-notes">{product.notes.join("  ·  ")}</p>
          <p className="dialog-description">{product.description}</p>
          <p className="dialog-details">
            {product.size} <span>·</span> {product.burnTime} hour burn <span>·</span> Hand-poured in small batches
          </p>
          <div className="personalize-field">
            <label htmlFor="personalization">Add a personal note <span>OPTIONAL · 32 CHARACTERS</span></label>
            <input
              id="personalization"
              maxLength={32}
              placeholder="A small something, just for you"
              value={personalization}
              onChange={(event) => setPersonalization(event.target.value)}
            />
            <p>Your note will be printed on a little keepsake card.</p>
          </div>
          <button className="primary-button dialog-add" onClick={handleAdd} disabled={product.stockStatus !== "in_stock"}>
            {added ? <><Check size={17} /> Added to your bag</> : <>Add to bag — {formatPrice(product.price)} <ArrowRight size={16} /></>}
          </button>
          <p className="dialog-delivery">Complimentary delivery on orders over $75.</p>
        </div>
      </section>
    </div>
  );
}
