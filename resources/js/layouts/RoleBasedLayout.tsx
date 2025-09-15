import React from 'react'
import { type User as UserType } from '@/types'

// Import all role-specific layouts
import SuperAdminLayout from './SuperAdminLayout'
import HospitalAdminLayout from './HospitalAdminLayout'
import DoctorLayout from './DoctorLayout'
import NurseLayout from './NurseLayout'
import DispatcherLayout from './DispatcherLayout'
import AmbulanceDriverLayout from './AmbulanceDriverLayout'
import PatientLayout from './PatientLayout'
import AppLayout from './AppLayout' // Fallback layout

interface RoleBasedLayoutProps {
  children: React.ReactNode
  user: UserType
}

/**
 * RoleBasedLayout component automatically selects the appropriate layout
 * based on the user's role, providing role-specific navigation and design
 */
export default function RoleBasedLayout({ children, user }: RoleBasedLayoutProps) {
  // Select layout based on user role
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminLayout user={user}>{children}</SuperAdminLayout>
    
    case 'hospital_admin':
      return <HospitalAdminLayout user={user}>{children}</HospitalAdminLayout>
    
    case 'doctor':
      return <DoctorLayout user={user}>{children}</DoctorLayout>
    
    case 'nurse':
      return <NurseLayout user={user}>{children}</NurseLayout>
    
    case 'dispatcher':
      return <DispatcherLayout user={user}>{children}</DispatcherLayout>
    
    case 'ambulance_driver':
      return <AmbulanceDriverLayout user={user}>{children}</AmbulanceDriverLayout>
      
    case 'ambulance_paramedic':
      return <AmbulanceDriverLayout user={user}>{children}</AmbulanceDriverLayout>
    
    case 'patient':
      return <PatientLayout user={user}>{children}</PatientLayout>
    
    default:
      // Fallback to AppLayout for unknown roles
      return <AppLayout user={user}>{children}</AppLayout>
  }
}