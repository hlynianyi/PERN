// src/store/slices/cartSlice.js
export const cartReducer = (state = { items: [], totalAmount: 0 }, action) => {
  switch (action.type) {
    case "CART_ADD_ITEM":
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };

        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
        };
      } else {
        // Add new item
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
        };
      }

    case "CART_UPDATE_QUANTITY":
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is zero or negative
        const filteredItems = state.items.filter((item) => item.id !== id);
        return {
          ...state,
          items: filteredItems,
          totalAmount: calculateTotalAmount(filteredItems),
        };
      } else {
        // Update quantity
        const updatedItems = state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
        };
      }

    case "CART_UPDATE_ENGRAVING":
      const { productId, engraving } = action.payload;
      const updatedItems = state.items.map((item) =>
        item.id === productId ? { ...item, engraving } : item
      );
      return {
        ...state,
        items: updatedItems,
      };

    case "CART_REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...state,
        items: filteredItems,
        totalAmount: calculateTotalAmount(filteredItems),
      };

    case "CART_CLEAR":
      return {
        ...state,
        items: [],
        totalAmount: 0,
      };

    default:
      return state;
  }
};

// Helper function to calculate total amount
function calculateTotalAmount(items) {
  return items.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );
}

// Action creators
export const addToCart = (product, quantity = 1, engraving = "") => ({
  type: "CART_ADD_ITEM",
  payload: {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
    engraving,
    image: product.images?.[0]?.image_url || "",
  },
});

export const updateQuantity = (id, quantity) => ({
  type: "CART_UPDATE_QUANTITY",
  payload: { id, quantity },
});

export const updateEngraving = (productId, engraving) => ({
  type: "CART_UPDATE_ENGRAVING",
  payload: { productId, engraving },
});

export const removeFromCart = (id) => ({
  type: "CART_REMOVE_ITEM",
  payload: id,
});

export const clearCart = () => ({
  type: "CART_CLEAR",
});
