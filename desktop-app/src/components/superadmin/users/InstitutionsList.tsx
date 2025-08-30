import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { superAdminApi } from '../../../services/superadmin'
import { Institution, CreateInstitutionData, UpdateInstitutionData, Address } from '../../../types/superadmin/superadmin.types'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  MapPin,
  Search,
  Globe,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Building,
  School,
  BookOpen
} from 'lucide-react'
import { Button } from '../../ui/button'

interface FormData {
  name: string
  shortName: string
  code: string
  type: string
  category: string
  street: string
  city: string
  region: string
  country: string
  postalCode: string
  email: string
  phone: string
  website: string
  motto: string
  establishedYear: string
}

// Skeleton component for loading state
const InstitutionSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className="h-12 w-12 bg-muted rounded-lg"></div>
        <div className="ml-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center">
        <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="flex items-center">
        <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Helper function to format address
const formatAddress = (address?: Address): string => {
  if (!address) return ''
  const parts = [
    address.street,
    address.city,
    address.region,
    address.postalCode,
    address.country
  ].filter(Boolean)
  return parts.join(', ')
}

// Helper function to get institution type badge color
const getTypeBadgeColor = (type?: string, category?: string) => {
  const typeColor = type === 'UNIVERSITY' 
    ? 'bg-blue-100 text-blue-800' 
    : type === 'COLLEGE' 
    ? 'bg-green-100 text-green-800'
    : type === 'INSTITUTE'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-gray-100 text-gray-800'
  
  return category === 'PUBLIC' 
    ? `${typeColor} border border-current border-opacity-20`
    : typeColor
}

export const InstitutionsList: React.FC = () => {
  const { token } = useAuthStore()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    shortName: '',
    code: '',
    type: '',
    category: '',
    street: '',
    city: '',
    region: '',
    country: 'Ghana',
    postalCode: '',
    email: '',
    phone: '',
    website: '',
    motto: '',
    establishedYear: ''
  })

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false)
      
      // Set token in the API client
      superAdminApi.setToken(token)
      
      try {
        setLoading(true)
        setError(null)
        const data = await superAdminApi.getInstitutions()
        setInstitutions(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setError((err as Error).message || String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      code: '',
      type: '',
      category: '',
      street: '',
      city: '',
      region: '',
      country: 'Ghana',
      postalCode: '',
      email: '',
      phone: '',
      website: '',
      motto: '',
      establishedYear: ''
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    try {
      const institutionData = {
        name: formData.name,
        shortName: formData.shortName,
        code: formData.code,
        type: formData.type,
        category: formData.category,
        address: {
          street: formData.street,
          city: formData.city,
          region: formData.region,
          country: formData.country,
          postalCode: formData.postalCode
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          website: formData.website
        },
        motto: formData.motto,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined
      }

      const newInstitution = await superAdminApi.createInstitution(institutionData as CreateInstitutionData)
      setInstitutions(prev => [newInstitution, ...prev])
      setShowCreateModal(false)
      resetForm()
    } catch (err: unknown) {
      setError((err as Error).message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution)
    setFormData({
      name: institution.name || '',
      shortName: institution.shortName || '',
      code: institution.code || '',
      type: institution.type || '',
      category: institution.category || '',
      street: institution.address?.street || '',
      city: institution.address?.city || '',
      region: institution.address?.region || '',
      country: institution.address?.country || 'Ghana',
      postalCode: institution.address?.postalCode || '',
      email: institution.contactInfo?.email || '',
      phone: institution.contactInfo?.phone || '',
      website: institution.contactInfo?.website || '',
      motto: institution.motto || '',
      establishedYear: institution.establishedYear ? institution.establishedYear.toString() : ''
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !editingInstitution) return

    setSubmitting(true)
    try {
      const institutionData = {
        name: formData.name,
        shortName: formData.shortName,
        code: formData.code,
        type: formData.type,
        category: formData.category,
        address: {
          street: formData.street,
          city: formData.city,
          region: formData.region,
          country: formData.country,
          postalCode: formData.postalCode
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          website: formData.website
        },
        motto: formData.motto,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined
      }

      const updatedInstitution = await superAdminApi.updateInstitution(editingInstitution.id, institutionData as UpdateInstitutionData)
      setInstitutions(prev => 
        prev.map(inst => inst.id === editingInstitution.id ? updatedInstitution : inst)
      )
      setEditingInstitution(null)
      resetForm()
    } catch (err: unknown) {
      setError((err as Error).message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (institutionId: string) => {
    if (!token || !confirm('Are you sure you want to delete this institution?')) return

    try {
      await superAdminApi.deleteInstitution(institutionId)
      setInstitutions(prev => prev.filter(inst => inst.id !== institutionId))
    } catch (err: unknown) {
      setError((err as Error).message || String(err))
    }
  }

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = 
      institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filterType || institution.type === filterType
    const matchesCategory = !filterCategory || institution.category === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  // Get unique types and categories for filters
  const availableTypes = Array.from(new Set(institutions.map(i => i.type).filter(Boolean)))
  const availableCategories = Array.from(new Set(institutions.map(i => i.category).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Management</h1>
          <p className="text-gray-600 mt-1">Manage educational institutions in the system</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 lg:self-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Institution
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center whitespace-nowrap">
            <Building2 className="h-4 w-4 mr-1" />
            {filteredInstitutions.length} institutions
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <InstitutionSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((institution) => (
            <div key={institution.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={institution.name}>
                        {institution.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {institution.shortName && (
                          <span className="text-sm font-medium text-gray-600">
                            {institution.shortName}
                          </span>
                        )}
                        {institution.type && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(institution.type, institution.category)}`}>
                            {institution.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleEdit(institution)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit institution"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(institution.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete institution"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {institution.motto && (
                    <div className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded">
                      "{institution.motto}"
                    </div>
                  )}

                  {institution.contactInfo?.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{institution.contactInfo.email}</span>
                    </div>
                  )}

                  {institution.contactInfo?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{institution.contactInfo.phone}</span>
                    </div>
                  )}

                  {institution.contactInfo?.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{institution.contactInfo.website}</span>
                    </div>
                  )}

                  {institution.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{formatAddress(institution.address)}</span>
                    </div>
                  )}

                  {institution.establishedYear && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Established {institution.establishedYear}</span>
                    </div>
                  )}

                  {institution._count && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="text-lg font-bold text-blue-600">
                              {institution._count.faculties || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Faculties</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <School className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-lg font-bold text-green-600">
                              {institution._count.schools || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Schools</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Building className="h-4 w-4 text-purple-600 mr-1" />
                            <span className="text-lg font-bold text-purple-600">
                              {institution._count.campuses || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Campuses</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-orange-600 mr-1" />
                            <span className="text-lg font-bold text-orange-600">
                              {institution._count.academicYears || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Academic Years</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredInstitutions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No institutions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by creating a new institution.'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingInstitution) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-10">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  {editingInstitution ? 'Edit Institution' : 'Create New Institution'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingInstitution(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingInstitution ? handleUpdate : handleCreate} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., University of Ghana"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Short Name
                      </label>
                      <input
                        type="text"
                        value={formData.shortName}
                        onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., UG"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution Code
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., UG"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select type</option>
                        <option value="UNIVERSITY">University</option>
                        <option value="COLLEGE">College</option>
                        <option value="INSTITUTE">Institute</option>
                        <option value="ACADEMY">Academy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Established Year
                      </label>
                      <input
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => setFormData({...formData, establishedYear: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1948"
                        min="1800"
                        max="2024"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motto
                    </label>
                    <input
                      type="text"
                      value={formData.motto}
                      onChange={(e) => setFormData({...formData, motto: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Integri Procedamus"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="info@institution.edu.gh"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+233-30-2500381"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.institution.edu.gh"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="University of Ghana, Legon"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Accra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select region</option>
                        <option value="Greater Accra">Greater Accra</option>
                        <option value="Ashanti">Ashanti</option>
                        <option value="Western">Western</option>
                        <option value="Central">Central</option>
                        <option value="Eastern">Eastern</option>
                        <option value="Northern">Northern</option>
                        <option value="Upper East">Upper East</option>
                        <option value="Upper West">Upper West</option>
                        <option value="Volta">Volta</option>
                        <option value="Brong Ahafo">Brong Ahafo</option>
                        <option value="Western North">Western North</option>
                        <option value="Ahafo">Ahafo</option>
                        <option value="Bono">Bono</option>
                        <option value="Bono East">Bono East</option>
                        <option value="Oti">Oti</option>
                        <option value="Savannah">Savannah</option>
                        <option value="North East">North East</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="P.O. Box LG 25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ghana"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 min-w-32"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? 'Saving...' : (editingInstitution ? 'Update Institution' : 'Create Institution')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingInstitution(null)
                      resetForm()
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-initial min-w-24"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}