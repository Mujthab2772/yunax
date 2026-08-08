import { API } from './api';

// Fetch the authoritative cart from the backend
export const fetchCart = async () => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  // Migration step: if there's a legacy localStorage cart, migrate it to the backend!
  const legacyRaw = localStorage.getItem('cartItems');
  if (legacyRaw) {
    try {
      const legacyItems = JSON.parse(legacyRaw);
      if (Array.isArray(legacyItems) && legacyItems.length > 0) {
        // Send all to backend sequentially to migrate
        for (const item of legacyItems) {
          const productId = item.productId || item._id || item.id;
          if (productId) {
            await fetch(`${API}/cart/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity: item.qty || 1 })
            }).catch(() => {});
          }
        }
      }
    } catch (e) {
      // ignore
    }
    // Delete legacy cart so we never migrate it again
    localStorage.removeItem('cartItems');
  }

  try {
    const res = await fetch(`${API}/cart`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.items || []).map(item => ({
      productId: item.productId,
      qty: item.quantity,
      priceAtTimeOfAdding: item.priceAtTimeOfAdding,
      name: item.product?.name,
      stock: item.product?.stock,
      images: item.product?.images || [],
      priceCents: item.product?.priceCents,
      category: item.product?.category,
      slug: item.product?.slug,
      spec: item.product?.description
    }));
  } catch (err) {
    console.error('Failed to fetch cart:', err);
    return [];
  }
};

export const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // If not logged in, they can't use the cart
    window.location.href = '/login';
    return;
  }
  
  await fetch(`${API}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  window.dispatchEvent(new Event('cart-updated'));
};

export const updateCartItem = async (productId, quantity) => {
  await fetch(`${API}/cart/items/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  window.dispatchEvent(new Event('cart-updated'));
};

export const removeFromCart = async (productId) => {
  await fetch(`${API}/cart/items/${productId}`, {
    method: 'DELETE'
  });
  window.dispatchEvent(new Event('cart-updated'));
};

export const clearCart = async () => {
  await fetch(`${API}/cart`, { method: 'DELETE' });
  window.dispatchEvent(new Event('cart-updated'));
};
