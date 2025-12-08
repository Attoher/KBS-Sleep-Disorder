# UI Showcase Module

## Overview
The UI Showcase module provides a standalone interface preview system that allows viewing all frontend pages without requiring backend connectivity. This is ideal for:
- UI/UX design reviews
- Frontend development and testing
- Documentation and demonstrations
- Client presentations
- Offline development mode

## Access Points

### Direct URL Access
- **Main Showcase**: `http://localhost:5173/showcase`
- **Mock Results**: `http://localhost:5173/showcase/results`

### In-App Navigation
1. **From Login/Register Pages**: Click "🎨 View UI Showcase" link at the bottom
2. **From Header** (Desktop): Click "Showcase" button in the top navigation
3. **From User Menu** (Mobile): Open user dropdown and select "🎨 UI Showcase"

## Available Pages in Showcase

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication with guest mode |
| Register | `/register` | New user registration form |
| Dashboard | `/dashboard` | Main dashboard with stats |
| Screening Form | `/screening` | Sleep health questionnaire with stress assessment |
| Results | `/showcase/results` | Mock diagnosis results display |
| History | `/history` | Screening history records |
| Analytics | `/analytics` | Data visualization dashboard |

## Features

### 🎨 Theme Support
- Full light/dark mode support via ThemeToggle
- All pages respect the current theme setting
- Theme persists across navigation

### 🚀 No Backend Required
- All pages display with mock/sample data
- No API calls or database connections
- Perfect for offline development

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized layouts
- Touch-friendly interfaces

### 🔍 Interactive Navigation
- Click any card to view that page
- Breadcrumb navigation support
- Back to showcase from any page

## Mock Data

### ShowcaseResults Page
The mock results page demonstrates a complete diagnosis with:
- High Risk Insomnia
- Moderate Risk Sleep Apnea
- 6 triggered medical rules (R1, R3, R5, R12, R18, R25)
- 6 personalized recommendations
- Complete input data summary

## Implementation Details

### Files Structure
```
src/
├── pages/
│   ├── UIShowcase.jsx        # Main showcase gallery
│   └── ShowcaseResults.jsx   # Mock results page
└── App.jsx                   # Routes configuration
```

### Routes Configuration
```javascript
// Showcase routes (no authentication required)
<Route path="/showcase" element={<UIShowcase />} />
<Route path="/showcase/results" element={<ShowcaseResults />} />
```

### Component Dependencies
- `Card` component with hover effects
- `Button` component with variants
- `ThemeToggle` for theme switching
- Lucide React icons
- Framer Motion for animations

## Usage Examples

### Viewing a Specific Page
```javascript
// Navigate programmatically
navigate('/showcase');

// Direct link
<Link to="/showcase">View Showcase</Link>
```

### Adding New Pages to Showcase
```javascript
// In UIShowcase.jsx, add to pages array:
{
  name: 'New Page',
  path: '/new-page',
  icon: IconComponent,
  color: 'blue',
  description: 'Page description'
}
```

## Development Tips

1. **Testing Layouts**: Use showcase to quickly test responsive layouts without backend setup
2. **Theme Verification**: Toggle between light/dark modes to verify color schemes
3. **Component Isolation**: Test individual components in isolation
4. **Client Demos**: Use showcase mode for client presentations without exposing backend

## Future Enhancements

- [ ] Add component library documentation
- [ ] Include design system tokens preview
- [ ] Add interactive component playground
- [ ] Export screenshots functionality
- [ ] Add accessibility checker
- [ ] Include code snippets for each component

## Notes

- This module is completely frontend-only
- No authentication checks performed
- Mock data is hardcoded in component files
- Does not write to any database
- Safe to share with non-technical stakeholders
