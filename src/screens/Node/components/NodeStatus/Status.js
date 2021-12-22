import { Text, View, TouchableOpacity } from '@components/core';
import { FONT } from '@src/styles';
import PropTypes from 'prop-types';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '@src/styles/theme';
import { ActivityIndicator } from 'react-native';
import { colorsSelector } from '@src/theme';
import { useSelector } from 'react-redux';
import styles from '../style';

const Status = ({ isLoading, isExpanded, onToggle, value, color }) => {
  const colors = useSelector(colorsSelector);
  return (
    <View style={[styles.balanceContainer, theme.MARGIN.marginBottomDefault, { flexDirection: 'row', justifyContent: 'space-between' }]}>
      <Text style={{...FONT.TEXT.incognitoH5}}>Status</Text>
      {
        isLoading
          ? <ActivityIndicator />
          : (
            <TouchableOpacity
              style={[{ flexDirection: 'row' }, styles.balanceContainer]}
              onPress={onToggle}
            >
              <View style={{width: 10, height: 10, marginEnd: 5, borderRadius: 6, backgroundColor: color || 'white'}} />
              <Text style={[theme.text.boldTextStyleMedium, theme.MARGIN.marginRightDefault]}>{value || ''}</Text>
              <Ionicons name={isExpanded ? 'ios-arrow-up' : 'ios-arrow-down'} size={25} color={colors.arrowRightIcon} />
            </TouchableOpacity>
          )
      }
    </View>
  );
};

Status.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  isLoading: PropTypes.bool
};

Status.defaultProps = {
  isLoading: false
};

export default React.memo(Status);

