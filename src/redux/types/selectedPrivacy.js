import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('SELECTED_PRIVACY');

// define types here
const TYPES = {
  SET: n('SET'),
};

export default TYPES;
