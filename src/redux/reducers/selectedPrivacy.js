import type from '@src/redux/types/selectedPrivacy';

const initialState = null;

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case type.SET:
    return action.data;

  default:
    return state;
  }
};

export default reducer;