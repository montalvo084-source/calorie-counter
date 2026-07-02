# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Fixed fiber tracking not updating** - Disabled Next.js API response caching to ensure real-time updates of nutritional data when adding or modifying food items. Added `revalidate = 0` to all API routes (`/api/food-sources`, `/api/logs`, `/api/profile`) to guarantee fresh data is always returned instead of stale cached responses.

## [Initial Release]

### Added
- Calorie tracking with daily logs
- Nutritional data tracking (calories, protein, fiber, water)
- Food source management and customization
- Daily progress visualization with progress bars
- History view for past logs
- User profile with customizable goals
- Milestone notifications when hitting tracking goals
