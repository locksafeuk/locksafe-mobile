/**
 * SignaturePad Component
 *
 * Wraps react-native-signature-canvas for capturing customer signatures
 * during job completion flow.
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { RotateCcw, Check } from 'lucide-react-native';

interface SignaturePadProps {
  /** Called with base64 PNG data when signature is confirmed */
  onSignatureCapture: (signatureData: string) => void;
  /** Called when signature is cleared */
  onClear?: () => void;
  /** Height of the signature area */
  height?: number;
  /** Pen color */
  penColor?: string;
  /** Background color */
  backgroundColor?: string;
}

export default function SignaturePad({
  onSignatureCapture,
  onClear,
  height = 200,
  penColor = '#0f172a',
  backgroundColor = '#ffffff',
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleOK = useCallback(
    (signature: string) => {
      // signature is a base64 data URI (data:image/png;base64,...)
      onSignatureCapture(signature);
    },
    [onSignatureCapture]
  );

  const handleEmpty = useCallback(() => {
    // User tried to save empty signature
  }, []);

  const handleClear = useCallback(() => {
    signatureRef.current?.clearSignature();
    onClear?.();
  }, [onClear]);

  const handleConfirm = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  // Inline style for the webview signature canvas
  const style = `.m-signature-pad--footer { display: none; }
    .m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: none; }
    body, html { height: 100%; margin: 0; padding: 0; }
    canvas { width: 100% !important; height: 100% !important; }`;

  return (
    <View style={[styles.container, { height: height + 52 }]}>
      <View style={[styles.canvasWrapper, { height }]}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          webStyle={style}
          autoClear={false}
          descriptionText=""
          penColor={penColor}
          backgroundColor={backgroundColor}
          imageType="image/png"
          dataURL=""
          trimWhitespace={true}
          minWidth={1.5}
          maxWidth={3}
        />
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <RotateCcw size={16} color="#64748b" />
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>

        <Pressable onPress={handleConfirm} style={styles.confirmButton}>
          <Check size={16} color="white" />
          <Text style={styles.confirmText}>Confirm Signature</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  canvasWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  clearText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  confirmText: {
    marginLeft: 4,
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
});
