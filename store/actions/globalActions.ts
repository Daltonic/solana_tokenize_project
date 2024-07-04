import { GlobalState, MintHistoryItem } from '@/utils/types.dt'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
  setMintHistory: (state: GlobalState, action: PayloadAction<MintHistoryItem[]>) => {
    state.mintHistory = action.payload
  },
  setBalance: (state: GlobalState, action: PayloadAction<number>) => {
    state.balance = action.payload
  },
}
