import { ArrowUpRight, Plus } from "lucide-react";
import ProductArtwork from "./ProductArtwork";
import { formatPrice } from "../data/display";

export default function ProductCard({ product, onView, onAdd }) {
  return (
    <article className="product-card">
      <button
        className={`product-image product-image--${product.tone}`}
        onClick={() => onView(product)}
        aria-label={`Discover ${product.name}`}
      >
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <ProductArtwork tone={product.tone} name={product.name} />
        <span className="view-product">
          Discover <ArrowUpRight size={14} />
        </span>
      </button>
      <div className="product-copy">
        <div className="product-heading">
          <button className="product-name" onClick={() => onView(product)}>
            {product.name}
          </button>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <p className="product-notes">{product.notes.join(" · ")}</p>
        <div className="product-card-footer">
          <span>{product.size} · about {product.burnTime} hours</span>
          <button
            className="add-button"
            onClick={() => onAdd(product)}
            disabled={product.stockStatus !== "in_stock"}
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus size={15} />
            <span>{product.stockStatus === "in_stock" ? "Add" : "Sold out"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
