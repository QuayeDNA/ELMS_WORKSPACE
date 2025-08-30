import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/api-client'
import { InstitutionResponse, CreateInstitutionRequest, UpdateInstitutionRequest, InstitutionType, InstitutionCategory } from '@/types/superadmin/users/user-management-types'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/Skeleton'

interface FormData {
  name: string
  type: InstitutionType
  category: InstitutionCategory
}

export const InstitutionsList: React.FC = () => {
  const { token } = useAuthStore()
  const [institutions, setInstitutions] = useState<InstitutionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<InstitutionResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const hasFetchedRef = useRef(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'university' as InstitutionType,
    category: 'public' as InstitutionCategory
  })

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: 'university' as InstitutionType,
      category: 'public' as InstitutionCategory
    })
  }, [])

  const fetchInstitutions = useCallback(async () => {
    if (!token || hasFetchedRef.current) return

    try {
      setLoading(true)
      setError(null)
      hasFetchedRef.current = true

      const response = await apiClient.get<InstitutionResponse[]>('/superadmin/users/institutions')
      setInstitutions(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch institutions'
      setError(message)
      console.error('Error fetching institutions:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    try {
      const institutionData: CreateInstitutionRequest = {
        name: formData.name,
        type: formData.type,
        category: formData.category
      }

      const newInstitution = await apiClient.post<InstitutionResponse>('/superadmin/users/institutions', institutionData)
      setInstitutions(prev => [...prev, newInstitution])
      setShowCreateModal(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create institution'
      setError(message)
      console.error('Error creating institution:', err)
    } finally {
      setSubmitting(false)
    }
  }, [token, formData, resetForm])

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !editingInstitution) return

    setSubmitting(true)
    try {
      const institutionData: UpdateInstitutionRequest = {
        name: formData.name,
        type: formData.type,
        category: formData.category
      }

      const updatedInstitution = await apiClient.put<InstitutionResponse>(`/superadmin/users/institutions/${editingInstitution.id}`, institutionData)
      setInstitutions(prev => prev.map(inst => inst.id === editingInstitution.id ? updatedInstitution : inst))
      setEditingInstitution(null)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update institution'
      setError(message)
      console.error('Error updating institution:', err)
    } finally {
      setSubmitting(false)
    }
  }, [token, editingInstitution, formData, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!token) return

    if (!confirm('Are you sure you want to delete this institution?')) return

    try {
      await apiClient.delete(`/superadmin/users/institutions/${id}`)
      setInstitutions(prev => prev.filter(inst => inst.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete institution'
      setError(message)
      console.error('Error deleting institution:', err)
    }
  }, [token])

  const startEdit = useCallback((institution: InstitutionResponse) => {
    setEditingInstitution(institution)
    setFormData({
      name: institution.name || '',
      type: (institution.type as InstitutionType) || 'university',
      category: (institution.category as InstitutionCategory) || 'public'
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingInstitution(null)
    resetForm()
  }, [resetForm])

  // Fetch institutions only once when component mounts and token is available
  useEffect(() => {
    if (token && !hasFetchedRef.current) {
      fetchInstitutions()
    }
  }, [token, fetchInstitutions])

  // Reset fetch flag when token changes
  useEffect(() => {
    hasFetchedRef.current = false
  }, [token])

  const filteredInstitutions = institutions.filter(inst =>
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Institutions</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
          <p className="text-muted-foreground">Manage educational institutions in the system</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Institution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: InstitutionType) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="academy">Academy</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value: InstitutionCategory) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Institution
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Institutions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstitutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{institution.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {institution.id}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(institution)}
                    disabled={submitting}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(institution.id)}
                    disabled={submitting}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={institution.category === 'public' ? 'default' : 'secondary'}>
                    {institution.category}
                  </Badge>
                  <Badge variant="outline">
                    {institution.type}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created: {new Date(institution.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingInstitution && (
        <Dialog open={!!editingInstitution} onOpenChange={() => cancelEdit()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Institution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Institution Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: InstitutionType) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="academy">Academy</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value: InstitutionCategory) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Institution
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {filteredInstitutions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No institutions found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first institution.'}
          </p>
        </div>
      )}
    </div>
  )
}