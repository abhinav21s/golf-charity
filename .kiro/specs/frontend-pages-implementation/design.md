# Design Document: Frontend Pages Implementation

## Overview

This design document specifies the architecture and implementation approach for 11 fully functional frontend pages in the Golf Charity Platform. The backend APIs are complete and operational, and foundational components (Navbar, Footer, LoginPage, RegisterPage, HomePage) are already implemented. This feature focuses on building the remaining user-facing and admin pages with complete UI/UX, API integration, state management, form validation, and error handling.

### Design Goals

1. **Consistency**: Maintain the emotion-driven design language established in HomePage (charitable impact, excitement, personal growth)
2. **Reusability**: Create shared components and patterns to minimize code duplication
3. **Responsiveness**: Ensure all pages work seamlessly across mobile, tablet, and desktop devices
4. **User Experience**: Provide clear feedback through loading states, error handling, and success notifications
5. **Maintainability**: Structure code for easy updates and feature additions

### Technology Stack

- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6
- **State Management**: React hooks (useState, useEffect, useContext)
- **API Integration**: Axios with centralized service layer
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for complex animations, CSS transitions for simple effects
- **Form Handling**: Controlled components with client-side validation
- **Notifications**: react-hot-toast for user feedback
- **Icons**: lucide-react icon library

## Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes
│   │   ├── HomePage (existing)
│   │   ├── LoginPage (existing)
│   │   ├── RegisterPage (existing)
│   │   ├── CharitiesPage (new)
│   │   ├── CharityDetailPage (new)
│   │   ├── DrawsPage (new)
│   │   └── PricingPage (new)
│   ├── Protected User Routes
│   │   ├── DashboardPage (new)
│   │   ├── ScoresPage (new)
│   │   └── WinningsPage (new)
│   └── Protected Admin Routes
│       ├── AdminDashboard (new)
│       ├── AdminUsers (new)
│       ├── AdminCharities (new)
│       ├── AdminDraws (new)
│       └── AdminWinners (new)
└── Toaster (Global notifications)
```

### Data Flow Pattern

All pages follow a consistent data flow pattern:

1. **Component Mount**: Initialize local state
2. **Data Fetching**: Call API service methods
3. **Loading State**: Display loading indicators
4. **Success**: Update state and render data
5. **Error**: Display error notification and fallback UI
6. **User Actions**: Handle form submissions, button clicks
7. **Optimistic Updates**: Update UI immediately, sync with backend

### State Management Strategy

**Local Component State** (useState):
- Form inputs and validation errors
- UI state (modals, dropdowns, expanded sections)
- Loading and error states
- Fetched data specific to the component

**Global Context State** (AuthContext):
- User authentication status
- User profile data
- Login/logout operations

**No Redux**: The application complexity doesn't warrant Redux. React hooks and context provide sufficient state management.

## Components and Interfaces

### Shared Component Library

#### 1. LoadingSpinner Component

**Purpose**: Reusable loading indicator

**Props**:
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: Additional CSS classes

**Implementation**:
```jsx
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`} />
  );
};
```

#### 2. PageHeader Component

**Purpose**: Consistent page title and description layout

**Props**:
- `title`: string
- `description`: string (optional)
- `action`: ReactNode (optional) - for action buttons

**Implementation**:
```jsx
const PageHeader = ({ title, description, action }) => (
  <div className="flex justify-between items-start mb-8">
    <div>
      <h1 className="text-4xl font-display font-bold mb-2">{title}</h1>
      {description && <p className="text-slate-600 text-lg">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
```

#### 3. StatCard Component

**Purpose**: Display statistics with icon and color

**Props**:
- `title`: string
- `value`: string | number
- `icon`: LucideIcon
- `color`: 'primary' | 'success' | 'warning' | 'danger'
- `trend`: { value: number, direction: 'up' | 'down' } (optional)

**Implementation**:
```jsx
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-danger-500 to-danger-600'
  };
  
  return (
    <div className="card">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {trend && (
        <div className={`text-sm mt-2 ${trend.direction === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  );
};
```

#### 4. Modal Component

**Purpose**: Reusable modal dialog

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `children`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

**Implementation**:
```jsx
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
```

#### 5. ConfirmDialog Component

**Purpose**: Confirmation dialog for destructive actions

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onConfirm`: () => void
- `title`: string
- `message`: string
- `confirmText`: string (default: 'Confirm')
- `confirmColor`: 'primary' | 'danger' (default: 'danger')

#### 6. EmptyState Component

**Purpose**: Display when no data is available

**Props**:
- `icon`: LucideIcon
- `title`: string
- `description`: string
- `action`: { label: string, onClick: () => void } (optional)

#### 7. ErrorState Component

**Purpose**: Display when data fetching fails

**Props**:
- `message`: string
- `onRetry`: () => void (optional)

### Page Components

#### 1. DashboardPage

**Route**: `/dashboard`

**Purpose**: User's main dashboard showing subscription, scores, charity, and participation summary

**State**:
```typescript
{
  loading: boolean
  subscription: SubscriptionData | null
  recentScores: Score[]
  selectedCharity: Charity | null
  participation: ParticipationData[]
  winningsSummary: { total: number, paid: number, pending: number }
}
```

**API Calls**:
- `subscriptionAPI.getMySubscription()`
- `scoresAPI.getScores()` (limit to 5 most recent)
- `charityAPI.getMyCharity()`
- `drawAPI.getMyParticipation()`
- `winnersAPI.getMyWinnings()` (for summary)

**Layout Sections**:
1. Welcome header with user name
2. Subscription status card (active/inactive, plan type, renewal date)
3. Recent scores list with quick stats
4. Selected charity card with contribution percentage
5. Draw participation history (last 3 draws)
6. Winnings summary card
7. Quick action buttons (Add Score, Change Charity, View Winnings)

**Responsive Behavior**:
- Desktop: 2-column grid layout
- Tablet: 2-column grid with adjusted spacing
- Mobile: Single column stack

#### 2. ScoresPage

**Route**: `/scores`

**Purpose**: Manage golf scores (add, edit, delete)

**State**:
```typescript
{
  loading: boolean
  scores: Score[]
  stats: { average: number, highest: number, lowest: number }
  showAddForm: boolean
  editingScore: Score | null
  formData: { score: string, date: string }
  formErrors: { score?: string, date?: string }
}
```

**API Calls**:
- `scoresAPI.getScores()`
- `scoresAPI.getStats()`
- `scoresAPI.addScore(data)`
- `scoresAPI.updateScore(id, data)`
- `scoresAPI.deleteScore(id)`

**Form Validation**:
- Score: Required, integer, 1-45 range
- Date: Required, not in future

**Layout Sections**:
1. Page header with "Add Score" button
2. Score statistics cards (average, highest, lowest)
3. Current scores list (max 5) with edit/delete actions
4. Add/Edit score form (modal or inline)
5. Warning message when at 5 scores

**User Flows**:
- Add score: Click "Add Score" → Fill form → Submit → Success toast → Refresh list
- Edit score: Click edit icon → Modal with pre-filled form → Submit → Success toast → Refresh list
- Delete score: Click delete icon → Confirm dialog → Delete → Success toast → Refresh list

#### 3. CharitiesPage

**Route**: `/charities`

**Purpose**: Browse and select charities

**State**:
```typescript
{
  loading: boolean
  charities: Charity[]
  searchQuery: string
  selectedCharity: Charity | null (user's current selection)
  showSelectionModal: boolean
  selectionFormData: { charityId: number, contributionPercentage: number }
}
```

**API Calls**:
- `charityAPI.getCharities()`
- `charityAPI.getMyCharity()` (if authenticated)
- `charityAPI.selectCharity(data)` (if authenticated)

**Features**:
- Search filter by charity name
- Featured charities highlighted
- Visual indicator for user's selected charity
- Click card to view details
- "Select" button for authenticated users

**Layout**:
- Search bar at top
- Grid of charity cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card: logo, name, description (truncated), featured badge, select button

#### 4. CharityDetailPage

**Route**: `/charities/:charityId`

**Purpose**: View detailed charity information

**State**:
```typescript
{
  loading: boolean
  charity: Charity | null
  contributions: { total: number }
  showSelectionModal: boolean
}
```

**API Calls**:
- `charityAPI.getCharityById(charityId)`
- `charityAPI.selectCharity(data)` (if authenticated)

**Layout**:
- Back button to charities list
- Charity logo and name
- Full description
- Website link (external)
- Contact email
- Events list (if available)
- Total contributions received
- "Select This Charity" button (if authenticated)

#### 5. DrawsPage

**Route**: `/draws`

**Purpose**: View published draws and results

**State**:
```typescript
{
  loading: boolean
  draws: Draw[]
  expandedDrawId: number | null
}
```

**API Calls**:
- `drawAPI.getDraws({ status: 'published' })`
- `drawAPI.getDrawById(drawId)` (when expanding)

**Layout**:
- Page header
- List of draw cards (most recent first)
- Each card: month/year, winning numbers, prize pools, winner counts, jackpot rollover
- Expandable to show participants and winners
- Empty state if no draws published

#### 6. WinningsPage

**Route**: `/winnings`

**Purpose**: View winnings and upload proof

**State**:
```typescript
{
  loading: boolean
  winnings: Winning[]
  uploadingWinnerId: number | null
  selectedFile: File | null
}
```

**API Calls**:
- `winnersAPI.getMyWinnings()`
- `winnersAPI.uploadProof(winnerId, formData)`

**Features**:
- Summary cards (total won, total paid, pending)
- Winnings list with verification and payment status
- Upload proof button for unsubmitted winnings
- File validation (image types, max 5MB)
- Status badges with color coding

**Layout**:
- Summary statistics at top
- Table/list of winnings
- Each row: draw details, match type, prize amount, verification status, payment status, actions

#### 7. PricingPage

**Route**: `/pricing`

**Purpose**: Display subscription plans

**State**:
```typescript
{
  loading: boolean
  currentSubscription: Subscription | null
}
```

**API Calls**:
- `subscriptionAPI.getMySubscription()` (if authenticated)

**Layout**:
- Page header
- Two plan cards side by side (monthly, yearly)
- Each card: price, billing frequency, features list, CTA button
- Recommended badge on yearly plan
- Different CTAs based on auth status:
  - Not logged in: "Sign Up" → navigate to register
  - Logged in, no subscription: "Subscribe" → show Stripe pending message
  - Logged in, active subscription: "Current Plan" badge

#### 8. AdminDashboard

**Route**: `/admin`

**Purpose**: Platform statistics overview for admins

**State**:
```typescript
{
  loading: boolean
  stats: {
    totalUsers: number
    activeSubscriptions: number
    totalPrizePool: number
    totalCharityContributions: number
    pendingVerifications: number
    pendingPayments: number
  }
}
```

**API Calls**:
- Custom endpoint or aggregate from multiple endpoints
- `winnersAPI.getWinnerStats()`
- `charityAPI.getCharityStats()`

**Layout**:
- Admin page header
- Grid of stat cards (6 cards)
- Quick navigation links to admin pages
- Recent activity feed (optional)

#### 9. AdminUsers

**Route**: `/admin/users`

**Purpose**: Manage users and view details

**State**:
```typescript
{
  loading: boolean
  users: User[]
  searchQuery: string
  filterStatus: 'all' | 'active' | 'inactive'
  expandedUserId: number | null
  userScores: Score[]
  currentPage: number
  totalPages: number
}
```

**API Calls**:
- Custom admin endpoint for users list
- `scoresAPI.getScores()` (for expanded user)

**Features**:
- Search by name/email
- Filter by status
- Expandable rows showing user details and scores
- Pagination

**Layout**:
- Search and filter controls
- Users table
- Pagination controls

#### 10. AdminCharities

**Route**: `/admin/charities`

**Purpose**: CRUD operations on charities

**State**:
```typescript
{
  loading: boolean
  charities: Charity[]
  showCreateModal: boolean
  editingCharity: Charity | null
  formData: CharityFormData
  formErrors: Record<string, string>
}
```

**API Calls**:
- `charityAPI.getCharities()`
- `charityAPI.createCharity(data)`
- `charityAPI.updateCharity(id, data)`
- `charityAPI.deleteCharity(id)`
- `charityAPI.getCharityStats()`

**Form Fields**:
- name (required)
- description (required)
- logo_url (optional)
- website_url (optional)
- contact_email (optional)
- is_featured (boolean)

**Layout**:
- "Add Charity" button
- Charities table with edit/delete actions
- Create/Edit modal with form
- Delete confirmation dialog

#### 11. AdminDraws

**Route**: `/admin/draws`

**Purpose**: Create and publish draws

**State**:
```typescript
{
  loading: boolean
  draws: Draw[]
  showCreateForm: boolean
  formData: { month: number, year: number, drawType: 'random' | 'algorithmic' }
  simulationResults: SimulationResults | null
  expandedDrawId: number | null
}
```

**API Calls**:
- `drawAPI.getDraws()`
- `drawAPI.createDraw({ ...data, simulate: true })` (for simulation)
- `drawAPI.createDraw(data)` (for publishing)
- `drawAPI.getDrawById(id)` (for expanded view)

**Features**:
- Create draw form with month/year/type
- Simulate button to preview results
- Publish button to save draw
- Draw history with expandable details

**Layout**:
- "Create Draw" button
- Create form (modal or section)
- Simulation results display
- Draws history table

#### 12. AdminWinners

**Route**: `/admin/winners`

**Purpose**: Verify winners and process payments

**State**:
```typescript
{
  loading: boolean
  winners: Winner[]
  filterVerification: 'all' | 'pending' | 'approved' | 'rejected'
  filterPayment: 'all' | 'pending' | 'paid'
  viewingProof: { winnerId: number, proofUrl: string } | null
  stats: WinnerStats
}
```

**API Calls**:
- `winnersAPI.getAllWinners(params)`
- `winnersAPI.verifyWinner(id, { status, notes })`
- `winnersAPI.markAsPaid(id)`
- `winnersAPI.getWinnerStats()`

**Features**:
- Filter by verification and payment status
- View proof image in modal
- Approve/Reject verification with notes
- Mark as paid
- Statistics summary

**Layout**:
- Statistics cards at top
- Filter controls
- Winners table
- Proof viewing modal with approve/reject actions
- Payment confirmation dialog

## Data Models

### Frontend Data Types

```typescript
// User
interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  created_at: string
}

// Subscription
interface Subscription {
  id: number
  user_id: number
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired'
  start_date: string
  end_date: string
  stripe_subscription_id: string | null
}

// Score
interface Score {
  id: number
  user_id: number
  score: number
  date: string
  created_at: string
}

// Score Stats
interface ScoreStats {
  average: number
  highest: number
  lowest: number
  count: number
}

// Charity
interface Charity {
  id: number
  name: string
  description: string
  logo_url: string | null
  website_url: string | null
  contact_email: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

// User Charity Selection
interface UserCharity {
  charity_id: number
  contribution_percentage: number
  charity: Charity
}

// Draw
interface Draw {
  id: number
  month: number
  year: number
  winning_numbers: number[]
  draw_type: 'random' | 'algorithmic'
  status: 'draft' | 'published'
  prize_pool_5_match: number
  prize_pool_4_match: number
  prize_pool_3_match: number
  next_month_jackpot: number
  created_at: string
  published_at: string | null
}

// Draw Participation
interface DrawParticipation {
  draw_id: number
  user_scores: number[]
  matches: number
  draw: Draw
}

// Winning
interface Winning {
  id: number
  user_id: number
  draw_id: number
  match_type: '3_match' | '4_match' | '5_match'
  prize_amount: number
  verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected'
  payment_status: 'pending' | 'paid'
  proof_image_url: string | null
  verification_notes: string | null
  verified_at: string | null
  paid_at: string | null
  draw: Draw
}

// Form Data Types
interface ScoreFormData {
  score: string
  date: string
}

interface CharitySelectionFormData {
  charity_id: number
  contribution_percentage: number
}

interface CharityFormData {
  name: string
  description: string
  logo_url: string
  website_url: string
  contact_email: string
  is_featured: boolean
}

interface DrawFormData {
  month: number
  year: number
  draw_type: 'random' | 'algorithmic'
}

// API Response Types
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### Data Transformation

**Date Formatting**:
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

**Currency Formatting**:
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
```

**Status Badge Mapping**:
```javascript
const getStatusBadgeClass = (status) => {
  const mapping = {
    active: 'badge-success',
    inactive: 'badge-danger',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    paid: 'badge-success'
  };
  return mapping[status] || 'badge-primary';
};
```


## Error Handling

### Error Handling Strategy

All pages implement a consistent error handling approach:

**1. Network Errors**:
```javascript
catch (error) {
  if (!error.response) {
    toast.error('Network error. Please check your connection.');
  }
}
```

**2. HTTP Status Errors**:
```javascript
catch (error) {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  
  switch (status) {
    case 401:
      // Handled by axios interceptor - redirects to login
      break;
    case 403:
      toast.error('Access denied');
      break;
    case 404:
      toast.error('Resource not found');
      break;
    case 500:
      toast.error('Server error. Please try again later.');
      break;
    default:
      toast.error(message || 'An error occurred');
  }
}
```

**3. Form Validation Errors**:
```javascript
const validateScoreForm = (formData) => {
  const errors = {};
  
  if (!formData.score) {
    errors.score = 'Score is required';
  } else if (formData.score < 1 || formData.score > 45) {
    errors.score = 'Score must be between 1 and 45';
  }
  
  if (!formData.date) {
    errors.date = 'Date is required';
  } else if (new Date(formData.date) > new Date()) {
    errors.date = 'Date cannot be in the future';
  }
  
  return errors;
};
```

**4. File Upload Validation**:
```javascript
const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, or GIF)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be under 5MB' };
  }
  
  return { valid: true };
};
```

### Error State Components

**ErrorState Component**:
```jsx
const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
    <p className="text-slate-600 mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-primary">
        Try Again
      </button>
    )}
  </div>
);
```

**EmptyState Component**:
```jsx
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600 mb-6">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn btn-primary">
        {action.label}
      </button>
    )}
  </div>
);
```

### Loading States

**Page-Level Loading**:
```jsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
```

**Section-Level Loading**:
```jsx
{loading ? (
  <div className="flex justify-center py-8">
    <LoadingSpinner />
  </div>
) : (
  <DataDisplay data={data} />
)}
```

**Button Loading State**:
```jsx
<button disabled={loading} className="btn btn-primary">
  {loading ? (
    <span className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      Processing...
    </span>
  ) : (
    'Submit'
  )}
</button>
```

### Retry Mechanisms

**Automatic Retry for Critical Data**:
```javascript
const fetchWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

**Manual Retry Button**:
```javascript
const [error, setError] = useState(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiCall();
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// In render
{error && <ErrorState message={error} onRetry={loadData} />}
```

## Testing Strategy

### Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
**Property Tests**: Verify universal properties across all inputs using randomized testing

### Unit Testing

**Framework**: Vitest + React Testing Library

**Test Categories**:

1. **Component Rendering Tests**
   - Verify components render without crashing
   - Check initial state and props rendering
   - Test conditional rendering based on props

2. **User Interaction Tests**
   - Form input changes
   - Button clicks
   - Modal open/close
   - Navigation actions

3. **API Integration Tests**
   - Mock API responses
   - Test loading states
   - Test error handling
   - Test success scenarios

4. **Form Validation Tests**
   - Test specific validation rules
   - Test error message display
   - Test form submission prevention on invalid data

**Example Unit Tests**:

```javascript
// ScoresPage.test.jsx
describe('ScoresPage', () => {
  it('displays loading spinner while fetching scores', () => {
    render(<ScoresPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('displays scores after successful fetch', async () => {
    const mockScores = [
      { id: 1, score: 35, date: '2024-01-15' },
      { id: 2, score: 42, date: '2024-01-20' }
    ];
    scoresAPI.getScores.mockResolvedValue({ data: { data: mockScores } });
    
    render(<ScoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
  
  it('shows error message when fetch fails', async () => {
    scoresAPI.getScores.mockRejectedValue(new Error('Network error'));
    
    render(<ScoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
  
  it('validates score is between 1 and 45', async () => {
    render(<ScoresPage />);
    
    const scoreInput = screen.getByLabelText(/score/i);
    fireEvent.change(scoreInput, { target: { value: '50' } });
    fireEvent.blur(scoreInput);
    
    expect(screen.getByText(/must be between 1 and 45/i)).toBeInTheDocument();
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging**: Each property test references its design document property
```javascript
// Feature: frontend-pages-implementation, Property 1: Score validation rejects invalid inputs
```

**Property Test Categories**:

1. **Form Validation Properties**
   - Input validation rules hold for all inputs
   - Error messages are consistent
   - Valid inputs always pass validation

2. **Data Transformation Properties**
   - Formatting functions preserve data integrity
   - Round-trip transformations (format → parse → format)
   - Sorting and filtering maintain data consistency

3. **UI State Properties**
   - State transitions are consistent
   - UI reflects data state accurately
   - No invalid UI states possible

**Example Property Tests**:

```javascript
// scoreValidation.property.test.js
import fc from 'fast-check';

describe('Score Validation Properties', () => {
  // Feature: frontend-pages-implementation, Property 1: Valid scores always pass validation
  it('accepts all scores between 1 and 45', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 45 }),
        (score) => {
          const errors = validateScoreForm({ score: score.toString(), date: '2024-01-01' });
          expect(errors.score).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: frontend-pages-implementation, Property 2: Invalid scores always fail validation
  it('rejects all scores outside 1-45 range', () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n < 1 || n > 45),
        (score) => {
          const errors = validateScoreForm({ score: score.toString(), date: '2024-01-01' });
          expect(errors.score).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: frontend-pages-implementation, Property 3: Future dates always fail validation
  it('rejects all future dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date(Date.now() + 86400000) }), // Tomorrow onwards
        (date) => {
          const errors = validateScoreForm({ 
            score: '35', 
            date: date.toISOString().split('T')[0] 
          });
          expect(errors.date).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// dataFormatting.property.test.js
describe('Data Formatting Properties', () => {
  // Feature: frontend-pages-implementation, Property 4: Currency formatting preserves numeric value
  it('formats and parses currency without loss', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000000, noNaN: true }),
        (amount) => {
          const formatted = formatCurrency(amount);
          const parsed = parseFloat(formatted.replace(/[$,]/g, ''));
          expect(Math.abs(parsed - amount)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: frontend-pages-implementation, Property 5: Date formatting is consistent
  it('formats dates consistently for all valid dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date) => {
          const formatted = formatDate(date.toISOString());
          expect(formatted).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// stateTransitions.property.test.js
describe('UI State Transition Properties', () => {
  // Feature: frontend-pages-implementation, Property 6: Modal state transitions are consistent
  it('modal open/close transitions maintain consistency', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (actions) => {
          let isOpen = false;
          actions.forEach(action => {
            isOpen = action ? true : false;
          });
          // Final state matches last action
          expect(isOpen).toBe(actions[actions.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All validation functions, data transformations, and critical state transitions
- **Integration Test Coverage**: All API integration points
- **E2E Test Coverage**: Critical user flows (login, add score, select charity, view winnings)

### Testing Best Practices

1. **Isolation**: Mock external dependencies (API calls, localStorage, timers)
2. **Clarity**: Use descriptive test names that explain what is being tested
3. **Completeness**: Test happy paths, error paths, and edge cases
4. **Speed**: Keep unit tests fast (< 100ms each)
5. **Reliability**: Avoid flaky tests by properly handling async operations
6. **Maintainability**: Keep tests simple and focused on behavior, not implementation

### Continuous Integration

- Run all tests on every commit
- Fail builds if tests fail or coverage drops below threshold
- Run property tests with increased iterations (1000+) in CI for deeper validation
- Generate and publish coverage reports


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties and performed reflection to eliminate redundancy:

**Redundancy Analysis:**
- Multiple criteria test "display success toast on action" (2.6, 3.7, 6.8, 10.5, 10.8, 10.11, 11.9, 12.10, 12.13) → Combined into Property 7
- Multiple criteria test "display error toast on API failure" (1.7, 13.2-13.6) → Combined into Property 2
- Multiple criteria test "display loading state during API calls" (1.6, 13.1) → Combined into Property 1
- Multiple criteria test "validate form fields" (2.3, 2.4, 3.6, 10.4) → Separated by validation type (Properties 3, 4, 5, 9)
- Multiple criteria test "filter/search behavior" (3.3, 9.4, 9.5, 12.3, 12.4) → Combined into Property 10
- Multiple criteria test "status badge mapping" (6.9, 6.10) → Combined into Property 8
- Multiple criteria test "accessibility requirements" (14.7, 14.8) → Combined into Property 12

**Properties Identified:**
1. Loading state display during async operations (universal)
2. Error notification on API failures (universal)
3. Score validation (specific range)
4. Date validation (no future dates)
5. Contribution percentage validation (specific range)
6. File upload validation (type and size)
7. Success notification on successful operations (universal)
8. Status badge mapping consistency
9. Required field validation
10. Search/filter result consistency
11. Data calculation accuracy (statistics, summaries)
12. Accessibility compliance (labels, alt text)
13. Animation respect for reduced motion preference

### Property 1: Loading State Display

*For any* API request in progress, the application should display a loading indicator until the request completes (success or failure).

**Validates: Requirements 1.6, 13.1**

### Property 2: Error Notification on API Failures

*For any* API request that fails, the application should display an appropriate error notification based on the error type (network error, 401, 403, 404, 500, or custom message).

**Validates: Requirements 1.7, 13.2, 13.3, 13.4, 13.5, 13.6, 13.8**

### Property 3: Score Value Validation

*For any* score input, the validation should accept all integers between 1 and 45 (inclusive) and reject all other values with an appropriate error message.

**Validates: Requirements 2.3**

### Property 4: Date Validation

*For any* date input, the validation should accept all dates up to and including today and reject all future dates with an appropriate error message.

**Validates: Requirements 2.4**

### Property 5: Contribution Percentage Validation

*For any* contribution percentage input, the validation should accept all integers between 10 and 100 (inclusive) and reject all other values with an appropriate error message.

**Validates: Requirements 3.6**

### Property 6: File Upload Validation

*For any* file upload, the validation should accept only image files (jpg, jpeg, png, gif) under 5MB and reject all other files with an appropriate error message.

**Validates: Requirements 6.6, 6.7**

### Property 7: Success Notification on Operations

*For any* successful form submission or data modification operation, the application should display a success notification.

**Validates: Requirements 2.6, 3.7, 6.8, 10.5, 10.8, 10.11, 11.9, 12.10, 12.13, 13.7**

### Property 8: Status Badge Mapping Consistency

*For any* status value (verification status or payment status), the application should consistently map it to the correct badge class (pending → warning/yellow, approved → success/green, rejected → danger/red, paid → success/green).

**Validates: Requirements 6.9, 6.10**

### Property 9: Required Field Validation

*For any* form with required fields, the validation should reject submissions where any required field is empty or contains only whitespace, displaying appropriate error messages.

**Validates: Requirements 2.5, 10.4**

### Property 10: Search and Filter Result Consistency

*For any* search query or filter criteria, all returned results should match the specified criteria (search term in name/email, status matches filter, etc.).

**Validates: Requirements 3.3, 9.4, 9.5, 12.3, 12.4**

### Property 11: Data Calculation Accuracy

*For any* set of data requiring calculation (score statistics, winnings summaries, contribution totals), the calculated values should accurately reflect the source data (e.g., average = sum / count, total won = sum of all prize amounts).

**Validates: Requirements 2.11, 6.2**

### Property 12: Accessibility Compliance

*For any* form input element, it should have an associated label element, and *for any* image element, it should have an alt attribute.

**Validates: Requirements 14.7, 14.8**

### Property 13: Reduced Motion Preference

*For any* animation or transition, if the user's system has prefers-reduced-motion enabled, the animation should be disabled or significantly reduced.

**Validates: Requirements 15.9**

### Property 14: Draw Sorting Consistency

*For any* list of draws, they should always be sorted by date in descending order (most recent first).

**Validates: Requirements 5.2**

### Property 15: Form Validation Error Display

*For any* form validation failure, the application should display inline error messages next to the invalid fields without submitting the form.

**Validates: Requirements 2.5**

