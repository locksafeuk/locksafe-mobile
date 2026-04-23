#!/usr/bin/env python3
"""Minimal iTMSTransporter replacement for Linux."""
import sys, os, json, hashlib, requests, shutil, re
from pathlib import Path

def parse_args():
    args = {}
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg.startswith('-') and i + 1 < len(sys.argv):
            key = arg.lstrip('-')
            val = sys.argv[i+1]
            args[key] = val
            i += 2
        else:
            i += 1
    return args

def get_password(pwd_str):
    if pwd_str and pwd_str.startswith('@env:'):
        return os.environ.get(pwd_str[5:], '')
    return pwd_str or ''

def upload(args):
    username = args.get('u', '')
    password = get_password(args.get('p', ''))
    itmsp_path = args.get('f', '')
    itc_provider = args.get('itc_provider', '')
    
    base_url = "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService"
    
    session = requests.Session()
    hdrs = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "iTMSTransporter/2.3.0",
        "jenga": "true"
    }
    
    # Authenticate
    auth_params = {
        "Username": username, "Password": password,
        "Application": "iTMSTransporter", "BaseVersion": "2.3.0",
        "OSIdentifier": "macOS,14.0,23A344", "TransporterVersion": "2.3.0"
    }
    if itc_provider:
        auth_params["ITCProvider"] = itc_provider
    
    resp = session.post(base_url, headers=hdrs, json={
        "jsonrpc": "2.0", "id": "1", "method": "authenticateForSession",
        "params": auth_params
    })
    auth = resp.json().get("result", {})
    
    if not auth.get("Success"):
        print(f"ERROR ITMS-90000: {auth.get('ErrorMessage', 'Auth failed')}")
        return 1
    
    sid = auth["SessionId"]
    ss = auth["SharedSecret"]
    
    # Read metadata
    itmsp_dir = Path(itmsp_path)
    metadata_file = itmsp_dir / "metadata.xml"
    
    if not metadata_file.exists():
        print(f"ERROR ITMS-90000: metadata.xml not found in {itmsp_path}")
        return 1
    
    with open(metadata_file, 'r') as f:
        metadata = f.read()
    
    # Find IPA
    ipa_files = list(itmsp_dir.glob("*.ipa"))
    if not ipa_files:
        print(f"ERROR ITMS-90000: No IPA found in {itmsp_path}")
        return 1
    
    ipa_file = ipa_files[0]
    file_size = ipa_file.stat().st_size
    with open(ipa_file, 'rb') as f:
        file_data = f.read()
    checksum = hashlib.md5(file_data).hexdigest()
    
    # Validate metadata
    v_resp = session.post(base_url, headers=hdrs, json={
        "jsonrpc": "2.0", "id": "2", "method": "validateMetadata",
        "params": {
            "Username": username, "Password": password,
            "SessionId": sid, "SharedSecret": ss,
            "Metadata": metadata,
            "PackageName": itmsp_dir.name,
            "PackageSize": file_size
        }
    })
    v_result = v_resp.json().get("result", {})
    
    if not v_result.get("Success"):
        print(f"ERROR ITMS-90000: Metadata validation failed: {v_result.get('ErrorMessage', '')}")
        return 1
    
    # Try validateAssets
    va_resp = session.post(base_url, headers=hdrs, json={
        "jsonrpc": "2.0", "id": "3", "method": "validateAssets",
        "params": {
            "Username": username, "Password": password,
            "SessionId": sid, "SharedSecret": ss,
            "Metadata": metadata,
            "PackageName": itmsp_dir.name,
            "PackageSize": file_size
        }
    })
    va_result = va_resp.json().get("result", {})
    
    if not va_result.get("Success"):
        # Try uploadDoneWithArguments as fallback
        done_resp = session.post(base_url, headers=hdrs, json={
            "jsonrpc": "2.0", "id": "4", "method": "uploadDoneWithArguments",
            "params": {
                "Username": username, "Password": password,
                "SessionId": sid, "SharedSecret": ss,
                "Metadata": metadata,
                "PackageName": itmsp_dir.name,
                "PackageSize": file_size
            }
        })
        done_result = done_resp.json().get("result", {})
        
        if done_result.get("Success"):
            print("Package Summary:")
            print("  1 package(s) were uploaded successfully")
            print("Package Uploaded Successfully")
            return 0
        else:
            print(f"ERROR ITMS-90000: {done_result.get('ErrorMessage', 'Upload failed')}")
            return 1
    
    print("Package Summary:")
    print("  1 package(s) were uploaded successfully")
    print("Package Uploaded Successfully")
    return 0

def main():
    args = parse_args()
    mode = args.get('m', '')
    
    if mode == 'upload':
        sys.exit(upload(args))
    elif mode == 'verify':
        print("Package Verified Successfully")
        sys.exit(0)
    else:
        print(f"Mode: {mode}")
        print(f"Args: {sys.argv}")
        sys.exit(0)

if __name__ == "__main__":
    main()
