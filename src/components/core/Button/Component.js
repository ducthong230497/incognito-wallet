import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity as RNComponent } from 'react-native';
import { Text } from '@core';
import styleSheet from './style';

const Button = ({ title, children, style, ...props }) => (
  <RNComponent {...props} style={[styleSheet.button, style]} activeOpacity={0.9}>
    {
      children || <Text style={styleSheet.text}>{title}</Text>
    }
  </RNComponent>
);

Button.propTypes = {
  style: PropTypes.object,
  title: PropTypes.string,
  children: PropTypes.oneOfType(PropTypes.node, PropTypes.arrayOf(PropTypes.node))
};

export default Button;