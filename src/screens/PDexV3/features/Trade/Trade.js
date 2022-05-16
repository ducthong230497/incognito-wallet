import {batch, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {Tabs} from '@src/components/core';
import Row from '@src/components/Row';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import TabSwap from '@screens/PDexV3/features/Swap';
import OrderLimit, {
  actionFetchingBookOrder,
  actionFetchOrdersHistory,
  actionInit,
  actionSetPercent,
  buyInputAmountSelector,
  poolSelectedDataSelector,
  sellInputAmountSelector,
  visibleBtnChartSelector,
} from '@screens/PDexV3/features/OrderLimit';
import {ButtonChart} from '@src/components/Button';
import SelectAccountButton from '@src/components/SelectAccountButton';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import {ROOT_TAB_TRADE, TAB_BUY_LIMIT_ID, TAB_SELL_LIMIT_ID, TAB_SWAP_ID,} from './Trade.constant';
import {orderLimitDataSelector, rateDataSelector} from '../OrderLimit/OrderLimit.selector';
import {styled} from './Trade.styled';
import withTrade from './Trade.enhance';
import {actionCheckNeedFaucetPRV, getBalance} from '@src/redux/actions/token';

import {formConfigs, HISTORY_ORDERS_STATE, OPEN_ORDERS_STATE,} from '../OrderLimit/OrderLimit.constant';
import {actionGetPDexV3Inst} from "@screens/PDexV3";
import SelectedPrivacy from "@models/selectedPrivacy";
import {ACCOUNT_CONSTANT, PrivacyVersion} from 'incognito-chain-web-js/build/wallet';
import {actionSetNFTTokenData as actionSetNFTTokenDataNoCache} from "@src/redux/actions/account";
import {ExHandler} from "@services/exception";
import {BIG_COINS, PRV_ID} from "@screens/DexV2/constants";
import {change} from "redux-form";
import FaucetPRVModal from "@components/Modal/features/FaucetPRVModal";
import {actionToggleModal} from "@components/Modal";
import {NFTTokenModal} from "@screens/PDexV3/features/NFTToken";
import {nftTokenDataSelector} from "@src/redux/selectors/account";
import { openOrdersSelector } from '../OrderLimit/OrderLimit.selector';
import { actionWithdrawOrder } from '../OrderLimit/OrderLimit.actions';
import BigNumber from 'bignumber.js';

let interval = null
let balance = null
let balance2 = null
let rate = null
let openOrdersJson = null

const Trade = (props) => {
  // const tabIndex = useNavigationParam('tabIndex');
  const {onRefresh} = props;
  // const navigation = useNavigation();
  const dispatch = useDispatch();
  const visibleBtnChart = useDebounceSelector(visibleBtnChartSelector);
  const { accountBalance } = useSelector(
      orderLimitDataSelector,
  );
  const { nftTokenAvailable } = useDebounceSelector(nftTokenDataSelector);
  const sellInputAmount = useDebounceSelector(sellInputAmountSelector);
  const [ordering, setOrdering] = React.useState(false);
  openOrdersJson = useDebounceSelector(openOrdersSelector);

  const actionBookOrderWithTabId = (tabId) => async (dispatch, getState) => {
    await dispatch(actionFetchingBookOrder(true));
    try {
      const state = getState();
      const { disabledBtn, totalAmountData } =
          orderLimitDataSelector(state);
      // if (disabledBtn) {
      //     return;
      // }
      const { totalAmountToken, totalOriginalAmount, totalOriginalAmountBuy, totalOriginalAmountSell } = totalAmountData;
      console.log(`adadad totalAmountToken: ${totalAmountToken}, totalOriginalAmount: ${totalOriginalAmount}, totalOriginalAmountBuy: ${totalOriginalAmountBuy}, totalOriginalAmountSell: ${totalOriginalAmountSell}`)
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      const { poolId: poolPairID } = poolSelectedDataSelector(state);
      let extra;
      switch (tabId) {
        case TAB_BUY_LIMIT_ID: {
          const { originalAmount: minAcceptableAmount, tokenData } =
              buyInputAmountSelector(state);
          const sellToken: SelectedPrivacy = totalAmountToken;
          const buyToken: SelectedPrivacy = tokenData;
          const tokenIDToSell = "0000000000000000000000000000000000000000000000000000000000000004";
          const sellAmount = totalOriginalAmount;
          const tokenIDToBuy = "b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696";
          extra = {
            tokenIDToSell,
            poolPairID,
            sellAmount: String(sellAmount),
            version: PrivacyVersion.ver2,
            minAcceptableAmount: String(minAcceptableAmount),
            tokenIDToBuy,
          };
          break;
        }
        case TAB_SELL_LIMIT_ID: {
          const { originalAmount: sellAmount, tokenData } =
              sellInputAmountSelector(state);
          const sellToken: SelectedPrivacy = tokenData;
          const buyToken: SelectedPrivacy = totalAmountToken;
          const tokenIDToSell = "b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696";
          const minAcceptableAmount = totalOriginalAmountSell;
          const tokenIDToBuy = "0000000000000000000000000000000000000000000000000000000000000004";
          extra = {
            tokenIDToSell,
            poolPairID,
            sellAmount: String(sellAmount),
            version: PrivacyVersion.ver2,
            minAcceptableAmount: String(minAcceptableAmount),
            tokenIDToBuy,
          };
          break;
        }
        default:
          break;
      }
      console.log(`adadad extra: ${JSON.stringify(extra)}`)
      const tx = await pDexV3Inst.createAndSendOrderRequestTx({ extra });
      dispatch(actionSetNFTTokenDataNoCache());
      dispatch(actionFetchOrdersHistory(OPEN_ORDERS_STATE));
      return tx;
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await dispatch(actionFetchingBookOrder(false));
    }
  };
  const handleConfirm = async (tabId) => {
    try {
      if (ordering) {
        return;
      }
      await setOrdering(true);
      // const fields = [
      //   formConfigs.selltoken,
      //   formConfigs.buytoken,
      //   formConfigs.rate,
      // ];
      // console.log(`adadad handleConfirm: ${JSON.stringify(fields)}`)
      // for (let index = 0; index < fields.length; index++) {
      //     const field = fields[index];
      //     if (formErrors[field]) {
      //         return dispatch(focus(formConfigs.formName, field));
      //     }
      // }
      // if (!sellInputAmount.isMainCrypto) {
      //   const needFaucet = await dispatch(
      //       actionCheckNeedFaucetPRV(<FaucetPRVModal />, accountBalance),
      //   );
      //   if (needFaucet) {
      //     return;
      //   }
      // }
      // console.log(`adadad sellInputAmount`)
      // if (!nftTokenAvailable) {
      //   return dispatch(
      //       actionToggleModal({
      //         visible: true,
      //         shouldCloseModalWhenTapOverlay: true,
      //         data: <NFTTokenModal />,
      //       }),
      //   );
      // }
      // console.log(`adadad nftTokenAvailable`)
      // if (disabledBtn) {
      //     return;
      // }
      // console.log(`adadad disabledBtn`)
      const tx = await dispatch(actionBookOrderWithTabId(tabId));
      // if (tx) {
      //     dispatch(
      //         actionToggleModal({
      //             data: (
      //                 <TradeSuccessModal
      //                     title="Order placed!"
      //                     desc={cfmTitle}
      //                     sub="Your balance will update as the order fills."
      //                     handleTradeSucesss={() => {
      //                         console.log('book order limit');
      //                     }}
      //                 />
      //             ),
      //             visible: true,
      //         }),
      //     );
      // }
    } catch {
      //
    } finally {
      setOrdering(false);
    }
  };

  const {
    balanceStr,
    balanceStr2,
  } = useSelector(
      orderLimitDataSelector,
  );
  const {customRate} = useSelector(rateDataSelector);
  balance = balanceStr
  balance2 = balanceStr2
  rate = customRate
  console.log(`adadad useEffect balance ${balance}`)
  console.log(`adadad rate: ${rate}, openOrders: ${JSON.stringify(openOrdersJson.history.map((order) => order.rate))}`)
  useEffect(() => {
    console.log("adadad useEffect in trade tab")
    interval = setInterval(() => {
        console.log(`adadad setInterval in trade tab ${interval}, balance: ${balance}, balance2: ${balance2}, rate: ${rate}`)
        let btcAmount
        let prvAmount
        let buyAmount = 0.0
        let sellAmount = 0.0
        if (balance.includes("BTC")) {
            console.log(`adadad upper if btc split ${balance.split("-")[0]}`)
            btcAmount = parseFloat(balance.split("-")[0])
        } else {
            console.log(`adadad upper if prv split ${balance.split("-")[0]}`)
            prvAmount = parseFloat(balance.split("-")[0])
        }
        if (balance2.includes("BTC")) {
            console.log(`adadad lower if btc split ${balance2.split("-")[0]}`)
            btcAmount = parseFloat(balance2.split("-")[0])
        } else {
            console.log(`adadad lower if prv split ${balance2.split("-")[0]}`)
            prvAmount = parseFloat(balance.split("-")[0])
        }
        console.log(`adadad btcAmount: ${btcAmount}, prvAmount: ${prvAmount}`)
        let shouldSell = false
        const amount = 0.0002
        if (btcAmount >= amount) {
            // set sell amount
            sellAmount = amount
            shouldSell = true
        }
        let shouldBuy = false
        if (prvAmount >= amount*rate) {
            // set buy amount
            buyAmount = amount
            shouldBuy = true
        }
        console.log(`adadad setInterval in trade tab ${interval}, buyAmount: ${buyAmount}, sellAmount: ${sellAmount}`)

        batch(async () => {
            const prvBalance = await dispatch(getBalance(PRV_ID))
            const btcBalance = await dispatch(getBalance(BIG_COINS.BTC))
            console.log(`adadad prvBalance: ${prvBalance}`)
            console.log(`adadad btcBalance: ${btcBalance}`)
            if (shouldBuy && buyAmount > 0.0) {
                console.log("start buy limit order")
                await dispatch(change(formConfigs.formName, formConfigs.buytoken, buyAmount));
                await dispatch(actionSetPercent(0));
                await handleConfirm(TAB_BUY_LIMIT_ID)
                console.log("end buy limit order")
            }
            if (shouldSell && sellAmount > 0.0) {
                console.log("start sell limit order")
                await dispatch(change(formConfigs.formName, formConfigs.selltoken, sellAmount),);
                await dispatch(actionSetPercent(0));
                await handleConfirm(TAB_SELL_LIMIT_ID)
                console.log("end sell limit order")
            }

            // console.log(`openOrdersJson: ${JSON.stringify(openOrdersJson.history)}`)
            for (let i in openOrdersJson.history) {
                const openOrder = openOrdersJson.history[i]
                const orderPrice = +openOrder.priceStr.replace(",", "")

              console.log(`cancel order loop, orderPrice: ${orderPrice}, rate: ${rate}`)
              if (Math.abs(orderPrice - rate) > 5) {
              // if ((isBuy && orderRate < 1 && Math.abs(orderAmount - rate) > 5) || (!isBuy && Math.abs(+orderRate - rate) > 5)) {
                console.log("start cancel limit order")
                const data = {
                  ...openOrder,
                  txType: ACCOUNT_CONSTANT.TX_TYPE.CANCEL_ORDER_LIMIT,
                  subTitle: 'Are you sure you want to cancel\nthis limit order?',
                };
                console.log(`cancel order, orderPrice: ${orderPrice}, currentRate: ${rate}`)
                await dispatch(actionWithdrawOrder(data))
                console.log("end cancel limit order")
                break;
              }
            }

            await dispatch(actionInit())
            await dispatch(actionFetchOrdersHistory(HISTORY_ORDERS_STATE));
            await dispatch(actionFetchOrdersHistory(OPEN_ORDERS_STATE));
        })
    }, 60000)
    return () => {
      console.log(`adadad clearInterval ${interval}`)
      clearInterval(interval);
    }
  }, [])
  return (
      <View style={styled.container}>
        <Tabs
            rootTabID={ROOT_TAB_TRADE}
            defaultTabHeader
            styledTabs={styled.styledTabs}
            useTab1
            defaultTabIndex={0}
            styledTabList={styled.styledTabList}
            rightCustom={(
                <Row style={styled.rightHeader}>
                  {visibleBtnChart && (
                      <ButtonChart
                          onPress={() => {
                            batch(async () => {
                              // const prvBalance = await dispatch(getBalance(PRV_ID))
                              // const btcBalance = await dispatch(getBalance(BIG_COINS.BTC))
                              // console.log(`adadad prvBalance: ${prvBalance}`)
                              // console.log(`adadad btcBalance: ${btcBalance}`)
                              // // if (shouldBuy && buyAmount > 0.0) {
                              // await dispatch(change(formConfigs.formName, formConfigs.buytoken, "0.0001"));
                              // await dispatch(actionSetPercent(0));
                              // await handleConfirm(TAB_BUY_LIMIT_ID)
                              // // }
                              // // if (shouldSell && sellAmount > 0.0) {
                              // //     await dispatch(
                              // //         actionChangeTab({
                              // //             ROOT_TAB_TRADE,
                              // //             tabID: TAB_SELL_LIMIT_ID,
                              // //         }),
                              // //     );
                              //
                              // await dispatch(change(formConfigs.formName, formConfigs.selltoken, "0.0001"),);
                              // await dispatch(actionSetPercent(0));
                              // await handleConfirm(TAB_SELL_LIMIT_ID)
                              // // }
                              // await dispatch(actionInit())
                              // await dispatch(actionFetchOrdersHistory(HISTORY_ORDERS_STATE));
                              // await dispatch(actionFetchOrdersHistory(OPEN_ORDERS_STATE));

                              // for (let i in openOrdersJson.history) {
                              //   const openOrder = openOrdersJson.history[i]
                              //   const orderPrice = +openOrder.priceStr.replace(",", "")
                              //
                              //   if (Math.abs(orderPrice - rate) > 5) {
                              //       const data = {
                              //           ...openOrder,
                              //           txType: ACCOUNT_CONSTANT.TX_TYPE.CANCEL_ORDER_LIMIT,
                              //           subTitle: 'Are you sure you want to cancel\nthis limit order?',
                              //       };
                              //     console.log(`cancel order, orderPrice: ${orderPrice}, currentRate: ${rate}`)
                              //     // dispatch(actionWithdrawOrder(data))
                              //     // break;
                              //   }
                              // }
                            })
                          }}
                          style={{marginRight: 15}}
                      />
                  )}
                  <View>
                    <SelectAccountButton handleSelectedAccount={onRefresh}/>
                  </View>
                </Row>
            )}
        >
          <View
              tabID={TAB_BUY_LIMIT_ID}
              label="Buy"
              onChangeTab={() => dispatch(actionInit(false))}
          >
            <OrderLimit/>
          </View>
          <View
              tabID={TAB_SELL_LIMIT_ID}
              label="Sell"
              onChangeTab={() => dispatch(actionInit(false))}
          >
            <OrderLimit/>
          </View>
          <View tabID={TAB_SWAP_ID} label="Swap">
            <TabSwap/>
          </View>
        </Tabs>
      </View>
  );
};

Trade.defaultProps = {
  hideBackButton: false,
};

Trade.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  refreshing: PropTypes.bool.isRequired,
  handlePressPool: PropTypes.func.isRequired,
  hideBackButton: PropTypes.bool,
};

export default withTrade(React.memo(Trade));
