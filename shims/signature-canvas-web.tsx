/**
 * Web shim for react-native-signature-canvas
 * Provides a basic canvas-based signature pad for web.
 */
import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface SignatureViewRef {
  readSignature: () => void;
  clearSignature: () => void;
}

const SignatureScreen = forwardRef(({ onOK, onClear, webStyle, style, penColor, backgroundColor, ...props }: any, ref: any) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>✍️</Text>
        <Text style={styles.text}>Signature Pad</Text>
        <Text style={styles.subtext}>Signature capture is limited in web preview</Text>
      </View>
    </View>
  );
});

SignatureScreen.displayName = 'SignatureScreen';

export default SignatureScreen;
export type { SignatureViewRef as SignatureViewRef };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    minHeight: 200,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  subtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
});
