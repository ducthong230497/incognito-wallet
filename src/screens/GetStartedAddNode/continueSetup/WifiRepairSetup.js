import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  ActivityIndicator,
  Button,
  InputExtension as Input,
  Text,
  TouchableOpacity
} from '@src/components/core';
import knownCode from '@src/services/exception/customError/code/knownCode';
import NodeService from '@src/services/NodeService';
import WifiManager from 'react-native-wifi-reborn';
import APIService from '@services/api/miner/APIService';
import Util from '@utils/Util';
import { CustomError } from '@services/exception';
import LocalDatabase from '@utils/LocalDatabase';
import { DEVICES } from '@src/constants/miner';
import clipboard from '@services/clipboard';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import LogManager from '@src/services/LogManager';
import ModalConnectWifi from '@src/components/Modal/ModalConnection/ModalConnectWifi';
import { ScreenHeight, ScreenWidth } from '@src/utils/devices';
import { LineView } from '@src/components/Line';
import styles from './styles';

export const TAG = 'SetupWifi';

class WifiRepairSetup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ssid: '',
      lastVerifyCode: '',
      verifyCode: '',
      isCorrectWifi: false,
      password: '',
      date: new Date(),
      error: '',
      steps: [],
      connectWifi: {
        shouldShowModalConnectWifi: false,
        isCheckingWifiConnection: false,
        isConnected: false,
        title: 'We are trying to connect to your network',
      },
    };
    this.isMounteds = false;
    this.scrollView = React.createRef();
    this.funcQueue = [];
  }

  tryAtMost = async (promiseFunc, count = 6, delayToTry = 1) => {
    if (count > 0 && promiseFunc && this.isMounteds === true) {
      const result = await promiseFunc().catch(e => e);
      console.log(`tryAtMost result = ${result}, count = ${count}---isEROR = ${result instanceof Error}`);
      if (result instanceof Error) {
        if (_.isNumber(delayToTry)) {
          await Util.delay(delayToTry);
        }
        return await this.tryAtMost(promiseFunc, count - 1, delayToTry);
      }
      return result;
    }
    return Promise.reject(`Tried ${count} times and failed`);
  };

  componentDidMount() {
    this.isMounteds = true;
    this.getCurrentWifi();
    this.getLastVerifyCode();
  }
  // Get current wifi
  async getCurrentWifi() {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      console.debug('SSID', ssid);
      this.setState({ ssid });
    } catch (error) {
      this.setState({ ssid: '' });
    }
  }

  // Check last verify code if exist => Set state for current verifyCode
  async getLastVerifyCode() {
    const { verifyProductCode } = this.props;
    console.log('Verify code' + verifyProductCode);
    this.setState({ verifyCode: verifyProductCode, lastVerifyCode: verifyProductCode });
  }

  componentWillUnmount() {
    this.isMounteds = false;
    clearInterval(this._interval);
    clearInterval(this.checkNetWorkSwitched);
  }

  addStep(step) {
    const { steps } = this.state;
    steps.push(step);
    this.setState({ steps: [...steps] });
  }

  renderContent = () => {
    const { ssid, error, password } = this.state;
    const { text, item, item_container_input, errorText } = styles;

    return (
      <View>
        <Input
          underlineColorAndroid="transparent"
          containerStyle={item}
          inputContainerStyle={item_container_input}
          inputStyle={[text]}
          placeholder="Wi-Fi name"
          errorStyle={[errorText, { textAlign: 'left', marginLeft: 0 }]}
          errorMessage={!_.isEmpty(this.ssid) ? 'Required' : ''}
          value={ssid}
          onChangeText={ssid => this.setState({ ssid })}
        />
        <Input
          underlineColorAndroid="transparent"
          containerStyle={item}
          autoCapitalize="none"
          inputContainerStyle={item_container_input}
          inputStyle={[text]}
          placeholder="Password"
          errorStyle={[errorText, { textAlign: 'left', marginLeft: 0 }]}
          errorMessage={error}
          value={password}
          onChangeText={password => this.setState({ password })}
        />
      </View>
    );
  };

  tryVerifyCode = async (count = 12, isLast = false) => {
    this.funcQueue.push('tryVerifyCode');
    const { verifyProductCode } = this.props;
    if (!verifyProductCode || verifyProductCode === '') {
      this.setState({ loading: false });
      throw new Error('Verify code failed');
    }
    console.log('### INCOGNITO ###: tryVerifyCode ' + verifyProductCode);
    this.addStep({ name: 'Trying last product code ...', detail: verifyProductCode, isSuccess: true });
    const result = await this.tryAtMost(() => {
      return NodeService.verifyProductCode(verifyProductCode)
        .then(res => {
          if (!res) {
            this.addStep({ name: 'Verify code failed', isSuccess: false });
            throw new Error('empty result');
          }

          return res;
        })
        .catch(error => {
          throw error;
        });
    }, count, 5);

    if (result && result?.status != 0) {
      this.addStep({ name: 'Verify code success', detail: JSON.stringify(result), isSuccess: true });
    } else {
      this.setState({ loading: false });
      this.addStep({ name: 'Verify code failed', isSuccess: false });
      throw new Error('Verify code failed');
    }
    return result;
  };

  authFirebase = async (productInfo) => {
    let account = await LocalDatabase.getAccountWithQRCode();
    try {
      account = JSON.parse(account);
      let qrCode = account?.name || '';
      const funcName = `${qrCode}-authFirebase`;
      await APIService.trackLog({ action: funcName, message: 'Bat dau Auth Firebase', rawData: `productInfo = ${JSON.stringify(productInfo)}` });
      const authFirebase = await this.tryAtMost(async () => {
        const resultFbUID = await NodeService.authFirebase(productInfo)
          .catch(error => this.addStep({ name: 'Authenticate firebase error ', detail: error?.message, isSuccess: false }));
        if (!resultFbUID) {
          this.setState({ loading: false });
          this.addStep({ name: 'Authenticate firebase failed', detail: resultFbUID, isSuccess: false });
          throw new CustomError(knownCode.node_auth_firebase_fail);
        } else {
          this.addStep({ name: 'Authenticate firebase success', detail: resultFbUID, isSuccess: true });
        }
        return _.isEmpty(resultFbUID) ? new CustomError(knownCode.node_auth_firebase_fail) : resultFbUID;
      }, 3, 3);
      await APIService.trackLog({ action: funcName, message: authFirebase ? 'Auth Firebase=> SUCCESS' : 'Auth Firebase=> FAIL' });
      return authFirebase;
    } catch (err) {
      this.setState({ loading: false });
      this.addStep({ name: 'Authenticate firebase failed', detail: '', isSuccess: false });
      throw err;
    }
  };

  updateDeviceNameRequest = async (product_id, name) => {
    let params = {
      product_id: product_id,
      product_name: name
    };
    try {
      const response = await APIService.updateProduct(params);

      const { status, data } = response;
      if (status === 1) {
        console.log(TAG, 'Change name = ', response);
        params = { ...params, ...data };
      }
      return params;
    } catch (error) {
      console.log(TAG, 'updateDeviceNameRequest error');
    }
    return null;
  };

  handleSetupAccount = async (productInfo) => {
    this.funcQueue.push('handleSetupAccount');
    let account = await LocalDatabase.getAccountWithQRCode();
    try {
      account = JSON.parse(account);
    } catch (err) {
      this.setState({ loading: false });
      this.addStep({ name: 'Send stake request failed', detail: err?.message || err, isSuccess: false });
      throw err;
    }
    let qrCode = account?.name || '';
    const { onNext } = this.props;
    const funcName = `${qrCode}-changeDeviceName`;
    try {
      this.addStep({ name: 'Setup account for node ', detail: account?.PaymentAddress || '', isSuccess: true });
      this.updateDeviceNameRequest(productInfo.product_id, qrCode);
      let fetchProductInfo = {
        ...productInfo,
        product_name: qrCode,
        product_type: DEVICES.MINER_TYPE,
        minerInfo: {
          isCallStaked: false,
          qrCodeDeviceId: qrCode,
        },
      };
      const { product_id } = fetchProductInfo;
      let PaymentAddress = account?.PaymentAddress || '';
      let ValidatorKey = account?.ValidatorKey || '';
      this.addStep({ name: 'Send stake request', isSuccess: true });
      await Util.excuteWithTimeout(APIService.requestStake({
        ProductID: product_id,
        ValidatorKey: ValidatorKey,
        qrCodeDeviceId: qrCode,
        PaymentAddress: PaymentAddress
      }), 60)
        .then(async response => {
          this.setState({ loading: true });
          this.addStep({ name: 'Send stake request success', detail: response, isSuccess: true });
          await APIService.trackLog({ action: funcName, message: `Result: requestStake ==> ${response ? 'SUCCESS' : 'FAIL'}` });
          const dataRequestStake = response?.data || {};
          if (!_.isEmpty(dataRequestStake) && !_.isEmpty(dataRequestStake.PaymentAddress)) {
            fetchProductInfo.minerInfo = {
              ...fetchProductInfo.minerInfo,
              ...dataRequestStake
            };
          }
          await LocalDatabase.updateDevice(fetchProductInfo);
          await LocalDatabase.saveVerifyCode('');
          onNext();
        })
        .catch(async error => {
          console.log('==============' + LogManager.parseJsonObjectToJsonString(error));
          let messageErr = error?.message || '';
          if (typeof messageErr === 'string' && messageErr?.includes('already staked')) {
            await LocalDatabase.saveVerifyCode('');
            onNext();
            return;
          }
          this.setState({ loading: false });
          this.addStep({ name: 'Send stake request failed', detail: '', isSuccess: false });
          throw error;
        });

    } catch (error) {
      await APIService.trackLog({ action: funcName, message: `Result: connected Node ==> ERROR- message ${error.message}` });
      throw error;
    }
    await APIService.trackLog({ action: funcName, message: 'Result: connected Node ==> SUCCESS' });
    return true;
  };


  // Start to authen with firebase for verifying code
  verifyCodeFirebase = async (count, isLast) => {
    this.setState({ loading: true });
    this.funcQueue.push('verifyCodeFirebase');
    const { qrCode } = this.state;
    const productInfo = {
      ...await this.tryVerifyCode(count, isLast),
      product_name: qrCode,
    };

    await this.authFirebase(productInfo);
    await this.handleSetupAccount(productInfo);
  }

  // On press button next
  handleNext = async () => {
    this.funcQueue.push('handleNext');
    const { navigation } = this.props;
    // Check if verifyCode exist, check 1 time
    this.verifyCodeFirebase(12, false);
  };

  copyLogs = () => {
    const { steps } = this.state;
    clipboard.set(JSON.stringify(steps), { copiedMessage: 'Logs copied.' });
  };

  // Check by func name 
  retryFuncByName = (name) => {
    console.log('### INCOGNITO_LOG ### Current step being invoked: ' + name);
    switch (name) {
    case 'getLastVerifyCode':
      this.getLastVerifyCode();
      break;
    case 'checkWifiInfo':
      this.handleNext();
      break;
    case 'setupAndConnectWifiForNode':
      this.setupAndConnectWifiForNode();
      break;
    case 'connectToWifiHotspot':
      this.handleSetupNode();
      break;
    case 'verifyCodeFirebase':
      this.verifyCodeFirebase();
      break;
    case 'handleSetupAccount':
      this.handleSetupAccount();
      break;
    case 'handleSetupNode':
      this.handleSetupNode();
      break;
    case 'tryVerifyCode':
      this.verifyCodeFirebase();
      break;
    case 'setupWifiZMQ':
      this.setupAndConnectWifiForNode();
      break;
    case 'updateValidatorKey':
      this.setupAndConnectWifiForNode();
      break;
    case 'checkVersionCodeInZMQ':
      this.checkVersionCodeInZMQ();
      break;
    case 'handleNext':
      this.handleNext();
      break;
    default:
      break;
    }
  }
  renderFooter = () => {
    const { steps, loading } = this.state;
    return (
      <View style={styles.footer}>
        <Button
          disabled={loading}
          loading={loading}
          onPress={() => {
            console.log('### INCOGNITO ### funcQueue: ' + LogManager.parseJsonObjectToJsonString(this.funcQueue));
            if (this.funcQueue.length > 1) {
              this.retryFuncByName(this.funcQueue.pop());
            } else {
              this.handleNext();
            }
          }}
          title={steps.length > 0 ? 'Retry' : 'Next'}
        />
      </View>
    );
  };

  renderStep(step, isLastStep) {
    const { loading } = this.state;
    return (
      <View style={styles.log}>
        {isLastStep && loading ? <ActivityIndicator style={styles.logIcon} size="small" /> : (
          <Icon
            containerStyle={styles.logIcon}
            color={step?.isSuccess ? COLORS.primary : COLORS.red}
            size={14}
            name="checkbox-blank-circle"
            type="material-community"
          />
        )}
        <Text style={[!isLastStep ? styles.disabledText : null, { width: ScreenWidth * 0.7 }]}>{step.name}</Text>
      </View>
    );
  }

  renderLogs() {
    const { steps } = this.state;
    return (
      <View>
        <LineView color={COLORS.lightGrey10} />
        <ScrollView
          style={[{ height: ScreenHeight * 0.35 }]}
          ref={ref => this.scrollView = ref}
          onContentSizeChange={() => {
            if (this.scrollView) {
              this.scrollView.scrollToEnd({ animated: true });
            }
          }}
          onPress={this.copyLogs}
        >
          <TouchableOpacity onPress={this.copyLogs}>
            {steps.map((step, index) => this.renderStep(step, index === steps.length - 1))}
          </TouchableOpacity>
        </ScrollView>
        <LineView color={COLORS.lightGrey10} />
      </View>
    );
  }

  getErrorMessage = () => {
    const { errorInSetUp } = this.state;
    const message = errorInSetUp?.message || '';
    const code = errorInSetUp?.code ?? 0;
    return !_.isEmpty(errorInSetUp) ? `[${code}]${message}` : '';
  };

  render() {
    const { steps, connectWifi } = this.state;
    const rootCauseMessage = this.getErrorMessage();

    return (
      <View>
        <ScrollView>
          <Text style={styles.title2}>Enter your home WiFi detail</Text>
          {steps.length > 0 ? this.renderLogs() : this.renderContent()}
          <Text style={styles.errorText}>{rootCauseMessage}</Text>
          {this.renderFooter()}
        </ScrollView>
        <ModalConnectWifi
          isLoading={connectWifi.isCheckingWifiConnection}
          isVisible={connectWifi.shouldShowModalConnectWifi}
          isSuccess={connectWifi.isConnected}
          title={connectWifi.title}
          titleConfirm='OK'
          titleRetry='Retry'
        />
      </View>
    );
  }
}

WifiRepairSetup.propTypes = {
  qrCode: PropTypes.string.isRequired,
  hotspotSSID: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

WifiRepairSetup.defaultProps = {};

export default WifiRepairSetup;