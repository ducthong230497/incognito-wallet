import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector } from 'react-redux';
import { availableTokensSelector } from '@src/redux/selectors/shared';
import { useSearchBox } from '@src/components/Header';
import { handleFilterTokenByKeySearch } from '@src/components/Token';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { useTokenList } from './Token.useEffect';

const enhance = (WrappedComp) => (props) => {
  const { filterField, orderField } = props;
  const availableTokens =
    props?.availableTokens || useSelector(availableTokensSelector);
  let verifiedTokens = [];
  let unVerifiedTokens = [];
  availableTokens.map((token) =>
    token?.isVerified
      ? verifiedTokens.push(token)
      : unVerifiedTokens.push(token),
  );
  const [toggleUnVerified, onToggleUnVerifiedTokens] = useTokenList();
  const [_verifiedTokens, keySearch, handleFilterData] = useSearchBox({
    data: verifiedTokens,
    shouldCleanSearch: false,
    handleFilter: () =>
      handleFilterTokenByKeySearch({ tokens: verifiedTokens, keySearch }),
  });
  const [_unVerifiedTokens, _keySearch, _handleFilterData] = useSearchBox({
    data: unVerifiedTokens,
    shouldCleanSearch: false,
    handleFilter: () =>
      handleFilterTokenByKeySearch({
        tokens: unVerifiedTokens,
        keySearch: _keySearch,
      }),
  });

  React.useEffect(() => {
    const __verifiedTokens = handleFilterTokenByKeySearch({
      tokens: verifiedTokens,
      keySearch,
    });
    handleFilterData(__verifiedTokens);
    if (toggleUnVerified) {
      const __unVerifiedTokens = handleFilterTokenByKeySearch({
        tokens: unVerifiedTokens,
        keySearch: _keySearch,
      });
      _handleFilterData(__unVerifiedTokens);
    }
  }, [availableTokens]);

  const tokensFactories = React.useMemo(() => {
    let marketTokens = _verifiedTokens.concat(_unVerifiedTokens.filter(item => item.isFollowed));
    marketTokens = orderBy(marketTokens, [filterField, 'isVerified', 'isFollowed'], [orderField, 'desc', 'desc']);
    const __verifiedTokens = orderBy(_verifiedTokens, [filterField], [orderField]);
    const __unVerifiedTokens = orderBy(_unVerifiedTokens, [filterField], [orderField]);
    return [
      {
        data: __verifiedTokens,
        visible: true,
        styledListToken: { paddingTop: 0 },
      },
      {
        data: __unVerifiedTokens,
        visible: toggleUnVerified,
        styledListToken: { paddingTop: 15 },
      },
      {
        data: marketTokens,
        visible: true,
        styledListToken: { paddingTop: 15 },
      }
    ];
  }, [_unVerifiedTokens, _verifiedTokens, toggleUnVerified]);

  React.useEffect(() => {
    if (toggleUnVerified && !keySearch) {
      onToggleUnVerifiedTokens();
    }
  }, [keySearch]);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          tokensFactories,
          toggleUnVerified,
          onToggleUnVerifiedTokens,
          keySearch
        }}
      />
    </ErrorBoundary>
  );
};
enhance.defaultProps = {
  filterField: 'change',
  orderField: 'desc'
};
enhance.propTypes = {
  availableTokens: PropTypes.array.isRequired,
  filterField: PropTypes.string,
  orderField: PropTypes.string
};

export default enhance;
