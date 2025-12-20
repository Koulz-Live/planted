# Plant Care UX - Developer Implementation Guide

## Overview

This guide provides technical implementation details for replicating these UX patterns across other pages (Recipes, Nutrition, etc.).

---

## 🔧 Component Patterns

### 1. **Step Progress Indicator**

**Purpose**: Visual feedback of form completion progress

**Implementation**:
```tsx
{/* Step Indicator */}
<div className="mb-4">
  <div className="d-flex justify-content-between align-items-center">
    {/* Step 1 */}
    <div className="flex-fill">
      <div className="d-flex align-items-center">
        <div className={`badge ${condition ? 'bg-success' : 'bg-secondary'} me-2`}>1</div>
        <span className={`small ${condition ? 'fw-bold' : 'text-muted'}`}>Step Name</span>
      </div>
    </div>
    {/* Repeat for each step */}
  </div>
  
  {/* Progress Bar */}
  <div className="progress mt-2" style={{ height: '4px' }}>
    <div 
      className="progress-bar bg-success" 
      role="progressbar" 
      style={{ width: `${calculatedPercentage}%` }}
      aria-valuenow={calculatedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    ></div>
  </div>
</div>
```

**Reusable Component** (TypeScript):
```tsx
interface StepIndicatorProps {
  steps: Array<{
    label: string;
    completed: boolean;
  }>;
  currentStep?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex-fill">
            <div className="d-flex align-items-center">
              <div className={`badge ${step.completed ? 'bg-success' : 'bg-secondary'} me-2`}>
                {index + 1}
              </div>
              <span className={`small ${step.completed ? 'fw-bold' : 'text-muted'}`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="progress mt-2" style={{ height: '4px' }}>
        <div 
          className="progress-bar bg-success" 
          role="progressbar" 
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
```

**Usage Example**:
```tsx
const steps = [
  { label: 'Your Plant', completed: !!formData.plantName },
  { label: 'Environment', completed: !!formData.country },
  { label: 'Observations', completed: formData.photoUrls.length > 0 },
  { label: 'Care Plan', completed: !!carePlan }
];

<StepIndicator steps={steps} />
```

---

### 2. **Dynamic Helper Text for Button Groups**

**Purpose**: Contextual education without leaving the page

**Implementation**:
```tsx
const [selectedOption, setSelectedOption] = useState<string>('option1');

const helperTexts: Record<string, string> = {
  option1: 'Description for option 1',
  option2: 'Description for option 2',
  option3: 'Description for option 3'
};

return (
  <>
    <div className="btn-group d-flex" role="group">
      {Object.keys(helperTexts).map(option => (
        <button
          key={option}
          type="button"
          className={`btn ${selectedOption === option ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setSelectedOption(option)}
          title={helperTexts[option]}
        >
          {option}
        </button>
      ))}
    </div>
    
    {/* Dynamic Helper Text */}
    <div className="form-text mt-2">
      {helperTexts[selectedOption]}
    </div>
  </>
);
```

**Reusable Component**:
```tsx
interface ButtonGroupWithHelpProps<T extends string> {
  options: Record<T, { label: string; description: string; icon?: string }>;
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function ButtonGroupWithHelp<T extends string>({
  options,
  value,
  onChange,
  name
}: ButtonGroupWithHelpProps<T>) {
  return (
    <>
      <div className="btn-group d-flex" role="group" aria-label={name}>
        {Object.entries(options).map(([key, opt]) => (
          <button
            key={key}
            type="button"
            className={`btn ${value === key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => onChange(key as T)}
            title={(opt as any).description}
          >
            {(opt as any).icon && <span className="me-1">{(opt as any).icon}</span>}
            {(opt as any).label}
          </button>
        ))}
      </div>
      <div className="form-text mt-2">
        {(options[value] as any)?.icon && <span>{(options[value] as any).icon} </span>}
        {(options[value] as any)?.description}
      </div>
    </>
  );
}
```

---

### 3. **Sectioned Form Layout**

**Purpose**: Visual hierarchy and reduced cognitive load

**Implementation**:
```tsx
{/* Section with Visual Container */}
<div className="mb-4 p-3 border rounded bg-light">
  <h6 className="fw-bold mb-3">
    <span className="badge bg-primary me-2" style={{ fontSize: '0.7rem' }}>Step 2</span>
    Section Title
  </h6>
  
  {/* Form fields go here */}
  <div className="row">
    <div className="col-md-6 mb-3">
      {/* Field 1 */}
    </div>
    <div className="col-md-6 mb-3">
      {/* Field 2 */}
    </div>
  </div>
</div>
```

**CSS Classes Used**:
- `.mb-4` - Margin bottom spacing
- `.p-3` - Padding inside section
- `.border` - Light border around section
- `.rounded` - Rounded corners
- `.bg-light` - Light gray background

---

### 4. **Enhanced CTA with Reassurance**

**Purpose**: Build trust and reduce friction

**Implementation**:
```tsx
<div className="d-flex flex-column gap-3">
  {/* Info Text */}
  <div className="text-body-secondary small">
    <svg {/* icon */} />
    AI will generate a <strong>specific outcome</strong> from this form.
  </div>
  
  {/* Primary CTA */}
  <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
    {loading ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" />
        Processing...
      </>
    ) : (
      <>
        <svg {/* icon */} />
        Compelling Action Text
      </>
    )}
  </button>
  
  {/* Reassurance Line */}
  <div className="text-center small text-body-secondary">
    ✓ No login required · ✓ Free · ✓ Takes ~15 seconds
  </div>
</div>
```

**Reusable Pattern**:
```tsx
interface EnhancedCTAProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
  reassuranceItems: string[];
  infoText?: string;
}

export const EnhancedCTA: React.FC<EnhancedCTAProps> = ({
  onClick,
  loading,
  disabled,
  text,
  loadingText,
  reassuranceItems,
  infoText
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      {infoText && (
        <div className="text-body-secondary small">{infoText}</div>
      )}
      
      <button 
        className="btn btn-primary btn-lg" 
        type="button"
        onClick={onClick}
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            {loadingText}
          </>
        ) : text}
      </button>
      
      <div className="text-center small text-body-secondary">
        {reassuranceItems.map((item, i) => (
          <span key={i}>
            {i > 0 && ' · '}✓ {item}
          </span>
        ))}
      </div>
    </div>
  );
};
```

---

### 5. **Dynamic Live Preview**

**Purpose**: Real-time feedback as user fills form

**Implementation**:
```tsx
<p className="mb-0 text-body-secondary">
  {result
    ? '✓ Generated result for your request'
    : formData.key1 && formData.key2
      ? `Your plan is adapting for ${formData.key1} in ${formData.key2}...`
      : 'As you fill in the form, AI drafts in real time.'}
</p>
```

**Reusable Hook**:
```tsx
export function useDynamicPreviewMessage<T extends Record<string, any>>(
  formData: T,
  result: any,
  config: {
    defaultMessage: string;
    activeMessage: (data: T) => string;
    completeMessage: string;
  }
) {
  const hasData = Object.values(formData).some(v => 
    v !== '' && v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  if (result) return config.completeMessage;
  if (hasData) return config.activeMessage(formData);
  return config.defaultMessage;
}

// Usage:
const previewMessage = useDynamicPreviewMessage(
  formData,
  carePlan,
  {
    defaultMessage: 'As you fill in the form, AI drafts in real time.',
    activeMessage: (data) => `Your care plan is adapting for ${data.plantName} in ${data.country}...`,
    completeMessage: '✓ Generated care plan for your plant'
  }
);
```

---

### 6. **Motivational Empty State**

**Purpose**: Turn passive void into action-driving element

**Implementation**:
```tsx
{items.length > 0 ? (
  <ul className="list-unstyled">
    {items.map(item => (
      <li key={item.id}>{/* Item content */}</li>
    ))}
  </ul>
) : (
  <div className="text-center py-4">
    <div className="mb-2" style={{ fontSize: '2.5rem', opacity: 0.3 }}>
      🌱 {/* Relevant emoji */}
    </div>
    <p className="text-body-secondary small mb-2">
      Your saved items will appear here.
    </p>
    <p className="text-body-secondary small mb-0">
      <strong>Start with your first action above</strong>
    </p>
  </div>
)}
```

**Reusable Component**:
```tsx
interface EmptyStateProps {
  icon: string;
  message: string;
  actionText: string;
}

export const MotivationalEmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionText
}) => (
  <div className="text-center py-4">
    <div className="mb-2" style={{ fontSize: '2.5rem', opacity: 0.3 }}>
      {icon}
    </div>
    <p className="text-body-secondary small mb-2">{message}</p>
    <p className="text-body-secondary small mb-0">
      <strong>{actionText}</strong>
    </p>
  </div>
);
```

---

## 📱 Mobile Responsive Patterns

### Vertical Button Stacking

**CSS**:
```css
@media (max-width: 576px) {
  .btn-group {
    flex-direction: column !important;
  }
  
  .btn-group .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.5rem;
  }
}
```

### Content Reordering (Mobile-First)

**CSS**:
```css
@media (max-width: 576px) {
  .page-name .row.g-5 {
    display: flex;
    flex-direction: column-reverse;
  }
  
  .page-name .col-md-4 {
    order: 2; /* Sidebar first on mobile */
  }
  
  .page-name .col-md-8 {
    order: 1; /* Main content second */
  }
}
```

### Sticky CTA (Future Enhancement)

**CSS**:
```css
@media (max-width: 768px) {
  .sticky-cta {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: none;
  }
  
  .sticky-cta.visible {
    display: block;
  }
}
```

**JavaScript** (to activate):
```tsx
useEffect(() => {
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    const stickyBtn = document.querySelector('.sticky-cta');
    
    if (stickyBtn) {
      if (scrollPercent > 50) {
        stickyBtn.classList.add('visible');
      } else {
        stickyBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## ♿ Accessibility Patterns

### ARIA Labels for Progress
```tsx
<div 
  className="progress-bar bg-success" 
  role="progressbar" 
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Form completion progress: 50%"
/>
```

### Semantic HTML
```tsx
<label htmlFor="field-id" className="form-label">
  Field Label
</label>
<input id="field-id" name="fieldName" type="text" />
```

### Keyboard Navigation
```tsx
<button
  type="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Action
</button>
```

---

## 🎨 Design Tokens

### Colors
```css
--primary-color: #0d6efd;      /* Bootstrap primary blue */
--success-color: #198754;      /* Bootstrap success green */
--secondary-color: #6c757d;    /* Bootstrap secondary gray */
--light-bg: #f8f9fa;          /* Light gray backgrounds */
--border-color: #dee2e6;      /* Border color */
```

### Spacing
```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
```

### Typography
```css
--font-size-small: 0.875rem;   /* 14px */
--font-size-base: 1rem;        /* 16px */
--font-size-large: 1.25rem;    /* 20px */
--font-weight-normal: 400;
--font-weight-bold: 700;
```

---

## 🧪 Testing Patterns

### Component Testing (Jest + React Testing Library)
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('should show progress based on completed steps', () => {
    const steps = [
      { label: 'Step 1', completed: true },
      { label: 'Step 2', completed: false }
    ];
    
    render(<StepIndicator steps={steps} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });
  
  it('should mark completed steps with success badge', () => {
    const steps = [
      { label: 'Step 1', completed: true }
    ];
    
    render(<StepIndicator steps={steps} />);
    
    const badge = screen.getByText('1');
    expect(badge).toHaveClass('bg-success');
  });
});
```

### Accessibility Testing
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<PlantCarePage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 📦 Package Dependencies

All patterns use standard Bootstrap 5 classes and React hooks. No additional dependencies required:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "bootstrap": "^5.3.0"
  }
}
```

---

## 🔄 Migration Checklist

To apply these patterns to another page:

- [ ] Add step indicator component at top of form
- [ ] Group related fields into visually distinct sections
- [ ] Add helper text to button groups and complex fields
- [ ] Enhance CTA with personalization and reassurance
- [ ] Make preview sections dynamic and context-aware
- [ ] Transform empty states into motivational messages
- [ ] Add mobile responsive CSS rules
- [ ] Test on mobile devices (vertical stacking, content order)
- [ ] Verify WCAG AA+ compliance (contrast, ARIA labels)
- [ ] Add ethical/trust statement in footer

---

## 📚 Additional Resources

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Don't Make Me Think by Steve Krug](https://sensible.com/dont-make-me-think/)

---

**Built with development clarity in mind** 🛠️
