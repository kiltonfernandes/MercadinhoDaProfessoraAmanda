import { useEffect, useState } from 'react'
import { initialData } from './data'
import type { StoreData } from './types'

const KEY = 'mercadinho-amanda:v1'

function readData(): StoreData {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? JSON.parse(stored) : initialData
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
