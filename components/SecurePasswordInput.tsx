import React from 'react';
import { Platform, TextInput, View } from 'react-native';

type SecurePasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SecurePasswordInput({ value, onChangeText }: SecurePasswordInputProps) {
  return (
    <View>
      <TextInput
        secureTextEntry={true}
        value={value}
        onFocus={() => {
          console.log('[PASSWORD] Focused');
          console.log('[PASSWORD] secureTextEntry:', true);
        }}
        onChangeText={(text) => {
          console.log('[PASSWORD] Text length:', text.length);
          console.log('[PASSWORD] Has text:', text.length > 0);
          onChangeText(text);
        }}
        style={Platform.select({
          ios: {
            height: 50,
            fontSize: 16,
            color: '#000000',
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#000000',
            backgroundColor: '#FFFFFF',
          },
          android: {
            height: 50,
            fontSize: 16,
            color: '#000000',
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#000000',
          },
          default: {
            height: 50,
            fontSize: 16,
            color: '#000000',
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#000000',
          },
        })}
      />
    </View>
  );
}
