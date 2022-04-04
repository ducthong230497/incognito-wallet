import React from 'react';
import MainLayout from '@components/MainLayout';
import { RoundCornerButton, Text } from '@components/core';
import { StyleSheet } from 'react-native';
import { THEME } from '@src/styles';
// import enhanceExportCSV from '@src/screens/Setting/features/ExportCSVSection/ExportCSVSection.enhance';
import enhanceExportCSV1 from '@src/screens/Setting/features/ExportCSVSection/ExportCSVSection.enhance1';
import Loading from '@screens/DexV2/components/Loading';
// import Loading from '@screens/Dex/components/Loading';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  text: {
    ...THEME.text.mediumTextMotto,
  },
  button: {
    marginTop: 50,
  },
});

const ExportCSV = (props) => {
  const { loadingExportCSV, exportCSV, forcePercent, disableBtn } = props;

  const handlePressExportCSV = () => {
    exportCSV();
  };

  return (
    <MainLayout header="Reporting" scrollable>
      <Text style={styles.text}>
        {
          'We need file and folder permission so we can export csv and stored it in your device. Please grant us the permission. \n\n We will export transaction data of trade, provide and withdraw node rewards.'
        }
      </Text>
      <RoundCornerButton
        style={styles.button}
        title="Export"
        onPress={handlePressExportCSV}
        disabled={disableBtn}
      />
      {loadingExportCSV && (
        <Loading open={loadingExportCSV} forcePercent={forcePercent} />
      )}
    </MainLayout>
  );
};

ExportCSV.propTypes = {
  loadingExportCSV: PropTypes.bool,
  forcePercent: PropTypes.number,
  exportCSV: PropTypes.func,
};

ExportCSV.defaultProps = {
  loadingExportCSV: false,
  forcePercent: 0,
  exportCSV: null,
};

export default enhanceExportCSV1(ExportCSV);
