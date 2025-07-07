import { createSelector } from 'reselect';

const selectStates = (state) => state;

export const isSkeleton = createSelector(
  selectStates,
  (state) => {
    const slices = Object.values(state);
    return slices.some((slice) => {
      if (slice && typeof slice === 'object' && slice.isSkeleton === true) {
        return true;
      }
      return false;
    });
  }
);

export const isLoading = createSelector(
  selectStates,
  (state) => {
    const slices = Object.values(state);
    return slices.some((slice) => {
      if (slice && typeof slice === 'object' && slice.isLoading === true) {
        return true;
      }
      console.log('isLoadingggggggggggggggggggggggggggg:', isLoading);
      return false;
    });
  }
);