// src/store/index.js
import { categoriesReducer } from "./slices/categoriesSlice";
import { productsReducer } from "./slices/productsSlice";

function rootReducer(state = {}, action) {
  return {
    categories: categoriesReducer(state.categories, action),
    products: productsReducer(state.products, action),
  };
}

const initialState = {
  categories: {
    items: [],
    isLoaded: false,
  },
  products: {
    items: [],
    isLoaded: false,
    error: null,
  },
};

class Store {
  constructor(reducer) {
    this.state = reducer(initialState, {});
    this.reducer = reducer;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach((listener) => listener());
    this.saveToLocalStorage();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem("reduxState", JSON.stringify(this.state));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  }

  loadFromLocalStorage() {
    try {
      const serializedState = localStorage.getItem("reduxState");
      if (serializedState === null) return;
      this.state = JSON.parse(serializedState);
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }
  }
}

const store = new Store(rootReducer);
store.loadFromLocalStorage();

export default store;
