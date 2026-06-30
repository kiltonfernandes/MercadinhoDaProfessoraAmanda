import { useEffect, useState } from 'react'
import { initialData } from './data'
import type { StoreData } from './types'

const KEY = 'mercadinho-amanda:v1'

export function normalizeStoreData(data: StoreData): StoreData {
  return {
    ...data,
    customers: data.customers.map((customer) => ({
      ...customer,
      behaviorEntries: Array.isArray(customer.behaviorEntries) ? customer.behaviorEntries : [],
    })),
  }
}

function readData(): StoreData {
  try {
    const stored = localStorage.getItem(KEY)
    const parsed = stored ? JSON.parse(stored) as StoreData : initialData
    return normalizeStoreData(parsed)
  } catch {
    return initialData
  }
}

export function useStore() {
  const [data, setData] = useState<StoreData>(readData)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  return { data, setData }
}
