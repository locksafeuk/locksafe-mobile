#!/usr/bin/env python3
"""
Upload IPA to App Store Connect using the App Store Connect API.
Uses the contentDelivery API for binary uploads.
"""

import jwt
import time
import hashlib
import json
import os
import requests
from pathlib import Path

# Configuration
ISSUER_ID = "7472da00-ebbf-4c36-a6e4-bd8a6b4e769d"
KEY_ID = "CN472U9F7K"
PRIVATE_KEY_PATH = os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_CN472U9F7K.p8")
APP_ID = "6762475008"
IPA_PATH = "/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa"
BUNDLE_ID = "uk.locksafe.app"
VERSION = "1.0.2"
BUILD_NUMBER = "4"

BASE_URL = "https://api.appstoreconnect.apple.com/v1"

def generate_token():
    """Generate JWT token for App Store Connect API."""
    with open(PRIVATE_KEY_PATH, 'r') as f:
        private_key = f.read()
    
    now = int(time.time())
    payload = {
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 1200,  # 20 minutes
        "aud": "appstoreconnect-v1"
    }
    
    token = jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})
    return token

def get_headers():
    """Get authorization headers."""
    token = generate_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def get_app_store_version():
    """Get the current app store version for 1.0.2."""
    headers = get_headers()
    url = f"{BASE_URL}/apps/{APP_ID}/appStoreVersions"
    params = {"filter[versionString]": VERSION, "filter[platform]": "IOS"}
    
    resp = requests.get(url, headers=headers, params=params)
    print(f"Get versions response: {resp.status_code}")
    data = resp.json()
    
    if data.get("data"):
        version = data["data"][0]
        print(f"Found version: {version['id']} - state: {version['attributes']['appStoreState']}")
        return version
    return None

def get_builds():
    """List all builds for the app."""
    headers = get_headers()
    url = f"{BASE_URL}/builds"
    params = {
        "filter[app]": APP_ID,
        "sort": "-uploadedDate",
        "limit": 10
    }
    
    resp = requests.get(url, headers=headers, params=params)
    data = resp.json()
    
    for build in data.get("data", []):
        attrs = build["attributes"]
        print(f"Build {attrs['version']} - Processing: {attrs['processingState']} - Uploaded: {attrs['uploadedDate']}")
    
    return data.get("data", [])

def check_build_exists(build_number):
    """Check if a specific build number already exists."""
    headers = get_headers()
    url = f"{BASE_URL}/builds"
    params = {
        "filter[app]": APP_ID,
        "filter[version]": build_number,
    }
    
    resp = requests.get(url, headers=headers, params=params)
    data = resp.json()
    builds = data.get("data", [])
    
    if builds:
        print(f"Build {build_number} already exists!")
        return builds[0]
    return None

def upload_ipa():
    """Upload IPA using the App Store Connect API upload flow."""
    
    # Step 1: Check if build 4 already exists
    print("Checking if Build 4 already exists...")
    existing = check_build_exists(BUILD_NUMBER)
    if existing:
        print(f"Build 4 already exists with ID: {existing['id']}")
        return existing['id']
    
    # Step 2: Get file info
    ipa_path = Path(IPA_PATH)
    file_size = ipa_path.stat().st_size
    
    with open(ipa_path, 'rb') as f:
        file_data = f.read()
    
    md5_hash = hashlib.md5(file_data).hexdigest()
    print(f"IPA size: {file_size} bytes, MD5: {md5_hash}")
    
    # Step 3: Create build delivery resource
    headers = get_headers()
    
    # Use the builds upload API
    # First, we need to use the iTMSTransporter-compatible API
    # The App Store Connect API doesn't directly support IPA upload
    # We need to use the contentDelivery API
    
    print("\nNote: Direct IPA upload via App Store Connect API requires")
    print("the iTMSTransporter or altool, which are macOS-only tools.")
    print("Attempting alternative upload method...")
    
    return None

if __name__ == "__main__":
    print("=== App Store Connect Build Upload ===\n")
    
    # List current builds
    print("Current builds:")
    get_builds()
    
    print("\n--- Checking version ---")
    version = get_app_store_version()
    
    print("\n--- Attempting upload ---")
    result = upload_ipa()
    
    if result is None:
        print("\nDirect API upload not possible from Linux.")
        print("Alternative: Use EAS submit or Transporter on macOS.")
