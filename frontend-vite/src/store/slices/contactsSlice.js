// src/store/slices/contactsSlice.js
const initialState = {
  data: null,
  isLoaded: false,
  error: null,
};

// Action Types
const SET_CONTACTS = "contacts/setContacts";
const SET_LOADING = "contacts/setLoading";
const SET_ERROR = "contacts/setError";

// Action Creators
export const setContacts = (contacts) => ({
  type: SET_CONTACTS,
  payload: contacts,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

// Thunk
export const fetchContacts = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/contacts`
    );
    const data = await response.json();
    dispatch(setContacts(data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Reducer
export const contactsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONTACTS:
      return {
        ...state,
        data: action.payload,
        error: null,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoaded: !action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
