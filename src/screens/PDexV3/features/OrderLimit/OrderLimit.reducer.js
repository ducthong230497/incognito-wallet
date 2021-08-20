import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import { ACTION_SET_FOCUS_TOKEN } from '../Swap/Swap.constant';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_POOL_ID,
  ACTION_SET_INITIING,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_SET_FEE_TOKEN,
  ACTION_RESET,
  ACTION_SET_PERCENT,
} from './OrderLimit.constant';

const initialState = {
  isFetching: true,
  isFetched: false,
  data: {},
  poolId: '',
  buytoken: '',
  selltoken: '',
  feetoken: '',
  estimateTrade: null,
  focustoken: '',
  networkfee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX,
  swaping: false,
  selecting: false,
  initing: false,
  rate: '',
  percent: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHING: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCHED: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      data: { ...action.payload },
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_SET_POOL_ID: {
    return {
      ...state,
      poolId: action.payload,
    };
  }
  case ACTION_SET_INITIING: {
    return {
      ...state,
      initing: action.payload,
    };
  }
  case ACTION_SET_SELL_TOKEN: {
    return {
      ...state,
      selltoken: action.payload,
    };
  }
  case ACTION_SET_BUY_TOKEN: {
    return {
      ...state,
      buytoken: action.payload,
    };
  }
  case ACTION_SET_FEE_TOKEN: {
    return {
      ...state,
      feetoken: action.payload,
    };
  }
  case ACTION_SET_FOCUS_TOKEN: {
    return {
      ...state,
      focustoken: action.payload,
    };
  }
  case ACTION_RESET: {
    return initialState;
  }
  case ACTION_SET_PERCENT: {
    return {
      ...state,
      percent: action.payload,
    };
  }
  default:
    return state;
  }
};
