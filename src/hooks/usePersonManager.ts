import { useState, useEffect } from 'react'
import { RegisteredPerson } from '@/types/omikuji'
import { decodeNamesFromUrl, updateUrlWithNames } from '@/utils/urlParams'

const STORAGE_KEY = 'omikuji-registered-persons'

export function usePersonManager() {
  const [persons, setPersons] = useState<RegisteredPerson[]>([])

  useEffect(() => {
    // URLパラメータから名前を読み込み
    const urlNames = decodeNamesFromUrl()
    if (urlNames.length > 0) {
      const urlPersons = urlNames.map(name => ({
        name,
        registeredAt: new Date()
      }))
      setPersons(urlPersons)
      savePersons(urlPersons)
      return
    }

    // ローカルストレージから登録済みの人を読み込み
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedPersons = JSON.parse(stored).map((p: any) => ({
          ...p,
          registeredAt: new Date(p.registeredAt)
        }))
        setPersons(parsedPersons)
      }
    } catch (error) {
      console.error('Failed to load persons from localStorage:', error)
    }
  }, [])

  const savePersons = (newPersons: RegisteredPerson[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPersons))
      setPersons(newPersons)
      
      // URLも更新
      const names = newPersons.map(p => p.name)
      updateUrlWithNames(names)
    } catch (error) {
      console.error('Failed to save persons to localStorage:', error)
    }
  }

  const registerPerson = (name: string): RegisteredPerson => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('名前を入力してください')
    }

    // 既に登録済みかチェック
    const existingPerson = persons.find(p => p.name === trimmedName)
    if (existingPerson) {
      return existingPerson
    }

    // 新しい人を登録
    const newPerson: RegisteredPerson = {
      name: trimmedName,
      registeredAt: new Date()
    }

    const updatedPersons = [...persons, newPerson]
    savePersons(updatedPersons)
    return newPerson
  }


  const removePerson = (name: string) => {
    const updatedPersons = persons.filter(p => p.name !== name)
    savePersons(updatedPersons)
  }

  const clearAllPersons = () => {
    savePersons([])
  }

  return {
    persons,
    registerPerson,
    removePerson,
    clearAllPersons
  }
}