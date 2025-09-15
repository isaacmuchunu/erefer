import React, { useState, useEffect } from 'react'
import { Search, Filter, X, User, FileText, Truck, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  type: 'patient' | 'referral' | 'ambulance' | 'hospital'
  title: string
  subtitle: string
  url: string
  relevance: number
}

interface SearchFilters {
  type: string[]
  dateRange: string
  status: string[]
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    dateRange: 'all',
    status: []
  })

  useEffect(() => {
    if (query.length > 2) {
      performSearch()
    } else {
      setResults([])
    }
  }, [query, filters])

  const performSearch = async () => {
    setIsLoading(true)
    
    // Simulate API search
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'patient',
          title: 'John Doe',
          subtitle: 'Patient ID: P001 • Age: 45 • Last visit: 2024-01-15',
          url: '/patients/1',
          relevance: 0.95
        },
        {
          id: '2',
          type: 'referral',
          title: 'Emergency Cardiac Referral',
          subtitle: 'From: Nairobi Hospital • To: Kenyatta Hospital • Status: Pending',
          url: '/referrals/2',
          relevance: 0.87
        },
        {
          id: '3',
          type: 'ambulance',
          title: 'Ambulance KCA-001',
          subtitle: 'Status: Available • Location: Westlands • Driver: Mary Wanjiku',
          url: '/ambulances/3',
          relevance: 0.76
        },
        {
          id: '4',
          type: 'hospital',
          title: 'Kenyatta National Hospital',
          subtitle: 'Capacity: 85% • Emergency: Available • Specialties: Cardiology, Neurology',
          url: '/hospitals/4',
          relevance: 0.65
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      )

      setResults(mockResults)
      setIsLoading(false)
    }, 300)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'patient': return <User className="w-4 h-4 text-blue-600" />
      case 'referral': return <FileText className="w-4 h-4 text-green-600" />
      case 'ambulance': return <Truck className="w-4 h-4 text-red-600" />
      case 'hospital': return <Building2 className="w-4 h-4 text-purple-600" />
      default: return <Search className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'patient': return 'bg-blue-100 text-blue-800'
      case 'referral': return 'bg-green-100 text-green-800'
      case 'ambulance': return 'bg-red-100 text-red-800'
      case 'hospital': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search patients, referrals, ambulances..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (query.length > 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Filters */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['patient', 'referral', 'ambulance', 'hospital'].map((type) => (
                <Badge
                  key={type}
                  variant={filters.type.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      type: prev.type.includes(type)
                        ? prev.type.filter(t => t !== type)
                        : [...prev.type, type]
                    }))
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            ) : results.length === 0 && query.length > 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => {
                    window.location.href = result.url
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {result.title}
                        </p>
                        <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {results.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all {results.length} results
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
