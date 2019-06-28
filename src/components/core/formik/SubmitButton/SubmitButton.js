import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@src/components/core';

const FormSubmitButton = (props) => {
  const { handleSubmit, ...btnProps } = props;
  return (
    <Button
      {...btnProps}
      isAsync
      onPress={handleSubmit}
    />
  );
};

FormSubmitButton.propTypes = {
  handleSubmit: PropTypes.func
};

export default FormSubmitButton;