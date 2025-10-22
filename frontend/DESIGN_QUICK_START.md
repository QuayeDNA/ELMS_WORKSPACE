# 🎨 ELMS Design System - Quick Start

## 🚀 View the Showcase

```powershell
# Start dev server
npm run dev

# Then visit:
# http://localhost:5173/showcase
```

## 📖 Key Files

| File | Purpose |
|------|---------|
| `src/lib/design-tokens.ts` | All design tokens (colors, spacing, typography) |
| `src/pages/ComponentShowcase.tsx` | Component showcase page |
| `src/index.css` | CSS variables for theme |

## 💡 Quick Examples

### Using Colors
```tsx
import { colors } from '@/lib/design-tokens';

<div style={{ color: colors.primary[600] }}>Blue Text</div>
<div className="bg-blue-600 text-white">Tailwind Blue</div>
```

### Using Design Tokens
```tsx
import { spacing, typography } from '@/lib/design-tokens';

<div style={{
  padding: spacing.lg,
  fontSize: typography.fontSize.xl
}}>
  Content
</div>
```

### Role Badges
```tsx
import { roleColors } from '@/lib/design-tokens';
import { Badge } from '@/components/ui/badge';

<Badge className={`${roleColors.ADMIN.bg} ${roleColors.ADMIN.text}`}>
  Admin
</Badge>
```

## 📚 Full Documentation

- **Complete Design System**: See `../ELMS_UI_DESIGN_SYSTEM.md`
- **Implementation Guide**: See `../ELMS_DESIGN_IMPLEMENTATION_GUIDE.md`
- **Setup Status**: See `../DESIGN_SETUP_COMPLETE.md`

## 🎯 Current Theme

**Academic Blue** (`#2563eb`)
- Professional and trustworthy
- Excellent accessibility
- Academic tradition

## ✅ What's Ready

- ✅ Blue theme applied
- ✅ Inter font loaded
- ✅ Design tokens created
- ✅ Component showcase at `/showcase`
- ✅ Foundation for theme customization

Start building! 🚀
