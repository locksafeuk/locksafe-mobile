/**
 * Web shim for react-native-maps
 * Renders a placeholder on web since MapView is not supported.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = React.forwardRef(({ children, style, ...props }: any, ref: any) => {
  return (
    <View style={[styles.container, style]} ref={ref}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Map View</Text>
        <Text style={styles.subtext}>Maps are not available in web preview</Text>
      </View>
      {children}
    </View>
  );
});

MapView.displayName = 'MapView';

export default MapView;

export const Marker = ({ children }: any) => <>{children}</>;
export const Polyline = (_props: any) => null;
export const PROVIDER_GOOGLE = 'google';
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  subtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
