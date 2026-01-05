Recommended backlog items and next steps

- Database integration (Postgres, MongoDB or SQLite) for persisting contracts, orders and inventory
- Enable HTTPS (Let's Encrypt or managed TLS) for production deployments
- PWA support and app icons (manifest + responsive icons)
- WhatsApp / messaging API integration for order notifications
- QR code generation for product pages and order receipts
- Add analytics (Plausible / Google Analytics / Matomo) and privacy configuration
- Create a Dockerfile and container deployment workflow
- Add CI (GitHub Actions) for linting, tests, and deployments
- Add automated tests (unit and integration) and ESLint/Prettier setup
- Improve session/security: use a session store, secure cookies, and rotate secrets

Next steps:
1. Pick a database and add a migration or seed script.
2. Wire up persistent sessions and user accounts.
3. Add CI pipeline and basic test coverage.
4. Harden production settings (CSP, rate-limiting, secure cookies).
5. Create issues for each item above and prioritize.
