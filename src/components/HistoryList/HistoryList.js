import { Text, TouchableOpacity, View } from '@src/components/core';
import routeNames from '@src/router/routeNames';
import { COLORS } from '@src/styles';
import formatUtil from '@src/utils/format';
import PropTypes from 'prop-types';
import React from 'react';
import { generateTestId } from '@utils/misc';
import { TOKEN } from '@src/constants/elements';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from 'react-navigation-hooks';
import trim from 'lodash/trim';
import { useSelector } from 'react-redux';
import { decimalDigitsSelector } from '@src/screens/Setting';
import styleSheet from './style';
import { getStatusData, getTypeData } from './HistoryList.utils';

const HistoryItemWrapper = ({ history, onCancelEtaHistory, ...otherProps }) => {
  const component = <HistoryItem history={history} {...otherProps} />;
  if (history?.cancelable) {
    return (
      <Swipeout
        autoClose
        style={{
          backgroundColor: 'transparent',
        }}
        right={[
          {
            text: 'Remove',
            backgroundColor: COLORS.red,
            onPress: () => onCancelEtaHistory(history),
          },
        ]}
      >
        {component}
      </Swipeout>
    );
  }

  return component;
};

const NormalText = ({ style, text, ...rest }) => (
  <Text
    numberOfLines={1}
    style={[styleSheet.text, style]}
    ellipsizeMode="tail"
    {...rest}
  >
    {trim(text)}
  </Text>
);

const HistoryItem = ({ history }) => {
  const navigation = useNavigation();
  const decimalDigits = useSelector(decimalDigitsSelector);
  const { pDecimals, amount } = history;
  if (!history) {
    return null;
  }
  const { statusText, statusColor, statusNumber } = getStatusData(
    history.status,
    history.statusCode,
  );
  const { typeText, balanceColor, balanceDirection } = getTypeData(
    history.type,
    history,
  );
  const _amount = formatUtil.amount(amount, pDecimals, true, decimalDigits);
  const onPress = () => {
    navigation?.navigate(routeNames.TxHistoryDetail, {
      data: {
        history,
        typeText,
        balanceColor,
        balanceDirection,
        statusText,
        statusColor,
        statusNumber,
      },
    });
  };

  return (
    <TouchableOpacity onPress={onPress} style={styleSheet.itemContainer}>
      <View style={[styleSheet.row, styleSheet.rowTop]}>
        <NormalText
          text={typeText}
          style={styleSheet.title}
          {...generateTestId(TOKEN.TRANSACTION_TYPE)}
        />
        <NormalText
          text={_amount ? trim(_amount) : ''}
          style={styleSheet.title}
          {...generateTestId(TOKEN.TRANSACTION_CONTENT)}
        />
      </View>
      <View style={styleSheet.row}>
        <NormalText
          style={styleSheet.desc}
          text={formatUtil.formatDateTime(history.time)}
          {...generateTestId(TOKEN.TRANSACTION_TIME)}
        />
        <NormalText
          style={styleSheet.desc}
          {...generateTestId(TOKEN.TRANSACTION_STATUS)}
          text={`${statusText} ${
            !!statusNumber || statusNumber === 0 ? `[${statusNumber}]` : ''
          }`}
        />
      </View>
    </TouchableOpacity>
  );
};

const HistoryList = ({ histories, onCancelEtaHistory }) => (
  <View style={styleSheet.container}>
    {histories
      .sort((a, b) => new Date(b?.time).getTime() - new Date(a?.time).getTime())
      .map((history) => (
        <HistoryItemWrapper
          key={history.id}
          history={history}
          onCancelEtaHistory={onCancelEtaHistory}
        />
      ))}
  </View>
);

HistoryItem.defaultProps = {
  history: {
    id: null,
    time: null,
    type: null,
    amount: null,
    symbol: null,
    fromAddress: null,
    toAddress: null,
    statusCode: null,
    status: null,
  },
};

HistoryItem.propTypes = {
  history: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    time: PropTypes.string,
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    symbol: PropTypes.string,
    fromAddress: PropTypes.string,
    toAddress: PropTypes.string,
    statusCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    decentralized: PropTypes.number,
    cancelable: PropTypes.bool,
    canRetryExpiredDeposit: PropTypes.bool,
    pDecimals: PropTypes.number,
    requestedAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    expiredAt: PropTypes.string,
    depositAddress: PropTypes.string,
    userPaymentAddress: PropTypes.string,
    erc20TokenAddress: PropTypes.string,
    privacyTokenAddress: PropTypes.string,
    walletAddress: PropTypes.string,
  }),
};

HistoryList.defaultProps = {
  histories: [],
  onCancelEtaHistory: null,
};

HistoryList.propTypes = {
  histories: PropTypes.array,
  onCancelEtaHistory: PropTypes.func,
};

NormalText.propTypes = {
  style: PropTypes.any,
  text: PropTypes.string,
};

NormalText.defaultProps = {
  style: null,
  text: '',
};

export default HistoryList;