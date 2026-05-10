# 🐾 Pawket

**Pocket-sized cat-paw AI** — Cherry Studio Android port

A mobile AI chat client built with Capacitor + Android, featuring Xiaomi MiMo as the default LLM provider.

## Features

- 💬 Clean chat interface with dark theme
- 🤖 OpenAI-compatible API support
- 🔐 Secure API key storage (local SharedPreferences)
- 📱 Native Android app via Capacitor
- 🐱 MiMo v2.5-pro as default model

## Quick Start

### Prerequisites

- JDK 21+
- Android SDK (API 34)
- Node.js 18+

### Build

```bash
# Install dependencies
npm install

# Build web assets
mkdir -p www && cp index.html www/

# Sync Capacitor
npx cap sync android

# Build APK
cd android
export JAVA_HOME=/path/to/jdk-21
export ANDROID_SDK_ROOT=/path/to/android-sdk
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Install

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## MiMo Provider Configuration

Pawket uses Xiaomi MiMo as the default LLM provider. To configure:

1. Get your API key from the Xiaomi MiMo provider console
2. Long-press the provider badge (🐾 MiMo v2.5-pro) in the app header
3. Enter your configuration:
   - **API Base URL**: `https://token-plan-cn.xiaomimo.com/v1`
   - **API Key**: Your personal API key
   - **Model**: `mimo-v2.5-pro`

### Available Models

| Model | Description |
|-------|-------------|
| `mimo-v2.5` | Standard model |
| `mimo-v2.5-pro` | Advanced model (default) |
| `mimo-v2.5-tts` | Text-to-speech model |

### Environment Variables (Development)

For development, create a `.env` file (never commit this!):

```bash
MIMO_API_KEY=your_api_key_here
MIMO_BASE_URL=https://token-plan-cn.xiaomimo.com/v1
MIMO_MODEL=mimo-v2.5-pro
```

See `.env.example` for the template.

## Security

- API keys are stored locally in Android SharedPreferences
- No keys are hardcoded in source code
- `.env` files are gitignored
- See [SECURITY.md](SECURITY.md) for details

## Architecture

- **Frontend**: HTML/CSS/JS chat interface
- **Wrapper**: Capacitor 7.x for Android
- **Build**: Gradle 8.14.3 + Android SDK 34
- **Provider**: OpenAI-compatible API (MiMo)

## License

MIT

## Credits

- [Cherry Studio](https://github.com/CherryHQ/cherry-studio) — Original desktop client
- [Capacitor](https://capacitorjs.com/) — Cross-platform native runtime
- [Xiaomi MiMo](https://xiaomi.mimo.com) — LLM provider
