import { createSelector } from 'reselect';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { PRV_ID } from '@screens/Dex/constants';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { selectedPrivacySelector } from '@src/redux/selectors';

export const convertCoinsSelector = createSelector(
  (state) => state.convert,
  (convert) => convert,
);

export const convertCoinsDataSelector = createSelector(
  convertCoinsSelector,
  defaultAccountSelector,
  (convert, account) => {
    const { data: convertData, isFetching } = convert;
    const { unspentCoins, address } = convertData;
    let currUnspentCoins = [];
    let hasUnspentCoins = false;
    let prvUnspent = [];
    let pTokenUnspent = [];
    const accountAddress = account?.PaymentAddress;
    const existAddress = address && address === accountAddress;
    if (address && address === accountAddress) {
      currUnspentCoins = unspentCoins;
      hasUnspentCoins = currUnspentCoins.some(coin => {
        if (coin.tokenID === PRV_ID) {
          return coin.balance > 100;
        }
        return coin.balance > 0;
      });

      prvUnspent = currUnspentCoins.find((coin) => coin.tokenID === PRV_ID && coin.balance > MAX_FEE_PER_TX);
      pTokenUnspent = currUnspentCoins.filter((coin) => coin.tokenID !== PRV_ID && coin.balance > 0);
    }

    const loading = !existAddress || isFetching;
    const isConvert = !loading && hasUnspentCoins;

    return {
      ...convert,
      coins: currUnspentCoins,
      isFetching: !existAddress || isFetching,
      hasUnspentCoins,
      isConvert,
      prvUnspent,
      pTokenUnspent,
    };
  },
);

export const convertGetConvertStepSelector = createSelector(
  convertCoinsDataSelector,
  selectedPrivacySelector.getPrivacyDataByTokenID,
  (convert, fnc) => {
    const { prvUnspent, pTokenUnspent } = convert;
    const coins = [prvUnspent].concat(pTokenUnspent).filter(token => !!token);
    return coins.map((coin) => {
      const { tokenID } = coin;
      const token = fnc(tokenID);
      return {
        ...coin,
        ...token,
        tokenId: tokenID,
        name: `Convert ${token?.name}`,
        key: tokenID,
        tokenName: token?.name,
      };
    });
  },
);