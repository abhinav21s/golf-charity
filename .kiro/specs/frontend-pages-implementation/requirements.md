# Requirements Document

## Introduction

This document specifies the requirements for implementing 11 fully functional frontend pages for the Golf Charity Platform. The backend APIs are complete and functional, and the authentication pages (Login/Register), HomePage, Navbar, and Footer are already implemented. This feature focuses on building the remaining user-facing and admin pages with complete UI/UX, API integration, state management, form validation, and error handling.

## Glossary

- **Frontend_Application**: The React-based web application that users interact with
- **User_Dashboard**: The main authenticated user interface showing subscription status, scores, and charity information
- **Score_Entry_System**: The interface for users to add, edit, and delete their golf scores (Stableford format, 1-45)
- **Charity_Browser**: The interface for browsing and selecting charities to support
- **Draw_Viewer**: The interface for viewing published monthly draws and results
- **Winnings_Manager**: The interface for users to view winnings and upload proof images
- **Pricing_Interface**: The interface displaying subscription plans (monthly/yearly)
- **Admin_Dashboard**: The administrative interface showing platform statistics
- **Admin_User_Manager**: The administrative interface for managing users and subscriptions
- **Admin_Charity_Manager**: The administrative interface for CRUD operations on charities
- **Admin_Draw_Manager**: The administrative interface for creating and publishing draws
- **Admin_Winner_Manager**: The administrative interface for verifying winners and processing payments
- **API_Service**: The backend REST API providing data and operations
- **Toast_Notification**: A temporary notification message displayed to users
- **Loading_State**: A visual indicator shown while data is being fetched
- **Form_Validation**: Client-side validation of user input before submission
- **Responsive_Design**: UI that adapts to different screen sizes (mobile, tablet, desktop)

## Requirements

### Requirement 1: User Dashboard Page

**User Story:** As a logged-in user, I want to view my dashboard, so that I can see my subscription status, recent scores, selected charity, and participation summary at a glance.

#### Acceptance Criteria

1. WHEN the User_Dashboard loads, THE Frontend_Application SHALL fetch and display the user's subscription status
2. WHEN the User_Dashboard loads, THE Frontend_Application SHALL fetch and display the user's 5 most recent scores
3. WHEN the User_Dashboard loads, THE Frontend_Application SHALL fetch and display the user's selected charity with contribution percentage
4. WHEN the User_Dashboard loads, THE Frontend_Application SHALL fetch and display the user's draw participation history
5. WHEN the User_Dashboard loads, THE Frontend_Application SHALL fetch and display the user's total winnings summary
6. WHILE data is being fetched, THE Frontend_Application SHALL display Loading_State indicators
7. IF an API request fails, THEN THE Frontend_Application SHALL display an error Toast_Notification
8. THE Frontend_Application SHALL implement Responsive_Design for the User_Dashboard
9. THE Frontend_Application SHALL provide quick action buttons to navigate to Scores, Charities, and Winnings pages

### Requirement 2: Score Entry and Management Page

**User Story:** As a logged-in user, I want to manage my golf scores, so that I can participate in monthly draws.

#### Acceptance Criteria

1. WHEN the Score_Entry_System loads, THE Frontend_Application SHALL fetch and display the user's current scores (maximum 5)
2. THE Frontend_Application SHALL provide a form to add new scores with fields for score value (1-45) and date
3. WHEN a user submits a new score, THE Frontend_Application SHALL validate that the score is between 1 and 45
4. WHEN a user submits a new score, THE Frontend_Application SHALL validate that the date is not in the future
5. WHEN Form_Validation fails, THE Frontend_Application SHALL display inline error messages
6. WHEN a score is successfully added, THE Frontend_Application SHALL display a success Toast_Notification
7. WHEN a user has 5 scores and adds a new one, THE Frontend_Application SHALL display a warning that the oldest score will be removed
8. THE Frontend_Application SHALL provide edit functionality for existing scores
9. THE Frontend_Application SHALL provide delete functionality for existing scores
10. WHEN a score is edited or deleted, THE Frontend_Application SHALL display a confirmation Toast_Notification
11. THE Frontend_Application SHALL display score statistics (average, highest, lowest)
12. THE Frontend_Application SHALL implement Responsive_Design for the Score_Entry_System

### Requirement 3: Charity Browsing and Selection Page

**User Story:** As a user, I want to browse and select a charity, so that I can direct my subscription contributions to causes I care about.

#### Acceptance Criteria

1. WHEN the Charity_Browser loads, THE Frontend_Application SHALL fetch and display all active charities
2. THE Frontend_Application SHALL display charities with name, logo, description, and featured status
3. THE Frontend_Application SHALL provide search functionality to filter charities by name
4. THE Frontend_Application SHALL highlight featured charities visually
5. WHEN a logged-in user selects a charity, THE Frontend_Application SHALL display a modal to confirm selection and set contribution percentage (10-100%)
6. WHEN contribution percentage is set, THE Frontend_Application SHALL validate it is between 10 and 100
7. WHEN a charity is successfully selected, THE Frontend_Application SHALL display a success Toast_Notification
8. THE Frontend_Application SHALL display the user's currently selected charity with a visual indicator
9. WHEN a charity card is clicked, THE Frontend_Application SHALL navigate to the charity detail page
10. THE Frontend_Application SHALL implement Responsive_Design for the Charity_Browser

### Requirement 4: Charity Detail Page

**User Story:** As a user, I want to view detailed information about a charity, so that I can learn more before selecting it.

#### Acceptance Criteria

1. WHEN the charity detail page loads, THE Frontend_Application SHALL fetch and display the charity's full information
2. THE Frontend_Application SHALL display charity name, logo, full description, website URL, and contact email
3. THE Frontend_Application SHALL display charity events if available
4. THE Frontend_Application SHALL display total contributions received by the charity
5. WHERE the user is logged in, THE Frontend_Application SHALL provide a "Select This Charity" button
6. WHEN the "Select This Charity" button is clicked, THE Frontend_Application SHALL open the selection modal
7. THE Frontend_Application SHALL implement Responsive_Design for the charity detail page

### Requirement 5: Draws Viewing Page

**User Story:** As a user, I want to view published draws, so that I can see winning numbers, prize amounts, and winners.

#### Acceptance Criteria

1. WHEN the Draw_Viewer loads, THE Frontend_Application SHALL fetch and display all published draws
2. THE Frontend_Application SHALL display draws ordered by date (most recent first)
3. THE Frontend_Application SHALL display draw month, year, winning numbers, and total prize pool for each draw
4. THE Frontend_Application SHALL display prize breakdown (5-match, 4-match, 3-match pools)
5. THE Frontend_Application SHALL display winner counts for each match type
6. THE Frontend_Application SHALL display jackpot rollover amount if no 5-match winners
7. WHEN a draw card is clicked, THE Frontend_Application SHALL expand to show detailed participant and winner information
8. THE Frontend_Application SHALL implement Responsive_Design for the Draw_Viewer

### Requirement 6: Winnings Management Page

**User Story:** As a logged-in user, I want to view my winnings and upload proof, so that I can receive my prize payments.

#### Acceptance Criteria

1. WHEN the Winnings_Manager loads, THE Frontend_Application SHALL fetch and display the user's winnings
2. THE Frontend_Application SHALL display total won, total paid, and pending amounts
3. THE Frontend_Application SHALL display each winning with draw details, match type, prize amount, verification status, and payment status
4. WHERE verification status is "not_submitted", THE Frontend_Application SHALL provide an upload button
5. WHEN the upload button is clicked, THE Frontend_Application SHALL open a file picker for image selection
6. WHEN an image is selected, THE Frontend_Application SHALL validate it is an image file (jpg, jpeg, png, gif)
7. WHEN an image is selected, THE Frontend_Application SHALL validate file size is under 5MB
8. WHEN proof upload is successful, THE Frontend_Application SHALL display a success Toast_Notification
9. THE Frontend_Application SHALL display verification status with color-coded badges (pending: yellow, approved: green, rejected: red)
10. THE Frontend_Application SHALL display payment status with color-coded badges (pending: yellow, paid: green)
11. THE Frontend_Application SHALL implement Responsive_Design for the Winnings_Manager

### Requirement 7: Pricing Page

**User Story:** As a user, I want to view subscription plans, so that I can choose and purchase a plan.

#### Acceptance Criteria

1. WHEN the Pricing_Interface loads, THE Frontend_Application SHALL display monthly and yearly subscription plans
2. THE Frontend_Application SHALL display plan pricing, billing frequency, and features
3. THE Frontend_Application SHALL display charity contribution information (minimum 10%)
4. THE Frontend_Application SHALL highlight the recommended plan visually
5. WHERE the user is not logged in, THE Frontend_Application SHALL display "Sign Up" buttons that navigate to registration
6. WHERE the user is logged in without a subscription, THE Frontend_Application SHALL display "Subscribe" buttons
7. WHERE the user is logged in with an active subscription, THE Frontend_Application SHALL display "Current Plan" badge on the active plan
8. WHEN a "Subscribe" button is clicked, THE Frontend_Application SHALL display a message that Stripe integration is pending
9. THE Frontend_Application SHALL implement Responsive_Design for the Pricing_Interface

### Requirement 8: Admin Dashboard Page

**User Story:** As an admin, I want to view platform statistics, so that I can monitor the platform's health and activity.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display total user count
2. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display active subscription count
3. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display total prize pool amount
4. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display total charity contributions
5. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display pending winner verifications count
6. WHEN the Admin_Dashboard loads, THE Frontend_Application SHALL fetch and display pending payments count
7. THE Frontend_Application SHALL display statistics in card format with icons and color coding
8. THE Frontend_Application SHALL provide quick navigation links to admin management pages
9. THE Frontend_Application SHALL implement Responsive_Design for the Admin_Dashboard

### Requirement 9: Admin User Management Page

**User Story:** As an admin, I want to manage users, so that I can view user details, subscriptions, and scores.

#### Acceptance Criteria

1. WHEN the Admin_User_Manager loads, THE Frontend_Application SHALL fetch and display all users
2. THE Frontend_Application SHALL display user information including name, email, role, status, and registration date
3. THE Frontend_Application SHALL display subscription status for each user
4. THE Frontend_Application SHALL provide search functionality to filter users by name or email
5. THE Frontend_Application SHALL provide filter functionality to show only active/inactive users
6. WHEN a user row is clicked, THE Frontend_Application SHALL expand to show detailed information including scores
7. THE Frontend_Application SHALL display user scores with dates and values
8. THE Frontend_Application SHALL implement pagination for large user lists
9. THE Frontend_Application SHALL implement Responsive_Design for the Admin_User_Manager

### Requirement 10: Admin Charity Management Page

**User Story:** As an admin, I want to manage charities, so that I can add, edit, and remove charities from the platform.

#### Acceptance Criteria

1. WHEN the Admin_Charity_Manager loads, THE Frontend_Application SHALL fetch and display all charities
2. THE Frontend_Application SHALL provide an "Add Charity" button to open a creation form
3. WHEN the "Add Charity" button is clicked, THE Frontend_Application SHALL display a modal with form fields (name, description, logo URL, website URL, contact email, featured status)
4. WHEN the charity creation form is submitted, THE Frontend_Application SHALL validate all required fields are filled
5. WHEN a charity is successfully created, THE Frontend_Application SHALL display a success Toast_Notification
6. THE Frontend_Application SHALL provide edit functionality for each charity
7. WHEN the edit button is clicked, THE Frontend_Application SHALL display a modal pre-filled with charity data
8. WHEN a charity is successfully updated, THE Frontend_Application SHALL display a success Toast_Notification
9. THE Frontend_Application SHALL provide delete functionality for each charity
10. WHEN the delete button is clicked, THE Frontend_Application SHALL display a confirmation dialog
11. WHEN a charity is successfully deleted, THE Frontend_Application SHALL display a success Toast_Notification
12. THE Frontend_Application SHALL display charity statistics (total contributions, active users)
13. THE Frontend_Application SHALL implement Responsive_Design for the Admin_Charity_Manager

### Requirement 11: Admin Draw Management Page

**User Story:** As an admin, I want to create and publish draws, so that I can run monthly draws and determine winners.

#### Acceptance Criteria

1. WHEN the Admin_Draw_Manager loads, THE Frontend_Application SHALL fetch and display all draws
2. THE Frontend_Application SHALL provide a "Create Draw" button to open the draw creation form
3. WHEN the "Create Draw" button is clicked, THE Frontend_Application SHALL display a form with fields (month, year, draw type: random/algorithmic)
4. THE Frontend_Application SHALL provide a "Simulate" button to preview draw results without saving
5. WHEN the "Simulate" button is clicked, THE Frontend_Application SHALL call the API with simulate=true parameter
6. WHEN simulation results are returned, THE Frontend_Application SHALL display winning numbers, prize pools, winner counts, and next month jackpot
7. THE Frontend_Application SHALL provide a "Publish Draw" button to create and save the draw
8. WHEN the "Publish Draw" button is clicked, THE Frontend_Application SHALL display a confirmation dialog
9. WHEN a draw is successfully published, THE Frontend_Application SHALL display a success Toast_Notification
10. THE Frontend_Application SHALL display draw history with month, year, winning numbers, and winner counts
11. WHEN a draw row is clicked, THE Frontend_Application SHALL expand to show detailed participants and winners
12. THE Frontend_Application SHALL implement Responsive_Design for the Admin_Draw_Manager

### Requirement 12: Admin Winner Management Page

**User Story:** As an admin, I want to manage winners, so that I can verify proof submissions and process payments.

#### Acceptance Criteria

1. WHEN the Admin_Winner_Manager loads, THE Frontend_Application SHALL fetch and display all winners
2. THE Frontend_Application SHALL display winner information including user name, draw details, match type, prize amount, verification status, and payment status
3. THE Frontend_Application SHALL provide filter functionality to show winners by verification status (pending, approved, rejected)
4. THE Frontend_Application SHALL provide filter functionality to show winners by payment status (pending, paid)
5. WHERE verification status is "pending", THE Frontend_Application SHALL display a "View Proof" button
6. WHEN the "View Proof" button is clicked, THE Frontend_Application SHALL display the uploaded proof image in a modal
7. THE Frontend_Application SHALL provide "Approve" and "Reject" buttons in the proof viewing modal
8. WHEN the "Approve" button is clicked, THE Frontend_Application SHALL call the verify API with status "approved"
9. WHEN the "Reject" button is clicked, THE Frontend_Application SHALL prompt for rejection notes and call the verify API with status "rejected"
10. WHEN verification is successful, THE Frontend_Application SHALL display a success Toast_Notification
11. WHERE verification status is "approved" and payment status is "pending", THE Frontend_Application SHALL display a "Mark as Paid" button
12. WHEN the "Mark as Paid" button is clicked, THE Frontend_Application SHALL display a confirmation dialog
13. WHEN payment is marked as paid, THE Frontend_Application SHALL display a success Toast_Notification
14. THE Frontend_Application SHALL display winner statistics (total winners, pending verifications, pending payments, total paid)
15. THE Frontend_Application SHALL implement Responsive_Design for the Admin_Winner_Manager

### Requirement 13: Error Handling and Loading States

**User Story:** As a user, I want clear feedback on system status, so that I understand when operations are in progress or have failed.

#### Acceptance Criteria

1. WHILE any API request is in progress, THE Frontend_Application SHALL display Loading_State indicators
2. IF an API request fails with a network error, THEN THE Frontend_Application SHALL display a Toast_Notification with message "Network error. Please check your connection."
3. IF an API request fails with a 401 status, THEN THE Frontend_Application SHALL redirect to the login page
4. IF an API request fails with a 403 status, THEN THE Frontend_Application SHALL display a Toast_Notification with message "Access denied"
5. IF an API request fails with a 404 status, THEN THE Frontend_Application SHALL display a Toast_Notification with message "Resource not found"
6. IF an API request fails with a 500 status, THEN THE Frontend_Application SHALL display a Toast_Notification with message "Server error. Please try again later."
7. WHEN a form submission succeeds, THE Frontend_Application SHALL display a success Toast_Notification
8. WHEN a form submission fails, THE Frontend_Application SHALL display an error Toast_Notification with the error message from the API

### Requirement 14: Responsive Design and Accessibility

**User Story:** As a user on any device, I want the application to work well, so that I can access all features regardless of screen size.

#### Acceptance Criteria

1. THE Frontend_Application SHALL implement Responsive_Design for all pages using Tailwind CSS breakpoints
2. WHEN viewed on mobile devices (< 768px), THE Frontend_Application SHALL display single-column layouts
3. WHEN viewed on tablet devices (768px - 1024px), THE Frontend_Application SHALL display optimized two-column layouts where appropriate
4. WHEN viewed on desktop devices (> 1024px), THE Frontend_Application SHALL display full multi-column layouts
5. THE Frontend_Application SHALL ensure all interactive elements have minimum touch target size of 44x44 pixels on mobile
6. THE Frontend_Application SHALL ensure all text has sufficient color contrast for readability
7. THE Frontend_Application SHALL ensure all form inputs have associated labels
8. THE Frontend_Application SHALL ensure all images have alt text

### Requirement 15: Animation and Visual Feedback

**User Story:** As a user, I want smooth and engaging interactions, so that the application feels polished and responsive.

#### Acceptance Criteria

1. WHEN a page loads, THE Frontend_Application SHALL apply fade-in animations to content
2. WHEN a modal opens, THE Frontend_Application SHALL apply scale-in animation
3. WHEN a modal closes, THE Frontend_Application SHALL apply fade-out animation
4. WHEN a Toast_Notification appears, THE Frontend_Application SHALL slide in from the top-right
5. WHEN a Toast_Notification disappears, THE Frontend_Application SHALL fade out
6. WHEN a button is clicked, THE Frontend_Application SHALL apply a scale-down effect
7. WHEN a card is hovered, THE Frontend_Application SHALL apply a subtle lift effect with shadow
8. THE Frontend_Application SHALL use Framer Motion for complex animations
9. THE Frontend_Application SHALL ensure all animations respect user's prefers-reduced-motion setting
