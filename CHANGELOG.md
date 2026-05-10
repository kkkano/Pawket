# Changelog

## [0.1.0] - 2026-05-10

### Added
- Initial Capacitor Android skeleton
- Chat UI with dark theme
- Xiaomi MiMo provider integration (OpenAI-compatible)
- API key configuration via long-press on provider badge
- `.gitignore` with security exclusions
- `.env.example` for API key template
- `SECURITY.md` with key handling guidelines
- `README.md` with build instructions
- Gradle 8.14.3 + Android SDK 34 build pipeline
- APK build verification with aapt

### Security
- No hardcoded API keys in source code
- `.env` and `*.keystore` gitignored
- Token pattern scanning in pre-commit checks
