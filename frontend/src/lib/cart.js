import { API } from './api';

export const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (err) {
    return null;
  }
};

// Fetch the authoritative cart from the backend
export const fetchCart = async () => {
  const token = getAuthToken();
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
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              credentials: 'include',
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
    const res = await fetch(`${API}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('cart-updated'));
      return [];
    }
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
  const token = getAuthToken();
  if (!token) {
    // If not logged in, redirect to login
    window.location.href = '/login';
    return;
  }
  
  const res = await fetch(`${API}/cart/items`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify({ productId, quantity })
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('401: Unauthorized. Please log in.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to add to cart');
  }

  window.dispatchEvent(new Event('cart-updated'));
};

export const updateCartItem = async (productId, quantity) => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const res = await fetch(`${API}/cart/items/${productId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify({ quantity })
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  window.dispatchEvent(new Event('cart-updated'));
};

export const removeFromCart = async (productId) => {
  const token = getAuthToken();
  if (!token) return;

  const res = await fetch(`${API}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  window.dispatchEvent(new Event('cart-updated'));
};

export const clearCart = async () => {
  const token = getAuthToken();
  if (!token) return;

  const res = await fetch(`${API}/cart`, { 
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  window.dispatchEvent(new Event('cart-updated'));
};
