#!/usr/bin/env python3
"""
Upload IPA to App Store Connect using the contentDelivery API.
This implements the same protocol as altool/Transporter.
"""

import jwt
import time
import hashlib
import json
import os
import sys
import math
import requests
from pathlib import Path

# Configuration
ISSUER_ID = "7472da00-ebbf-4c36-a6e4-bd8a6b4e769d"
KEY_ID = "CN472U9F7K"
PRIVATE_KEY_PATH = os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_CN472U9F7K.p8")
APP_ID = "6762475008"
IPA_PATH = "/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa"
BUNDLE_ID = "uk.locksafe.app"

BASE_URL = "https://api.appstoreconnect.apple.com/v1"
UPLOAD_BASE_URL = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService"

def generate_token():
    with open(PRIVATE_KEY_PATH, 'r') as f:
        private_key = f.read()
    now = int(time.time())
    payload = {
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 1200,
        "aud": "appstoreconnect-v1"
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})

def get_headers():
    token = generate_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def lookup_software(bundle_id):
    """Look up software by bundle ID using the content delivery API."""
    token = generate_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = f"{UPLOAD_BASE_URL}/lookupSoftwareForBundleId"
    payload = {
        "Application": "iTMSTransporter",
        "BaseVersion": "2.0.0",
        "BundleId": bundle_id,
        "OSIdentifier": "linux",
        "Version": "2.0.0"
    }
    
    print(f"Looking up software for bundle ID: {bundle_id}")
    resp = requests.post(url, headers=headers, json=payload)
    print(f"Response status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"Response: {json.dumps(data, indent=2)[:500]}")
        return data
    else:
        print(f"Error: {resp.text[:500]}")
        return None

def create_build_delivery(app_id):
    """Create a build delivery reservation."""
    headers = get_headers()
    
    # Get file info
    ipa_path = Path(IPA_PATH)
    file_size = ipa_path.stat().st_size
    
    with open(ipa_path, 'rb') as f:
        file_data = f.read()
    
    checksum = hashlib.md5(file_data).hexdigest()
    
    print(f"\nFile: {ipa_path.name}")
    print(f"Size: {file_size} bytes ({file_size / 1024 / 1024:.1f} MB)")
    print(f"MD5: {checksum}")
    
    # Try the buildDeliveries endpoint
    url = f"{BASE_URL}/buildDeliveries"
    payload = {
        "data": {
            "type": "buildDeliveries",
            "attributes": {
                "cfBundleShortVersionString": "1.0.2",
                "cfBundleVersion": "4"
            },
            "relationships": {
                "app": {
                    "data": {
                        "type": "apps",
                        "id": app_id
                    }
                }
            }
        }
    }
    
    print(f"\nCreating build delivery...")
    resp = requests.post(url, headers=headers, json=payload)
    print(f"Response status: {resp.status_code}")
    
    if resp.status_code in [200, 201]:
        data = resp.json()
        print(f"Success: {json.dumps(data, indent=2)[:500]}")
        return data
    else:
        print(f"Error: {resp.text[:500]}")
        
    # Try alternative endpoint
    url2 = f"https://api.appstoreconnect.apple.com/v1/appStoreVersions"
    
    return None

def upload_via_content_delivery():
    """Upload using Apple's content delivery service."""
    token = generate_token()
    
    # Step 1: Authenticate with content delivery
    auth_url = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService/authenticateForSession"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    auth_payload = {
        "Application": "iTMSTransporter",
        "BaseVersion": "2.3.0",
        "OSIdentifier": "linux",
        "Version": "2.3.0"
    }
    
    print("Authenticating with content delivery service...")
    resp = requests.post(auth_url, headers=headers, json=auth_payload)
    print(f"Auth response: {resp.status_code}")
    
    if resp.status_code == 200:
        auth_data = resp.json()
        print(f"Auth data: {json.dumps(auth_data, indent=2)[:300]}")
        
        session_id = auth_data.get("sessionId")
        shared_secret = auth_data.get("sharedSecret")
        
        if session_id:
            print(f"Session ID: {session_id}")
            
            # Step 2: Create reservation
            reserve_url = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService/createReservation"
            
            ipa_path = Path(IPA_PATH)
            file_size = ipa_path.stat().st_size
            
            with open(ipa_path, 'rb') as f:
                checksum = hashlib.md5(f.read()).hexdigest()
            
            reserve_payload = {
                "Application": "iTMSTransporter",
                "BaseVersion": "2.3.0",
                "OSIdentifier": "linux",
                "Version": "2.3.0",
                "fileDescriptions": [{
                    "checksum": checksum,
                    "checksumType": "md5",
                    "contentType": "application/octet-stream",
                    "fileName": ipa_path.name,
                    "fileSize": file_size
                }],
                "sessionId": session_id,
                "sharedSecret": shared_secret
            }
            
            print("\nCreating upload reservation...")
            resp2 = requests.post(reserve_url, headers=headers, json=reserve_payload)
            print(f"Reservation response: {resp2.status_code}")
            print(f"Response: {resp2.text[:500]}")
            
            if resp2.status_code == 200:
                reserve_data = resp2.json()
                
                # Step 3: Upload file parts
                reservations = reserve_data.get("Reservations", [])
                if reservations:
                    reservation = reservations[0]
                    upload_url = reservation.get("url")
                    
                    print(f"\nUploading to: {upload_url}")
                    
                    with open(ipa_path, 'rb') as f:
                        file_data = f.read()
                    
                    upload_headers = {
                        "Content-Type": "application/octet-stream",
                        "Content-Length": str(file_size)
                    }
                    
                    resp3 = requests.put(upload_url, headers=upload_headers, data=file_data)
                    print(f"Upload response: {resp3.status_code}")
                    
                    if resp3.status_code in [200, 201]:
                        # Step 4: Commit
                        commit_url = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService/commitReservation"
                        commit_payload = {
                            "Application": "iTMSTransporter",
                            "BaseVersion": "2.3.0",
                            "OSIdentifier": "linux",
                            "Version": "2.3.0",
                            "reservations": [reservation.get("id")],
                            "sessionId": session_id,
                            "sharedSecret": shared_secret
                        }
                        
                        resp4 = requests.post(commit_url, headers=headers, json=commit_payload)
                        print(f"Commit response: {resp4.status_code}")
                        print(f"Response: {resp4.text[:500]}")
                        return True
    else:
        print(f"Auth error: {resp.text[:500]}")
    
    return False

if __name__ == "__main__":
    print("=== IPA Upload to App Store Connect ===\n")
    
    # Try content delivery upload
    result = upload_via_content_delivery()
    
    if not result:
        print("\n--- Trying build delivery API ---")
        create_build_delivery(APP_ID)
        
        print("\n--- Trying software lookup ---")
        lookup_software(BUNDLE_ID)
