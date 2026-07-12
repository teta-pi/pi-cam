import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const HEX = '0123456789abcdef';
const CHARS = 80;

function randomHex(n: number) {
  return Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join(' ');
}

type Props = {
  color?: string;
  speed?: number; // seconds for one scroll cycle
  opacity?: number;
};

export default function HashStream({ color = '#6C63FF', speed = 20, opacity = 1 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const text = randomHex(CHARS);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: -1,
        duration: speed * 1000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [speed]);

  const translateX = anim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-300, 0],
  });

  return (
    <View style={styles.row} pointerEvents="none">
      <Animated.Text
        style={[styles.text, { color, opacity, transform: [{ translateX }] }]}
        numberOfLines={1}
      >
        {text + ' ' + text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: 'hidden',
    height: 16,
  },
  text: {
    fontFamily: 'Menlo',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
