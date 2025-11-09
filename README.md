## Medication UI ![Tests](https://github.com/chryce/medication-ui/actions/workflows/ci.yml/badge.svg)

This Next.js app renders a medication orders dashboard with inline editing, configurable columns, expandable rows, and toast notifications. Data is served by a Next.js API route that returns paginated Faker-generated records.

### Working Features
- Inline editing per cell with toast confirmation.
- Expandable rows showing detailed patient information and tags.
- Column configurator to toggle optional columns.
- Server-backed pagination + query-parameter synced search with skeleton states.
- Responsive layout with horizontal scrolling for the table and mobile-friendly controls.

### Future Enhancements
- Persist column and selection preferences to a backend or user profile.
- Add authentication/authorization for multi-user environments.
- Integrate real APIs for medications instead of Faker data.
- Provide bulk actions (export/archive) wired to actual endpoints.
- Add accessibility improvements like focus outlines for interactive elements.

### Development

```bash
npm install
npm run dev
```

The UI fetches from `/api/medications` by default. To point it at another endpoint, set `NEXT_PUBLIC_MEDICATIONS_ENDPOINT` in `.env.local`.

### Linting

```bash
npm run lint
```

### Tests

```bash
npm run test
```
