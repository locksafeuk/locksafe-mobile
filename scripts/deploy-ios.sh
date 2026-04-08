#!/bin/bash
###############################################################################
# LockSafe iOS Deployment Script
#
# Prerequisites:
#   1. Apple Developer account verified & active (https://developer.apple.com)
#   2. EAS CLI installed: npm install -g eas-cli
#   3. Logged into EAS: eas login (use contact@locksafe.uk)
#   4. Apple Developer credentials configured (script will prompt if not)
#
# Usage:
#   ./scripts/deploy-ios.sh              # Full build + submit
#   ./scripts/deploy-ios.sh build        # Build only
#   ./scripts/deploy-ios.sh submit       # Submit latest build to App Store
#   ./scripts/deploy-ios.sh status       # Check latest build status
#
# Account Info:
#   Expo Account: locksafeuk26 (contact@locksafe.uk)
#   Bundle ID:    uk.locksafe.app
#   App Name:     LockSafe - Locksmith Partner
###############################################################################

set -e

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  LockSafe iOS Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check EAS CLI
    if ! command -v eas &> /dev/null; then
        if ! npx eas-cli --version &> /dev/null; then
            echo -e "${RED}Error: EAS CLI not found. Install with: npm install -g eas-cli${NC}"
            exit 1
        fi
        EAS="npx eas-cli"
    else
        EAS="eas"
    fi

    # Check login status
    WHOAMI=$($EAS whoami 2>&1)
    if echo "$WHOAMI" | grep -q "Not logged in"; then
        echo -e "${RED}Error: Not logged into EAS. Run: $EAS login${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Logged in as: $WHOAMI${NC}"

    # Check that eas.json exists
    if [ ! -f "eas.json" ]; then
        echo -e "${RED}Error: eas.json not found. Are you in the project root?${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ eas.json found${NC}"
    echo ""
}

# Step 1: Update Apple credentials in eas.json submit config
configure_apple_credentials() {
    echo -e "${YELLOW}Before building, make sure your eas.json submit.production.ios section${NC}"
    echo -e "${YELLOW}has the correct Apple credentials:${NC}"
    echo ""
    echo -e "  appleId:     Your Apple ID (e.g., contact@locksafe.uk)"
    echo -e "  ascAppId:    Your App Store Connect App ID (numeric)"
    echo -e "  appleTeamId: Your Apple Developer Team ID"
    echo ""
    echo -e "${YELLOW}You can find these at:${NC}"
    echo -e "  - Apple ID: https://developer.apple.com/account"
    echo -e "  - ASC App ID: https://appstoreconnect.apple.com (create app first)"
    echo -e "  - Team ID: https://developer.apple.com/account/#/membership"
    echo ""

    # Check if credentials are still placeholder
    if grep -q "YOUR_APPLE_ID" eas.json; then
        echo -e "${RED}⚠ Apple credentials in eas.json are still placeholders!${NC}"
        echo -e "${RED}  Please update them before continuing.${NC}"
        echo ""
        read -p "Have you updated the credentials in eas.json? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Aborting. Please update eas.json and try again.${NC}"
            exit 1
        fi
    fi
}

# Step 2: Build iOS production binary
build_ios() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Step 1: Building iOS Production Binary${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "${YELLOW}This will:${NC}"
    echo -e "  - Upload your project to EAS Build servers"
    echo -e "  - Create/use iOS distribution certificate & provisioning profile"
    echo -e "  - Build an IPA file for App Store submission"
    echo -e "  - You may be prompted for your Apple ID password/2FA"
    echo ""

    $EAS build --platform ios --profile production

    echo ""
    echo -e "${GREEN}✓ iOS build completed!${NC}"
    echo ""
}

# Step 3: Submit to App Store Connect
submit_ios() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Step 2: Submitting to App Store Connect${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "${YELLOW}This will upload the latest iOS build to App Store Connect.${NC}"
    echo -e "${YELLOW}You will need to:${NC}"
    echo -e "  1. Enter your Apple ID credentials if prompted"
    echo -e "  2. Complete the app listing in App Store Connect manually"
    echo -e "  3. Upload screenshots from store-assets/ios-screenshots/"
    echo -e "  4. Fill in listing details from store-assets/appstore-listing.json"
    echo ""

    $EAS submit --platform ios --profile production --latest

    echo ""
    echo -e "${GREEN}✓ Build submitted to App Store Connect!${NC}"
    echo ""
}

# Check build status
check_status() {
    echo -e "${BLUE}Latest iOS builds:${NC}"
    echo ""
    $EAS build:list --platform ios --limit 5
    echo ""
}

# Post-submission steps
post_submission_info() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Next Steps (Manual in App Store Connect)${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "${YELLOW}1. Go to https://appstoreconnect.apple.com${NC}"
    echo -e "   - Select 'LockSafe - Locksmith Partner'"
    echo -e "   - Go to 'App Information' and fill in details"
    echo ""
    echo -e "${YELLOW}2. App Store Listing:${NC}"
    echo -e "   - Use details from: store-assets/appstore-listing.json"
    echo -e "   - Upload screenshots from: store-assets/ios-screenshots/"
    echo -e "   - App icon is embedded in the build"
    echo ""
    echo -e "${YELLOW}3. Required Info:${NC}"
    echo -e "   - Subtitle: 'Manage Jobs, Quotes & Earnings'"
    echo -e "   - Keywords: locksmith,jobs,quotes,earnings,lockout,security,keys,locks,partner,business"
    echo -e "   - Support URL: https://www.locksafe.uk"
    echo -e "   - Privacy URL: https://www.locksafe.uk/privacy"
    echo -e "   - Category: Business"
    echo -e "   - Age Rating: 4+"
    echo ""
    echo -e "${YELLOW}4. Review Notes (for Apple review team):${NC}"
    echo -e "   Test credentials: Email: amiosif@icloud.com, Password: demo1234"
    echo -e "   This app is for professional locksmiths who are partners of LockSafe."
    echo ""
    echo -e "${YELLOW}5. Submit for Review${NC}"
    echo -e "   - Once all fields are filled, click 'Submit for Review'"
    echo -e "   - Apple review typically takes 24-48 hours"
    echo ""
    echo -e "${GREEN}Done! Good luck with the review! 🍀${NC}"
}

# Main execution
ACTION=${1:-"full"}

check_prerequisites

case "$ACTION" in
    build)
        configure_apple_credentials
        build_ios
        ;;
    submit)
        submit_ios
        post_submission_info
        ;;
    status)
        check_status
        ;;
    full|"")
        configure_apple_credentials
        build_ios
        submit_ios
        post_submission_info
        ;;
    *)
        echo -e "${RED}Unknown action: $ACTION${NC}"
        echo "Usage: $0 [build|submit|status|full]"
        exit 1
        ;;
esac
