import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface OrderBookState {
  bidArray: any;
  askArray: any;
}

const initialState: OrderBookState = {
  bidArray: [],
  askArray: [],
};

export const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,
  reducers: {
    setBid: (state, action: PayloadAction<any>) => {
      state.bidArray = action.payload;
    },
    addBid: (state, action: PayloadAction<any>) => {
      const updateBidArr = [...state.bidArray];
      updateBidArr.unshift(action.payload);
      updateBidArr.pop();
      state.bidArray = updateBidArr;
    },
    setAsk: (state, action: PayloadAction<any>) => {
      state.askArray = action.payload;
    },
    addAsk: (state, action: PayloadAction<any>) => {
      const updateAskArr = [...state.askArray];
      updateAskArr.unshift(action.payload);
      updateAskArr.pop();
      state.askArray = updateAskArr;
    },
  },
});

export const { setBid, setAsk, addBid, addAsk } = orderBookSlice.actions;

export const getBidList = (state: RootState) => state.orderBook.bidArray;
export const getAskList = (state: RootState) => state.orderBook.askArray;

export default orderBookSlice.reducer;
