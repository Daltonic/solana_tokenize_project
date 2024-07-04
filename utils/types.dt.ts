export interface TruncateParams {
  text: string
  startChars: number
  endChars: number
  maxLength: number
}

export type MintHistoryItem = {
  receiver: any // Consider specifying a more specific type instead of 'any'
  amount: number
  signature: string
  transactionLink: string
}

export interface GlobalState {
  mintHistory: MintHistoryItem[]
}
