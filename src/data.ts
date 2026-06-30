import type { StoreData } from './types'

export const initialData: StoreData = {
  products: [
    { id: 'p1', name: 'Maçã', emoji: '🍎', price: 2.5, stock: 12 },
    { id: 'p2', name: 'Suco', emoji: '🧃', price: 4, stock: 8 },
    { id: 'p3', name: 'Pão de queijo', emoji: '🧀', price: 3, stock: 10 },
    { id: 'p4', name: 'Biscoito', emoji: '🍪', price: 2, stock: 5 },
  ],
  customers: [
    { id: 'c1', name: 'Lia', age: 8, emoji: '🧒🏽', goodBehavior: 5, badBehavior: 1, creditLimit: 30, balance: 0 },
    { id: 'c2', name: 'Davi', age: 9, emoji: '👦🏻', goodBehavior: 3, badBehavior: 0, creditLimit: 25, balance: 6 },
  ],
  transactions: [],
}

export const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const uid = () => crypto.randomUUID()
