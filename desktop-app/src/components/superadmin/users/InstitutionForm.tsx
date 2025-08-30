import React, { useState, useEffect } from 'react';
import { useInstitutions } from '@/hooks/superadmin/users/user-management-hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { InstitutionResponse, CreateInstitutionRequest, UpdateInstitutionRequest, InstitutionType, InstitutionCategory, InstitutionFormData } from '@/types/superadmin/users/user-management-types';

interface InstitutionFormProps {
  institution?: InstitutionResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData extends InstitutionFormData {}

const initialFormData: FormData = {
  name: '',
  type: 'UNIVERSITY' as InstitutionType,
  category: 'PUBLIC' as InstitutionCategory,
  code: '',
  address: {},
  contactInfo: {},
  logo: '',
  motto: '',
  description: '',
  establishedYear: undefined,
  charter: '',
  accreditation: '',
  affiliations: [],
  timezone: 'Africa/Accra',
  language: 'en',
  currencies: ['GHS'],
  academicCalendar: {},
  customFields: {},
  config: {},
  settings: {},
  isActive: true
};

export const InstitutionForm: React.FC<InstitutionFormProps> = ({
  institution,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createInstitution, updateInstitution, loading, error } = useInstitutions();

  // Populate form when editing
  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        type: institution.type || 'UNIVERSITY',
        category: institution.category || 'PUBLIC',
        code: institution.code || '',
        address: institution.address || {},
        contactInfo: institution.contactInfo || {},
        logo: institution.logo || '',
        motto: institution.motto || '',
        description: institution.description || '',
        establishedYear: institution.establishedYear,
        charter: institution.charter || '',
        accreditation: institution.accreditation || '',
        affiliations: institution.affiliations || [],
        timezone: institution.timezone || 'Africa/Accra',
        language: institution.language || 'en',
        currencies: institution.currencies || ['GHS'],
        academicCalendar: institution.academicCalendar || {},
        customFields: institution.customFields || {},
        config: institution.config || {},
        settings: institution.settings || {},
        isActive: institution.isActive ?? true
      });
    } else {
      setFormData(initialFormData);
    }
  }, [institution]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institution name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Institution name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Institution name must be less than 100 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Institution type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Institution category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (institution) {
        // Update existing institution
        const updateData: UpdateInstitutionRequest = {
          name: formData.name,
          type: formData.type,
          category: formData.category,
          code: formData.code || undefined,
          address: formData.address,
          contactInfo: formData.contactInfo,
          logo: formData.logo || undefined,
          motto: formData.motto || undefined,
          description: formData.description || undefined,
          establishedYear: formData.establishedYear,
          charter: formData.charter || undefined,
          accreditation: formData.accreditation || undefined,
          affiliations: formData.affiliations,
          timezone: formData.timezone,
          language: formData.language,
          currencies: formData.currencies,
          academicCalendar: formData.academicCalendar,
          customFields: formData.customFields,
          config: formData.config,
          settings: formData.settings,
          isActive: formData.isActive
        };
        await updateInstitution(institution.id, updateData);
      } else {
        // Create new institution
        const createData: CreateInstitutionRequest = {
          name: formData.name,
          type: formData.type,
          category: formData.category,
          code: formData.code || undefined,
          address: formData.address,
          contactInfo: formData.contactInfo,
          logo: formData.logo || undefined,
          motto: formData.motto || undefined,
          description: formData.description || undefined,
          establishedYear: formData.establishedYear,
          charter: formData.charter || undefined,
          accreditation: formData.accreditation || undefined,
          affiliations: formData.affiliations,
          timezone: formData.timezone,
          language: formData.language,
          currencies: formData.currencies,
          academicCalendar: formData.academicCalendar,
          customFields: formData.customFields,
          config: formData.config,
          settings: formData.settings,
          isActive: formData.isActive
        };
        await createInstitution(createData);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to submit institution form:', err);
      // Error is already handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const institutionTypes = [
    { value: 'UNIVERSITY', label: 'University' },
    { value: 'COLLEGE', label: 'College' },
    { value: 'POLYTECHNIC', label: 'Polytechnic' },
    { value: 'INSTITUTE', label: 'Institute' }
  ];

  const institutionCategories = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'MISSION', label: 'Mission' }
  ];

  const timezones = [
    { value: 'Africa/Accra', label: 'West Africa (GMT+0)' },
    { value: 'Africa/Lagos', label: 'West Africa (GMT+1)' },
    { value: 'Africa/Nairobi', label: 'East Africa (GMT+3)' },
    { value: 'Africa/Johannesburg', label: 'South Africa (GMT+2)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];

  const currencies = [
    { value: 'GHS', label: 'Ghanaian Cedi (₵)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CHF', label: 'Swiss Franc (Fr)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {institution ? 'Edit Institution' : 'Create New Institution'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  placeholder="Enter institution name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value: string) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: string) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Primary Currency</Label>
                  <Select
                    value={formData.currencies?.[0] || 'GHS'}
                    onValueChange={(value: string) => handleInputChange('currencies', [value])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex items-center gap-2"
            >
              {isSubmitting || loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {institution ? 'Update Institution' : 'Create Institution'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
