import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import { ScrollView, Toast, RefreshControl, Button } from '@src/components/core';
import HistoryList from '@src/components/HistoryList';
import LoadingContainer from '@src/components/LoadingContainer';
import tokenService from '@src/services/wallet/tokenService';
import { getpTokenHistory, removeHistory } from '@src/services/api/history';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { CONSTANT_COMMONS } from '@src/constants';
import ROUTE_NAMES from '@src/router/routeNames';

const combineHistory = (histories, historiesFromApi, symbol, externalSymbol, decimals, pDecimals) => {
  const data = [];

  historiesFromApi && historiesFromApi.forEach((h) => {
    data.push({
      id: h?.id,
      incognitoTx: h?.incognitoTx,
      time: h?.updatedAt,
      type: h?.addressType,
      toAddress: h?.userPaymentAddress,
      fromAddress: h?.userPaymentAddress,
      amount: h?.incognitoAmount,
      requestedAmount: h?.requestedAmount,
      symbol: externalSymbol,
      decimals,
      pDecimals,
      status: h?.statusText,
      statusCode: h?.status,
      cancelable: h?.cancelable,
      currencyType: h?.currencyType,
    });
  });

  histories && histories.forEach(h => {
    data.push({
      id: h?.txID,
      incognitoTx: h?.txID,
      time: h?.time,
      type: h?.isIn ?  CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE : CONSTANT_COMMONS.HISTORY.TYPE.SEND,
      toAddress: h?.receivers[0],
      amount: h?.amount,
      symbol: h?.tokenSymbol,
      decimals,
      pDecimals,
      status: h?.status,
      fee: h?.fee,
      feePToken: h?.feePToken,
    });
  });

  return data.sort((a, b) => new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1);
};


class HistoryTokenContainer extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: true,
      histories: [],
      historiesFromApi: [],
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    navigation.addListener(
      'didFocus',
      () => {
        this.handleLoadHistory();
      }
    );
  }

  componentDidUpdate(prevProps) {
    const token = this.getToken(this.props);
    const prevToken = this.getToken(prevProps);

    if (token && (token?.id !== prevToken?.id)) {
      this.handleLoadHistory();
    }
  }

  handleCancelEtaHistory = async history => {
    try {
      const data = await removeHistory({ historyId: history?.id, currencyType: history?.currencyType});
      if (data) {
        Toast.showSuccess('Canceled');
        this.handleLoadHistory();
      }
    } catch {
      Toast.showError('Something went wrong. Please try again.');
    }
  }

  handleLoadHistory = async () => {
    try {
      this.setState({ isLoading: true });
      const { wallet, defaultAccount } = this.props;
      const token = this.getToken(this.props);
  
      const [histories, historiesFromApi] = await Promise.all([
        this.loadTokentHistory(wallet, defaultAccount, token),
        this.getHistoryFromApi()
      ]);

      this.setState({
        historiesFromApi,
        histories
      });
      
    } finally {
      this.setState({ isLoading: false });
    }
  }

  getToken = (props) => {
    const { selectedPrivacy, tokens } = props;
    return tokens?.find(t => t?.id === selectedPrivacy?.tokenId);
  }

  getHistoryFromApi = async () => {
    try {
      const { selectedPrivacy } = this.props;
      const { isDeposable, isWithdrawable, paymentAddress } = selectedPrivacy;

      if (!isWithdrawable || !isDeposable) {
        return;
      }

      const histories = await getpTokenHistory({ paymentAddress, tokenId: selectedPrivacy?.tokenId });

      return histories;
    } catch {
      Toast.showError('Something went wrong. Please refresh the screen.');
    }
  }

  loadTokentHistory = async (wallet, account, token) => {
    try {
      if (!wallet) {
        throw new Error('Wallet is not exist to load history');
      }

      if (!account) {
        throw new Error('Account is not exist to load history');
      }

      const histories = await tokenService.getTokenHistory({
        wallet,
        account,
        token
      });

      return histories;
    } catch {
      Toast.showError('Something went wrong. Please refresh the screen.');
    }
  };

  handleScrollReload = () => {
    const { onLoad } = this.props;
    if (typeof onLoad === 'function') {
      onLoad();
    }

    this.handleLoadHistory();
  }

  renderActionButton = () => {
    const { selectedPrivacy, navigation } = this.props;
    if (selectedPrivacy?.isDeposable) {
      return (
        <Button
          title='Make a deposit'
          onPress={() => {
            navigation.navigate(ROUTE_NAMES.Deposit);
          }}
        />
      );
    }

    return null;
  }

  render() {
    const { isLoading, histories, historiesFromApi } = this.state;
    const { selectedPrivacy } = this.props;

    if (isLoading || !selectedPrivacy) {
      return <LoadingContainer />;
    }

    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1
        }}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={this.handleScrollReload}
          />
        )}
      >
        <HistoryList
          histories={combineHistory(histories, historiesFromApi, selectedPrivacy?.symbol, selectedPrivacy?.externalSymbol, selectedPrivacy?.decimals, selectedPrivacy?.pDecimals)}
          actionButton={this.renderActionButton()}
          onCancelEtaHistory={this.handleCancelEtaHistory}
        />
      </ScrollView>
    );
  }
}

const mapState = state => ({
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
  wallet: state.wallet,
  defaultAccount: accountSeleclor.defaultAccount(state),
  tokens: state.token.followed,
});

HistoryTokenContainer.defaultProps = {
  selectedPrivacy: null,
  onLoad: null
};

HistoryTokenContainer.propTypes = {
  selectedPrivacy: PropTypes.object,
  wallet: PropTypes.object.isRequired,
  defaultAccount: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  onLoad: PropTypes.func,
};

export default compose(
  connect(mapState),
  withNavigation
)(HistoryTokenContainer);
