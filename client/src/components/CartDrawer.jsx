import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "../data/display";

export default function CartDrawer({ items, onClose, onChangeQuantity, onRemove, onCheckout, orderMessage, isSubmitting }) {
  const [email, setEmail] = useState("");
  const closeRef = useRef(null);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    onCheckout(email);
  }

  return (
    <div className="overlay cart-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="drawer-header">
          <div><p className="eyebrow">A LITTLE RITUAL</p><h2 id="cart-title">Your bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div>
          <button ref={closeRef} className="close-button" onClick={onClose} aria-label="Close bag"><X size={21} /></button>
        </header>
        {orderMessage?.success ? (
          <div className="checkout-success">
            <span className="success-icon"><Check size={25} /></span>
            <p className="eyebrow">MADE WITH CARE</p>
            <h3>Your sample order is in.</h3>
            <p>{orderMessage.message}</p>
            <button className="text-button" onClick={onClose}>Back to the slow hours <ArrowRight size={15} /></button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon"><ShoppingBag size={24} strokeWidth={1.4} /></span>
            <h3>A quiet moment awaits.</h3>
            <p>Your bag is taking a little breather. Find a scent that feels like home.</p>
            <button className="primary-button" onClick={onClose}>Discover the collection <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <div className="shipping-note">
              {total >= 7500 ? "Lovely — your delivery is on us." : `You're ${formatPrice(7500 - total)} away from complimentary delivery.`}
              <span className="shipping-meter"><span style={{ width: `${Math.min((total / 7500) * 100, 100)}%` }} /></span>
            </div>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={`${item.slug}-${item.personalization}`}>
                  <div className={`cart-item-art product-image--${item.tone}`}>
                    <svg viewBox="0 0 360 400" aria-hidden="true"><circle cx="180" cy="200" r="130" fill="#faf7f0" /><rect x="113" y="146" width="134" height="160" rx="13" fill={item.tone === "dusk" ? "#665e68" : item.tone === "garden" ? "#b1a995" : item.tone === "linen" ? "#c5b7a2" : "#d7a58d"} /><ellipse cx="180" cy="151" rx="67" ry="12" fill="#e8d9bf" /><rect x="132" y="202" width="96" height="45" fill="#f7f3e7" /><text x="180" y="228" textAnchor="middle" fontSize="10" fontFamily="Georgia,serif" fill="#55483d">EMBER &amp; WICK</text></svg>
                  </div>
                  <div className="cart-item-copy">
                    <div className="cart-item-title"><h3>{item.name}</h3><span>{formatPrice(item.price * item.quantity)}</span></div>
                    <p>{item.size} · {formatPrice(item.price)}</p>
                    {item.personalization && <p className="cart-personalization">Note: “{item.personalization}”</p>}
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button onClick={() => onChangeQuantity(item, item.quantity - 1)} aria-label={`Reduce ${item.name} quantity`}><Minus size={13} /></button>
                        <span aria-label="Quantity">{item.quantity}</span>
                        <button onClick={() => onChangeQuantity(item, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 9}><Plus size={13} /></button>
                      </div>
                      <button className="remove-button" onClick={() => onRemove(item)} aria-label={`Remove ${item.name} from bag`}><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="drawer-footer">
              <div className="subtotal"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
              <p>Delivery and applicable taxes are calculated later.</p>
              <form className="checkout-form" onSubmit={handleSubmit}>
                <label htmlFor="checkout-email">YOUR EMAIL ADDRESS</label>
                <input id="checkout-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <button className="primary-button checkout-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "A moment, please…" : <>Place sample order <ArrowRight size={16} /></>}
                </button>
                {orderMessage?.error && <p className="checkout-error" role="alert">{orderMessage.error}</p>}
                <p className="demo-caption">This is a demo checkout — no payment is taken.</p>
              </form>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
