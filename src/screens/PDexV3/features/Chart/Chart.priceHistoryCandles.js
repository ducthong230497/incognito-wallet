import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';
import { ButtonBasic } from '@src/components/Button';
import { Row } from '@src/components';
import { COLORS, FONT } from '@src/styles';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { ExHandler } from '@src/services/exception';
import convert from '@src/utils/convert';
import { actionGetPDexV3Inst } from '@screens/PDexV3';
import { ScreenWidth } from '@src/utils/devices';
import { ActivityIndicator } from '@src/components/core';
import { poolSelectedSelector } from './Chart.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  btnStyle: {
    minWidth: 40,
    height: 24,
    backgroundColor: COLORS.lightGrey19,
  },
  titleStyle: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 5,
    color: COLORS.black,
  },
});

const periods = ['15m', '1h', '4h', '1d', 'W', 'M', 'Y'];

export const Period = React.memo(({ handleFetchData }) => {
  const [actived, setActived] = React.useState(periods[0]);
  return (
    <Row
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
      }}
    >
      {periods?.map((period) => (
        <ButtonBasic
          btnStyle={styled.btnStyle}
          titleStyle={{
            ...styled.titleStyle,
            ...(period === actived ? { color: COLORS.colorTradeBlue } : {}),
          }}
          title={period}
          key={period}
          onPress={async () => {
            if (actived === period) {
              return;
            }
            setActived(period);
            handleFetchData(period);
          }}
        />
      ))}
    </Row>
  );
});

const PriceHistoryCandles = (props) => {
  const [initted, setInitted] = React.useState(false);
  const ref = React.useRef({});
  const pool = useSelector(poolSelectedSelector);
  const dispatch = useDispatch();
  const token2: SelectedPrivacy = pool?.token2;
  const handlePostMessage = (message) => {
    if (ref?.current) {
      setTimeout(() => {
        ref.current.postMessage(message);
      }, 200);
    }
  };
  const handleOnLoad = () => {
    if (ref?.current) {
      let width = Number(ScreenWidth) - 50;
      handlePostMessage(
        `chartConfigs|${JSON.stringify({
          lwChartConfigs: {
            width,
            height: 250,
          },
          lwChartOptions: {
            timeScale: {
              timeVisible: true,
            },
          },
          candlesStickConfigs: {
            upColor: '#53B987',
            downColor: '#EC4D5C',
          },
          candlesStickOptions: {
            priceFormat: {
              precision: token2?.pDecimals,
              minMove: convert.toHumanAmount(1, token2?.pDecimals),
            },
          },
        })}`,
      );
    }
  };
  const handleFetchData = async (actived) => {
    try {
      const pdexV3Inst = await dispatch(actionGetPDexV3Inst());
      let intervals = '';
      let period = '';
      switch (actived) {
      case '15m':
        period = 'PT15M';
        intervals = 'P1D';
        break;
      case '1h':
        period = 'PT1H';
        intervals = 'P3D';
        break;
      case '4h':
        period = 'PT4H';
        intervals = 'P7D';
        break;
      case '1d':
        period = 'P1D';
        intervals = 'P60D';
        break;
      case 'W':
        period = 'P1W';
        intervals = 'P12M';
        break;
      case 'M':
        period = 'P1M';
        intervals = 'P12M';
        break;
      case 'Y':
        period = 'P1M';
        intervals = 'P12M';
        break;
      default:
        break;
      }
      const { poolId: poolid } = pool;
      const res =
        (await pdexV3Inst.getPriceHistory({
          poolid,
          period,
          intervals,
        })) || [];
      const candles = res.map((c) => ({ ...c, time: c?.timestamp }));
      if (candles) {
        handlePostMessage(`candles|${JSON.stringify(candles)}`);
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleOnMessage = (e) => {
    const data = e.nativeEvent.data;
    const parseData = JSON.parse(data);
    if (parseData?.initted) {
      setInitted(true);
      handleFetchData(periods[0]);
    }
  };
  return (
    <View style={styled.container}>
      {!initted && <ActivityIndicator />}
      <WebView
        ref={ref}
        style={{
          width: '100%',
          height: 250,
        }}
        source={{ uri: 'https://chart-webview.incognito.org' }}
        onLoadEnd={handleOnLoad}
        onMessage={handleOnMessage}
      />
      <Period {...{ handleFetchData }} />
    </View>
  );
};

PriceHistoryCandles.propTypes = {};

export default React.memo(PriceHistoryCandles);
