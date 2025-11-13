import { useState } from 'react';
import { Save, Building2, User, Phone, MapPin, FileText, Mail, Globe, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institution-name" className="flex items-center gap-1">
              Institution Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="institution-name"
              value={institutionData.name}
              onChange={(e) => handleInstitutionChange('name', e.target.value)}
              placeholder="e.g., University of Ghana"
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution-code" className="flex items-center gap-1">
              Institution Code <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="institution-code"
                value={institutionData.code}
                onChange={(e) => handleInstitutionChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., UG, KNUST"
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institution-type" className="flex items-center gap-1">
              Institution Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={institutionData.type}
              onValueChange={(value) => handleInstitutionChange('type', value)}
              disabled={loading}
            >
              <SelectTrigger id="institution-type" className="h-10">
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="established-year">Established Year</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="established-year"
                type="number"
                value={institutionData.establishedYear}
                onChange={(e) => handleInstitutionChange('establishedYear', e.target.value)}
                placeholder="e.g., 1948"
                min="1800"
                max={new Date().getFullYear()}
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Phone className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Contact Information</h3>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-email"
                type="email"
                value={institutionData.contactEmail}
                onChange={(e) => handleInstitutionChange('contactEmail', e.target.value)}
                placeholder="contact@institution.edu"
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact-phone"
                value={institutionData.contactPhone}
                onChange={(e) => handleInstitutionChange('contactPhone', e.target.value)}
                placeholder="+233 XX XXX XXXX"
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="website"
              type="url"
              value={institutionData.website}
              onChange={(e) => handleInstitutionChange('website', e.target.value)}
              placeholder="https://www.institution.edu"
              disabled={loading}
              className="pl-9 h-10"
            />
          </div>
        </div>
      </div>

      {/* Location Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MapPin className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Location Information</h3>
        </div>
        <Separator />

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={institutionData.address}
            onChange={(e) => handleInstitutionChange('address', e.target.value)}
            placeholder="Enter full address"
            rows={3}
            disabled={loading}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={institutionData.city}
              onChange={(e) => handleInstitutionChange('city', e.target.value)}
              placeholder="e.g., Accra"
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Region</Label>
            <Input
              id="state"
              value={institutionData.state}
              onChange={(e) => handleInstitutionChange('state', e.target.value)}
              placeholder="e.g., Greater Accra"
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={institutionData.country}
              onChange={(e) => handleInstitutionChange('country', e.target.value)}
              placeholder="e.g., Ghana"
              disabled={loading}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Description</h3>
        </div>
        <Separator />

        <div className="space-y-2">
          <Label htmlFor="description">Institution Description</Label>
          <Textarea
            id="description"
            value={institutionData.description}
            onChange={(e) => handleInstitutionChange('description', e.target.value)}
            placeholder="Brief description of the institution, its mission, and programs..."
            rows={4}
            disabled={loading}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderAdminForm = () => (
    <div className="space-y-8">
      {/* Admin User Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Admin User Information</h3>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-first-name" className="flex items-center gap-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin-first-name"
              value={adminData.firstName}
              onChange={(e) => handleAdminChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-last-name" className="flex items-center gap-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin-last-name"
              value={adminData.lastName}
              onChange={(e) => handleAdminChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={loading}
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="flex items-center gap-1">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                value={adminData.email}
                onChange={(e) => handleAdminChange('email', e.target.value)}
                placeholder="admin@institution.edu"
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-phone"
                value={adminData.phone}
                onChange={(e) => handleAdminChange('phone', e.target.value)}
                placeholder="+233 XX XXX XXXX"
                disabled={loading}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="flex items-center gap-1">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={adminData.password}
              onChange={(e) => handleAdminChange('password', e.target.value)}
              placeholder="Enter secure password"
              disabled={loading}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters, include uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password" className="flex items-center gap-1">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin-confirm-password"
              type="password"
              value={adminData.confirmPassword}
              onChange={(e) => handleAdminChange('confirmPassword', e.target.value)}
              placeholder="Confirm password"
              disabled={loading}
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================
  // RENDER MAIN COMPONENT
  // ========================================

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'create-with-admin' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="institution" className="gap-2">
                <Building2 className="h-4 w-4" />
                Institution Details
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <User className="h-4 w-4" />
                Admin User
              </TabsTrigger>
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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[140px] gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'edit' ? 'Update Institution' : 'Create Institution'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionForm;



