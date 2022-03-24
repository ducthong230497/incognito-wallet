import React from 'react';
import {
  Text,
  TouchableOpacity,
  KeyboardAwareScrollView,
  View,
} from '@src/components/core';
import { colorsSelector } from '@src/theme/theme.selector';
import { View2 } from '@src/components/core/View';
import { useSelector } from 'react-redux';
import AddManualTokenComponent from '@src/components/AddManualToken';
import Icons from 'react-native-vector-icons/Fontisto';
import Header from '@src/components/Header';
import PureModal from '@src/components/Modal/features/PureModal';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import styles from './AddManually.styled';
import withAddManually, { AddManuallyContext } from './AddManually.enhance';
import AddManuallyModal from './AddManually.modal';

const SelectType = (props) => {
  const { toggleChooseType, type } = React.useContext(AddManuallyContext);
  const { colors } = props;
  return (
    <View style={styles.selectType}>
      <View style={styles.selectNetworkButtonGroup}>
        <Text style={[styles.text, styles.boldText]}>Select token type</Text>
        <TouchableOpacity
          onPress={toggleChooseType}
          style={styles.selectNetworkButton}
        >
          <Text style={styles.text}>{type}</Text>
          <Icons
            name="angle-right"
            style={[styles.selectNetworkValueIcon, { color: colors?.text1 }]}
            size={16}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ModalSelectType = () => {
  const { isShowChooseType, toggleChooseType } =
    React.useContext(AddManuallyContext);
  return (
    <PureModal
      visible={isShowChooseType}
      content={<AddManuallyModal />}
      onRequestClose={toggleChooseType}
    />
  );
};

const AddManually = () => {
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.FollowToken);
  const colors = useSelector(colorsSelector);
  return (
    <View2 style={styles.container}>
      <Header title="Add manually" onGoBack={onGoBack} />
      <View borderTop fullFlex>
        <KeyboardAwareScrollView>
          <View style={styles.extra}>
            <SelectType colors={colors} />
            <AddManualTokenComponent />
          </View>
        </KeyboardAwareScrollView>
        <ModalSelectType />
      </View>
    </View2>
  );
};

AddManually.propTypes = {};

export default withAddManually(AddManually);
