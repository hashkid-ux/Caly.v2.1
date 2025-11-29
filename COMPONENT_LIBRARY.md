# Caly UI Component Library - Complete Reference

## Overview
Complete reusable component library for Caly admin dashboard. All components follow a consistent design system and support responsive design patterns.

---

## Quick Import Guide

```javascript
// Import components from the index
import { 
  PageHeader, Breadcrumb, Sidebar, UserMenu,
  DataTable, Pagination, SearchBar,
  TextInput, Select, Form, FormActions,
  Button, Card, Badge, Modal,
  Accordion, EmptyState
} from '../components';
```

---

## Navigation Components

### Breadcrumb
Shows current location and navigation path.
```jsx
import { Breadcrumb } from '../components';

<Breadcrumb />
```
- Auto-generates from route path
- Hidden on auth pages
- Clickable navigation

### PageHeader
Consistent header for all pages with title, subtitle, and actions.
```jsx
<PageHeader 
  title="Dashboard"
  subtitle="Welcome back"
  showBackButton={true}
  actions={<UserMenu />}
/>
```
- Auto back button on detail pages
- Responsive sizing
- Mobile-friendly

### Sidebar
Navigation sidebar with collapsible design.
```jsx
<Sidebar 
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
  onLogout={handleLogout}
/>
```
- Hidden on mobile (shows at md+ screens)
- Active route highlighting
- Fixed positioning

### UserMenu
Profile dropdown menu.
```jsx
<UserMenu />
```
- User avatar with initials
- Quick access to Settings, Profile, Logout
- Click-outside detection

### MobileNavigation
Bottom navigation bar for mobile screens.
```jsx
<MobileNavigation />
```
- Only visible on mobile
- 4 main navigation items
- Active state highlighting

---

## Data Display Components

### DataTable
Display tabular data with sorting and responsive views.
```jsx
<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'phone', label: 'Phone', render: (val) => val || 'N/A' }
  ]}
  data={calls}
  onSort={(key, direction) => handleSort(key, direction)}
  onRowClick={(row) => console.log(row)}
  loading={isLoading}
/>
```
- Desktop: full table view
- Mobile: card view with labels
- Sorting support
- Custom rendering

### Pagination
Navigate through large datasets.
```jsx
<Pagination
  currentPage={page}
  totalPages={Math.ceil(total / itemsPerPage)}
  totalItems={total}
  itemsPerPage={itemsPerPage}
  onPageChange={setPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```
- Smart page number display
- Items per page selector
- Results counter

### SearchBar
Search with optional filtering.
```jsx
<SearchBar
  placeholder="Search calls..."
  value={searchTerm}
  onSearch={setSearchTerm}
  onClear={() => setSearchTerm('')}
  showFilter={true}
  filters={[
    { 
      key: 'status', 
      label: 'Status',
      type: 'select',
      options: [{value: 'active', label: 'Active'}],
      onChange: (val) => setStatus(val)
    }
  ]}
/>
```
- Real-time search
- Multiple filter types: select, checkbox, date-range
- Clear button

---

## Form Components

### TextInput
Text input with validation and icons.
```jsx
<TextInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChange={setEmail}
  error={emailError}
  success={emailValid}
  helpText="We'll never share your email"
  required={true}
  icon={MailIcon}
/>
```

### PasswordInput
Password field with show/hide toggle.
```jsx
<PasswordInput
  label="Password"
  value={password}
  onChange={setPassword}
  error={passwordError}
  required={true}
/>
```

### Textarea
Multi-line text input.
```jsx
<Textarea
  label="Description"
  placeholder="Enter description"
  value={description}
  onChange={setDescription}
  rows={4}
  error={error}
/>
```

### Select
Dropdown selector.
```jsx
<Select
  label="Category"
  options={[
    {value: 'a', label: 'Category A'},
    {value: 'b', label: 'Category B'}
  ]}
  value={category}
  onChange={setCategory}
  error={error}
/>
```

### Checkbox
Single or multiple checkboxes.
```jsx
<Checkbox
  label="I agree to terms"
  checked={agreed}
  onChange={setAgreed}
  description="You accept our terms and conditions"
/>
```

### RadioGroup
Radio button group.
```jsx
<RadioGroup
  label="Choose option"
  value={selected}
  onChange={setSelected}
  options={[
    {value: 'opt1', label: 'Option 1'},
    {value: 'opt2', label: 'Option 2'}
  ]}
/>
```

### Form Container
Wrapper for form layouts.
```jsx
<Form layout="vertical" gap="gap-6" onSubmit={handleSubmit}>
  <FormSection title="Personal Info">
    <TextInput label="Name" />
    <TextInput label="Email" />
  </FormSection>
  
  <FormSection title="Settings">
    <Checkbox label="Marketing emails" />
  </FormSection>

  <FormActions 
    submitLabel="Save Changes"
    onSubmit={handleSubmit}
    onCancel={handleCancel}
  />
</Form>
```

---

## Display Components

### Card
Flexible content container.
```jsx
<Card
  title="Card Title"
  subtitle="Optional subtitle"
  padding="p-6"
  hover={true}
  onClick={() => navigate('/detail')}
>
  Card content here
  <Card.footer>Footer content</Card.footer>
</Card>
```

### Badge
Status badges.
```jsx
<Badge
  label="Active"
  variant="success"
  size="md"
  icon={CheckCircle}
  dismissible={true}
/>
```
Variants: default, primary, success, warning, danger, info

### Button
Clickable buttons.
```jsx
<Button
  label="Save"
  onClick={handleSave}
  variant="primary"
  size="md"
  loading={isLoading}
  icon={SaveIcon}
/>
```
Variants: primary, secondary, danger, success, outline, ghost

### Accordion
Expandable sections.
```jsx
<Accordion
  multiple={false}
  items={[
    {
      title: 'Section 1',
      content: 'Content here'
    },
    {
      title: 'Section 2',
      content: <CustomComponent />
    }
  ]}
/>
```

---

## Feedback Components

### Modal
Dialog boxes.
```jsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Delete"
  size="md"
  closeOnBackdrop={true}
>
  Are you sure?
  <Modal.actions={[
    { label: 'Cancel', onClick: () => {}, variant: 'outline' },
    { label: 'Delete', onClick: handleDelete, variant: 'danger' }
  ]}
</Modal>
```

### Toast Notifications
Show temporary alerts.
```jsx
const { toasts, success, error, info, ToastContainer } = useToast();

// In render:
<ToastContainer toasts={toasts} />

// To show:
success('Changes saved!');
error('Something went wrong');
```

### EmptyState
Show when no data available.
```jsx
<EmptyState
  title="No calls yet"
  description="Start making calls to see them here"
  variant="empty"
  action={{
    label: 'Get Started',
    onClick: () => navigate('/setup')
  }}
/>
```

### LoadingSkeleton
Loading placeholders.
```jsx
import { TableSkeleton, CardSkeleton, TextSkeleton } from '../components';

<TableSkeleton rows={5} columns={4} />
<CardSkeleton count={4} />
<TextSkeleton lines={3} />
```

---

## Usage Patterns

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>
```

### Form Validation
```jsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (val) => {
  if (!val.includes('@')) setEmailError('Invalid email');
  else setEmailError('');
};

<TextInput
  value={email}
  onChange={(val) => {
    setEmail(val);
    validateEmail(val);
  }}
  error={emailError}
/>
```

### Loading States
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  await api.save(data);
  setLoading(false);
  success('Saved!');
};

<Button label="Save" onClick={handleSubmit} loading={loading} />
```

---

## Responsive Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

Use Tailwind classes: `md:`, `lg:`, `xl:` prefixes

---

## Accessibility Features
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Focus ring visibility
- ✅ Color contrast compliance
- ✅ Form validation messages
- ✅ Error announcements

---

## Design System Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Gray: #6B7280

---

## Component Status Summary
✅ Phase 1: Navigation (Breadcrumb, PageHeader, Sidebar, UserMenu)
✅ Phase 2: Mobile & Responsive (MobileNav, responsive layouts, skeletons)
✅ Phase 3: Data Display (DataTable, Pagination, SearchBar, Badge, Card)
✅ Phase 4: Forms (TextInput, Select, Textarea, Form wrapper)
✅ Feedback (Modal, Toast, EmptyState)

---

**Last Updated**: Phase 4 Complete (Form Components)
**Next**: Phase 5 - Accessibility & i18n
