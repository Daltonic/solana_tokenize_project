export type SalesHistoryItem = {
  receiver: any // Consider specifying a more specific type instead of 'any'
  amount: number
  signature: string
  transactionLink: string
  addressLink: string
}

export interface GlobalState {
  salesHistory: SalesHistoryItem[]
  balance: number
}

export interface RootState {
  globalStates: GlobalState
}
