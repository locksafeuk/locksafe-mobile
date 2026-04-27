import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface CustomPasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoComplete?: 'password' | 'new-password' | 'current-password';
  testID?: string;
}

export function CustomPasswordInput({
  value,
  onChangeText,
  placeholder = 'Password',
  autoComplete = 'password',
  testID,
}: CustomPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* Hidden TextInput - captures actual text */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        testID={testID}
        style={[styles.hiddenInput, StyleSheet.absoluteFillObject]}
        // No secureTextEntry - masking handled in visible text layer
        secureTextEntry={false}
        selectionColor={showPassword ? '#3b82f6' : 'transparent'}
        caretHidden={!showPassword}
      />

      {/* Visible password display */}
      <View style={[styles.visibleContainer, isFocused && styles.focused]} pointerEvents="none">
        {value.length === 0 ? (
          <Text style={styles.placeholder}>{placeholder}</Text>
        ) : showPassword ? (
          <Text style={styles.visibleText}>{value}</Text>
        ) : (
          <Text style={styles.dotsText}>{'●'.repeat(value.length)}</Text>
        )}
      </View>

      {/* Toggle visibility button */}
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.toggleButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 50,
  },
  hiddenInput: {
    color: 'transparent',
  },
  visibleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingRight: 48,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  focused: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  visibleText: {
    fontSize: 16,
    color: '#0f172a',
  },
  dotsText: {
    fontSize: 24,
    color: '#0f172a',
    letterSpacing: 4,
    lineHeight: 24,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
  },
});
