import { createSelector } from 'reselect';

export const settingSelector = createSelector(
  (state) => state.setting,
  (setting) => setting,
);

export const decimalDigitsSelector = createSelector(
  settingSelector,
  (setting) => setting?.decimalDigits,
);