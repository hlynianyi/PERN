// src/store/slices/categoriesSlice.js
const initialState = {
  items: [],
  isLoaded: false,
};

export function categoriesReducer(state = initialState, action) {
  switch (action.type) {
    case "categories/SET_CATEGORIES":
      return {
        ...state,
        items: action.payload,
        isLoaded: true,
      };
    default:
      return state;
  }
}

export const setCategories = (categories) => {
  return {
    type: "categories/SET_CATEGORIES",
    payload: categories,
  };
};
