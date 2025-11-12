import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentIdConfig,
  createStudentIdConfig,
  updateStudentIdConfig,
  previewStudentIdConfig,
} from '@/services/studentIdConfig.service';
import {
  StudentIdFormat,
  StudentIdYearPosition,
  CreateStudentIdConfigDTO,
} from '@/types/studentIdConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Settings, Eye } from 'lucide-react';

export default function StudentIdConfigPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const institutionId = user?.institutionId || 0;

  // Form state
  const [format, setFormat] = useState<StudentIdFormat>('SEQUENTIAL');
  const [prefix, setPrefix] = useState('');
  const [useAcademicYear, setUseAcademicYear] = useState(false);
  const [academicYearPos, setAcademicYearPos] = useState<StudentIdYearPosition>('MIDDLE');
  const [separator, setSeparator] = useState('/');
  const [paddingLength, setPaddingLength] = useState(6);
  const [startNumber, setStartNumber] = useState(1);
  const [pattern, setPattern] = useState('');
  const [previewExample, setPreviewExample] = useState('');

  // Fetch existing configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['student-id-config', institutionId],
    queryFn: () => getStudentIdConfig(institutionId),
    enabled: !!institutionId,
  });

  // Load existing config into form
  useEffect(() => {
    if (config) {
      setFormat(config.format);
      setPrefix(config.prefix || '');
      setUseAcademicYear(config.useAcademicYear);
      setAcademicYearPos(config.academicYearPos || 'MIDDLE');
      setSeparator(config.separator || '/');
      setPaddingLength(config.paddingLength);
      setStartNumber(config.startNumber);
      setPattern(config.pattern || '');
      setPreviewExample(config.example || '');
    }
  }, [config]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createStudentIdConfig,
    onSuccess: () => {
      toast.success('Student ID configuration created successfully');
      queryClient.invalidateQueries({ queryKey: ['student-id-config'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create configuration: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateStudentIdConfigDTO) => updateStudentIdConfig(institutionId, data),
    onSuccess: () => {
      toast.success('Student ID configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student-id-config'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: previewStudentIdConfig,
    onSuccess: (data) => {
      setPreviewExample(data.example);
      toast.success('Preview updated');
    },
  });

  // Handle preview
  const handlePreview = () => {
    const data: CreateStudentIdConfigDTO = {
      institutionId,
      format,
      prefix: prefix || undefined,
      useAcademicYear,
      academicYearPos: useAcademicYear ? academicYearPos : undefined,
      separator: separator || undefined,
      paddingLength,
      startNumber,
      pattern: format === 'CUSTOM' ? pattern : undefined,
    };

    previewMutation.mutate(data);
  };

  // Handle save
  const handleSave = () => {
    const data: CreateStudentIdConfigDTO = {
      institutionId,
      format,
      prefix: prefix || undefined,
      useAcademicYear,
      academicYearPos: useAcademicYear ? academicYearPos : undefined,
      separator: separator || undefined,
      paddingLength,
      startNumber,
      pattern: format === 'CUSTOM' ? pattern : undefined,
    };

    if (config) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Student ID Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure how student IDs/index numbers are generated for your institution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ID Generation Settings</CardTitle>
            <CardDescription>
              Define the format and rules for generating student identification numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">ID Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as StudentIdFormat)}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEQUENTIAL">Sequential (e.g., 0721000001)</SelectItem>
                  <SelectItem value="ACADEMIC_YEAR">Academic Year (e.g., BT/ITS/24/001)</SelectItem>
                  <SelectItem value="CUSTOM">Custom Pattern</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {format === 'SEQUENTIAL' && 'Simple sequential numbering with optional prefix'}
                {format === 'ACADEMIC_YEAR' && 'Include academic year in the student ID'}
                {format === 'CUSTOM' && 'Define your own pattern using placeholders'}
              </p>
            </div>

            {/* Prefix */}
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={format === 'SEQUENTIAL' ? '0721' : 'BT/ITS'}
              />
              <p className="text-sm text-muted-foreground">
                The prefix that appears at the beginning of the student ID
              </p>
            </div>

            {/* Academic Year Toggle */}
            {format !== 'SEQUENTIAL' && (
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="use-year">Include Academic Year</Label>
                  <p className="text-sm text-muted-foreground">
                    Add the academic year to the student ID
                  </p>
                </div>
                <Switch
                  id="use-year"
                  checked={useAcademicYear}
                  onCheckedChange={setUseAcademicYear}
                />
              </div>
            )}

            {/* Year Position */}
            {useAcademicYear && format !== 'SEQUENTIAL' && (
              <div className="space-y-2">
                <Label htmlFor="year-pos">Year Position</Label>
                <Select
                  value={academicYearPos}
                  onValueChange={(value) => setAcademicYearPos(value as StudentIdYearPosition)}
                >
                  <SelectTrigger id="year-pos">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREFIX">Beginning (24/BT/ITS/001)</SelectItem>
                    <SelectItem value="MIDDLE">Middle (BT/ITS/24/001)</SelectItem>
                    <SelectItem value="SUFFIX">End (BT/ITS/001/24)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Separator */}
            {format !== 'SEQUENTIAL' && (
              <div className="space-y-2">
                <Label htmlFor="separator">Separator</Label>
                <Input
                  id="separator"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="/"
                  maxLength={3}
                />
                <p className="text-sm text-muted-foreground">
                  Character(s) used to separate ID components (e.g., "/", "-")
                </p>
              </div>
            )}

            {/* Padding Length */}
            <div className="space-y-2">
              <Label htmlFor="padding">Sequence Number Length</Label>
              <Input
                id="padding"
                type="number"
                value={paddingLength}
                onChange={(e) => setPaddingLength(parseInt(e.target.value) || 6)}
                min={1}
                max={10}
              />
              <p className="text-sm text-muted-foreground">
                Number of digits for the sequence (e.g., 6 = 000001)
              </p>
            </div>

            {/* Start Number */}
            <div className="space-y-2">
              <Label htmlFor="start">Starting Number</Label>
              <Input
                id="start"
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                min={1}
              />
              <p className="text-sm text-muted-foreground">
                The first number in the sequence
              </p>
            </div>

            {/* Custom Pattern */}
            {format === 'CUSTOM' && (
              <div className="space-y-2">
                <Label htmlFor="pattern">Custom Pattern</Label>
                <Input
                  id="pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="{PREFIX}/{YEAR}/{SEQ}"
                />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Available placeholders: {'{PREFIX}'}, {'{YEAR}'}, {'{PROGRAM}'}, {'{SEQ}'}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handlePreview} variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {config ? 'Update Configuration' : 'Create Configuration'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your student IDs will look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewExample ? (
              <>
                <div className="p-6 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Example Student ID:</p>
                  <p className="text-3xl font-mono font-bold">{previewExample}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Pattern:</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {format === 'SEQUENTIAL' && '{PREFIX}{SEQUENCE}'}
                    {format === 'ACADEMIC_YEAR' &&
                      academicYearPos === 'PREFIX' &&
                      `{YEAR}${separator}{PREFIX}${separator}{SEQUENCE}`}
                    {format === 'ACADEMIC_YEAR' &&
                      academicYearPos === 'MIDDLE' &&
                      `{PREFIX}${separator}{YEAR}${separator}{SEQUENCE}`}
                    {format === 'ACADEMIC_YEAR' &&
                      academicYearPos === 'SUFFIX' &&
                      `{PREFIX}${separator}{SEQUENCE}${separator}{YEAR}`}
                    {format === 'CUSTOM' && (pattern || 'Not defined')}
                  </p>
                </div>

                {config && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Current sequence: {config.currentNumber}
                      <br />
                      Next ID: {previewExample.replace(/\d+$/, config.currentNumber.toString().padStart(paddingLength, '0'))}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="p-6 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Click "Preview" to see how your student IDs will look
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sequential Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Simple numbering: 0721000001, 0721000002, etc. Best for straightforward systems.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Academic Year Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Includes year info: BT/ITS/24/001. Helps identify student cohorts easily.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custom Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Full control with placeholders. Perfect for unique institutional requirements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
