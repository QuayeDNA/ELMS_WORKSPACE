# PowerShell script to fix all staff creation patterns in seed.ts

$seedFile = "prisma/seed.ts"
$content = Get-Content $seedFile -Raw

# Define staff type mappings based on roles
$staffMappings = @{
    'DEPARTMENT_HEAD' = 'MANAGEMENT'
    'PROGRAM_COORDINATOR' = 'ADMINISTRATIVE'
    'ACADEMIC_OFFICER' = 'ADMINISTRATIVE'
    'EXAM_OFFICER' = 'ADMINISTRATIVE'
    'COMPLIANCE_INSPECTOR' = 'ADMINISTRATIVE'
    'INVIGILATOR' = 'SUPPORT'
    'STUDENT_HALL_ADMIN' = 'ADMINISTRATIVE'
    'SECURITY_OFFICER' = 'SECURITY'
    'IT_SUPPORT' = 'TECHNICAL'
    'LECTURER' = 'TECHNICAL'
    'FINANCE_OFFICER' = 'ADMINISTRATIVE'
}

# Function to replace staff patterns
function Replace-StaffPattern {
    param($employeeId, $staffType)
    
    # Pattern to match the old staff structure
    $oldPattern = "staff: \{\s*create: \{\s*employeeId: '$employeeId',\s*staffNumber: '[^']+',\s*department: '[^']+',\s*hireDate: ([^,]+),\s*status: '[^']+',\s*qualification: \[[^\]]+\],\s*specialization: \[[^\]]+\]\s*\}\s*\}"
    
    # New staff structure
    $newPattern = @"
staff: {
        create: {
          employeeId: '$employeeId',
          staffType: '$staffType',
          startDate: `$1,
          contractType: 'PERMANENT',
          workSchedule: {
            type: 'full-time',
            hoursPerWeek: 40,
            workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        }
      }
"@
    
    $script:content = $script:content -replace $oldPattern, $newPattern
}

# Apply replacements for each staff type
Replace-StaffPattern 'UG-CS-001' 'MANAGEMENT'
Replace-StaffPattern 'UG-CS-002' 'ADMINISTRATIVE'
Replace-StaffPattern 'UG-AO-001' 'ADMINISTRATIVE'
Replace-StaffPattern 'UG-EXAM-001' 'ADMINISTRATIVE'
Replace-StaffPattern 'UG-CI-001' 'ADMINISTRATIVE'
Replace-StaffPattern 'UG-INV-001' 'SUPPORT'
Replace-StaffPattern 'UG-SH-001' 'ADMINISTRATIVE'
Replace-StaffPattern 'UG-SEC-001' 'SECURITY'
Replace-StaffPattern 'UG-IT-001' 'TECHNICAL'
Replace-StaffPattern 'UG-CS-003' 'TECHNICAL'
Replace-StaffPattern 'UG-BUS-001' 'ADMINISTRATIVE'

# Write the updated content back
Set-Content $seedFile $content

Write-Host "Staff patterns fixed successfully!"
