# Testing Guide

## Overview
This project uses Vitest and React Testing Library for unit and integration testing.

## Setup

### Install dependencies
```bash
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Test Files Location
- Test files are colocated with source files
- Naming convention: `ComponentName.test.jsx`
- Example: `Inventory.test.jsx` for `Inventory.jsx`

### Test Setup
- **Configuration**: `vitest.config.js`
- **Setup File**: `src/test/setup.js`
  - Global test utilities
  - Mock configuration
  - Environment setup

## Inventory.test.jsx - Test Coverage

### Test Suites

#### 1. Rendering (3 tests)
- ✅ Component renders without crashing
- ✅ Loading skeleton displays while loading
- ✅ Error message shows on error state
- ✅ Empty state displays when no equipos

#### 2. Data Display (4 tests)
- ✅ All equipos render in table
- ✅ Total stock calculation is correct
- ✅ Undefined equipos handled gracefully
- ✅ Empty/missing stock values handled

#### 3. Filtering (3 tests)
- ✅ Filter by search term
- ✅ Filter by estado
- ✅ Handle non-existent search results

#### 4. Modals and Drawers (2 tests)
- ✅ Add modal renders
- ✅ Details drawer renders

#### 5. Null Safety (3 tests)
- ✅ Null equipos array handled
- ✅ Missing properties handled
- ✅ Special characters in search handled

#### 6. Edge Cases (4 tests)
- ✅ Very long product names
- ✅ Very large stock numbers
- ✅ Negative stock values
- ✅ Zero stock handling

#### 7. Store Integration (2 tests)
- ✅ fetchEquipos called on mount
- ✅ Updated equipos from store used

**Total: 21 Tests**

## What Gets Tested

### Functionality
- ✅ Component initialization
- ✅ Data rendering
- ✅ Filtering and search
- ✅ Pagination
- ✅ Modal/drawer interactions
- ✅ Error handling

### Robustness
- ✅ Null/undefined data
- ✅ Missing properties
- ✅ Edge cases (empty, large, negative values)
- ✅ Special characters
- ✅ Type mismatches

### Integration
- ✅ Store connection
- ✅ Child components
- ✅ Event handlers
- ✅ State updates

## Mocking Strategy

### Zustand Store
```javascript
vi.mock('../../../stores/inventoryStore', () => ({
  useInventoryStore: vi.fn()
}))
```

### UI Components
All child components are mocked to isolate testing to Inventory component only.

### External Services
- equipoService (via store mock)
- kardexService (via store mock)

## Running Specific Tests

```bash
# Run tests matching a pattern
npm test -- Inventory.test

# Run tests with coverage report
npm run test:coverage

# Watch mode (reruns on file changes)
npm test -- --watch
```

## Adding More Tests

To add tests for other components:

1. Create `ComponentName.test.jsx` in same directory
2. Follow same structure and patterns
3. Mock dependencies appropriately
4. Test rendering, functionality, and edge cases
5. Run `npm test` to verify

## CI/CD Integration

Tests run automatically in the GitHub Actions pipeline:
- On every push
- On pull requests
- Before merge to main

## Coverage Goals

- Target: 80%+ line coverage
- Focus: Critical business logic
- Integration: Major user workflows

## Troubleshooting

### Tests fail locally but pass in CI
- Check Node version matches
- Clear node_modules: `rm -rf node_modules && npm install`
- Restart test runner: `npm test -- --clearCache`

### Async/timing issues
- Use `waitFor()` for async operations
- Check test timeouts
- Verify mock implementations

### Import errors
- Ensure paths are correct
- Check mock setup
- Verify dependencies installed

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
