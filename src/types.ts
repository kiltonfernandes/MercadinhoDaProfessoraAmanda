export type Product = {
  id: string
  name: string
  emoji: string
  price: number
  stock: number
}

export type Customer = {
  id: string
  name: string
  age: number
  emoji: string
  goodBehavior: number
  badBehavior: number
  creditLimit: number
  balance: number
  behaviorEntries: BehaviorEntry[]
}

export type BehaviorEntry = {
  id: string
  type: 'good' | 'bad'
  comment: string
  date: string
}

export type SaleItem = {
  productId: string
  name: string
  emoji: string
  quantity: number
  unitPrice: number
}

export type Transaction = {
  id: string
  type: 'sale' | 'payment' | 'adjustment'
  customerId: string
  customerName: string
  date: string
  total: number
  items?: SaleItem[]
}

export type StoreData = {
  products: Product[]
  customers: Customer[]
  transactions: Transaction[]
}
