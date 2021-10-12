import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Tabs, FlatList, ActivityIndicator } from '@src/components/core';
import { OrderBook } from '@screens/PDexV3/features/Chart/Chart.orderBook';
import { openOrdersSelector } from './OrderLimit.selector';
import Order from './OrderLimit.order';
import {
  TAB_OPEN_ORDER,
  TAB_ORDER_BOOK,
  ROOT_TAB_SUB_INFO,
} from './OrderLimit.constant';

const styled = StyleSheet.create({
  container: {},
  wrapper: {
    paddingTop: 24,
  },
});

const TabOpenOrder = React.memo(() => {
  const { history = [], isFetching } = useSelector(openOrdersSelector);
  return (
    <View style={styled.wrapper}>
      {isFetching && <ActivityIndicator style={{ marginBottom: 16 }} />}
      <FlatList
        data={history}
        keyExtractor={(item) => item?.requestTx}
        renderItem={({ item, index }) => (
          <Order data={item} visibleDivider={index !== history.length - 1} />
        )}
      />
    </View>
  );
});

const TabOrderBook = React.memo(() => {
  return (
    <View style={styled.wrapper}>
      <OrderBook />
    </View>
  );
});

const GroupSubInfo = () => {
  return (
    <View style={styled.container}>
      <Tabs
        rootTabID={ROOT_TAB_SUB_INFO}
        styledTabs={styled.styledTabs}
        useTab1
      >
        <View
          tabID={TAB_ORDER_BOOK}
          label="Order book"
          onChangeTab={() => null}
        >
          <TabOrderBook />
        </View>
        <View
          tabID={TAB_OPEN_ORDER}
          label="Open order"
          onChangeTab={() => null}
        >
          <TabOpenOrder />
        </View>
      </Tabs>
    </View>
  );
};

GroupSubInfo.propTypes = {};

export default React.memo(GroupSubInfo);