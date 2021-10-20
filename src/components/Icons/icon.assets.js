import Svg, {Path} from 'react-native-svg';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';

const SelectAssets = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M9.27002 7.20845C9.31764 7.27259 9.37939 7.32491 9.4505 7.36133C9.5216 7.39774 9.60014 7.41729 9.68002 7.41845H14.32C14.3986 7.41811 14.476 7.39885 14.5457 7.3623C14.6153 7.32575 14.6751 7.27298 14.72 7.20845L16.22 5.09845C16.3715 4.79303 16.4222 4.44738 16.3647 4.11131C16.3072 3.77525 16.1445 3.46611 15.9 3.22845C15.6526 2.9861 15.3317 2.83294 14.9877 2.79311C14.6437 2.75327 14.2962 2.82904 14 3.00845C13.9264 3.04941 13.8413 3.06476 13.758 3.05209C13.6748 3.03942 13.5981 2.99945 13.54 2.93845L13.32 2.62846C13.1616 2.43222 12.9613 2.27393 12.7337 2.16519C12.5062 2.05644 12.2572 2 12.005 2C11.7528 2 11.5038 2.05644 11.2763 2.16519C11.0487 2.27393 10.8484 2.43222 10.69 2.62846L10.46 2.93845C10.4057 3.01325 10.326 3.06569 10.2358 3.08593C10.1456 3.10618 10.0511 3.09286 9.97002 3.04845C9.67892 2.87556 9.33896 2.80342 9.00273 2.84319C8.6665 2.88296 8.35275 3.03242 8.11002 3.26845C7.85926 3.5177 7.69634 3.84173 7.64584 4.19166C7.59533 4.5416 7.65998 4.89847 7.83002 5.20845L9.27002 7.20845Z"
      fill="#5995F0"
    />
    <Path
      d="M14.91 8.53848C14.8182 8.4599 14.7009 8.41727 14.58 8.41848H9.42004C9.29915 8.41727 9.18191 8.4599 9.09004 8.53848C7.47004 9.93848 5.09004 12.5385 5.09004 15.7685C5.09004 19.2785 8.09004 21.9185 12.01 21.9185C15.93 21.9185 18.93 19.2785 18.93 15.7685C18.92 12.5385 16.53 9.93848 14.91 8.53848ZM10.75 14.4185C10.75 14.4848 10.7764 14.5484 10.8233 14.5953C10.8701 14.6421 10.9337 14.6685 11 14.6685H13C13.4642 14.6685 13.9093 14.8528 14.2375 15.181C14.5657 15.5092 14.75 15.9543 14.75 16.4185C14.75 16.8826 14.5657 17.3277 14.2375 17.6559C13.9093 17.9841 13.4642 18.1685 13 18.1685C12.9337 18.1685 12.8701 18.1948 12.8233 18.2417C12.7764 18.2886 12.75 18.3522 12.75 18.4185C12.75 18.6174 12.671 18.8081 12.5304 18.9488C12.3897 19.0894 12.1989 19.1685 12 19.1685C11.8011 19.1685 11.6104 19.0894 11.4697 18.9488C11.3291 18.8081 11.25 18.6174 11.25 18.4185C11.25 18.3522 11.2237 18.2886 11.1768 18.2417C11.1299 18.1948 11.0663 18.1685 11 18.1685H10C9.80112 18.1685 9.61036 18.0894 9.46971 17.9488C9.32905 17.8081 9.25004 17.6174 9.25004 17.4185C9.25004 17.2196 9.32905 17.0288 9.46971 16.8881C9.61036 16.7475 9.80112 16.6685 10 16.6685H13C13.0663 16.6685 13.1299 16.6421 13.1768 16.5952C13.2237 16.5484 13.25 16.4848 13.25 16.4185C13.25 16.3522 13.2237 16.2886 13.1768 16.2417C13.1299 16.1948 13.0663 16.1685 13 16.1685H11C10.5359 16.1685 10.0908 15.9841 9.7626 15.6559C9.43441 15.3277 9.25004 14.8826 9.25004 14.4185C9.25004 13.9543 9.43441 13.5092 9.7626 13.181C10.0908 12.8529 10.5359 12.6685 11 12.6685C11.0663 12.6685 11.1299 12.6421 11.1768 12.5953C11.2237 12.5484 11.25 12.4848 11.25 12.4185C11.25 12.2196 11.3291 12.0288 11.4697 11.8881C11.6104 11.7475 11.8011 11.6685 12 11.6685C12.1989 11.6685 12.3897 11.7475 12.5304 11.8881C12.671 12.0288 12.75 12.2196 12.75 12.4185C12.75 12.4848 12.7764 12.5484 12.8233 12.5953C12.8701 12.6421 12.9337 12.6685 13 12.6685H14C14.1989 12.6685 14.3897 12.7475 14.5304 12.8881C14.671 13.0288 14.75 13.2196 14.75 13.4185C14.75 13.6174 14.671 13.8082 14.5304 13.9488C14.3897 14.0895 14.1989 14.1685 14 14.1685H11C10.9337 14.1685 10.8701 14.1948 10.8233 14.2417C10.7764 14.2886 10.75 14.3522 10.75 14.4185Z"
      fill="#5995F0"
    />
    <Path
      d="M21.57 10.5485C21.4791 10.467 21.362 10.4209 21.24 10.4185H18.94C18.8503 10.4193 18.7623 10.4437 18.6851 10.4894C18.6078 10.535 18.544 10.6002 18.5 10.6785C18.4561 10.7545 18.433 10.8407 18.433 10.9285C18.433 11.0162 18.4561 11.1024 18.5 11.1785C19.3918 12.5457 19.8804 14.1364 19.91 15.7684C19.9218 17.158 19.5026 18.517 18.71 19.6584C18.6686 19.728 18.6468 19.8075 18.6468 19.8884C18.6468 19.9694 18.6686 20.0489 18.71 20.1184C18.7422 20.1931 18.7932 20.2582 18.858 20.3073C18.9229 20.3564 18.9994 20.3878 19.08 20.3984H19.54C20.1056 20.4006 20.6662 20.2919 21.19 20.0784C22.0179 19.7473 22.7278 19.1762 23.2285 18.4385C23.7293 17.7007 23.9979 16.8301 24 15.9384C23.9884 14.921 23.7665 13.917 23.3484 12.9895C22.9302 12.0619 22.3247 11.2308 21.57 10.5485Z"
      fill="#FFC726"
    />
    <Path
      d="M18 9.17849C18.0408 9.25131 18.1004 9.31193 18.1724 9.35411C18.2445 9.39629 18.3265 9.41851 18.41 9.41849H20.59C20.6735 9.41851 20.7555 9.39629 20.8275 9.35411C20.8996 9.31193 20.9591 9.25131 21 9.17849L21.67 7.9985C21.7839 7.79836 21.8378 7.56966 21.8254 7.33971C21.8129 7.10976 21.7345 6.88825 21.5995 6.70164C21.4645 6.51503 21.2788 6.37119 21.0643 6.2873C20.8498 6.2034 20.6157 6.18299 20.39 6.2285C19.8027 6.34838 19.1973 6.34838 18.61 6.2285C18.3842 6.18299 18.1502 6.2034 17.9357 6.2873C17.7212 6.37119 17.5354 6.51503 17.4005 6.70164C17.2655 6.88825 17.1871 7.10976 17.1746 7.33971C17.1621 7.56966 17.2161 7.79836 17.33 7.9985L18 9.17849Z"
      fill="#FFC726"
    />
    <Path
      d="M3.00003 9.16849C3.04602 9.24419 3.11057 9.30688 3.18757 9.35063C3.26457 9.39438 3.35147 9.41774 3.44003 9.41849H5.57003C5.65688 9.41606 5.74174 9.39191 5.81686 9.34824C5.89197 9.30457 5.95495 9.24277 6.00003 9.16849L6.66003 7.9985C6.77295 7.79916 6.82644 7.57166 6.81419 7.34288C6.80194 7.11411 6.72446 6.89362 6.5909 6.70748C6.45734 6.52134 6.27328 6.37732 6.06048 6.29244C5.84768 6.20756 5.61504 6.18537 5.39003 6.2285C4.80275 6.34838 4.19731 6.34838 3.61003 6.2285C3.38428 6.18299 3.1502 6.2034 2.93573 6.2873C2.72126 6.37119 2.53547 6.51503 2.40052 6.70164C2.26557 6.88825 2.18716 7.10976 2.17467 7.33971C2.16217 7.56966 2.2161 7.79836 2.33003 7.9985L3.00003 9.16849Z"
      fill="#FFC726"
    />
    <Path
      d="M5.49003 11.1785C5.53707 11.1036 5.56203 11.0169 5.56203 10.9285C5.56203 10.84 5.53707 10.7534 5.49003 10.6785C5.4485 10.6003 5.3866 10.5349 5.31089 10.4891C5.23519 10.4434 5.1485 10.4189 5.06003 10.4185H2.77003C2.63996 10.4197 2.51508 10.4697 2.42003 10.5585C1.66694 11.2394 1.0631 12.0691 0.646595 12.995C0.230087 13.921 0.00994011 14.9232 3.53592e-05 15.9384C-0.00355119 16.8404 0.265783 17.7223 0.772651 18.4683C1.27952 19.2143 2.00021 19.7896 2.84003 20.1184C3.36385 20.3319 3.92441 20.4406 4.49003 20.4384C4.64654 20.4484 4.80352 20.4484 4.96003 20.4384C5.04022 20.4307 5.11687 20.4015 5.18195 20.354C5.24703 20.3065 5.29817 20.2424 5.33003 20.1684C5.36945 20.0982 5.39015 20.019 5.39015 19.9384C5.39015 19.8579 5.36945 19.7787 5.33003 19.7084C4.53391 18.5682 4.11114 17.2091 4.12003 15.8184C4.13315 14.174 4.60784 12.5663 5.49003 11.1785Z"
      fill="#FFC726"
    />
  </Svg>
);

const UnSelectAssets = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M9.27002 7.20845C9.31764 7.27259 9.37939 7.32491 9.4505 7.36133C9.5216 7.39774 9.60014 7.41729 9.68002 7.41845H14.32C14.3986 7.41811 14.476 7.39885 14.5457 7.3623C14.6153 7.32575 14.6751 7.27298 14.72 7.20845L16.22 5.09845C16.3715 4.79303 16.4222 4.44738 16.3647 4.11131C16.3072 3.77525 16.1445 3.46611 15.9 3.22845C15.6526 2.9861 15.3317 2.83294 14.9877 2.79311C14.6437 2.75327 14.2962 2.82904 14 3.00845C13.9264 3.04941 13.8413 3.06476 13.758 3.05209C13.6748 3.03942 13.5981 2.99945 13.54 2.93845L13.32 2.62846C13.1616 2.43222 12.9613 2.27393 12.7337 2.16519C12.5062 2.05644 12.2572 2 12.005 2C11.7528 2 11.5038 2.05644 11.2763 2.16519C11.0487 2.27393 10.8484 2.43222 10.69 2.62846L10.46 2.93845C10.4057 3.01325 10.326 3.06569 10.2358 3.08593C10.1456 3.10618 10.0511 3.09286 9.97002 3.04845C9.67892 2.87556 9.33896 2.80342 9.00273 2.84319C8.6665 2.88296 8.35275 3.03242 8.11002 3.26845C7.85926 3.5177 7.69634 3.84173 7.64584 4.19166C7.59533 4.5416 7.65998 4.89847 7.83002 5.20845L9.27002 7.20845Z"
      fill="#9C9C9C"
    />
    <Path
      d="M14.91 8.53848C14.8182 8.4599 14.7009 8.41727 14.58 8.41848H9.42004C9.29915 8.41727 9.18191 8.4599 9.09004 8.53848C7.47004 9.93848 5.09004 12.5385 5.09004 15.7685C5.09004 19.2785 8.09004 21.9185 12.01 21.9185C15.93 21.9185 18.93 19.2785 18.93 15.7685C18.92 12.5385 16.53 9.93848 14.91 8.53848ZM10.75 14.4185C10.75 14.4848 10.7764 14.5484 10.8233 14.5953C10.8701 14.6421 10.9337 14.6685 11 14.6685H13C13.4642 14.6685 13.9093 14.8528 14.2375 15.181C14.5657 15.5092 14.75 15.9543 14.75 16.4185C14.75 16.8826 14.5657 17.3277 14.2375 17.6559C13.9093 17.9841 13.4642 18.1685 13 18.1685C12.9337 18.1685 12.8701 18.1948 12.8233 18.2417C12.7764 18.2886 12.75 18.3522 12.75 18.4185C12.75 18.6174 12.671 18.8081 12.5304 18.9488C12.3897 19.0894 12.1989 19.1685 12 19.1685C11.8011 19.1685 11.6104 19.0894 11.4697 18.9488C11.3291 18.8081 11.25 18.6174 11.25 18.4185C11.25 18.3522 11.2237 18.2886 11.1768 18.2417C11.1299 18.1948 11.0663 18.1685 11 18.1685H10C9.80112 18.1685 9.61036 18.0894 9.46971 17.9488C9.32905 17.8081 9.25004 17.6174 9.25004 17.4185C9.25004 17.2196 9.32905 17.0288 9.46971 16.8881C9.61036 16.7475 9.80112 16.6685 10 16.6685H13C13.0663 16.6685 13.1299 16.6421 13.1768 16.5952C13.2237 16.5484 13.25 16.4848 13.25 16.4185C13.25 16.3522 13.2237 16.2886 13.1768 16.2417C13.1299 16.1948 13.0663 16.1685 13 16.1685H11C10.5359 16.1685 10.0908 15.9841 9.7626 15.6559C9.43441 15.3277 9.25004 14.8826 9.25004 14.4185C9.25004 13.9543 9.43441 13.5092 9.7626 13.181C10.0908 12.8529 10.5359 12.6685 11 12.6685C11.0663 12.6685 11.1299 12.6421 11.1768 12.5953C11.2237 12.5484 11.25 12.4848 11.25 12.4185C11.25 12.2196 11.3291 12.0288 11.4697 11.8881C11.6104 11.7475 11.8011 11.6685 12 11.6685C12.1989 11.6685 12.3897 11.7475 12.5304 11.8881C12.671 12.0288 12.75 12.2196 12.75 12.4185C12.75 12.4848 12.7764 12.5484 12.8233 12.5953C12.8701 12.6421 12.9337 12.6685 13 12.6685H14C14.1989 12.6685 14.3897 12.7475 14.5304 12.8881C14.671 13.0288 14.75 13.2196 14.75 13.4185C14.75 13.6174 14.671 13.8082 14.5304 13.9488C14.3897 14.0895 14.1989 14.1685 14 14.1685H11C10.9337 14.1685 10.8701 14.1948 10.8233 14.2417C10.7764 14.2886 10.75 14.3522 10.75 14.4185Z"
      fill="#9C9C9C"
    />
    <Path
      d="M21.57 10.5485C21.4791 10.467 21.362 10.4209 21.24 10.4185H18.94C18.8503 10.4193 18.7623 10.4437 18.6851 10.4894C18.6078 10.535 18.544 10.6002 18.5 10.6785C18.4561 10.7545 18.433 10.8407 18.433 10.9285C18.433 11.0162 18.4561 11.1024 18.5 11.1785C19.3918 12.5457 19.8804 14.1364 19.91 15.7684C19.9218 17.158 19.5026 18.517 18.71 19.6584C18.6686 19.728 18.6468 19.8075 18.6468 19.8884C18.6468 19.9694 18.6686 20.0489 18.71 20.1184C18.7422 20.1931 18.7932 20.2582 18.858 20.3073C18.9229 20.3564 18.9994 20.3878 19.08 20.3984H19.54C20.1056 20.4006 20.6662 20.2919 21.19 20.0784C22.0179 19.7473 22.7278 19.1762 23.2285 18.4385C23.7293 17.7007 23.9979 16.8301 24 15.9384C23.9884 14.921 23.7665 13.917 23.3484 12.9895C22.9302 12.0619 22.3247 11.2308 21.57 10.5485Z"
      fill="#DDDDDD"
    />
    <Path
      d="M18 9.17849C18.0408 9.25131 18.1004 9.31193 18.1724 9.35411C18.2445 9.39629 18.3265 9.41851 18.41 9.41849H20.59C20.6735 9.41851 20.7555 9.39629 20.8275 9.35411C20.8996 9.31193 20.9591 9.25131 21 9.17849L21.67 7.9985C21.7839 7.79836 21.8378 7.56966 21.8254 7.33971C21.8129 7.10976 21.7345 6.88825 21.5995 6.70164C21.4645 6.51503 21.2788 6.37119 21.0643 6.2873C20.8498 6.2034 20.6157 6.18299 20.39 6.2285C19.8027 6.34838 19.1973 6.34838 18.61 6.2285C18.3842 6.18299 18.1502 6.2034 17.9357 6.2873C17.7212 6.37119 17.5354 6.51503 17.4005 6.70164C17.2655 6.88825 17.1871 7.10976 17.1746 7.33971C17.1621 7.56966 17.2161 7.79836 17.33 7.9985L18 9.17849Z"
      fill="#DDDDDD"
    />
    <Path
      d="M3.00003 9.16849C3.04602 9.24419 3.11057 9.30688 3.18757 9.35063C3.26457 9.39438 3.35147 9.41774 3.44003 9.41849H5.57003C5.65688 9.41606 5.74174 9.39191 5.81686 9.34824C5.89197 9.30457 5.95495 9.24277 6.00003 9.16849L6.66003 7.9985C6.77295 7.79916 6.82644 7.57166 6.81419 7.34288C6.80194 7.11411 6.72446 6.89362 6.5909 6.70748C6.45734 6.52134 6.27328 6.37732 6.06048 6.29244C5.84768 6.20756 5.61504 6.18537 5.39003 6.2285C4.80275 6.34838 4.19731 6.34838 3.61003 6.2285C3.38428 6.18299 3.1502 6.2034 2.93573 6.2873C2.72126 6.37119 2.53547 6.51503 2.40052 6.70164C2.26557 6.88825 2.18716 7.10976 2.17467 7.33971C2.16217 7.56966 2.2161 7.79836 2.33003 7.9985L3.00003 9.16849Z"
      fill="#DDDDDD"
    />
    <Path
      d="M5.49003 11.1785C5.53707 11.1036 5.56203 11.0169 5.56203 10.9285C5.56203 10.84 5.53707 10.7534 5.49003 10.6785C5.4485 10.6003 5.3866 10.5349 5.31089 10.4891C5.23519 10.4434 5.1485 10.4189 5.06003 10.4185H2.77003C2.63996 10.4197 2.51508 10.4697 2.42003 10.5585C1.66694 11.2394 1.0631 12.0691 0.646595 12.995C0.230087 13.921 0.00994011 14.9232 3.53592e-05 15.9384C-0.00355119 16.8404 0.265783 17.7223 0.772651 18.4683C1.27952 19.2143 2.00021 19.7896 2.84003 20.1184C3.36385 20.3319 3.92441 20.4406 4.49003 20.4384C4.64654 20.4484 4.80352 20.4484 4.96003 20.4384C5.04022 20.4307 5.11687 20.4015 5.18195 20.354C5.24703 20.3065 5.29817 20.2424 5.33003 20.1684C5.36945 20.0982 5.39015 20.019 5.39015 19.9384C5.39015 19.8579 5.36945 19.7787 5.33003 19.7084C4.53391 18.5682 4.11114 17.2091 4.12003 15.8184C4.13315 14.174 4.60784 12.5663 5.49003 11.1785Z"
      fill="#DDDDDD"
    />
  </Svg>
);

const AssetsIcon = React.memo(({ style, active }) => (
  <View style={style}>
    {active ? <SelectAssets /> : <UnSelectAssets />}
  </View>
));

AssetsIcon.defaultProps = {
  style: null,
  active: false
};

AssetsIcon.propTypes = {
  style: PropTypes.any,
  active: PropTypes.bool
};

export default AssetsIcon;