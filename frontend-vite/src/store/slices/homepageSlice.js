// src/store/slices/homepageSlice.js
const initialState = {
  data: null,
  isLoaded: false,
  error: null,
  timestamp: null,
};

export function homepageReducer(state = initialState, action) {
  switch (action.type) {
    case "homepage/SET_HOMEPAGE":
      return {
        ...state,
        data: action.payload.data,
        isLoaded: true,
        error: null,
        timestamp: action.payload.timestamp,
      };
    case "homepage/SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoaded: false,
      };
    default:
      return state;
  }
}

export const setHomepage = (homepage) => ({
  type: "homepage/SET_HOMEPAGE",
  payload: {
    data: homepage,
    timestamp: Date.now(),
  },
});

export const setHomepageError = (error) => ({
  type: "homepage/SET_ERROR",
  payload: error,
});
