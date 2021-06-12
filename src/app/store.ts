import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import orderBookReducer from "../features/orderBook/orderBookSlice";

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
