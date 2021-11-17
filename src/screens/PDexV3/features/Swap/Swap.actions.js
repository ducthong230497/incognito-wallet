/* eslint-disable import/no-cycle */
import { getBalance } from '@src/redux/actions/token';
import { actionGetPDexV3Inst, getPDexV3Instance } from '@screens/PDexV3';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
} from 'incognito-chain-web-js/build/wallet';
import { defaultAccountWalletSelector, defaultAccountSelector } from '@src/redux/selectors/account';
import { ExHandler } from '@src/services/exception';
import { change, reset } from 'redux-form';
import isEmpty from 'lodash/isEmpty';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { batch } from 'react-redux';
import { BIG_COINS } from '@src/screens/Dex/constants';
import uniq from 'lodash/uniq';
import { PRV, PRV_ID } from '@src/constants/common';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import { getPancakeTokens, getPancakeTradingFee } from '@services/api/pancakeswap';
import BigNumber from 'bignumber.js';
import floor from 'lodash/floor';
import difference from 'lodash/difference';
import { isUsePRVToPayFeeSelector } from '@screens/Setting';
import { getDataByPoolIdSelector } from '@screens/PDexV3/features/Pools';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_SET_SELL_TOKEN,
  ACTION_SET_BUY_TOKEN,
  ACTION_SET_FEE_TOKEN,
  ACTION_SET_FOCUS_TOKEN,
  formConfigs,
  ACTION_SET_SELECTING_TOKEN,
  ACTION_SET_SWAPING_TOKEN,
  ACTION_SET_INITIING_SWAP,
  ACTION_RESET,
  ACTION_SET_PERCENT,
  ACTION_FETCH_SWAP,
  ACTION_FETCHED_LIST_PAIRS,
  ACTION_FETCHING_ORDERS_HISTORY,
  ACTION_FETCHED_ORDERS_HISTORY,
  ACTION_FETCH_FAIL_ORDERS_HISTORY,
  ACTION_FETCHING_ORDER_DETAIL,
  ACTION_FETCHED_ORDER_DETAIL,
  ACTION_SET_DEFAULT_PAIR,
  ACTION_SET_SELECTED_PLATFORM,
  PANCAKE_CHAIN_ID,
  SwapPlatforms,
} from './Swap.constant';
import {
  buytokenSelector,
  feeSelectedSelector,
  feetokenDataSelector,
  inputAmountSelector,
  selltokenSelector,
  orderDetailSelector,
  swapInfoSelector,
  slippagetoleranceSelector,
  swapSelector,
  defaultPairSelector,
  getPancakeTokenParamReqByTokenIDSelector,
} from './Swap.selector';
import { 
  getBestRateFromPancake, 
  calMinAmountExpectedToFixed 
} from './Swap.utils';

export const actionSetPercent = (payload) => ({
  type: ACTION_SET_PERCENT,
  payload,
});

export const actionSetSellTokenFetched = (payload) => ({
  type: ACTION_SET_SELL_TOKEN,
  payload,
});

export const actionSetBuyTokenFetched = (payload) => ({
  type: ACTION_SET_BUY_TOKEN,
  payload,
});

export const actionSetFeeToken = (payload) => ({
  type: ACTION_SET_FEE_TOKEN,
  payload,
});

export const actionSetFocusToken = (payload) => ({
  type: ACTION_SET_FOCUS_TOKEN,
  payload,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionReset = (payload) => ({
  type: ACTION_RESET,
  payload,
});

export const actionSetSelectedPlatform = (payload) => ({
  type: ACTION_SET_SELECTED_PLATFORM,
  payload,
});

export const actionEstimateTrade = (field = formConfigs.selltoken) => async (
  dispatch,
  getState,
) => {
  try {
    let state = getState();
    const inputAmount = inputAmountSelector(state);
    let sellInputToken, buyInputToken, inputToken, inputPDecimals;
    sellInputToken = inputAmount(formConfigs.selltoken);
    buyInputToken = inputAmount(formConfigs.buytoken);
    const {
      tokenId: selltoken,
      originalAmount: sellAmount,
      pDecimals: sellPDecimals,
    } = sellInputToken;
    const {
      tokenId: buytoken,
      originalAmount: buyAmount,
      pDecimals: buyPDecimals,
    } = buyInputToken;
    let payload = {
      selltoken,
      buytoken,
    };
    
    const slippagetolerance = slippagetoleranceSelector(state);
    switch (field) {
    case formConfigs.selltoken: {
      inputToken = formConfigs.buytoken;
      payload.sellamount = sellAmount;
      payload.sellamount = String(payload.sellamount);
      inputPDecimals = buyPDecimals;
      break;
    }
    case formConfigs.buytoken: {
      inputToken = formConfigs.selltoken;
      payload.buyamount = floor(
        new BigNumber(buyAmount)
          .multipliedBy(100 / (100 - slippagetolerance))
          .toNumber(),
      );
      payload.buyamount = String(payload.buyamount);
      inputPDecimals = sellPDecimals;
      break;
    }
    default:
      break;
    }
    const feetoken = feeSelectedSelector(state);
    payload.feetoken = feetoken;
    if (
      isEmpty(sellInputToken) ||
      isEmpty(buyInputToken) ||
      isEmpty(feetoken) ||
      (!sellAmount && !buyAmount)
    ) {
      return;
    }
    await dispatch(actionFetching());

    // estimate trade from Incognito
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    let data, dataPancake;
    let platforms = [];
    let dataOtherPlatforms = {};
    try {
      data = await pDexV3Inst.getEstimateTrade(payload);
      platforms.push(SwapPlatforms.Incognito);
    } catch(e) {
      console.log('Can not estimate trade from Incognito with this pair.');
    }

    // estimate trade from Pancake
    try {
      dataPancake = await estimateTradePancake(state, payload);
      if (dataPancake && dataPancake.paths && dataPancake.paths.length > 0) {
        platforms.push(SwapPlatforms.Pancake);
        dataOtherPlatforms[SwapPlatforms.Pancake] = {...dataPancake};
      }
    } catch(e) {
      console.log('Can not estimate trade from Pancake with this pair.');
    }

    if (platforms.length === 0) {
      throw Error('Can not estimate trade with this pair');
    }

    state = getState();
    let dataDisplays = {};
    platforms.forEach(item => {
      switch (item) {
      case SwapPlatforms.Incognito: {
        const feeTokenData = feetokenDataSelector(state);
        const minFee = feeTokenData.minFeeAmountFixed;
        let maxGet = 0;
        switch (field) {
        case formConfigs.selltoken: {
          maxGet = data?.maxGet || 0;
          break;
        }
        case formConfigs.buytoken: {
          maxGet = data?.sellAmount || 0;
          break;
        }
        default:
          break;
        }
        const minAmountExpectedToFixed = calMinAmountExpectedToFixed({maxGet, slippagetolerance, pDecimals: inputPDecimals});
        dataDisplays[item] = {
          minAmountExpectedToFixed: minAmountExpectedToFixed,
          minFeeAmountFixed: minFee, 
        };
        break;
      }
      case SwapPlatforms.Pancake: {
        const {tradingFee, maxGet} = dataPancake;
        const minAmountExpectedToFixed = calMinAmountExpectedToFixed({maxGet, slippagetolerance, pDecimals: inputPDecimals});
        const minFeeAmountFixed = convert.toHumanAmount(
          tradingFee.tradeFee,
          9, //todo: get PRV decimals
        );
        dataDisplays[item] = {
          minAmountExpectedToFixed: minAmountExpectedToFixed,
          minFeeAmountFixed: minFeeAmountFixed, 
        };
        break;
      }
      default:
        break;
      }
    });

    await dispatch(actionFetched({data, dataOtherPlatforms, platforms, dataDisplays}));

    if (platforms.length === 1 && platforms[0] === SwapPlatforms.Incognito || platforms.length === 2) {
      dispatch(actionSetSelectedPlatform(SwapPlatforms.Incognito));
    } else if (platforms.length === 1 && platforms[0] === SwapPlatforms.Pancake) {
      dispatch(actionSetSelectedPlatform(SwapPlatforms.Pancake));
    }
    
    batch(() => {
      state = getState();
      const { selectedPlatform } = swapSelector(state);
      const dataDisplay = dataDisplays.find(item => item.platformType === selectedPlatform);
      if (selectedPlatform === SwapPlatforms.Pancake) {
        dispatch(actionSetFeeToken(PRV.id));
      }
      dispatch(
        change(formConfigs.formName, inputToken, dataDisplay.minAmountExpectedToFixed),
      );
      dispatch(
        change(formConfigs.formName, formConfigs.feetoken, dataDisplay.minFeeAmountFixed),
      );
    });
  } catch (error) {
    await dispatch(actionFetchFail());
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionSetFocusToken(''));
  }
};

const estimateTradePancake = async (state, {selltoken, buytoken, sellamount, buyamount}) => {
  try {
    const getPancakeTokenParamReq = getPancakeTokenParamReqByTokenIDSelector(state);
    const tokenSellPancake = getPancakeTokenParamReq(selltoken);
    const tokenBuyPancake = getPancakeTokenParamReq(buytoken);
    if (tokenSellPancake == null || tokenBuyPancake == null) {
      console.log('This pair is not existed on pancake');
      return null;
    }

    let payloadPancake = {
      sourceToken: tokenSellPancake,
      destToken: tokenBuyPancake,
      chainID: PANCAKE_CHAIN_ID,
    };
    if (sellamount) {
      payloadPancake.amount = convert.toHumanAmount(
        sellamount,
        tokenSellPancake.pDecimals,
      );
      payloadPancake.isSwapExactOut = false; 
    } else if (buyamount) {
      payloadPancake.amount = convert.toHumanAmount(
        buyamount,
        tokenBuyPancake.pDecimals,
      );
      payloadPancake.isSwapExactOut = true; 
    }
    const {sourceToken, destToken, amount, chainID, isSwapExactOut} = payloadPancake;
    console.log('payloadPancake: ', payloadPancake);
    const {paths, outputs} = await getBestRateFromPancake(sourceToken, destToken, amount, chainID, isSwapExactOut);
    if (!paths || paths.length === 0) {
      console.log('Can not found best route for this pair');
      return null;
    }
    // convert maxGet amount from decimals to pDecimals
    let originalMaxGet = isSwapExactOut ? outputs[0] : outputs[outputs.length - 1];
    const getTokenDecimals = isSwapExactOut ? sourceToken.decimals : destToken.decimals;
    const getTokenPDecimals = isSwapExactOut ? sourceToken.pDecimals : destToken.pDecimals;
    const maxGetHuman = convert.toHumanAmount(originalMaxGet, getTokenDecimals);
    const maxGet = convert.toOriginalAmount(maxGetHuman, getTokenPDecimals);

    const account = defaultAccountSelector(state);
    // only PRV
    const tradingFee = await getPancakeTradingFee({
      paymentAddress: account.PaymentAddress,
      srcTokenID: selltoken, 
      destTokenID: buytoken, 
      srcAmt: sellamount, 
      destAmt: buyamount,
    });
    return {
      paths, 
      outputs,
      tradingFee,
      maxGet,
    };
  }catch(e) {
    console.log('Error when get best route on pancake: ', e);
    return null;
  }
};

export const actionSetSellToken = (selltoken) => async (dispatch, getState) => {
  try {
    batch(() => {
      dispatch(actionSetSellTokenFetched(selltoken));
      dispatch(getBalance(selltoken));
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionSetBuyToken = (buytoken) => async (dispatch, getState) => {
  try {
    batch(() => {
      dispatch(actionSetBuyTokenFetched(buytoken));
      dispatch(getBalance(buytoken));
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionInitingSwapForm = (payload) => ({
  type: ACTION_SET_INITIING_SWAP,
  payload,
});

export const actionSetInputToken = ({ selltoken, buytoken }) => async (
  dispatch,
) => {
  if (!selltoken || !buytoken) {
    return;
  }
  try {
    batch(() => {
      dispatch(actionSetSellToken(selltoken));
      dispatch(actionSetBuyToken(buytoken));
      dispatch(getBalance(PRV.id));
    });
  } catch (error) {
    throw error;
  }
};

export const actionFetchedPairs = (payload) => ({
  payload,
  type: ACTION_FETCHED_LIST_PAIRS,
});

export const actionFetchPairs = (refresh) => async (dispatch, getState) => {
  let pairs = [];
  let pDEXPairs = [];
  let pancakeTokens = [];
  try {
    let state = getState();
    const account = defaultAccountWalletSelector(state);
    const pDexV3Inst = await getPDexV3Instance({ account });
    const { pairs: listPairs } = swapSelector(state);
    if (!refresh && listPairs.length > 0) {
      return listPairs;
    }
    [pDEXPairs, pancakeTokens] = await Promise.all([
      pDexV3Inst.getListPair(),
      getPancakeTokens(),
    ]);

    pDEXPairs = pDEXPairs.reduce(
      (prev, current) =>
        (prev = prev.concat([current.tokenId1, current.tokenId2])),
      [],
    );
    
    const pancakeTokenIDs = pancakeTokens.map(item => item.tokenID);
    console.log('pDEXPairs: ', pDEXPairs);
    console.log('pancakeTokenIDs: ', pancakeTokenIDs);
    pairs = uniq([...pDEXPairs, ...pancakeTokenIDs]);
    console.log('pairs: ', pairs);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
  await dispatch(actionFetchedPairs({pairs, pancakeTokens}));
  return pairs;
};

export const actionInitSwapForm = ({
  refresh = true,
  defaultPair = {},
} = {}) => async (dispatch, getState) => {
  try {
    const state = getState();
    const isUsePRVToPayFee = isUsePRVToPayFeeSelector(state);
    await dispatch(actionInitingSwapForm(true));
    await dispatch(reset(formConfigs.formName));
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    let pair = defaultPair || defaultPairSelector(state);
    if (!pair?.selltoken || !pair?.buytoken) {
      const defaultPoolId = await pDexV3Inst.getDefaultPool();
      const defaultPool = getDataByPoolIdSelector(state)(defaultPoolId);
      pair.selltoken = defaultPool?.token1?.tokenId;
      pair.buytoken = defaultPool?.token2?.tokenId;
    }
    const pairs = await dispatch(actionFetchPairs(refresh));
    const isDefaultPairExisted =
      difference([pair?.selltoken, pair?.buytoken], pairs).length === 0;
    if (!pair?.selltoken || !pair?.buytoken || !isDefaultPairExisted) {
      pair = {
        selltoken: PRV_ID,
        buytoken:
          pairs.find(
            (i) =>
              i ===
              '116976a6896ed7001deb011b92576048bd8c670c47cd8529a5ddbba0024c701a',
          ) || BIG_COINS.USDT,
      };
    }
    const { selltoken, buytoken } = pair;
    batch(() => {
      dispatch(actionSetSellTokenFetched(selltoken));
      dispatch(actionSetBuyTokenFetched(buytoken));
      dispatch(
        change(formConfigs.formName, formConfigs.slippagetolerance, '1'),
      );
      const useFeeByToken = selltoken !== PRV_ID && !isUsePRVToPayFee;
      if (useFeeByToken) {
        dispatch(actionSetFeeToken(selltoken));
      } else {
        dispatch(actionSetFeeToken(PRV.id));
      }
      dispatch(actionSetInputToken({ selltoken, buytoken }));
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionInitingSwapForm(false));
  }
};

export const actionSetSwapingToken = (payload) => ({
  type: ACTION_SET_SWAPING_TOKEN,
  payload,
});

export const actionSwapToken = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const { tokenId: selltoken }: SelectedPrivacy = selltokenSelector(state);
    const { tokenId: buytoken }: SelectedPrivacy = buytokenSelector(state);
    if (!selltoken | !buytoken) {
      return;
    }
    await dispatch(actionSetSwapingToken(true));
    await dispatch(
      actionInitSwapForm({
        defaultPair: {
          selltoken: buytoken,
          buytoken: selltoken,
        },
        refresh: false,
      }),
    );
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionSetSwapingToken(false));
  }
};

export const actionSetSelectingToken = (payload) => ({
  type: ACTION_SET_SELECTING_TOKEN,
  payload,
});

export const actionSelectToken = (token: SelectedPrivacy, field) => async (
  dispatch,
  getState,
) => {
  if (!token.tokenId || !field) {
    return;
  }
  try {
    await dispatch(actionSetSelectingToken(true));
    const state = getState();
    const selltoken: SelectedPrivacy = selltokenSelector(state);
    const buytoken: SelectedPrivacy = buytokenSelector(state);
    switch (field) {
    case formConfigs.selltoken: {
      if (selltoken.tokenId === token.tokenId) {
        return;
      }
      if (buytoken.tokenId === token.tokenId) {
        await dispatch(actionSwapToken());
      } else {
        await dispatch(
          actionInitSwapForm({
            refresh: true,
            defaultPair: {
              selltoken: token.tokenId,
              buytoken: buytoken.tokenId,
            },
          }),
        );
      }
      break;
    }
    case formConfigs.buytoken: {
      if (buytoken.tokenId === token.tokenId) {
        return;
      }
      if (selltoken.tokenId === token.tokenId) {
        await dispatch(actionSwapToken());
      } else {
        await dispatch(
          actionInitSwapForm({
            refresh: true,
            defaultPair: {
              selltoken: selltoken.tokenId,
              buytoken: token.tokenId,
            },
          }),
        );
      }
      break;
    }
    default:
      break;
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionSetSelectingToken(false));
  }
};

export const actionFetchingSwap = (payload) => ({
  type: ACTION_FETCH_SWAP,
  payload,
});

export const actionFetchSwap = () => async (dispatch, getState) => {
  let tx;
  try {
    const state = getState();
    const { disabledBtnSwap, routing: tradePath } = swapInfoSelector(state);
    if (disabledBtnSwap) {
      return;
    }
    await dispatch(actionFetchingSwap(true));
    const account = defaultAccountWalletSelector(state);
    const sellInputAmount = inputAmountSelector(state)(formConfigs.selltoken);
    const buyInputAmount = inputAmountSelector(state)(formConfigs.buytoken);
    const feetokenData = feetokenDataSelector(state);
    if (!sellInputAmount || !buyInputAmount || !feetokenData) {
      return;
    }
    const pDexV3 = await getPDexV3Instance({ account });
    const {
      tokenId: tokenIDToSell,
      originalAmount: sellAmount,
    } = sellInputAmount;
    const {
      tokenId: tokenIDToBuy,
      originalAmount: minAcceptableAmount,
    } = buyInputAmount;
    const { origininalFeeAmount: tradingFee, feetoken } = feetokenData;
    const params = {
      transfer: { fee: ACCOUNT_CONSTANT.MAX_FEE_PER_TX, info: '' },
      extra: {
        tokenIDToSell,
        sellAmount: String(sellAmount),
        tokenIDToBuy,
        tradingFee,
        tradePath,
        feetoken,
        version: PrivacyVersion.ver2,
        minAcceptableAmount: String(minAcceptableAmount),
      },
    };
    tx = await pDexV3.createAndSendSwapRequestTx(params);
    if (!tx) {
      console.log('error');
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    await dispatch(actionFetchingSwap(false));
  }
  return tx;
};

export const actionFetchingOrdersHistory = () => ({
  type: ACTION_FETCHING_ORDERS_HISTORY,
});

export const actionFetchedOrdersHistory = (payload) => ({
  type: ACTION_FETCHED_ORDERS_HISTORY,
  payload,
});

export const actionFetchFailOrderHistory = () => ({
  type: ACTION_FETCH_FAIL_ORDERS_HISTORY,
});

export const actionFetchHistory = () => async (dispatch, getState) => {
  let history = [];
  try {
    await dispatch(actionFetchingOrdersHistory());
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    history = await pDexV3.getSwapHistory({ version: PrivacyVersion.ver2 });
    await dispatch(actionFetchedOrdersHistory(history));
  } catch (error) {
    new ExHandler(error).showErrorToast();
    await dispatch(actionFetchFailOrderHistory());
  }
};

export const actionFetchingOrderDetail = () => ({
  type: ACTION_FETCHING_ORDER_DETAIL,
});

export const actionFetchedOrderDetail = (payload) => ({
  type: ACTION_FETCHED_ORDER_DETAIL,
  payload,
});

export const actionFetchDataOrderDetail = () => async (dispatch, getState) => {
  let _order = {};
  const state = getState();
  const { order } = orderDetailSelector(state);
  if (!order?.requestTx) {
    return;
  }
  try {
    await dispatch(actionFetchingOrderDetail());
    const pDexV3 = await dispatch(actionGetPDexV3Inst());
    _order = await pDexV3.getOrderSwapDetail({
      requestTx: order?.requestTx,
      version: PrivacyVersion.ver2,
      fromStorage: !!order?.fromStorage,
    });
  } catch (error) {
    _order = { ...order };
    new ExHandler(error).showErrorToast();
  } finally {
    _order = _order || order;
    await dispatch(actionFetchedOrderDetail(_order));
  }
};

export const actionSetDefaultPair = (payload) => ({
  type: ACTION_SET_DEFAULT_PAIR,
  payload,
});
