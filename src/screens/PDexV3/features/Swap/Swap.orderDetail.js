import React from 'react';
import { View, StyleSheet } from 'react-native';
import { withLayout_2 } from '@src/components/Layout';
import Header from '@components/Header';
import { ScrollView, RefreshControl, Text } from '@components/core';
import { useDispatch, useSelector } from 'react-redux';
import { BtnCopy } from '@src/components/Button';
import { ExHandler } from '@src/services/exception';
import LinkingService from '@src/services/linking';
import ClipboardService from '@src/services/clipboard';
import { CONSTANT_CONFIGS } from '@src/constants';
import TradeOrderDetail, {
  styled as orderDetailStyled,
} from '@screens/PDexV3/features/Trade/Trade.orderDetail';
import { orderDetailSelector } from './Swap.selector';
import { actionFetchDataOrderDetail } from './Swap.actions';

const styled = StyleSheet.create({
  container: { flex: 1 },
  scrollview: { flex: 1, paddingTop: 32 },
});

const SwapOrderDetail = () => {
  const dispatch = useDispatch();
  const { fetching: refreshing, order } = useSelector(orderDetailSelector);
  const onRefresh = async () => {
    dispatch(actionFetchDataOrderDetail());
  };
  const factories = React.useMemo(() => {
    if (!order) {
      return [];
    }
    let ft = [
      {
        label: 'Request Tx',
        value: `#${order?.requestTx}`,
        copiable: true,
        openUrl: true,
        handleOpenUrl: () =>
          LinkingService.openUrl(
            `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${order?.requestTx}`,
          ),
      },
      {
        label: 'Time',
        value: order?.timeStr,
      },
      {
        label: 'Sell',
        value: order?.sellStr,
      },
      {
        label: 'Buy',
        value: order?.buyStr,
      },
      {
        label: 'Status',
        value: order?.statusStr,
      },
      {
        label: 'Rate',
        value: order?.rateStr,
      },
      {
        label: 'Fee',
        value: order?.tradingFeeStr,
      },
    ];
    if (!order?.tradingFeeByPRV) {
      ft.push({
        label: 'Network fee',
        value: order?.networkfeeAmountStr,
      });
    }
    if (order?.responseTxs?.length > 0) {
      ft.push({
        label: 'Response Tx',
        customValue: (
          <View style={{ flex: 1 }}>
            {order?.responseTxs.map((responseTx) => (
              <Text
                style={{ ...orderDetailStyled.value, marginBottom: 15 }}
                ellipsizeMode="middle"
                numberOfLines={1}
              >
                {responseTx}
              </Text>
            ))}
          </View>
        ),
        hookStyled: {
          alignItems: 'flex-start',
        },
        value: order?.responseTxs.map((responseTx) => `\n${responseTx}`).join(),
      });
    }
    return ft.filter(
      (ftItem) => !!ftItem && (!!ftItem?.value || !!ftItem?.customValue),
    );
  }, [order]);
  const handleCopy = () => {
    try {
      const data = factories
        .map(({ label, value }) => `${label}: ${value}`)
        .join('\n');
      ClipboardService.set(data, { copiedMessage: 'Copied', errorMessage: '' });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    dispatch(actionFetchDataOrderDetail());
  }, []);
  return (
    <View style={styled.container}>
      <Header
        title="Order detail"
        rightHeader={<BtnCopy onPress={handleCopy} />}
      />
      <ScrollView
        style={styled.scrollview}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {factories.length > 0 &&
          factories?.map((item) => (
            <TradeOrderDetail key={item?.label} {...item} />
          ))}
      </ScrollView>
    </View>
  );
};

SwapOrderDetail.propTypes = {};

export default withLayout_2(React.memo(SwapOrderDetail));