## Medication UI ![Tests](https://github.com/crycetruly/medication-ui/actions/workflows/ci.yml/badge.svg)

This Next.js app renders a medication orders dashboard with inline editing, configurable columns, expandable rows, and toast notifications. Data is served by a Next.js API route that returns paginated Faker-generated records.

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
