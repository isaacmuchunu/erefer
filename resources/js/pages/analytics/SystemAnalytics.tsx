import React, { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Truck, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'

interface AnalyticsData {
  totalPatients: number
  totalReferrals: number
  activeAmbulances: number
  connectedHospitals: number
  referralTrends: {
    period: string
    completed: number
    pending: number
    cancelled: number
  }[]
  responseMetrics: {
    averageResponseTime: number
    successRate: number
    patientSatisfaction: number
  }
  regionalData: {
    region: string
    referrals: number
    hospitals: number
    ambulances: number
  }[]
}

export default function SystemAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockData: AnalyticsData = {
        totalPatients: 12847,
        totalReferrals: 3456,
        activeAmbulances: 89,
        connectedHospitals: 156,
        referralTrends: [
          { period: 'Mon', completed: 45, pending: 12, cancelled: 3 },
          { period: 'Tue', completed: 52, pending: 18, cancelled: 2 },
          { period: 'Wed', completed: 38, pending: 15, cancelled: 5 },
          { period: 'Thu', completed: 61, pending: 9, cancelled: 1 },
          { period: 'Fri', completed: 48, pending: 22, cancelled: 4 },
          { period: 'Sat', completed: 35, pending: 8, cancelled: 2 },
          { period: 'Sun', completed: 29, pending: 6, cancelled: 1 }
        ],
        responseMetrics: {
          averageResponseTime: 18.5,
          successRate: 94.2,
          patientSatisfaction: 4.7
        },
        regionalData: [
          { region: 'Nairobi', referrals: 1245, hospitals: 45, ambulances: 32 },
          { region: 'Mombasa', referrals: 678, hospitals: 23, ambulances: 18 },
          { region: 'Kisumu', referrals: 456, hospitals: 18, ambulances: 12 },
          { region: 'Nakuru', referrals: 389, hospitals: 15, ambulances: 10 },
          { region: 'Eldoret', referrals: 234, hospitals: 12, ambulances: 8 }
        ]
      }
      
      setAnalyticsData(mockData)
      setIsLoading(false)
    }, 1000)
  }

  const exportReport = () => {
    // Simulate report export
    const blob = new Blob(['Analytics Report Data'], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `erefer-analytics-${selectedPeriod}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading || !analyticsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head title="System Analytics — eRefer Kenya" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive system performance and usage metrics</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1">
              {['24h', '7d', '30d', '90d'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button onClick={exportReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalPatients.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalReferrals.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ambulances</CardTitle>
              <Truck className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.activeAmbulances}</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                -2.1% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Hospitals</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.connectedHospitals}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.4% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.responseMetrics.averageResponseTime} min
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Time from referral creation to acceptance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.responseMetrics.successRate}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Successful referral completions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Patient Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {analyticsData.responseMetrics.patientSatisfaction}/5.0
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Average patient rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.regionalData.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">{region.region}</div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-green-600" />
                      {region.referrals} referrals
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {region.hospitals} hospitals
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-red-600" />
                      {region.ambulances} ambulances
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
