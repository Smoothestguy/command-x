import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Database, 
  Briefcase, 
  Construction, 
  Users, 
  DollarSign, 
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { projectsApi, workOrdersApi, paymentItemsApi, subcontractorsApi, locationsApi } from '../services/supabaseApi'

const RealDataDemo: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [paymentItems, setPaymentItems] = useState<any[]>([])
  const [subcontractors, setSubcontractors] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        const [projectsData, workOrdersData, paymentItemsData, subcontractorsData] = await Promise.all([
          projectsApi.getAll(),
          workOrdersApi.getAll(),
          paymentItemsApi.getAll(),
          subcontractorsApi.getAll()
        ])

        setProjects(projectsData)
        setWorkOrders(workOrdersData)
        setPaymentItems(paymentItemsData)
        setSubcontractors(subcontractorsData)

        // Get locations for the first project
        if (projectsData.length > 0) {
          const locationsData = await locationsApi.getByProject(projectsData[0].project_id)
          setLocations(locationsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in progress': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-500" />
            <p className="text-lg">Loading real data from Supabase...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎉 Real Data Demo</h1>
        <p className="text-gray-600 text-lg">
          Your Command-X Construction Management System is now powered by real Supabase data!
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              ${(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Construction className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {workOrders.filter(wo => ['Pending', 'In Progress'].includes(wo.status)).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Items</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentItems.length}</div>
            <p className="text-xs text-muted-foreground">
              ${paymentItems.reduce((sum, pi) => sum + (pi.total_price || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcontractors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcontractors.length}</div>
            <p className="text-xs text-muted-foreground">
              Avg rating: {(subcontractors.reduce((sum, s) => sum + (s.performance_rating || 0), 0) / subcontractors.length).toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="payments">Payment Items</TabsTrigger>
          <TabsTrigger value="contractors">Subcontractors</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.project_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.project_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-gray-600">{project.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-sm text-gray-600">${project.budget?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timeline</p>
                      <p className="text-sm text-gray-600">
                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - 
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-4">
          <div className="grid gap-4">
            {workOrders.map((workOrder) => (
              <Card key={workOrder.work_order_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workOrder.description}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {workOrder.scheduled_date ? new Date(workOrder.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Estimated Cost</p>
                      <p className="text-sm text-gray-600">${workOrder.estimated_cost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-gray-600">{new Date(workOrder.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4">
            {paymentItems.map((item) => (
              <Card key={item.item_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.description}</CardTitle>
                      <CardDescription>
                        {item.category} • {item.original_quantity} {item.unit_of_measure}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Unit Price</p>
                      <p className="text-sm text-gray-600">${item.unit_price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Price</p>
                      <p className="text-sm text-gray-600">${item.total_price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Received</p>
                      <p className="text-sm text-gray-600">{item.received_quantity} / {item.original_quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <div className="grid gap-4">
            {subcontractors.map((contractor) => (
              <Card key={contractor.subcontractor_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contractor.company_name}</CardTitle>
                      <CardDescription>{contractor.primary_contact_name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{contractor.performance_rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{contractor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{contractor.phone_number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4">
            {locations.map((location) => (
              <Card key={location.location_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription>{location.location_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{location.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Success Message */}
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Migration Successful! 🎉</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            Your Command-X Construction Management System is now fully powered by Supabase! 
            All the data you see above is real data from your cloud database, not mock data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open('/dashboard-test', '_blank')}>
              View Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/projects-test', '_blank')}>
              View Projects
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/supabase-test', '_blank')}>
              Run Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealDataDemo
