# Security Policy

## API Key Handling

**NEVER commit API keys, tokens, or secrets to the repository.**

### For Developers
1. Copy `.env.example` to `.env`
2. Fill in your API key from the MiMo provider console
3. Never commit `.env` — it's in `.gitignore`

### For Users (APK)
1. Long-press the provider badge in the app header
2. Enter your API base URL, key, and model name
3. Keys are stored in Android SharedPreferences (local only)

### Pre-commit Hook
This repository enforces automatic scanning for leaked secrets:
- Tokens starting with `tp-`, `sk-`, `ghp_`
- Private keys and certificates
- `.env` files and `local.properties`

## Reporting Vulnerabilities
Open a GitHub issue with the `security` label.
