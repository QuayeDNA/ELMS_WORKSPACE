import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'POLYTECHNIC' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  adminCount: number;
  studentCount: number;
  createdAt: string;
  lastActivity: string;
}

interface InstitutionAdmin {
  id: string;
  institutionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  role: 'ADMIN' | 'FACULTY_ADMIN';
  createdAt: string;
  lastLogin?: string;
}

const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'University of Ghana',
    code: 'UG',
    type: 'UNIVERSITY',
    status: 'ACTIVE',
    address: 'University of Ghana, Legon',
    city: 'Accra',
    state: 'Greater Accra',
    country: 'Ghana',
    phone: '+233 302 500 381',
    email: 'admin@ug.edu.gh',
    website: 'https://www.ug.edu.gh',
    description: 'Premier university in Ghana',
    adminCount: 3,
    studentCount: 45000,
    createdAt: '2024-01-15',
    lastActivity: '2024-12-10'
  },
  {
    id: '2',
    name: 'Kwame Nkrumah University of Science and Technology',
    code: 'KNUST',
    type: 'UNIVERSITY',
    status: 'ACTIVE',
    address: 'KNUST Campus, Kumasi',
    city: 'Kumasi',
    state: 'Ashanti',
    country: 'Ghana',
    phone: '+233 322 060 319',
    email: 'admin@knust.edu.gh',
    website: 'https://www.knust.edu.gh',
    description: 'Leading technological university',
    adminCount: 2,
    studentCount: 60000,
    createdAt: '2024-02-01',
    lastActivity: '2024-12-09'
  }
];

const mockAdmins: InstitutionAdmin[] = [
  {
    id: '1',
    institutionId: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@ug.edu.gh',
    phone: '+233 244 123 456',
    status: 'ACTIVE',
    role: 'ADMIN',
    createdAt: '2024-01-20',
    lastLogin: '2024-12-10'
  },
  {
    id: '2',
    institutionId: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@ug.edu.gh',
    phone: '+233 244 789 012',
    status: 'ACTIVE',
    role: 'FACULTY_ADMIN',
    createdAt: '2024-02-15',
    lastLogin: '2024-12-09'
  }
];

export function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);
  const [admins, setAdmins] = useState<InstitutionAdmin[]>(mockAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInstitution, setShowAddInstitution] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('institutions');

  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    code: '',
    type: 'UNIVERSITY' as Institution['type'],
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    description: ''
  });

  const [adminForm, setAdminForm] = useState({
    institutionId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'ADMIN' as InstitutionAdmin['role']
  });

  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddInstitution = () => {
    const newInstitution: Institution = {
      id: (institutions.length + 1).toString(),
      ...institutionForm,
      status: 'PENDING',
      adminCount: 0,
      studentCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0]
    };
    setInstitutions([...institutions, newInstitution]);
    setInstitutionForm({
      name: '',
      code: '',
      type: 'UNIVERSITY',
      address: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      description: ''
    });
    setShowAddInstitution(false);
  };

  const handleAddAdmin = () => {
    const newAdmin: InstitutionAdmin = {
      id: (admins.length + 1).toString(),
      ...adminForm,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAdmins([...admins, newAdmin]);
    setAdminForm({
      institutionId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'ADMIN'
    });
    setShowAddAdmin(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institution Management</h1>
          <p className="text-gray-600">Register and manage educational institutions and their administrators</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddAdmin(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
          <Button onClick={() => setShowAddInstitution(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Institutions</p>
                <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Institutions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {institutions.filter(i => i.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {institutions.reduce((sum, i) => sum + i.studentCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search institutions by name, code, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Institutions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInstitutions.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{institution.name}</CardTitle>
                        <Badge variant="secondary">{institution.code}</Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {institution.type.replace('_', ' ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(institution.status)}>
                        {institution.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Admins
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{institution.city}, {institution.state}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{institution.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{institution.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{institution.adminCount} Admins</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Students: {institution.studentCount.toLocaleString()}</span>
                      <span>Created: {institution.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          {/* Admins Table */}
          <Card>
            <CardHeader>
              <CardTitle>Institution Administrators</CardTitle>
              <CardDescription>
                Manage administrators for all institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.map((admin) => {
                  const institution = institutions.find(i => i.id === admin.institutionId);
                  return (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {admin.firstName[0]}{admin.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{admin.firstName} {admin.lastName}</p>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            {institution?.name} • {admin.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(admin.status)}>
                          {admin.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Institution Dialog */}
      <Dialog open={showAddInstitution} onOpenChange={setShowAddInstitution}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Institution</DialogTitle>
            <DialogDescription>
              Add a new educational institution to the system
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name *</Label>
              <Input
                id="name"
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                placeholder="e.g., University of Ghana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Institution Code *</Label>
              <Input
                id="code"
                value={institutionForm.code}
                onChange={(e) => setInstitutionForm({ ...institutionForm, code: e.target.value })}
                placeholder="e.g., UG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Institution Type</Label>
              <Select 
                value={institutionForm.type} 
                onValueChange={(value) => setInstitutionForm({ ...institutionForm, type: value as Institution['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIVERSITY">University</SelectItem>
                  <SelectItem value="COLLEGE">College</SelectItem>
                  <SelectItem value="POLYTECHNIC">Polytechnic</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={institutionForm.email}
                onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                placeholder="admin@institution.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={institutionForm.phone}
                onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
                placeholder="+233 XXX XXX XXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={institutionForm.website}
                onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                placeholder="https://www.institution.edu"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={institutionForm.address}
                onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={institutionForm.city}
                onChange={(e) => setInstitutionForm({ ...institutionForm, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Region *</Label>
              <Input
                id="state"
                value={institutionForm.state}
                onChange={(e) => setInstitutionForm({ ...institutionForm, state: e.target.value })}
                placeholder="State or Region"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={institutionForm.country}
                onChange={(e) => setInstitutionForm({ ...institutionForm, country: e.target.value })}
                placeholder="Country"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={institutionForm.description}
                onChange={(e) => setInstitutionForm({ ...institutionForm, description: e.target.value })}
                placeholder="Brief description of the institution"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddInstitution(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInstitution}>
              Register Institution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Institution Administrator</DialogTitle>
            <DialogDescription>
              Register a new administrator for an institution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Select 
                value={adminForm.institutionId} 
                onValueChange={(value) => setAdminForm({ ...adminForm, institutionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      {institution.name} ({institution.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin@institution.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPhone">Phone *</Label>
              <Input
                id="adminPhone"
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                placeholder="+233 XXX XXX XXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={adminForm.role} 
                onValueChange={(value) => setAdminForm({ ...adminForm, role: value as InstitutionAdmin['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Institution Admin</SelectItem>
                  <SelectItem value="FACULTY_ADMIN">Faculty Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddAdmin(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>
              Add Administrator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
