#!/usr/bin/env python3
"""
Upload IPA to App Store Connect using Apple's upload API.
Implements the protocol used by Transporter/altool.
"""

import jwt
import time
import hashlib
import json
import os
import sys
import gzip
import requests
from pathlib import Path

ISSUER_ID = "7472da00-ebbf-4c36-a6e4-bd8a6b4e769d"
KEY_ID = "CN472U9F7K"
PRIVATE_KEY_PATH = os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_CN472U9F7K.p8")
IPA_PATH = "/home/ubuntu/locksafe-mobile/build/locksafe-v1.0.2-build4-ios.ipa"
BUNDLE_ID = "uk.locksafe.app"

PRODUCER_SERVICE_URL = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService"

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

def make_request(endpoint, payload):
    """Make a request to the content delivery service."""
    token = generate_token()
    url = f"{PRODUCER_SERVICE_URL}/{endpoint}"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "iTMSTransporter/2.3.0"
    }
    
    # Add standard fields
    payload.update({
        "jsonrpc": "2.0",
        "method": endpoint,
        "id": str(int(time.time() * 1000))
    })
    
    resp = requests.post(url, headers=headers, json=payload)
    return resp

def authenticate():
    """Authenticate and get session."""
    print("Step 1: Authenticating...")
    
    payload = {
        "params": {
            "Application": "iTMSTransporter",
            "BaseVersion": "2.3.0",
            "OSIdentifier": "linux",
            "TransporterVersion": "2.3.0"
        }
    }
    
    resp = make_request("authenticateForSession", payload)
    print(f"  Status: {resp.status_code}")
    data = resp.json()
    
    result = data.get("result", {})
    if result.get("Success"):
        session_id = result.get("SessionId")
        shared_secret = result.get("SharedSecret")
        print(f"  Session ID: {session_id}")
        return session_id, shared_secret
    else:
        print(f"  Error: {json.dumps(result, indent=2)[:300]}")
        
        # Try without params wrapper
        payload2 = {
            "Application": "iTMSTransporter",
            "BaseVersion": "2.3.0",
            "OSIdentifier": "linux",
            "TransporterVersion": "2.3.0"
        }
        resp2 = make_request("authenticateForSession", payload2)
        print(f"  Retry status: {resp2.status_code}")
        data2 = resp2.json()
        result2 = data2.get("result", {})
        print(f"  Retry result: {json.dumps(result2, indent=2)[:300]}")
        
        if result2.get("Success"):
            return result2.get("SessionId"), result2.get("SharedSecret")
    
    return None, None

def lookup_software(session_id, shared_secret):
    """Look up the software/app."""
    print("\nStep 2: Looking up software...")
    
    payload = {
        "params": {
            "BundleId": BUNDLE_ID,
            "SharedSecret": shared_secret,
            "SessionId": session_id
        }
    }
    
    resp = make_request("lookupSoftwareForBundleId", payload)
    print(f"  Status: {resp.status_code}")
    data = resp.json()
    result = data.get("result", {})
    print(f"  Result: {json.dumps(result, indent=2)[:500]}")
    
    return result

def create_reservation(session_id, shared_secret, apple_id):
    """Create upload reservation."""
    print("\nStep 3: Creating upload reservation...")
    
    ipa_path = Path(IPA_PATH)
    file_size = ipa_path.stat().st_size
    
    with open(ipa_path, 'rb') as f:
        checksum = hashlib.md5(f.read()).hexdigest()
    
    payload = {
        "params": {
            "AppleId": apple_id,
            "SharedSecret": shared_secret,
            "SessionId": session_id,
            "Transport": "HTTP",
            "FileDescriptions": [{
                "Checksum": checksum,
                "ChecksumType": "md5",
                "ContentType": "application/octet-stream",
                "FileName": ipa_path.name,
                "FileSize": file_size
            }]
        }
    }
    
    resp = make_request("createReservation", payload)
    print(f"  Status: {resp.status_code}")
    data = resp.json()
    result = data.get("result", {})
    print(f"  Result: {json.dumps(result, indent=2)[:500]}")
    
    return result

def upload_file(reservation_data):
    """Upload the IPA file."""
    print("\nStep 4: Uploading file...")
    
    reservations = reservation_data.get("Reservations", [])
    if not reservations:
        print("  No reservations found!")
        return False
    
    for reservation in reservations:
        upload_url = reservation.get("URL")
        token_value = reservation.get("Token")
        
        print(f"  Upload URL: {upload_url}")
        
        with open(IPA_PATH, 'rb') as f:
            file_data = f.read()
        
        headers = {
            "Content-Type": "application/octet-stream",
            "Content-Length": str(len(file_data))
        }
        
        if token_value:
            headers["X-Apple-Upload-Token"] = token_value
        
        resp = requests.put(upload_url, headers=headers, data=file_data)
        print(f"  Upload status: {resp.status_code}")
        
        if resp.status_code not in [200, 201]:
            print(f"  Error: {resp.text[:300]}")
            return False
    
    return True

def commit_reservation(session_id, shared_secret, reservation_id):
    """Commit the upload."""
    print("\nStep 5: Committing upload...")
    
    payload = {
        "params": {
            "SharedSecret": shared_secret,
            "SessionId": session_id,
            "ReservationIds": [reservation_id]
        }
    }
    
    resp = make_request("commitReservation", payload)
    print(f"  Status: {resp.status_code}")
    data = resp.json()
    result = data.get("result", {})
    print(f"  Result: {json.dumps(result, indent=2)[:500]}")
    
    return result.get("Success", False)

if __name__ == "__main__":
    print("=== Apple Content Delivery Upload ===\n")
    
    session_id, shared_secret = authenticate()
    
    if session_id:
        software = lookup_software(session_id, shared_secret)
        apple_id = software.get("AppleId") or software.get("adamId")
        
        if apple_id:
            reservation = create_reservation(session_id, shared_secret, apple_id)
            
            if reservation.get("Reservations"):
                success = upload_file(reservation)
                
                if success:
                    reservation_id = reservation["Reservations"][0].get("ReservationId")
                    commit_reservation(session_id, shared_secret, reservation_id)
    else:
        print("\nAuthentication failed. The content delivery API requires")
        print("specific protocol handling that may not work with API keys alone.")
        print("\nAlternative approaches:")
        print("1. Use Transporter app on macOS")
        print("2. Use EAS submit from the project owner's account")
        print("3. Generate an app-specific password and use altool")
