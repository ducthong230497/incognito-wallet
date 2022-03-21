import Erc20Token from '@src/models/erc20Token';
import PToken from '@src/models/pToken';
import BEP2Token from '@models/bep2Token';
import Bep20Token from '@models/bep20Token';
import IncognitoCoinInfo from '@src/models/incognitoCoinInfo';
import http from '@src/services/http';
import { CONSTANT_CONFIGS } from '@src/constants';
import axios from 'axios';
import { cachePromise, EXPIRED_TIME, KEYS } from '@services/cache';
import http1 from '@services/http1';
import PolygonToken from '@src/models/polygonToken';
import FantomToken from '@src/models/fantomToken';

let BEP2Tokens = [];

const getTokenListNoCache = () => {
  return http1
    .get('coins/tokenlist')
    .then((res) => res.map((token) => new PToken(token, res)));
};

export const getTokensInfo = (tokenIDs = []) => {
  return http1
    .post('coins/tokeninfo', { TokenIDs: tokenIDs })
    .then((res) => res?.map((token) => new PToken(token, res)))
    .catch((error) => {
      console.log('error', error);
      return [];
    });
};

export const getTokenList = ({ expiredTime = EXPIRED_TIME } = {}) => {
  return cachePromise(KEYS.P_TOKEN, getTokenListNoCache, expiredTime);
};

export const detectERC20Token = (erc20Address) => {
  if (!erc20Address) throw new Error('Missing erc20Address to detect');
  return http
    .post('eta/detect-erc20', {
      Address: erc20Address,
    })
    .then((res) => new Erc20Token(res));
};

export const detectPolygonToken = (polygonAddress) => {
  if (!polygonAddress) throw new Error('Missing polygonAddress to detect');
  return http
    .post('plg/detect-erc20', {
      Address: polygonAddress,
    })
    .then((res) => new PolygonToken(res))
    .catch((err) => {
      console.log(err);
    });
};

export const addPolygonToken = ({ symbol, name, contractId, decimals }) => {
  const parseDecimals = Number(decimals);

  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!contractId) throw new Error('Missing contractId');
  if (!Number.isInteger(parseDecimals)) throw new Error('Invalid decimals');
  return http
    .post('plg/erc20/add', {
      ContractID: contractId,
    })
    .then((res) => new PToken(res));
};

export const detectFantomToken = (fantomAddress) => {
  if (!fantomAddress) throw new Error('Missing fantomAddress to detect');
  return http
    .post('ftm/detect-erc20', {
      Address: fantomAddress,
    })
    .then((res) => new FantomToken(res))
    .catch((err) => {
      console.log(err);
    });
};

export const addFantomToken = ({ symbol, name, contractId, decimals }) => {
  const parseDecimals = Number(decimals);

  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!contractId) throw new Error('Missing contractId');
  if (!Number.isInteger(parseDecimals)) throw new Error('Invalid decimals');
  return http
    .post('ftm/erc20/add', {
      ContractID: contractId,
    })
    .then((res) => new PToken(res));
};

export const detectTokenInNetwork = ({ address, network }) => {
  if (!address) throw new Error(`Missing ${network} address to detect`);
  if (!network) throw new Error('Missing network');
  switch (network) {
  case 'ERC20':
    detectERC20Token(address);
    break;
  case 'BEP2':
    detectBEP2Token(address);
    break;
  case 'BEP20':
    detectBEP20Token(address);
    break;
  case 'POLYGON':
    detectPolygonToken(address);
    break;
  case 'FANTOM':
    detectFantomToken(address);
    break;
  default:
    break;
  }
};

export const detectBEP20Token = (bep20Address) => {
  if (!bep20Address) throw new Error('Missing bep20Address to detect');
  return http
    .post('ptoken/detect-bep20', {
      Address: bep20Address,
    })
    .then((res) => new Bep20Token(res));
};

export const detectBEP2Token = async (symbol) => {
  if (!symbol) throw new Error('Missing BEP2 symbol to detect');

  if (BEP2Token.length === 0) {
    const res = await axios.get(
      `${CONSTANT_CONFIGS.DEX_BINANCE_TOKEN_URL}?limit=1000000`,
    );
    BEP2Tokens = res.data.map((item) => new BEP2Token(item));
  }

  return BEP2Tokens.find((item) => item.originalSymbol === symbol);
};

export const addERC20Token = ({ symbol, name, contractId, decimals }) => {
  const parseDecimals = Number(decimals);

  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!contractId) throw new Error('Missing contractId');
  if (!Number.isInteger(parseDecimals)) throw new Error('Invalid decimals');

  return http
    .post('ptoken/add', {
      Symbol: symbol,
      Name: name,
      ContractID: contractId,
      Decimals: parseDecimals,
    })
    .then((res) => new PToken(res));
};

export const addBEP20Token = ({ symbol, name, contractId, decimals }) => {
  const parseDecimals = Number(decimals);

  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!contractId) throw new Error('Missing contractId');
  if (!Number.isInteger(parseDecimals)) throw new Error('Invalid decimals');
  return http
    .post('ptoken/bep20/add', {
      ContractID: contractId,
    })
    .then((res) => new PToken(res));
};

export const addManuallyToken = ({
  symbol,
  name,
  contractId,
  decimals,
  network,
}) => {
  switch (network) {
  case 'ERC20':
    addERC20Token({ symbol, name, contractId, decimals });
    break;
  case 'BEP2':
    addBEP2Token({ symbol, name, contractId, decimals });
    break;
  case 'BEP20':
    addBEP20Token({ symbol, name, contractId, decimals });
    break;
  case 'POLYGON':
    addPolygonToken({ symbol, name, contractId, decimals });
    break;
  case 'FANTOM':
    addFantomToken({ symbol, name, contractId, decimals });
    break;
  default:
    break;
  }
};

export const addBEP2Token = ({ symbol, name, originalSymbol }) => {
  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!originalSymbol) throw new Error('Missing originalSymbol');

  return http
    .post('ptoken/bep2/add', {
      Symbol: symbol,
      Name: name,
      OriginalSymbol: originalSymbol,
    })
    .then((res) => new PToken(res));
};

export const addTokenInfo = ({
  amount,
  tokenId,
  symbol,
  name,
  logoFile,
  description = '',
  showOwnerAddress = false,
  ownerAddress,
  ownerName,
  ownerEmail,
  ownerWebsite,
  txId,
}) => {
  if (!symbol) throw new Error('Missing symbol');
  if (!name) throw new Error('Missing name');
  if (!tokenId) throw new Error('Missing tokenId');

  const form = new FormData();
  form.append('File', logoFile || null);

  form.append('TokenID', tokenId);
  form.append('Name', name ?? '');
  form.append('Description', description ?? '');
  form.append('Symbol', symbol ?? '');
  form.append('IsPrivacy', 'true');
  form.append('OwnerName', ownerName ?? '');
  form.append('OwnerEmail', ownerEmail ?? '');
  form.append('OwnerWebsite', ownerWebsite ?? '');
  form.append('ShowOwnerAddress', Number(showOwnerAddress) || 0);
  form.append('TxID', txId ?? '');
  form.append('Amount', amount ?? '');
  ownerAddress && form.append('OwnerAddress', ownerAddress ?? '');

  return http
    .post('storage/upload/token-info', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => new IncognitoCoinInfo(res));
};

const getTokenInfoNoCache =
  ({ tokenId } = {}) =>
    () => {
      const endpoint = tokenId ? 'pcustomtoken/get' : 'pcustomtoken/list';
      return http
        .get(endpoint, tokenId ? { params: { TokenID: tokenId } } : undefined)
        .then((res) => {
          return tokenId
            ? new IncognitoCoinInfo(res)
            : res.map((token) => new IncognitoCoinInfo(token));
        });
    };

/**
 * get incognito token info from backend, if `tokenId` is not passed in then get info for all tokens
 * @param {string} tokenId
 */
export const getTokenInfo = ({ tokenId } = {}) => {
  return cachePromise(KEYS.P_CUSTOM_TOKEN, getTokenInfoNoCache({ tokenId }));
};

/**
 *
 * @param {array} tokenIds is array of token id (string)
 */
export const countFollowToken = (tokenIds, accountPublicKey) => {
  if (!tokenIds) throw new Error('Missing tokenIds');
  if (!accountPublicKey) throw new Error('Missing accountPublicKey');

  return http.post('pcustomtoken/follow/add', {
    TokenIDs: tokenIds,
    PublicKey: accountPublicKey,
  });
};

/**
 *
 * @param {string} tokenId
 */
export const countUnfollowToken = (tokenId, accountPublicKey) => {
  if (!tokenId) throw new Error('Missing tokenId');
  if (!accountPublicKey) throw new Error('Missing accountPublicKey');

  return http.post('pcustomtoken/follow/remove', {
    TokenID: tokenId,
    PublicKey: accountPublicKey,
  });
};
