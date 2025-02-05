// src/store/slices/productsSlice.js
const initialState = {
  items: [],
  isLoaded: false,
  error: null,
  timestamp: null,
};

export function productsReducer(state = initialState, action) {
  switch (action.type) {
    case "products/SET_PRODUCTS":
      return {
        ...state,
        items: action.payload.items,
        isLoaded: true,
        error: null,
        timestamp: action.payload.timestamp,
      };
    case "products/SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoaded: false,
      };
    default:
      return state;
  }
}

export const setProducts = (products) => ({
  type: "products/SET_PRODUCTS",
  payload: {
    items: Array.isArray(products) ? products : products.items,
    timestamp: Date.now(),
  },
});

export const setProductsError = (error) => ({
  type: "products/SET_ERROR",
  payload: error,
});
