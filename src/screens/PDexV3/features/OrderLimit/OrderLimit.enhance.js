import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { COLORS, FONT } from '@src/styles';
import { actionToggleModal } from '@src/components/Modal';
import { TradeSuccessModal } from '@screens/PDexV3/features/Trade';
import { useFocusEffect } from 'react-navigation-hooks';
import debounce from 'lodash/debounce';
import { orderLimitDataSelector } from './OrderLimit.selector';
import {
  actionInit,
  actionSetDefaultPool,
  actionBookOrder,
  actionSetPoolSelected,
} from './OrderLimit.actions';
import { TAB_BUY_ID, TAB_SELL_ID } from './OrderLimit.constant';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const handleInitOrderLimit = debounce(
    React.useCallback(() => {
      dispatch(actionInit());
    }, 200),
  );
  const handleUnmount = async () => {
    await dispatch(actionSetDefaultPool());
  };
  const actionChangeTab = () => {
    handleInitOrderLimit();
  };
  const { sellColor, buyColor, cfmTitle } = useSelector(orderLimitDataSelector);
  const tabsFactories = [
    {
      tabID: TAB_BUY_ID,
      label: 'Buy',
      onChangeTab: actionChangeTab,
      titleStyled: {
        color: COLORS.white,
        fontSize: FONT.SIZE.medium,
        fontFamily: FONT.NAME.medium,
      },
      titleDisabledStyled: { color: COLORS.colorGrey3 },
      tabStyled: {
        backgroundColor: buyColor,
        flex: 1,
      },
      tabStyledDisabled: {
        backgroundColor: 'transparent',
      },
    },
    {
      tabID: TAB_SELL_ID,
      label: 'Sell',
      onChangeTab: actionChangeTab,
      titleStyled: {
        color: COLORS.white,
        fontSize: FONT.SIZE.medium,
        fontFamily: FONT.NAME.medium,
      },
      titleDisabledStyled: { color: COLORS.colorGrey3 },
      tabStyled: {
        backgroundColor: sellColor,
        flex: 1,
      },
      tabStyledDisabled: {
        backgroundColor: 'transparent',
      },
    },
  ];
  const handleConfirm = async () => {
    try {
      const tx = await dispatch(actionBookOrder());
      if (tx) {
        dispatch(
          actionToggleModal({
            data: (
              <TradeSuccessModal
                title="Order initiated!"
                desc={cfmTitle}
                sub={
                  'Your balance will update in a couple of\nminutes after the trade is finalized.'
                }
                handleTradeSucesss={() => dispatch(actionInit())}
              />
            ),
            visible: true,
          }),
        );
      }
    } catch {
      //
    }
  };
  const onRefresh = () => {
    dispatch(actionInit());
  };
  const callback = async (poolId) => {
    await dispatch(actionSetPoolSelected(poolId));
    dispatch(actionInit());
  };
  useFocusEffect(
    React.useCallback(() => {
      handleInitOrderLimit();
    }, []),
  );
  React.useEffect(() => {
    return () => {
      handleUnmount();
    };
  }, []);
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{ ...props, handleConfirm, tabsFactories, onRefresh, callback }}
      />
    </ErrorBoundary>
  );
};

export default compose(enhance);