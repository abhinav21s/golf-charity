# Implementation Plan: Frontend Pages Implementation

## Overview

This implementation plan builds 11 fully functional frontend pages for the Golf Charity Platform using React, Tailwind CSS, and the existing backend APIs. The plan follows a bottom-up approach: shared components first, then user pages, then admin pages. Each component integrates with backend APIs, includes form validation, error handling, loading states, and responsive design.

## Tasks

- [x] 1. Create shared component library
  - [x] 1.1 Create LoadingSpinner component
    - Implement reusable loading indicator with size variants (sm, md, lg)
    - Add Tailwind CSS animations for spinner
    - _Requirements: 13.1_

  - [x] 1.2 Create PageHeader component
    - Implement consistent page title and description layout
    - Support optional action button slot
    - _Requirements: 1.1, 8.1_

  - [ ] 1.3 Create StatCard component
    - Implement statistics display with icon, value, and color variants
    - Add optional trend indicator with up/down arrows
    - Support color variants (primary, success, warning, danger)
    - _Requirements: 2.11, 6.2, 8.1_

  - [x] 1.4 Create Modal component
    - Implement reusable modal dialog with Framer Motion animations
    - Support size variants (sm, md, lg, xl)
    - Add backdrop click to close and X button
    - _Requirements: 15.2, 15.3_

  - [x] 1.5 Create ConfirmDialog component
    - Implement confirmation dialog for destructive actions
    - Support custom title, message, and button text
    - Add color variants for confirm button (primary, danger)
    - _Requirements: 2.9, 10.10, 12.12_

  - [x] 1.6 Create EmptyState component
    - Implement empty state display with icon, title, description
    - Support optional action button
    - _Requirements: 5.8_

  - [x] 1.7 Create ErrorState component
    - Implement error state display with retry button
    - Show error icon and message
    - _Requirements: 1.7, 13.2_


- [x] 2. Create validation utility functions
  - [x] 2.1 Create score validation function
    - Implement validateScoreForm function
    - Validate score is between 1 and 45
    - Validate date is not in future
    - Return errors object with field-specific messages
    - _Requirements: 2.3, 2.4_

  - [ ]* 2.2 Write property test for score validation
    - **Property 3: Score value validation**
    - **Validates: Requirements 2.3**
    - Test that all scores 1-45 pass validation
    - Test that all scores outside range fail validation

  - [ ]* 2.3 Write property test for date validation
    - **Property 4: Date validation**
    - **Validates: Requirements 2.4**
    - Test that all past and present dates pass validation
    - Test that all future dates fail validation

  - [x] 2.4 Create contribution percentage validation function
    - Implement validateContributionPercentage function
    - Validate percentage is between 10 and 100
    - Return error message if invalid
    - _Requirements: 3.6_

  - [ ]* 2.5 Write property test for contribution percentage validation
    - **Property 5: Contribution percentage validation**
    - **Validates: Requirements 3.6**
    - Test that all percentages 10-100 pass validation
    - Test that all percentages outside range fail validation

  - [x] 2.6 Create file upload validation function
    - Implement validateImageFile function
    - Validate file type is jpg, jpeg, png, or gif
    - Validate file size is under 5MB
    - Return validation result with error message
    - _Requirements: 6.6, 6.7_

  - [ ]* 2.7 Write property test for file upload validation
    - **Property 6: File upload validation**
    - **Validates: Requirements 6.6, 6.7**
    - Test that valid image files pass validation
    - Test that invalid file types fail validation
    - Test that oversized files fail validation

  - [x] 2.8 Create required field validation function
    - Implement validateRequiredFields function
    - Check for empty or whitespace-only values
    - Return errors object with field-specific messages
    - _Requirements: 2.5, 10.4_

  - [ ]* 2.9 Write property test for required field validation
    - **Property 9: Required field validation**
    - **Validates: Requirements 2.5, 10.4**
    - Test that non-empty values pass validation
    - Test that empty and whitespace-only values fail validation

- [x] 3. Create data formatting utility functions
  - [x] 3.1 Create date formatting function
    - Implement formatDate function using Intl.DateTimeFormat
    - Format dates as "Month Day, Year" (e.g., "January 15, 2024")
    - _Requirements: 2.1, 5.3, 6.3_

  - [x] 3.2 Create currency formatting function
    - Implement formatCurrency function using Intl.NumberFormat
    - Format amounts as USD currency (e.g., "$1,234.56")
    - _Requirements: 6.2, 8.3, 8.4_

  - [ ]* 3.3 Write property test for currency formatting
    - **Property 11: Data calculation accuracy (currency)**
    - **Validates: Requirements 6.2**
    - Test that currency formatting preserves numeric value
    - Test round-trip formatting and parsing

  - [x] 3.3 Create status badge mapping function
    - Implement getStatusBadgeClass function
    - Map status values to Tailwind CSS classes
    - Support verification and payment statuses
    - _Requirements: 6.9, 6.10_

  - [ ]* 3.4 Write property test for status badge mapping
    - **Property 8: Status badge mapping consistency**
    - **Validates: Requirements 6.9, 6.10**
    - Test that all status values map to correct badge classes
    - Test consistency across multiple calls

- [x] 4. Implement DashboardPage
  - [x] 4.1 Create DashboardPage component structure
    - Set up component with state management (subscription, scores, charity, participation, winnings)
    - Add loading and error states
    - Implement responsive grid layout (2-column desktop, 1-column mobile)
    - _Requirements: 1.1, 1.8_

  - [x] 4.2 Implement data fetching for DashboardPage
    - Fetch subscription status using subscriptionAPI.getMySubscription()
    - Fetch recent scores (limit 5) using scoresAPI.getScores()
    - Fetch selected charity using charityAPI.getMyCharity()
    - Fetch participation history using drawAPI.getMyParticipation()
    - Fetch winnings summary using winnersAPI.getMyWinnings()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 4.3 Create subscription status card
    - Display subscription plan type, status, and renewal date
    - Show active/inactive badge with color coding
    - _Requirements: 1.1_

  - [x] 4.4 Create recent scores section
    - Display 5 most recent scores with dates
    - Show quick statistics (average, highest, lowest)
    - Add "View All Scores" button linking to ScoresPage
    - _Requirements: 1.2, 1.9_

  - [x] 4.5 Create selected charity card
    - Display charity name, logo, and contribution percentage
    - Add "Change Charity" button linking to CharitiesPage
    - _Requirements: 1.3, 1.9_

  - [x] 4.6 Create participation history section
    - Display last 3 draws with match counts
    - Show draw month/year and user scores
    - _Requirements: 1.4_

  - [x] 4.7 Create winnings summary card
    - Display total won, paid, and pending amounts using StatCard
    - Add "View Winnings" button linking to WinningsPage
    - _Requirements: 1.5, 1.9_

  - [ ]* 4.8 Write unit tests for DashboardPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test error handling
    - Test navigation button clicks

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Implement ScoresPage
  - [x] 6.1 Create ScoresPage component structure
    - Set up component with state management (scores, stats, form data, form errors)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 2.1, 2.12_

  - [x] 6.2 Implement data fetching for ScoresPage
    - Fetch scores using scoresAPI.getScores()
    - Fetch statistics using scoresAPI.getStats()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 2.1, 2.11_

  - [x] 6.3 Create score statistics cards
    - Display average, highest, and lowest scores using StatCard
    - Calculate and display total score count
    - _Requirements: 2.11_

  - [x] 6.4 Create scores list display
    - Display current scores (max 5) in table or card format
    - Show score value and date for each entry
    - Add edit and delete action buttons
    - Show warning message when at 5 scores
    - _Requirements: 2.1, 2.7_

  - [x] 6.5 Create add score form
    - Implement form with score input (1-45) and date picker
    - Add client-side validation using validateScoreForm
    - Display inline error messages for validation failures
    - Handle form submission with scoresAPI.addScore()
    - Show success toast on successful addition
    - Refresh scores list after addition
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 6.6 Implement edit score functionality
    - Open modal with pre-filled form when edit button clicked
    - Validate edited data using validateScoreForm
    - Handle form submission with scoresAPI.updateScore()
    - Show success toast on successful update
    - Refresh scores list after update
    - _Requirements: 2.8, 2.10_

  - [x] 6.7 Implement delete score functionality
    - Show confirmation dialog when delete button clicked
    - Handle deletion with scoresAPI.deleteScore()
    - Show success toast on successful deletion
    - Refresh scores list after deletion
    - _Requirements: 2.9, 2.10_

  - [ ]* 6.8 Write property test for form validation error display
    - **Property 15: Form validation error display**
    - **Validates: Requirements 2.5**
    - Test that validation errors display inline without form submission
    - Test that valid forms allow submission

  - [ ]* 6.9 Write unit tests for ScoresPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test add score form submission
    - Test edit score functionality
    - Test delete score with confirmation
    - Test validation error display

- [x] 7. Implement CharitiesPage
  - [x] 7.1 Create CharitiesPage component structure
    - Set up component with state management (charities, search query, selected charity)
    - Add loading and error states
    - Implement responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
    - _Requirements: 3.1, 3.10_

  - [x] 7.2 Implement data fetching for CharitiesPage
    - Fetch charities using charityAPI.getCharities()
    - Fetch user's selected charity using charityAPI.getMyCharity() (if authenticated)
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 3.1, 3.8_

  - [x] 7.3 Create search functionality
    - Implement search input field
    - Filter charities by name based on search query
    - Update displayed charities in real-time
    - _Requirements: 3.3_

  - [ ]* 7.4 Write property test for search functionality
    - **Property 10: Search and filter result consistency**
    - **Validates: Requirements 3.3**
    - Test that all search results contain the search term
    - Test that search is case-insensitive

  - [x] 7.5 Create charity card component
    - Display charity logo, name, and truncated description
    - Show featured badge for featured charities
    - Highlight user's selected charity with visual indicator
    - Add "Select" button for authenticated users
    - Add click handler to navigate to charity detail page
    - _Requirements: 3.2, 3.4, 3.8, 3.9_

  - [x] 7.6 Implement charity selection modal
    - Open modal when "Select" button clicked
    - Display form with contribution percentage input (10-100%)
    - Validate contribution percentage
    - Handle form submission with charityAPI.selectCharity()
    - Show success toast on successful selection
    - Refresh charity data after selection
    - _Requirements: 3.5, 3.6, 3.7_

  - [ ]* 7.7 Write unit tests for CharitiesPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test search functionality
    - Test charity selection modal
    - Test navigation to charity detail page

- [x] 8. Implement CharityDetailPage
  - [x] 8.1 Create CharityDetailPage component structure
    - Set up component with state management (charity, contributions, selection modal)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 4.1, 4.7_

  - [x] 8.2 Implement data fetching for CharityDetailPage
    - Extract charityId from URL params
    - Fetch charity details using charityAPI.getCharityById()
    - Display loading spinner during fetch
    - Handle errors with toast notifications (404 if charity not found)
    - _Requirements: 4.1_

  - [x] 8.3 Create charity detail display
    - Display charity logo and name
    - Display full description
    - Display website URL as external link
    - Display contact email
    - Display events list if available
    - Display total contributions received
    - Add back button to return to charities list
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 8.4 Implement charity selection from detail page
    - Show "Select This Charity" button for authenticated users
    - Open selection modal when button clicked
    - Reuse charity selection modal from CharitiesPage
    - _Requirements: 4.5, 4.6_

  - [ ]* 8.5 Write unit tests for CharityDetailPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test 404 error handling for invalid charity ID
    - Test charity selection functionality
    - Test back button navigation

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 10. Implement DrawsPage
  - [x] 10.1 Create DrawsPage component structure
    - Set up component with state management (draws, expanded draw ID)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 5.1, 5.8_

  - [x] 10.2 Implement data fetching for DrawsPage
    - Fetch published draws using drawAPI.getDraws({ status: 'published' })
    - Sort draws by date in descending order (most recent first)
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - Show empty state if no draws published
    - _Requirements: 5.1, 5.2, 5.8_

  - [ ]* 10.3 Write property test for draw sorting
    - **Property 14: Draw sorting consistency**
    - **Validates: Requirements 5.2**
    - Test that draws are always sorted by date descending
    - Test sorting with various date combinations

  - [x] 10.4 Create draw card component
    - Display draw month and year
    - Display winning numbers as badges
    - Display total prize pool
    - Display prize breakdown (5-match, 4-match, 3-match)
    - Display winner counts for each match type
    - Display jackpot rollover amount if no 5-match winners
    - Add expand/collapse functionality
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [x] 10.5 Implement draw expansion functionality
    - Fetch detailed draw data using drawAPI.getDrawById() when expanded
    - Display participants list with scores
    - Display winners list with match types and prize amounts
    - Add collapse functionality to hide details
    - _Requirements: 5.7_

  - [ ]* 10.6 Write unit tests for DrawsPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test empty state display
    - Test draw expansion and collapse
    - Test draw sorting

- [x] 11. Implement WinningsPage
  - [x] 11.1 Create WinningsPage component structure
    - Set up component with state management (winnings, uploading winner ID, selected file)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 6.1, 6.11_

  - [x] 11.2 Implement data fetching for WinningsPage
    - Fetch winnings using winnersAPI.getMyWinnings()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 6.1_

  - [x] 11.3 Create winnings summary cards
    - Calculate total won, total paid, and pending amounts
    - Display summary using StatCard components
    - _Requirements: 6.2_

  - [ ]* 11.4 Write property test for winnings calculation
    - **Property 11: Data calculation accuracy (winnings)**
    - **Validates: Requirements 6.2**
    - Test that total won equals sum of all prize amounts
    - Test that total paid equals sum of paid winnings
    - Test that pending equals sum of unpaid winnings

  - [x] 11.5 Create winnings list display
    - Display winnings in table or card format
    - Show draw details (month, year)
    - Show match type (3-match, 4-match, 5-match)
    - Show prize amount formatted as currency
    - Show verification status with color-coded badges
    - Show payment status with color-coded badges
    - Add upload proof button for not_submitted winnings
    - _Requirements: 6.3, 6.4, 6.9, 6.10_

  - [x] 11.6 Implement proof upload functionality
    - Open file picker when upload button clicked
    - Validate selected file using validateImageFile
    - Display validation errors if file invalid
    - Upload file using winnersAPI.uploadProof()
    - Show success toast on successful upload
    - Refresh winnings list after upload
    - _Requirements: 6.5, 6.6, 6.7, 6.8_

  - [ ]* 11.7 Write unit tests for WinningsPage
    - Test loading state display
    - Test successful data fetch and rendering
    - Test winnings summary calculation
    - Test proof upload functionality
    - Test file validation
    - Test status badge display

- [x] 12. Implement PricingPage
  - [x] 12.1 Create PricingPage component structure
    - Set up component with state management (current subscription)
    - Add loading state for subscription check
    - Implement responsive layout (2 columns desktop, 1 column mobile)
    - _Requirements: 7.1, 7.8_

  - [x] 12.2 Implement data fetching for PricingPage
    - Fetch current subscription using subscriptionAPI.getMySubscription() (if authenticated)
    - Handle errors silently (user may not have subscription)
    - _Requirements: 7.7_

  - [x] 12.3 Create pricing plan cards
    - Create monthly plan card with price, billing frequency, and features
    - Create yearly plan card with price, billing frequency, and features
    - Add recommended badge to yearly plan
    - Display charity contribution information (minimum 10%)
    - Implement responsive side-by-side layout
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 12.4 Implement dynamic CTA buttons
    - Show "Sign Up" button for non-authenticated users (navigate to register)
    - Show "Subscribe" button for authenticated users without subscription
    - Show "Current Plan" badge for authenticated users with active subscription
    - Display Stripe pending message when Subscribe clicked
    - _Requirements: 7.5, 7.6, 7.7, 7.8_

  - [ ]* 12.5 Write unit tests for PricingPage
    - Test rendering for non-authenticated users
    - Test rendering for authenticated users without subscription
    - Test rendering for authenticated users with subscription
    - Test CTA button behavior
    - Test navigation to register page

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 14. Implement AdminDashboard
  - [x] 14.1 Create AdminDashboard component structure
    - Set up component with state management (statistics)
    - Add loading and error states
    - Implement responsive grid layout
    - _Requirements: 8.1, 8.9_

  - [x] 14.2 Implement data fetching for AdminDashboard
    - Fetch total users count
    - Fetch active subscriptions count
    - Fetch total prize pool amount
    - Fetch total charity contributions
    - Fetch pending verifications count
    - Fetch pending payments count
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 14.3 Create statistics display
    - Display 6 StatCard components for each metric
    - Use appropriate icons and colors for each stat
    - Implement responsive grid (3 columns desktop, 2 tablet, 1 mobile)
    - _Requirements: 8.7_

  - [x] 14.4 Create quick navigation section
    - Add navigation links to admin management pages
    - Style as cards or buttons
    - _Requirements: 8.8_

  - [ ]* 14.5 Write unit tests for AdminDashboard
    - Test loading state display
    - Test successful data fetch and rendering
    - Test error handling
    - Test navigation links

- [x] 15. Implement AdminUsers page
  - [x] 15.1 Create AdminUsers component structure
    - Set up component with state management (users, search query, filter status, expanded user ID, pagination)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 9.1, 9.9_

  - [x] 15.2 Implement data fetching for AdminUsers
    - Fetch users list from admin endpoint
    - Support pagination parameters
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 9.1_

  - [x] 15.3 Create search and filter controls
    - Implement search input for name/email filtering
    - Implement status filter dropdown (all, active, inactive)
    - Update displayed users based on search and filter
    - _Requirements: 9.4, 9.5_

  - [ ]* 15.4 Write property test for user filtering
    - **Property 10: Search and filter result consistency (users)**
    - **Validates: Requirements 9.4, 9.5**
    - Test that all filtered results match filter criteria
    - Test that search results contain search term in name or email

  - [x] 15.5 Create users table display
    - Display user information (name, email, role, status, registration date)
    - Display subscription status for each user
    - Add expand/collapse functionality for each row
    - Implement responsive table (stack on mobile)
    - _Requirements: 9.2, 9.3_

  - [x] 15.6 Implement user expansion functionality
    - Fetch user scores using scoresAPI.getScores() when expanded
    - Display detailed user information
    - Display user scores with dates and values
    - Add collapse functionality
    - _Requirements: 9.6, 9.7_

  - [x] 15.7 Implement pagination controls
    - Display current page and total pages
    - Add previous/next buttons
    - Add page number buttons
    - Handle page changes with API calls
    - _Requirements: 9.8_

  - [ ]* 15.8 Write unit tests for AdminUsers
    - Test loading state display
    - Test successful data fetch and rendering
    - Test search functionality
    - Test filter functionality
    - Test user expansion
    - Test pagination

- [x] 16. Implement AdminCharities page
  - [x] 16.1 Create AdminCharities component structure
    - Set up component with state management (charities, form data, form errors, editing charity)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 10.1, 10.13_

  - [x] 16.2 Implement data fetching for AdminCharities
    - Fetch charities using charityAPI.getCharities()
    - Fetch charity statistics using charityAPI.getCharityStats()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 10.1, 10.12_

  - [x] 16.3 Create charities table display
    - Display charity information (name, description, featured status, active status)
    - Display charity statistics (total contributions, active users)
    - Add edit and delete action buttons
    - Implement responsive table
    - _Requirements: 10.1, 10.12_

  - [x] 16.4 Create add charity functionality
    - Add "Add Charity" button to open modal
    - Create form with fields (name, description, logo URL, website URL, contact email, featured checkbox)
    - Validate required fields (name, description)
    - Handle form submission with charityAPI.createCharity()
    - Show success toast on successful creation
    - Refresh charities list after creation
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [x] 16.5 Create edit charity functionality
    - Open modal with pre-filled form when edit button clicked
    - Validate required fields
    - Handle form submission with charityAPI.updateCharity()
    - Show success toast on successful update
    - Refresh charities list after update
    - _Requirements: 10.6, 10.7, 10.8_

  - [x] 16.6 Create delete charity functionality
    - Show confirmation dialog when delete button clicked
    - Handle deletion with charityAPI.deleteCharity()
    - Show success toast on successful deletion
    - Refresh charities list after deletion
    - _Requirements: 10.9, 10.10, 10.11_

  - [ ]* 16.7 Write unit tests for AdminCharities
    - Test loading state display
    - Test successful data fetch and rendering
    - Test add charity functionality
    - Test edit charity functionality
    - Test delete charity with confirmation
    - Test form validation

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 18. Implement AdminDraws page
  - [x] 18.1 Create AdminDraws component structure
    - Set up component with state management (draws, form data, simulation results, expanded draw ID)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 11.1, 11.12_

  - [x] 18.2 Implement data fetching for AdminDraws
    - Fetch draws using drawAPI.getDraws()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 11.1_

  - [x] 18.3 Create draw history display
    - Display draws in table format
    - Show month, year, winning numbers, winner counts, and status
    - Add expand/collapse functionality for each draw
    - Implement responsive table
    - _Requirements: 11.10_

  - [x] 18.4 Implement draw expansion functionality
    - Fetch detailed draw data using drawAPI.getDrawById() when expanded
    - Display participants list with scores
    - Display winners list with match types and prize amounts
    - Add collapse functionality
    - _Requirements: 11.11_

  - [x] 18.5 Create draw creation form
    - Add "Create Draw" button to open form modal
    - Create form with fields (month, year, draw type: random/algorithmic)
    - Validate month (1-12) and year (current or future)
    - _Requirements: 11.2, 11.3_

  - [x] 18.6 Implement draw simulation functionality
    - Add "Simulate" button to form
    - Call drawAPI.createDraw() with simulate=true parameter
    - Display simulation results (winning numbers, prize pools, winner counts, jackpot rollover)
    - Keep form open to allow adjustments or publishing
    - _Requirements: 11.4, 11.5, 11.6_

  - [x] 18.7 Implement draw publishing functionality
    - Add "Publish Draw" button to form
    - Show confirmation dialog before publishing
    - Call drawAPI.createDraw() without simulate parameter
    - Show success toast on successful publication
    - Refresh draws list after publication
    - Close form modal
    - _Requirements: 11.7, 11.8, 11.9_

  - [ ]* 18.8 Write unit tests for AdminDraws
    - Test loading state display
    - Test successful data fetch and rendering
    - Test draw creation form
    - Test draw simulation
    - Test draw publishing with confirmation
    - Test draw expansion

- [x] 19. Implement AdminWinners page
  - [x] 19.1 Create AdminWinners component structure
    - Set up component with state management (winners, filter verification, filter payment, viewing proof, stats)
    - Add loading and error states
    - Implement responsive layout
    - _Requirements: 12.1, 12.15_

  - [x] 19.2 Implement data fetching for AdminWinners
    - Fetch winners using winnersAPI.getAllWinners() with filter parameters
    - Fetch winner statistics using winnersAPI.getWinnerStats()
    - Display loading spinner during fetch
    - Handle errors with toast notifications
    - _Requirements: 12.1, 12.14_

  - [x] 19.3 Create winner statistics display
    - Display total winners, pending verifications, pending payments, and total paid
    - Use StatCard components with appropriate colors
    - _Requirements: 12.14_

  - [x] 19.4 Create filter controls
    - Implement verification status filter dropdown (all, pending, approved, rejected)
    - Implement payment status filter dropdown (all, pending, paid)
    - Update displayed winners based on filters
    - _Requirements: 12.3, 12.4_

  - [ ]* 19.5 Write property test for winner filtering
    - **Property 10: Search and filter result consistency (winners)**
    - **Validates: Requirements 12.3, 12.4**
    - Test that all filtered results match filter criteria
    - Test that multiple filters work together correctly

  - [x] 19.6 Create winners table display
    - Display winner information (user name, draw details, match type, prize amount)
    - Display verification status with color-coded badges
    - Display payment status with color-coded badges
    - Add action buttons based on status
    - Implement responsive table
    - _Requirements: 12.2_

  - [x] 19.7 Implement proof viewing functionality
    - Add "View Proof" button for winners with pending verification
    - Open modal displaying proof image
    - Add "Approve" and "Reject" buttons in modal
    - _Requirements: 12.5, 12.6, 12.7_

  - [x] 19.8 Implement winner verification functionality
    - Handle approve action with winnersAPI.verifyWinner(id, { status: 'approved' })
    - Handle reject action by prompting for notes and calling winnersAPI.verifyWinner(id, { status: 'rejected', notes })
    - Show success toast on successful verification
    - Refresh winners list after verification
    - Close proof modal
    - _Requirements: 12.8, 12.9, 12.10_

  - [x] 19.9 Implement payment marking functionality
    - Add "Mark as Paid" button for approved winners with pending payment
    - Show confirmation dialog before marking as paid
    - Handle action with winnersAPI.markAsPaid(id)
    - Show success toast on successful payment marking
    - Refresh winners list after marking
    - _Requirements: 12.11, 12.12, 12.13_

  - [ ]* 19.10 Write unit tests for AdminWinners
    - Test loading state display
    - Test successful data fetch and rendering
    - Test filter functionality
    - Test proof viewing
    - Test winner verification (approve and reject)
    - Test payment marking with confirmation

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 21. Implement global error handling and loading states
  - [ ] 21.1 Create API error interceptor
    - Set up axios response interceptor in api.js
    - Handle 401 errors by redirecting to login
    - Handle 403 errors with "Access denied" toast
    - Handle 404 errors with "Resource not found" toast
    - Handle 500 errors with "Server error" toast
    - Handle network errors with "Network error" toast
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 21.2 Write property test for error handling
    - **Property 2: Error notification on API failures**
    - **Validates: Requirements 1.7, 13.2-13.6, 13.8**
    - Test that all error types display appropriate notifications
    - Test that 401 errors trigger redirect to login

  - [ ]* 21.3 Write property test for loading states
    - **Property 1: Loading state display**
    - **Validates: Requirements 1.6, 13.1**
    - Test that loading indicators display during async operations
    - Test that loading indicators hide after completion

  - [ ]* 21.4 Write property test for success notifications
    - **Property 7: Success notification on operations**
    - **Validates: Requirements 2.6, 3.7, 6.8, 10.5, 10.8, 10.11, 11.9, 12.10, 12.13, 13.7**
    - Test that all successful operations display success toast
    - Test that toast messages are appropriate for each operation

- [ ] 22. Implement responsive design and accessibility
  - [ ] 22.1 Add responsive breakpoints to all pages
    - Verify all pages use Tailwind CSS breakpoints (sm, md, lg, xl)
    - Test single-column layout on mobile (< 768px)
    - Test optimized layouts on tablet (768px - 1024px)
    - Test full layouts on desktop (> 1024px)
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 22.2 Ensure minimum touch target sizes
    - Verify all buttons and interactive elements are at least 44x44 pixels on mobile
    - Add padding or increase size where needed
    - _Requirements: 14.5_

  - [ ] 22.3 Verify color contrast and accessibility
    - Check all text has sufficient color contrast (WCAG AA minimum)
    - Ensure all form inputs have associated labels
    - Ensure all images have alt text
    - _Requirements: 14.6, 14.7, 14.8_

  - [ ]* 22.4 Write property test for accessibility compliance
    - **Property 12: Accessibility compliance**
    - **Validates: Requirements 14.7, 14.8**
    - Test that all form inputs have associated labels
    - Test that all images have alt attributes

- [ ] 23. Implement animations and visual feedback
  - [ ] 23.1 Add page load animations
    - Apply fade-in animations to page content using Framer Motion
    - Set appropriate animation duration and easing
    - _Requirements: 15.1_

  - [ ] 23.2 Add modal animations
    - Apply scale-in animation when modal opens
    - Apply fade-out animation when modal closes
    - Use Framer Motion AnimatePresence for exit animations
    - _Requirements: 15.2, 15.3_

  - [ ] 23.3 Add toast notification animations
    - Configure react-hot-toast to slide in from top-right
    - Configure fade-out animation on dismiss
    - _Requirements: 15.4, 15.5_

  - [ ] 23.4 Add button and card interactions
    - Apply scale-down effect on button click using CSS transitions
    - Apply lift effect with shadow on card hover
    - _Requirements: 15.6, 15.7_

  - [ ] 23.5 Implement reduced motion support
    - Add prefers-reduced-motion media query check
    - Disable or reduce animations when user prefers reduced motion
    - Apply to all Framer Motion animations and CSS transitions
    - _Requirements: 15.9_

  - [ ]* 23.6 Write property test for reduced motion preference
    - **Property 13: Reduced motion preference**
    - **Validates: Requirements 15.9**
    - Test that animations are disabled when prefers-reduced-motion is enabled
    - Test that animations work normally when preference is not set

- [x] 24. Update routing configuration
  - [x] 24.1 Add routes for all new pages
    - Add public routes (CharitiesPage, CharityDetailPage, DrawsPage, PricingPage)
    - Add protected user routes (DashboardPage, ScoresPage, WinningsPage)
    - Add protected admin routes (AdminDashboard, AdminUsers, AdminCharities, AdminDraws, AdminWinners)
    - Verify route protection with authentication checks
    - _Requirements: All page requirements_

  - [x] 24.2 Update navigation components
    - Add navigation links to Navbar for new pages
    - Update Footer with relevant links
    - Ensure navigation reflects user authentication status and role
    - _Requirements: All page requirements_

  - [ ]* 24.3 Write unit tests for routing
    - Test that all routes render correct components
    - Test that protected routes redirect to login when not authenticated
    - Test that admin routes redirect when user is not admin
    - Test navigation between pages

- [ ] 25. Final integration and testing
  - [ ] 25.1 Test complete user flows
    - Test user registration → login → dashboard → add scores → select charity → view draws → view winnings
    - Test admin login → dashboard → manage users → manage charities → create draw → verify winners → mark payments
    - Verify all API integrations work correctly
    - Verify all error handling works correctly
    - _Requirements: All requirements_

  - [ ] 25.2 Test responsive design on all devices
    - Test all pages on mobile viewport (375px, 414px)
    - Test all pages on tablet viewport (768px, 1024px)
    - Test all pages on desktop viewport (1280px, 1920px)
    - Verify layouts adapt correctly at all breakpoints
    - _Requirements: 14.1-14.4_

  - [ ] 25.3 Verify accessibility compliance
    - Run accessibility audit using browser dev tools
    - Test keyboard navigation on all pages
    - Test screen reader compatibility on critical flows
    - Fix any accessibility issues found
    - _Requirements: 14.6-14.8_

  - [ ]* 25.4 Run all property-based tests
    - Execute all property tests with 100+ iterations
    - Verify all properties pass consistently
    - Fix any failing properties

  - [ ]* 25.5 Run all unit tests
    - Execute complete test suite
    - Verify minimum 80% code coverage
    - Fix any failing tests

- [ ] 26. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- All pages follow consistent patterns for data fetching, error handling, and loading states
- Shared components are built first to enable reuse across all pages
- User pages are implemented before admin pages to establish patterns
- Final integration testing ensures all components work together correctly

