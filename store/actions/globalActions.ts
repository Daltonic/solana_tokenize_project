import { GlobalState, SalesHistoryItem } from '@/utils/types.dt'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
  setSalesHistory: (state: GlobalState, action: PayloadAction<SalesHistoryItem[]>) => {
    state.salesHistory = action.payload
  },
  setBalance: (state: GlobalState, action: PayloadAction<number>) => {
    state.balance = action.payload
  },
}
