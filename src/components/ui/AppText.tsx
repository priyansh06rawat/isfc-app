import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface AppTextProps extends RNTextProps {
  weight?: '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
}

export function AppText(props: AppTextProps) {
  const { style, weight, ...rest } = props;
  
  // Try to determine the intended weight from the style object if not explicitly passed
  let resolvedWeight = weight;
  if (!resolvedWeight && style) {
    const flattened = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    if (flattened.fontWeight) {
      resolvedWeight = flattened.fontWeight as AppTextProps['weight'];
    }
  }

  let fontFamily = 'Inter_400Regular';
  if (resolvedWeight === '500') fontFamily = 'Inter_500Medium';
  if (resolvedWeight === '600') fontFamily = 'Inter_600SemiBold';
  if (resolvedWeight === '700' || resolvedWeight === 'bold') fontFamily = 'Inter_700Bold';
  if (resolvedWeight === '800') fontFamily = 'Inter_800ExtraBold';
  if (resolvedWeight === '900') fontFamily = 'Inter_900Black';

  return <RNText {...rest} style={[style, { fontFamily, fontWeight: undefined }]} />;
}
