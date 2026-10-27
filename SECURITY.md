# Security

Tally is an early-stage application. Automated checks cover selected calculation and endpoint behavior; they are not a security audit.

## Report a vulnerability

Do not publish credentials, personal ledger data, or exploit details in a public issue. If the repository's **Security → Report a vulnerability** option is available, use GitHub's private vulnerability reporting flow. If it is unavailable, open a public issue asking the maintainer for a private reporting channel without disclosing the vulnerability itself.

Include affected versions or commits, reproduction steps using synthetic data, impact, and any suggested mitigation in the private report. No response-time guarantee or bug bounty is currently offered.

## Deployment responsibilities

- Apply the Supabase ledger schema and RLS policies before enabling cloud use.
- Keep `OPENAI_API_KEY` on the server. Never put service-role credentials or other secrets in browser configuration.
- Keep environment files out of Git; `.env.example` must contain placeholders only.
- If a secret was committed, revoke or rotate it. Adding it to `.gitignore` does not remove Git history or invalidate the credential.
- Configure intended authentication redirect URLs, production email delivery, and provider usage budgets.
- The assistant quota limits an account's daily attempts; it does not prevent multi-account abuse or cap total provider billing.
- Review dependency updates and test the production deployment before storing real user data.
- Avoid logging authorization headers, receipt images, or full private ledgers.

The current data model gives each signed-in account a private ledger. Names recorded as participants do not gain access to that ledger. Settlement entries are bookkeeping records and do not authorize or execute payments.
