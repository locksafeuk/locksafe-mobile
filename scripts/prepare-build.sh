#!/bin/bash

# LockSafe Mobile App - Build Preparation Script
# =============================================
# Run this before your first EAS build to ensure everything is configured correctly.

set -e

echo "🔧 LockSafe Mobile App - Build Preparation"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
    echo "❌ Error: Please run this script from the locksafe-uk-mobile-app directory"
    exit 1
fi

# Check for EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check EAS version
echo "✅ EAS CLI version: $(eas --version)"

# Check if logged in to Expo
echo ""
echo "📱 Checking Expo login status..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Not logged in to Expo. Please run: eas login"
    exit 1
fi
echo "✅ Logged in as: $(eas whoami)"

# Check for required environment variables in .env
echo ""
echo "🔑 Checking environment variables..."

if [ -f ".env" ]; then
    echo "✅ .env file found"

    # Check for required variables
    required_vars=("API_URL" "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" "EXPO_PUBLIC_ONESIGNAL_APP_ID")
    missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "⚠️  Missing environment variables in .env:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
    else
        echo "✅ All required environment variables present"
    fi
else
    echo "⚠️  .env file not found. Copy .env.example to .env and configure."
fi

# Check app.json configuration
echo ""
echo "📋 Checking app.json configuration..."

# Check for placeholder values
if grep -q "YOUR_" app.json; then
    echo "⚠️  app.json contains placeholder values (YOUR_*):"
    grep -n "YOUR_" app.json | while read -r line; do
        echo "   $line"
    done
else
    echo "✅ No placeholder values found in app.json"
fi

# Check EAS project ID
if grep -q '"projectId": "YOUR_EAS_PROJECT_ID"' app.json; then
    echo ""
    echo "⚠️  EAS Project ID not configured."
    echo "   Run: eas init"
fi

# Check for assets
echo ""
echo "🎨 Checking assets..."

required_assets=("assets/icon.png" "assets/splash-icon.png" "assets/favicon.png" "assets/android-icon-foreground.png" "assets/android-icon-background.png")
missing_assets=()

for asset in "${required_assets[@]}"; do
    if [ ! -f "$asset" ]; then
        missing_assets+=("$asset")
    fi
done

if [ ${#missing_assets[@]} -ne 0 ]; then
    echo "⚠️  Missing assets:"
    for asset in "${missing_assets[@]}"; do
        echo "   - $asset"
    done
else
    echo "✅ All required assets present"
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found. Run: npm install --legacy-peer-deps"
fi

# Summary
echo ""
echo "==========================================="
echo "📋 Build Preparation Summary"
echo "==========================================="
echo ""
echo "To build for development (APK for Android):"
echo "  eas build --profile development --platform android"
echo ""
echo "To build for preview (testing):"
echo "  eas build --profile preview --platform android"
echo ""
echo "To build for production:"
echo "  eas build --profile production --platform all"
echo ""
echo "For more information, see docs/DEPLOYMENT_GUIDE.md"
echo ""
