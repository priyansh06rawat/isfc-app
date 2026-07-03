import React, { useRef } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle, PressableProps, StyleSheet } from 'react-native';

interface TouchableScaleProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export function TouchableScale({
  children,
  style,
  scaleTo = 0.96,
  onPress,
  ...props
}: TouchableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const flatStyle = style ? StyleSheet.flatten(style) : {};
  const containerStyle: ViewStyle = {};
  const layoutStyle: ViewStyle = {};

  const layoutKeys = [
    'flexDirection',
    'alignItems',
    'justifyContent',
    'gap',
    'flex',
    'flexWrap',
    'padding',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'paddingHorizontal',
    'paddingVertical',
  ];

  Object.keys(flatStyle).forEach((key) => {
    if (layoutKeys.includes(key)) {
      (layoutStyle as any)[key] = (flatStyle as any)[key];
    } else {
      (containerStyle as any)[key] = (flatStyle as any)[key];
    }
  });

  if ((flatStyle as any).width !== undefined) {
    layoutStyle.width = '100%';
  }
  if ((flatStyle as any).height !== undefined) {
    layoutStyle.height = '100%';
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, containerStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={layoutStyle}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
