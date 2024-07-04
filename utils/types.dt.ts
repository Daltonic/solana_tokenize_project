export type MintHistoryItem = {
  receiver: any // Consider specifying a more specific type instead of 'any'
  amount: number
  signature: string
  transactionLink: string
  addressLink: string
}
