'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
  }, [user, loading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>Redirecting...</div>
}
