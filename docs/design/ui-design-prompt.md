# UI Design Prompt - SimRacing Shop

## Project Context

**SimRacing Shop** is a premium e-commerce platform for customizable sim racing hardware (steering wheels, pedals, cockpits, accessories). The platform features an innovative **interactive 3D product viewer** that allows customers to customize and visualize products in real-time before purchase.

**Target Audience**: Serious sim racing enthusiasts, competitive esports players, and professional racing simulator users. Age range 25-45, tech-savvy, willing to invest in premium equipment.

**Brand Positioning**: Premium, innovative, performance-focused. Not a gaming store - a professional racing equipment destination.

---

## Design System Specification

### Color Palette

#### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Obsidian Black** | `#0A0A0A` | Primary backgrounds, headers, hero sections |
| **Carbon Gray** | `#171717` | Secondary backgrounds, cards, elevated surfaces |
| **Graphite** | `#262626` | Tertiary backgrounds, borders, dividers |

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Racing Red** | `#E53935` | Primary CTAs, sale badges, urgent actions |
| **Electric Blue** | `#2196F3` | Links, interactive elements, focus states |
| **Champagne Gold** | `#C9AF89` | Premium highlights, special editions, loyalty |

#### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Pure White** | `#FFFFFF` | Primary text on dark, cards on light mode |
| **Silver** | `#9CA3AF` | Secondary text, placeholders, disabled states |
| **Smoke** | `#4B5563` | Tertiary text, captions, metadata |

#### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Confirmations, in-stock, completed |
| **Warning** | `#F59E0B` | Low stock, attention needed |
| **Error** | `#EF4444` | Errors, out of stock, validation |

### Typography

**Font Family**: Inter (Primary), SF Pro Display (Alternative)

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|---------------|---------------|--------|-------------|
| Display H1 | 72px | 40px | 700 | 1.1 |
| Hero H1 | 56px | 32px | 700 | 1.15 |
| Section H2 | 40px | 28px | 600 | 1.2 |
| Card H3 | 24px | 20px | 600 | 1.3 |
| Body Large | 18px | 16px | 400 | 1.6 |
| Body | 16px | 14px | 400 | 1.6 |
| Caption | 14px | 12px | 400 | 1.5 |
| Button | 16px | 14px | 600 | 1 |

### Spacing System (8px base)

```
4px  (0.5) - Micro spacing, icon gaps
8px  (1)   - Tight spacing, inline elements
16px (2)   - Default spacing, form fields
24px (3)   - Component padding
32px (4)   - Section gaps
48px (6)   - Large section gaps
64px (8)   - Hero padding
96px (12)  - Major section separation
```

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Cards | 12px |
| Modals | 16px |
| Pills/Tags | 9999px (full) |
| Inputs | 8px |

### Shadows & Elevation

```css
/* Elevation 1 - Cards, dropdowns */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);

/* Elevation 2 - Hover states, floating elements */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);

/* Elevation 3 - Modals, popovers */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

/* Glow effect for CTAs */
shadow-glow: 0 0 20px rgba(229, 57, 53, 0.4);
```

### Effects & Animations

- **Backdrop blur**: `blur(12px)` for overlays and glass effects
- **Transitions**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Hover scale**: `transform: scale(1.02)`
- **Loading pulse**: Subtle opacity animation (0.5 to 1)

---

## Component Library

### Buttons

#### Primary Button
- Background: Racing Red (`#E53935`)
- Text: White
- Padding: 16px 32px
- Hover: Darken 10%, add glow shadow
- Active: Scale 0.98
- Disabled: 50% opacity, no interactions

#### Secondary Button
- Background: Transparent
- Border: 1px solid White
- Text: White
- Hover: Background white at 10% opacity

#### Ghost Button
- Background: Transparent
- Text: Electric Blue
- Hover: Underline animation

### Form Inputs

- Background: Carbon Gray (`#171717`)
- Border: 1px solid Graphite (`#262626`)
- Text: White
- Placeholder: Silver (`#9CA3AF`)
- Focus: Border Electric Blue, subtle glow
- Error: Border Error Red, error message below
- Height: 48px (desktop), 44px (mobile)

### Cards

#### Product Card
- Background: Carbon Gray
- Border: 1px solid transparent
- Hover: Border Graphite, elevation shadow, image zoom 1.05
- Content: Image (aspect 4:3), title, price, rating (optional)
- Quick actions: Add to cart icon on hover

#### Feature Card
- Background: Gradient from Obsidian to Carbon
- Icon: 48px, Champagne Gold
- Title: H3
- Description: Body, Silver text

### Navigation

#### Header (Sticky)
- Background: Obsidian Black with backdrop blur
- Height: 72px (desktop), 64px (mobile)
- Logo: Left aligned
- Nav links: Center (desktop), hamburger menu (mobile)
- Actions: Search, Account, Cart - Right aligned
- Cart badge: Racing Red circle with count

#### Mega Menu
- Full width dropdown
- Background: Carbon Gray with backdrop blur
- Grid layout for categories
- Featured product highlight

---

## Page Specifications

---

### PAGE 1: Home / Landing Page

**Purpose**: Capture attention, showcase brand premium positioning, drive to product discovery.

#### Section 1: Hero
- **Layout**: Full viewport height (100vh)
- **Background**: Looping video of sim racing cockpit in action (dark, atmospheric lighting) OR high-quality static image with subtle parallax
- **Overlay**: Gradient from bottom `rgba(10,10,10,0.9)` to top `rgba(10,10,10,0)`
- **Content** (centered):
  - Tagline: "ENGINEERED FOR VICTORY" (Display H1, uppercase, letter-spacing 4px)
  - Subtitle: "Premium sim racing equipment for those who demand perfection" (Body Large, Silver)
  - CTA Group:
    - Primary: "EXPLORE PRODUCTS" (Racing Red button)
    - Secondary: "WATCH VIDEO" (Ghost button with play icon)
- **Scroll indicator**: Animated chevron at bottom

#### Section 2: Featured Categories (Bento Grid)
- **Background**: Obsidian Black
- **Layout**: Asymmetric grid (CSS Grid)
  - Desktop: 2 large tiles (2x2), 3 small tiles (1x1)
  - Mobile: Stack vertically
- **Categories**:
  1. Steering Wheels (large) - Image of premium wheel
  2. Wheel Bases (large) - Image of direct drive base
  3. Pedals (small)
  4. Cockpits (small)
  5. Accessories (small)
- **Card style**:
  - Full-bleed image
  - Category name overlay (bottom-left)
  - "Explore" link with arrow
  - Hover: Image zoom, border glow

#### Section 3: Featured Products
- **Background**: Carbon Gray
- **Title**: "BEST SELLERS" (H2, centered)
- **Layout**: Horizontal scroll carousel (desktop shows 4, mobile 1.5)
- **Product cards**: Standard product card component
- **Navigation**: Arrow buttons + dot indicators
- **CTA**: "View All Products" link below

#### Section 4: 3D Configurator Promo
- **Layout**: Split screen (60% visual, 40% content)
- **Visual side**:
  - Interactive 3D preview of steering wheel (subtle auto-rotation)
  - Floating UI elements showing customization options
- **Content side**:
  - Badge: "EXCLUSIVE FEATURE" (Champagne Gold pill)
  - Title: "Build Your Perfect Setup" (H2)
  - Description: Explain 3D configurator capabilities
  - Feature list with checkmarks:
    - Real-time 3D visualization
    - Custom colors and materials
    - Save and share configurations
  - CTA: "START CONFIGURING" (Primary button)

#### Section 5: Trust Indicators
- **Background**: Obsidian Black
- **Layout**: 4-column grid (2x2 on mobile)
- **Items**:
  1. "FREE SHIPPING" - Truck icon - "On orders over 100 EUR"
  2. "2 YEAR WARRANTY" - Shield icon - "Full coverage included"
  3. "SECURE PAYMENT" - Lock icon - "256-bit SSL encryption"
  4. "EXPERT SUPPORT" - Headset icon - "Racing specialists available"
- **Style**: Icon + title + description, centered, Silver icons

#### Section 6: Newsletter CTA
- **Background**: Gradient Racing Red to darker red
- **Layout**: Centered content
- **Title**: "JOIN THE RACING COMMUNITY" (H2, White)
- **Description**: "Get exclusive offers, early access, and racing tips"
- **Form**: Email input + Subscribe button (White button on red)
- **Privacy note**: Small text linking to privacy policy

#### Footer
- **Background**: Obsidian Black
- **Columns**:
  1. Logo + tagline + social icons
  2. Shop: Products, Categories, New Arrivals, Sale
  3. Support: Contact, FAQ, Shipping, Returns
  4. Company: About, Blog, Careers, Press
- **Bottom bar**: Copyright, payment icons, legal links

---

### PAGE 2: Product Listing Page (PLP)

**Purpose**: Browse and filter products efficiently, encourage exploration.

#### Header Section
- **Breadcrumb**: Home > Category Name
- **Title**: Category name (H1)
- **Results count**: "Showing 24 of 156 products" (Caption, Silver)
- **View toggles**: Grid (2/3/4 columns) / List view icons
- **Sort dropdown**: "Sort by: Featured / Price Low-High / Price High-Low / Newest / Rating"

#### Layout: Sidebar + Grid

##### Sidebar Filters (Desktop: Left 280px, Mobile: Slide-in drawer)
- **Background**: Carbon Gray
- **Sections** (collapsible accordions):

1. **Categories** (if viewing all products)
   - Checkbox list with count badges

2. **Price Range**
   - Dual-handle range slider
   - Min/Max input fields
   - Quick presets: "Under 200 EUR", "200-500 EUR", "500+ EUR"

3. **Brand**
   - Checkbox list with logos
   - Search within filter

4. **Compatibility**
   - Platform checkboxes: PC, PlayStation, Xbox
   - Ecosystem: Fanatec, Thrustmaster, Logitech

5. **Rating**
   - Star rating buttons (4+, 3+, etc.)

6. **Availability**
   - In Stock only toggle
   - Include Pre-orders toggle

- **Actions**:
  - "Clear All" link
  - "Apply Filters" button (mobile only)

- **Active filters**: Pills showing applied filters with X to remove

##### Product Grid
- **Columns**: 3 (desktop), 2 (tablet), 1 (mobile - card style)
- **Gap**: 24px
- **Product Card Content**:
  - Image container (aspect 4:3, object-fit contain, gray background)
  - Badges overlay: "NEW", "SALE -20%", "LOW STOCK" (positioned top-left)
  - Wishlist heart icon (top-right, toggleable)
  - Product name (H3, 2 lines max, ellipsis)
  - Brand name (Caption, Silver)
  - Rating stars + review count
  - Price: Current price (bold) + Original price (strikethrough if on sale)
  - Quick add to cart button (appears on hover, desktop)

#### States

##### Loading State
- Skeleton cards matching product card dimensions
- Pulsing animation
- Show 6-12 skeleton cards

##### Empty State
- Illustration of empty box or search
- "No products found" (H3)
- "Try adjusting your filters or search terms" (Body, Silver)
- "Clear Filters" button

##### Error State
- Error icon
- "Something went wrong" (H3)
- "We couldn't load the products. Please try again." (Body)
- "Retry" button

#### Pagination Options

**Option A: Traditional Pagination**
- Page numbers: 1, 2, 3... with ellipsis
- Previous/Next arrows
- "Page X of Y" indicator
- Items per page selector: 24, 48, 96

**Option B: Infinite Scroll**
- Auto-load on scroll threshold (200px from bottom)
- Loading spinner during fetch
- "Load More" button as fallback
- Progress indicator: "Showing 48 of 156 products"
- "Back to top" floating button after scrolling

---

### PAGE 3: Product Detail Page (PDP)

**Purpose**: Provide comprehensive product information, enable customization, drive conversion.

#### Section 1: Main Product Area

##### Layout: Two-column (55% media, 45% info) on desktop, stacked on mobile

###### Left Column: Media Gallery + 3D Viewer

**Tab Navigation**:
- "3D View" (default if available)
- "Gallery"
- "Videos" (if available)

**3D Viewer Tab**:
- **Container**: Full column width, aspect 1:1, Carbon Gray background
- **3D Model**: Interactive Three.js/React Three Fiber viewer
- **Controls**:
  - Orbit: Click + drag to rotate
  - Zoom: Scroll or pinch
  - Reset view button
  - Fullscreen toggle
- **Customization Panel** (overlay, bottom):
  - Color swatches for selectable parts
  - Material options (leather, alcantara, carbon fiber)
  - Live preview of changes
- **Loading state**: Circular progress with percentage

**Gallery Tab**:
- **Main image**: Large, zoomable on hover (lens effect)
- **Thumbnails**: Horizontal scroll below main image
- **Lightbox**: Click to open fullscreen gallery with arrows

**Videos Tab**:
- Embedded video player
- Product demo/review videos

###### Right Column: Product Information

**Breadcrumb**: Home > Category > Subcategory > Product

**Product Title** (H1): Full product name

**Brand**: Logo + name, clickable to brand page

**Rating**: Stars + "(123 reviews)" link to reviews section

**Price Block**:
- Current price (large, bold)
- Original price (strikethrough if discounted)
- Discount badge: "SAVE 20%" (Racing Red)
- Financing option: "or 4x 62.50 EUR with Klarna" (small)

**Availability**:
- In Stock: Green dot + "In Stock - Ships within 24h"
- Low Stock: Orange dot + "Only 3 left!"
- Pre-order: Blue dot + "Pre-order - Ships March 2024"
- Out of Stock: Red dot + "Out of Stock" + "Notify Me" button

**Variant Selectors** (if applicable):
- Color: Visual swatches with tooltips
- Size/Version: Button group or dropdown
- Platform compatibility: Icon buttons (PC/PS/Xbox)

**Quantity Selector**:
- Minus/Plus buttons with number input
- Max stock validation

**Action Buttons**:
- Primary: "ADD TO CART" (full width, Racing Red)
- Secondary: "ADD TO WISHLIST" (heart icon, outline button)
- Share: Icon buttons for social/copy link

**Shipping Info**:
- Estimated delivery date
- Free shipping threshold indicator
- Store pickup option (if available)

**Trust badges**: Secure checkout, warranty, returns policy icons

---

#### Section 2: Product Details Tabs

**Tab Navigation**: Sticky on scroll, underline style

##### Tab 1: Description
- Rich text product description
- Key features bullet list
- "What's in the box" list

##### Tab 2: Technical Specifications
- **Table layout**: Label-Value pairs
- **Grouped sections**:
  - General: Brand, Model, SKU, Release Date
  - Physical: Dimensions, Weight, Materials
  - Technical: Motor type, Force feedback, Resolution
  - Compatibility: Platforms, Mounting, Ecosystem
- **Comparison link**: "Compare with similar products"

##### Tab 3: Reviews
- **Summary**:
  - Average rating (large number + stars)
  - Rating distribution bars (5 to 1 star)
  - Total review count
- **Filter/Sort**:
  - Sort: Most recent, Highest rated, Lowest rated, Most helpful
  - Filter: By rating, Verified purchase only
- **Review Cards**:
  - User avatar + name + "Verified Buyer" badge
  - Star rating + date
  - Review title (bold)
  - Review text (expandable if long)
  - Helpful vote: "Was this helpful?" Yes/No counts
  - Photos attached (if any)
- **Write Review CTA**: "Write a Review" button (requires login)
- **Pagination**: Load more button

##### Tab 4: Q&A
- Search questions input
- Question cards with answers
- "Ask a Question" button

---

#### Section 3: Related Products

- **Title**: "CUSTOMERS ALSO VIEWED" or "COMPLETE YOUR SETUP"
- **Carousel**: Product cards, 4 visible desktop
- **Logic**: Show compatible accessories, same category items

---

### PAGE 4: Registration Page

**Purpose**: Capture new users with minimal friction while collecting necessary information.

#### Layout: Split screen (desktop), single column (mobile)

##### Left Side (Desktop only): Brand Visual
- **Background**: Full-bleed atmospheric image of racing cockpit or hero product
- **Overlay**: Gradient for text readability
- **Content**:
  - Logo (top-left)
  - Tagline: "Join the Racing Elite"
  - Benefits list:
    - Exclusive member discounts
    - Order tracking & history
    - Wishlist & saved configurations
    - Early access to new products

##### Right Side: Registration Form

**Container**: Centered, max-width 440px, padding 48px

**Header**:
- Title: "Create Account" (H2)
- Subtitle: "Already have an account?" + "Sign In" link

**Form Fields**:

1. **Name Row** (2 columns):
   - First Name* (required)
   - Last Name* (required)

2. **Email***:
   - Input type: email
   - Validation: Format check, availability check (debounced)
   - Error: "This email is already registered. Sign in instead?"

3. **Password***:
   - Input type: password with show/hide toggle
   - Requirements indicator (real-time):
     - Minimum 8 characters
     - One uppercase letter
     - One lowercase letter
     - One number
   - Strength meter: Weak/Medium/Strong (color-coded bar)

4. **Confirm Password***:
   - Must match password field

5. **Phone** (optional):
   - Country code dropdown + number input
   - Format validation

6. **Checkboxes**:
   - [ ] "I agree to the Terms of Service and Privacy Policy" (required, links open in new tab)
   - [ ] "Subscribe to newsletter for exclusive offers" (optional, default unchecked)

**Submit Button**: "CREATE ACCOUNT" (Primary, full width)

**Divider**: "OR" with lines

**Social Registration**:
- "Continue with Google" (Google branded button)
- "Continue with Apple" (Apple branded button)

**Footer Links**:
- Terms of Service
- Privacy Policy
- Need help? Contact Support

#### States

**Loading**: Button shows spinner, form disabled

**Validation Errors**:
- Inline error messages below fields (red text)
- Field border turns red
- Scroll to first error

**Success**:
- Redirect to email verification page or account dashboard
- Success toast: "Account created successfully!"

---

### PAGE 5: Login Page

**Purpose**: Quick, secure authentication with multiple options.

#### Layout: Centered card on dark background

**Background**: Subtle gradient or blurred product image

**Card Container**:
- Max-width: 420px
- Padding: 48px
- Background: Carbon Gray
- Border-radius: 16px
- Shadow: Large elevation

#### Card Content

**Logo**: Centered, links to home

**Title**: "Welcome Back" (H2, centered)
**Subtitle**: "Sign in to your account" (Body, Silver, centered)

**Form Fields**:

1. **Email**:
   - Placeholder: "Enter your email"
   - Autocomplete: email

2. **Password**:
   - Placeholder: "Enter your password"
   - Show/hide toggle
   - Autocomplete: current-password

3. **Remember Me Row**:
   - [ ] "Remember me" checkbox (left)
   - "Forgot password?" link (right)

**Submit Button**: "SIGN IN" (Primary, full width)

**Divider**: "OR CONTINUE WITH"

**Social Login**:
- Google button (full width)
- Apple button (full width)

**Registration CTA**:
- "Don't have an account?" + "Create one" link

#### States

**Loading**:
- Button shows spinner
- Inputs disabled

**Error - Invalid Credentials**:
- Error message above form: "Invalid email or password. Please try again."
- Shake animation on form
- Clear password field

**Error - Account Locked**:
- Error message: "Account temporarily locked. Try again in 15 minutes or reset your password."
- Show "Reset Password" link prominently

**Error - Unverified Email**:
- Warning message: "Please verify your email before signing in."
- "Resend verification email" link

**Success**:
- Redirect to intended destination or dashboard
- Welcome toast with user's first name

---

### PAGE 6: Forgot Password Page

**Purpose**: Secure password recovery with clear feedback.

#### Layout: Same centered card style as login

#### Step 1: Request Reset

**Title**: "Reset Password" (H2)
**Description**: "Enter your email address and we'll send you instructions to reset your password." (Body, Silver)

**Form**:
- Email input
- "SEND RESET LINK" button (Primary, full width)

**Back Link**: "Back to Sign In" with arrow

#### Step 2: Email Sent Confirmation

**Icon**: Email/checkmark illustration (centered)
**Title**: "Check Your Email" (H2)
**Description**: "We've sent password reset instructions to [email]. The link expires in 1 hour." (Body)

**Actions**:
- "Open Email App" button (if on mobile)
- "Resend Email" link (with cooldown: "Resend in 45s")
- "Try a different email" link

**Help text**: "Didn't receive it? Check your spam folder or contact support."

#### Step 3: Reset Password Form (Accessed via email link)

**Title**: "Create New Password" (H2)
**Description**: "Enter your new password below." (Body)

**Form**:
1. **New Password**:
   - Requirements indicator (same as registration)
   - Strength meter

2. **Confirm New Password**:
   - Match validation

**Submit**: "RESET PASSWORD" (Primary, full width)

#### Step 4: Success

**Icon**: Success checkmark (green, animated)
**Title**: "Password Reset Complete" (H2)
**Description**: "Your password has been successfully updated." (Body)

**CTA**: "SIGN IN NOW" (Primary button)

#### Error States

**Invalid/Expired Link**:
- Error icon
- "This reset link is invalid or has expired"
- "Request a new reset link" button

**Email Not Found**:
- Show same "email sent" screen for security (don't reveal if email exists)

---

## Global Elements

### Loading States
- Skeleton screens for content loading
- Spinner for actions (buttons, forms)
- Progress bar for uploads/3D model loading

### Toast Notifications
- Position: Top-right (desktop), bottom-center (mobile)
- Types: Success (green), Error (red), Warning (orange), Info (blue)
- Auto-dismiss: 5 seconds
- Manual dismiss: X button

### Empty States
- Centered illustration
- Title + description
- Action button when applicable

### Error Boundaries
- Friendly error message
- Retry option
- Contact support link

### Responsive Breakpoints
```
Mobile: 0 - 639px
Tablet: 640px - 1023px
Desktop: 1024px - 1279px
Large Desktop: 1280px+
```

---

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Color contrast ratio: Minimum 4.5:1 for text
- Focus indicators: Visible outline on all interactive elements
- Keyboard navigation: Full site navigable via keyboard
- Screen reader support: Proper ARIA labels
- Reduced motion: Respect `prefers-reduced-motion`
- Alt text: All images must have descriptive alt text

---

## Design Deliverables Checklist

For each page, provide:
- [ ] Desktop design (1440px width)
- [ ] Tablet design (768px width)
- [ ] Mobile design (375px width)
- [ ] Interactive states (hover, focus, active, disabled)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Dark mode (primary) - this IS the dark mode design

---

## Reference Mood Board

**Visual Inspiration Sources**:
1. **Fanatec** (fanatec.com) - Racing authenticity, video backgrounds, product-centric
2. **Apple** (apple.com) - Minimalism, typography, whitespace, premium feel
3. **MOZA Racing** (mozaracing.com) - Dark luxury, champagne accents, professional positioning

**Key Characteristics to Capture**:
- Premium, not cheap gaming
- Technical, not playful
- Professional, not amateur
- Dark, not bright
- Confident, not aggressive
- Clean, not cluttered

---

## Summary

Create a cohesive, premium e-commerce experience that positions SimRacing Shop as the destination for serious sim racing enthusiasts. The design should feel like walking into a high-end motorsport showroom - sophisticated, technical, and aspirational. Every element should reinforce quality and performance while maintaining excellent usability and conversion optimization.
