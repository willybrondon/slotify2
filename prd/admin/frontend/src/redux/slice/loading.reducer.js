import { CLOSE_LOADER, OPEN_LOADER } from "./loading.type";

const initialState = {
  isLoading: false,
};

const spinnerReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_LOADER:
      return {
        ...state,
        isLoading: true,
      };
    case CLOSE_LOADER:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default spinnerReducer;