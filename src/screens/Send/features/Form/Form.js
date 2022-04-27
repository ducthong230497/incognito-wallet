import React, { useState } from 'react';
import {
  KeyboardAwareScrollView,
  View,
  Text,
  Button,
} from '@src/components/core';
import { change, Field } from 'redux-form';
import {
  createForm,
  InputQRField,
  InputField,
  InputMaxValueField,
  SelectOptionField,
  SelectNetworkField,
} from '@components/core/reduxForm';
import { SEND } from '@src/constants/elements';
import { generateTestId } from '@src/utils/misc';
import EstimateFee from '@components/EstimateFee/EstimateFee.input';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  feeDataSelector,
  networksSelector,
} from '@src/components/EstimateFee/EstimateFee.selector';
import { selectedPrivacySelector, childSelectedPrivacySelector } from '@src/redux/selectors';
import {
  setChildSelectedPrivacy,
  clearChildSelectedPrivacy,
} from '@src/redux/actions/childSelectedPrivacy';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import LoadingTx from '@src/components/LoadingTx';
import format from '@src/utils/format';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import { CONSTANT_COMMONS } from '@src/constants';
import { colorsSelector } from '@src/theme/theme.selector';
import { FONT } from '@src/styles';
import { formValueSelector } from 'redux-form';
import { styledForm as styled } from './Form.styled';
import withSendForm, { formName } from './Form.enhance';

const initialFormValues = {
  amount: '',
  toAddress: '',
  message: '',
};

const Form = createForm(formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const RightLabel = React.memo(() => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const amount = format.amount(
    selectedPrivacy?.amount,
    selectedPrivacy?.pDecimals,
    true,
  );
  return (
    <Text style={styled.amount} numberOfLines={1} ellipsizeMode="tail">
      {amount}
    </Text>
  );
});

const SendForm = (props) => {
  const {
    onChangeField,
    onPressMax,
    isFormValid,
    amount,
    toAddress,
    onShowFrequentReceivers,
    disabledForm,
    handleSend,
    validateAmount,
    validateAddress,
    isSending,
    memo,
    warningAddress,
    isIncognitoAddress,
    isExternalAddress,
    textLoadingTx,
    validateMemo,
    navigation,
    isPortalToken,
  } = props;
  const dispatch = useDispatch();
  const { titleBtnSubmit, isUnShield, editableInput } =
    useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const childSelectedPrivacy = useSelector(childSelectedPrivacySelector.childSelectedPrivacy);
  const [onCentralizedPress, isCentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_CENTRALIZED,
    handleSend,
  );
  const [onDecentralizedPress, isDecentralizedDisabled] = useFeatureConfig(
    appConstant.DISABLED.UNSHIELD_DECENTRALIZED,
    handleSend,
  );
  let placeholderAddress = 'Recipient address';

  const amountValidator = validateAmount;
  const isDisabled = 
    isUnShield &&
    ((selectedPrivacy.isCentralized && isCentralizedDisabled) ||
      (selectedPrivacy.isDecentralized && isDecentralizedDisabled));
  const handlePressSend = isUnShield
    ? selectedPrivacy.isCentralized
      ? onCentralizedPress
      : onDecentralizedPress
    : handleSend;
  const submitHandler = handlePressSend;

  const getNetworks = () => {
    let networks = useSelector(networksSelector);
    let incognitoNetwork = [
      {
        network: 'Incognito',
        networkId: 'INCOGNITO',
        currencyType: CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
        tokenId:
          '0000000000000000000000000000000000000000000000000000000000000006',
      },
    ];
    return [...incognitoNetwork, ...networks];
  };
  const networks = getNetworks();

  const selector = formValueSelector(formName);
  const currencyTypeName = useSelector((state) =>
    selector(state, 'currencyType'),
  );

  React.useEffect(() => {
    dispatch(clearChildSelectedPrivacy());
  }, []);

  React.useEffect(() => {
    if (isIncognitoAddress && !currencyTypeName) {
      onChangeField(
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
        'currencyType',
      );
      let childSelectedPrivacy = networks.find(
        (item) =>
          item.currencyType ===
          CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.INCOGNITO,
      );
      if (selectedPrivacy?.isMainCrypto) {
        childSelectedPrivacy = new SelectedPrivacy(
          account,
          null,
          childSelectedPrivacy,
          selectedPrivacy.tokenId,
        );
      }
      dispatch(setChildSelectedPrivacy(childSelectedPrivacy));
    }
  }, [isIncognitoAddress]);

  const account = useSelector(defaultAccountSelector);
  const colors = useSelector(colorsSelector);

  const renderMemo = () => {
    if (isUnShield) {
      if (selectedPrivacy?.isBep2Token || selectedPrivacy?.currencyType === 4) {
        return (
          <>
            <Field
              component={InputQRField}
              name="memo"
              label="Memo"
              placeholder="Add a note (optional)"
              maxLength={125}
              validate={validateMemo}
              componentProps={{
                editable: editableInput,
                inputStyle: {
                  color: colors.text1,
                },
              }}
              autoFocus
            />
            <Text style={styled.warningText}>
              For withdrawals to wallets on exchanges (e.g. Binance, etc.),
              enter your memo to avoid loss of funds.
            </Text>
          </>
        );
      }
      return null;
    }
    return (
      <Field
        component={InputField}
        name="message"
        placeholder="Add a note (optional)"
        label="Memo"
        maxLength={500}
        componentProps={{
          editable: editableInput,
          inputStyle: {
            color: colors.text1,
          },
        }}
        {...generateTestId(SEND.MEMO_INPUT)}
      />
    );
  };

  const renderNetworkType = () => {
      return (
        <Field
          onChange={(value) => {
            onChangeField(value, 'currencyType');
            let childSelectedPrivacy = networks.find(
              (item) => item.currencyType === value,
            );
            if(selectedPrivacy?.isMainCrypto) {
              childSelectedPrivacy = new SelectedPrivacy(
                account,
                null,
                childSelectedPrivacy,
                selectedPrivacy.tokenId,
              );
            }
            dispatch(setChildSelectedPrivacy(childSelectedPrivacy));
          }}
          component={SelectNetworkField}
          networks={networks}
          selectedNetwork={childSelectedPrivacy}
          name="currencyType"
          style={styled.selectNetwork}
        />
      );
  };

  React.useEffect(() => {
    const { toAddress, amount } = navigation.state?.params || {};
    if (toAddress) {
      onChangeField(toAddress, 'toAddress');
    }
    if (amount) {
      onChangeField(amount, 'amount');
    }
    // dispatch(change(formName, 'toAddress', 'zil142ynwum8egkt8snjhgjgmmf96l530vzam8r8a7'));
    // dispatch(change(formName, 'amount', '0.01'));
  }, [navigation.state?.params]);

  return (
    <View style={styled.container} borderTop>
      <KeyboardAwareScrollView>
        <Form>
          {({ handleSubmit }) => (
            <>
              <Field
                onChange={(value) => onChangeField(value, 'amount')}
                component={InputMaxValueField}
                name="amount"
                placeholder="0.0"
                label="Amount"
                rightLabel={<RightLabel />}
                componentProps={{
                  keyboardType: 'decimal-pad',
                  onPressMax,
                  style: {
                    marginTop: 22,
                  },
                  editable: editableInput,
                  inputStyle: {
                    color: colors.text1,
                  },
                }}
                validate={amountValidator}
                {...generateTestId(SEND.AMOUNT_INPUT)}
              />
              <Field
                onChange={(value) => onChangeField(value, 'toAddress')}
                component={InputQRField}
                name="toAddress"
                label="To"
                placeholder={placeholderAddress}
                validate={validateAddress}
                warning={warningAddress}
                showNavAddrBook
                onOpenAddressBook={onShowFrequentReceivers}
                shouldStandardized
                componentProps={{
                  editable: editableInput,
                  inputStyle: {
                    color: colors.text1,
                  },
                }}
                {...generateTestId(SEND.ADDRESS_INPUT)}
              />
              {renderNetworkType()}
              <EstimateFee
                {...{
                  amount,
                  address: toAddress,
                  isFormValid,
                  memo,
                  isIncognitoAddress,
                  isExternalAddress,
                  isPortalToken,
                  childSelectedPrivacy,
                }}
              />
              {renderMemo()}
              <Button
                title={titleBtnSubmit}
                btnStyle={[
                  styled.submitBtn,
                  isUnShield ? styled.submitBtnUnShield : null,
                ]}
                style={{ marginTop: 24 }}
                disabled={disabledForm || isDisabled || !childSelectedPrivacy}
                onPress={handleSubmit(submitHandler)}
                {...generateTestId(SEND.SUBMIT_BUTTON)}
              />
            </>
          )}
        </Form>
      </KeyboardAwareScrollView>
      {isSending && <LoadingTx text={textLoadingTx} />}
    </View>
  );
};

SendForm.defaultProps = {
  memo: '',
};

SendForm.propTypes = {
  onChangeField: PropTypes.func.isRequired,
  onPressMax: PropTypes.func.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  amount: PropTypes.string.isRequired,
  toAddress: PropTypes.string.isRequired,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  disabledForm: PropTypes.bool.isRequired,
  handleSend: PropTypes.func.isRequired,
  validateAmount: PropTypes.any.isRequired,
  validateAddress: PropTypes.any.isRequired,
  isERC20: PropTypes.bool.isRequired,
  isSending: PropTypes.bool.isRequired,
  memo: PropTypes.string,
  warningAddress: PropTypes.string.isRequired,
  isIncognitoAddress: PropTypes.bool.isRequired,
  isExternalAddress: PropTypes.bool.isRequired,
  textLoadingTx: PropTypes.string.isRequired,
  validateMemo: PropTypes.any.isRequired,
  navigation: PropTypes.object.isRequired,
  isUnshieldPegPRV: PropTypes.bool.isRequired,
  isUnshieldPUnifiedToken: PropTypes.bool.isRequired,
};

export default withSendForm(SendForm);
