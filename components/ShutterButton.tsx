import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/tokens';

type Props = {
  mode?: 'photo' | 'video';
  recording?: boolean;
  onPress?: () => void;
};

export default function ShutterButton({ mode = 'photo', recording = false, onPress }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const innerSize = mode === 'video' ? (recording ? 28 : 70) : 74;
  const innerRadius = mode === 'video' && recording ? 6 : 37;
  const innerBg = mode === 'video' ? Colors.alert : '#FFFFFF';

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 12, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
      onPress={onPress}
      accessibilityLabel="Shutter button"
      accessibilityRole="button"
    >
      <Animated.View style={[styles.ring, animStyle]}>
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
              backgroundColor: innerBg,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
});
