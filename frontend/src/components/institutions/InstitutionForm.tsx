import { useState } from 'react';
import { X, Save, Building2, User, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  InstitutionFormData,
  AdminFormData,
  INSTITUTION_TYPE_OPTIONS,
} from '@/types/institution';
import { institutionService } from '@/services/institution.service';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionFormProps {
  mode: 'create' | 'edit' | 'create-with-admin';
  initialData?: Partial<InstitutionFormData>;
  onSubmit: (data: InstitutionFormData, adminData?: AdminFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: InstitutionFormProps) => {
  // Form state
  const [institutionData, setInstitutionData] = useState<InstitutionFormData>({
    ...institutionService.getEmptyInstitutionForm(),
    ...initialData,
  });

  const [adminData, setAdminData] = useState<AdminFormData>(
    institutionService.getEmptyAdminForm()
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('institution');

  // ========================================
  // FORM HANDLERS
  // ========================================

  const handleInstitutionChange = (field: keyof InstitutionFormData, value: string) => {
    setInstitutionData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleAdminChange = (field: keyof AdminFormData, value: string) => {
    setAdminData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate institution form
    const institutionErrors = institutionService.validateInstitutionForm(institutionData);
    let allErrors = Object.values(institutionErrors);

    // Validate admin form if needed
    if (mode === 'create-with-admin') {
      const adminErrors = institutionService.validateAdminForm(adminData);
      allErrors = [...allErrors, ...Object.values(adminErrors)];
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    // Submit form
    if (mode === 'create-with-admin') {
      onSubmit(institutionData, adminData);
    } else {
      onSubmit(institutionData);
    }
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderInstitutionForm = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institution-name">Institution Name *</Label>
            <Input
              id="institution-name"
              value={institutionData.name}
              onChange={(e) => handleInstitutionChange('name', e.target.value)}
              placeholder="Enter institution name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution-code">Institution Code *</Label>
            <Input
              id="institution-code"
              value={institutionData.code}
              onChange={(e) => handleInstitutionChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., UG, KNUST"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institution-type">Institution Type *</Label>
            <Select
              value={institutionData.type}
              onValueChange={(value) => handleInstitutionChange('type', value)}
              disabled={loading}
            >
              <SelectTrigger id="institution-type">
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-500">{option.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="established-year">Established Year</Label>
            <Input
              id="established-year"
              type="number"
              value={institutionData.establishedYear}
              onChange={(e) => handleInstitutionChange('establishedYear', e.target.value)}
              placeholder="e.g., 1948"
              min="1800"
              max={new Date().getFullYear()}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Information
        </h3>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={institutionData.address}
            onChange={(e) => handleInstitutionChange('address', e.target.value)}
            placeholder="Enter full address"
            rows={2}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={institutionData.city}
              onChange={(e) => handleInstitutionChange('city', e.target.value)}
              placeholder="Enter city"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Region</Label>
            <Input
              id="state"
              value={institutionData.state}
              onChange={(e) => handleInstitutionChange('state', e.target.value)}
              placeholder="Enter state or region"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={institutionData.country}
              onChange={(e) => handleInstitutionChange('country', e.target.value)}
              placeholder="Enter country"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={institutionData.contactEmail}
              onChange={(e) => handleInstitutionChange('contactEmail', e.target.value)}
              placeholder="contact@institution.edu"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact Phone</Label>
            <Input
              id="contact-phone"
              value={institutionData.contactPhone}
              onChange={(e) => handleInstitutionChange('contactPhone', e.target.value)}
              placeholder="+1234567890"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={institutionData.website}
            onChange={(e) => handleInstitutionChange('website', e.target.value)}
            placeholder="https://www.institution.edu"
            disabled={loading}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Description
        </h3>

        <div className="space-y-2">
          <Label htmlFor="description">Institution Description</Label>
          <Textarea
            id="description"
            value={institutionData.description}
            onChange={(e) => handleInstitutionChange('description', e.target.value)}
            placeholder="Brief description of the institution..."
            rows={4}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  const renderAdminForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin User Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-first-name">First Name *</Label>
            <Input
              id="admin-first-name"
              value={adminData.firstName}
              onChange={(e) => handleAdminChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-last-name">Last Name *</Label>
            <Input
              id="admin-last-name"
              value={adminData.lastName}
              onChange={(e) => handleAdminChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Address *</Label>
            <Input
              id="admin-email"
              type="email"
              value={adminData.email}
              onChange={(e) => handleAdminChange('email', e.target.value)}
              placeholder="admin@institution.edu"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-phone">Phone Number</Label>
            <Input
              id="admin-phone"
              value={adminData.phone}
              onChange={(e) => handleAdminChange('phone', e.target.value)}
              placeholder="+1234567890"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password *</Label>
            <Input
              id="admin-password"
              type="password"
              value={adminData.password}
              onChange={(e) => handleAdminChange('password', e.target.value)}
              placeholder="Enter secure password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password">Confirm Password *</Label>
            <Input
              id="admin-confirm-password"
              type="password"
              value={adminData.confirmPassword}
              onChange={(e) => handleAdminChange('confirmPassword', e.target.value)}
              placeholder="Confirm password"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================
  // RENDER MAIN COMPONENT
  // ========================================

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Institution';
      case 'edit':
        return 'Edit Institution';
      case 'create-with-admin':
        return 'Create Institution with Admin';
      default:
        return 'Institution Form';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            {mode === 'create-with-admin' ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="institution">Institution Details</TabsTrigger>
                  <TabsTrigger value="admin">Admin User</TabsTrigger>
                </TabsList>
                <TabsContent value="institution" className="mt-6">
                  {renderInstitutionForm()}
                </TabsContent>
                <TabsContent value="admin" className="mt-6">
                  {renderAdminForm()}
                </TabsContent>
              </Tabs>
            ) : (
              renderInstitutionForm()
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Institution' : 'Create Institution'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionForm;



