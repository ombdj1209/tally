# Contributing to Tally

Thanks for helping make everyday expense tracking clearer and easier.

## Set up

1. Fork and clone the repository, then enter its project directory.
2. Use Node 22.12+ or Node 24 and run `npm install` (or `npm ci` when a lockfile is committed).
3. Run `npm run dev` and explore the local demo. No credentials are required for local UI and calculation work.
4. For cloud changes, follow the README with your own development Supabase project and server API key. Never commit credentials.

## Propose a change

Open an issue before beginning a large feature or changing the data model. Describe the user problem, expected behavior, and relevant alternatives. Keep pull requests focused and include screenshots for UI changes.

For bug reports, include reproduction steps, expected versus actual behavior, browser/device, and relevant sanitized errors. Do not include tokens, private receipts, emails, or personal ledger exports.

## Implementation guidelines

- Preserve exact money totals and existing split/settlement behavior. Add meaningful tests for calculation changes.
- Treat model output as untrusted input. Validate identities, totals, and currency before creating drafts.
- Keep AI output reviewable; never bypass the explicit save step.
- Keep server secrets out of frontend code and `VITE_` environment variables.
- Maintain keyboard access, visible focus, reduced-motion behavior, and touch-friendly controls.
- Check light and dark themes, all accents, and narrow mobile layouts. Avoid gradients to maintain the current visual direction.
- Explain database schema changes and migration order. Do not modify a production database as part of a routine local test.
- Update documentation when configuration or behavior changes. Keep generated output and personal data out of commits.

## Before a pull request

```sh
npm test
npm run build
```

Test the affected workflow manually. Include what changed, why, how it was checked, and any remaining limitations in the pull request. Cloud and voice changes need explicit notes distinguishing mocked tests from real integration or device checks.

Contributions are provided under the project's [MIT license](LICENSE). Only contribute code you have the right to share, and preserve any required third-party license notices.
