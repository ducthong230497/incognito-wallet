/* eslint-disable import/no-cycle */
import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { compose } from 'recompose';
import { useSelector } from 'react-redux';
import { isValid, getFormSyncErrors } from 'redux-form';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { CONSTANT_COMMONS } from '@src/constants';
import format from '@utils/format';
import { enhanceAddressValidation } from './Form.enhanceAddressValidator';
import { enhanceInit, formName } from './Form.enhanceInit';
import { enhancePortalUnshield } from './Form.enhancePortalUnShield';
import { enhancePortalValidation } from './Form.enhancePortalValidator';
import { enhanceSwitchSend } from './Form.enhanceSwitchSend';

export const enhance = (WrappedComp) => (props) => {
  const [isSending, setIsSending] = React.useState(false);
  const { handleUnshieldPortal, onChangeField } = props;
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const navigation = useNavigation();
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const syncErrors = useSelector((state) => getFormSyncErrors(formName)(state));
  const disabledForm = Object.keys(syncErrors).length !== 0 || !isFormValid;
  const { portalData } = props;
  const { incNetworkFee } = portalData;
  const onPressMax = async () => {
    if (selectedPrivacy.amount) {
      onChangeField(format.amountFull(selectedPrivacy.amount, selectedPrivacy.pDecimals), 'amount');
    }
  };

  const onShowFrequentReceivers = async () => {
    try {
      navigation.navigate(routeNames.FrequentReceivers, {
        onSelectedItem,
        filterBySelectedPrivacy: true,
      });
    } catch (error) {
      console.debug(error);
    }
  };

  const onSelectedItem = (info) => {
    onChangeField(info?.address, 'toAddress');
    navigation.pop();
  };

  const handlePressUnshieldPortal = async (payload) => {
    try {
      if (disabledForm) {
        return;
      }
      await setIsSending(true);
      await handleUnshieldPortal(payload);
    } catch (error) {
      console.debug(error);
    }
    await setIsSending(false);
  };


  React.useEffect(() => {
    return () => {
      setIsSending(false);
    };
  }, []);

  React.useEffect(() => {
    onChangeField(format.amountFull(incNetworkFee, CONSTANT_COMMONS.DECIMALS['PRV']), 'incognitoNetworkFee');
  }, [incNetworkFee]);
  return (
    <WrappedComp
      {...{
        ...props,
        onChangeField,
        onPressMax,
        isFormValid,
        onShowFrequentReceivers,
        disabledForm,
        handlePressUnshieldPortal,
        isSending,
      }}
    />
  );
};

export default compose(
  enhanceInit,
  enhanceAddressValidation,
  enhancePortalUnshield,
  enhancePortalValidation,
  enhance,
  enhanceSwitchSend,
);