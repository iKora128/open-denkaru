# Design System Architecture

## Overview

Open Denkaru uses a sophisticated design system inspired by Apple's Human Interface Guidelines combined with cutting-edge Liquid Glass aesthetics. The system prioritizes medical professional usability with iPhone-like smoothness and elegant simplicity.

## Design Philosophy

### Core Principles

1. **Medical-First UX**: Every interaction optimized for healthcare workflows
2. **Elegant Simplicity**: Clean, uncluttered interfaces that reduce cognitive load
3. **iPhone-like Fluidity**: Smooth animations and responsive interactions
4. **Professional Aesthetics**: Sophisticated visual hierarchy without SaaS clutter

### Anti-Patterns to Avoid

- ❌ Cluttered SaaS dashboards with overwhelming information density
- ❌ Heavy, complex UI that slows down medical workflows
- ❌ Inconsistent interaction patterns
- ❌ Poor accessibility for medical professionals under stress

## Visual Language

### Color System

#### Primary Palette (Apple-Inspired)
```css
apple-blue: #007AFF     /* Primary action color */
apple-green: #34C759    /* Success/normal status */
apple-orange: #FF9500   /* Warning status */
apple-red: #FF3B30      /* Critical/error status */
apple-purple: #AF52DE   /* Accent color */
```

#### System Grays (Apple HIG)
```css
system-gray-50: #F9F9F9   /* Lightest background */
system-gray-100: #F2F2F7  /* Card backgrounds */
system-gray-200: #E5E5EA  /* Borders */
system-gray-600: #8E8E93  /* Secondary text */
system-gray-900: #1C1C1E  /* Primary text */
```

#### Medical Status Colors
```css
medical-success: #34C759   /* Normal vitals */
medical-warning: #FF9500   /* Attention needed */
medical-error: #FF3B30     /* Critical condition */
medical-info: #007AFF      /* Information */
medical-critical: #FF2D92  /* Emergency */
```

### Typography

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
```

#### Scale (Apple 4pt Grid)
- **Display**: 32px, 28px (Page headers)
- **Heading**: 24px, 20px (Section headers)
- **Body**: 16px (Standard text)
- **Caption**: 14px, 12px (Secondary text)

### Spacing System

Based on Apple's 4pt grid system:
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

## Liquid Glass Components

### Glass Morphism Implementation

#### Primary Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

#### Interactive Elements
```css
.glass-button {
  backdrop-filter: blur(12px) saturate(160%);
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.glass-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.glass-button:active {
  transform: translateY(0);
  scale: 0.98;
}
```

### Animation System

#### Timing Functions (Apple-Inspired)
```css
--timing-apple: cubic-bezier(0.25, 0.1, 0.25, 1);
--timing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Standard Animations
```typescript
// Slide in from bottom (iOS-style)
const slideInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
};

// Scale in (for modals)
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
};

// Spring bounce (for interactions)
const bounceIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }
};
```

## Component Architecture

### Base Components

#### Button System
```typescript
// Variants for different use cases
type ButtonVariant = 
  | 'default'     // Primary actions
  | 'secondary'   // Secondary actions
  | 'destructive' // Delete/critical actions
  | 'outline'     // Minimal style
  | 'ghost'       // Text-based
  | 'success'     // Medical success
  | 'warning'     // Medical warning
  | 'premium';    // Special gradient
```

#### Card System
```typescript
// Medical-specific card types
<PatientCard 
  patient={{ name, age, status, lastVisit }}
  hover={true}
  className="status-indicator-left"
/>

<VitalCard
  value="120/80"
  label="血圧"
  unit="mmHg"
  status="normal"
  trend="stable"
/>
```

### Medical-Specific Components

#### Status Indicators
```typescript
type MedicalStatus = 'normal' | 'warning' | 'critical' | 'info';

const StatusBadge = ({ status, children }) => (
  <span className={`status-indicator status-${status}`}>
    {children}
  </span>
);
```

#### Form Elements
```typescript
// Floating label inputs with glass effect
<Input
  label="患者名"
  glass={true}
  leftIcon={<UserIcon />}
  error={errors.name?.message}
/>

// Medical-specific inputs
<SearchInput placeholder="患者を検索..." />
<PatientIdInput placeholder="患者番号を入力" />
```

## Layout System

### Grid System
```css
/* Responsive medical grid */
.medical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Card grid for patient lists */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

### Navigation Structure
```typescript
// Sidebar navigation with glass effect
const NavigationItem = ({ icon, label, active, href }) => (
  <Link 
    href={href}
    className={`nav-link ${active ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);
```

## Accessibility Standards

### Medical Compliance
- **WCAG 2.1 AA**: Minimum standard for medical applications
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Color Contrast**: 4.5:1 minimum for all text
- **Screen Readers**: Proper ARIA labels and descriptions

### Keyboard Navigation
```typescript
// Focus management for medical workflows
const useFocusManagement = () => {
  const trapFocus = (element) => {
    // Implement focus trapping for modals
  };
  
  const restoreFocus = (previousElement) => {
    // Restore focus after modal close
  };
};
```

## Performance Guidelines

### Medical Application Requirements
- **Initial Load**: < 2 seconds
- **Page Transitions**: < 300ms
- **Form Interactions**: < 100ms response time
- **Search Results**: < 500ms

### Optimization Strategies
```typescript
// Lazy loading for non-critical components
const PatientChart = lazy(() => import('./PatientChart'));

// Memoization for expensive calculations
const VitalStats = memo(({ vitals }) => {
  const calculatedStats = useMemo(() => 
    calculateVitalStatistics(vitals), [vitals]
  );
  
  return <VitalDisplay stats={calculatedStats} />;
});
```

## Dark Mode Support

### Automatic Theme Detection
```css
:root {
  --color-background: theme('colors.white');
  --color-foreground: theme('colors.system.gray.900');
}

.dark {
  --color-background: theme('colors.system.gray.900');
  --color-foreground: theme('colors.white');
}
```

### Glass Effect Adaptation
```css
/* Light mode glass */
.glass {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dark mode glass */
.dark .glass {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Medical UI Patterns

### Patient Information Display
```typescript
// Standardized patient card layout
const PatientCard = ({ patient }) => (
  <Card hover className="patient-card">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>{patient.fullName}</CardTitle>
          <CardDescription>
            {patient.age}歳 • {patient.gender}
          </CardDescription>
        </div>
        <StatusBadge status={patient.status}>
          {getStatusLabel(patient.status)}
        </StatusBadge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div>患者番号: {patient.patientNumber}</div>
        <div>最終来院: {formatDate(patient.lastVisit)}</div>
      </div>
    </CardContent>
  </Card>
);
```

### Vital Signs Display
```typescript
// Standardized vital signs layout
const VitalSigns = ({ vitals }) => (
  <div className="medical-grid">
    <VitalCard
      value={vitals.bloodPressure}
      label="血圧"
      unit="mmHg"
      status={getBloodPressureStatus(vitals.bloodPressure)}
    />
    <VitalCard
      value={vitals.heartRate}
      label="心拍数"
      unit="bpm"
      status={getHeartRateStatus(vitals.heartRate)}
    />
    <VitalCard
      value={vitals.temperature}
      label="体温"
      unit="°C"
      status={getTemperatureStatus(vitals.temperature)}
    />
  </div>
);
```

## Future Enhancements

### Liquid Glass Evolution
- **Advanced Blur Effects**: Variable blur intensity based on content priority
- **Interactive Glass**: Glass that responds to hover with ripple effects
- **Contextual Transparency**: Adaptive opacity based on background content

### Medical-Specific Innovations
- **Smart Status Colors**: AI-driven color adjustments based on patient risk
- **Gesture Navigation**: Touch-friendly interfaces for tablet use
- **Voice Integration**: Hands-free interaction for sterile environments

This design system ensures that Open Denkaru provides a premium, medical-professional experience that rivals the best consumer applications while meeting the specific needs of healthcare workflows.