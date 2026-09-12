import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
} from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Colors, Radius } from '@/constants/tokens';
import { useTheme } from '@/context/ThemeContext';
import PiMark from '@/components/PiMark';
import HashStream from '@/components/HashStream';
import { LockIcon, CheckIcon } from '@/components/ui/Icons';
import { generateKeypair } from '@/modules/crypto';

// ── Illustrations ─────────────────────────────────────────────────────────────

function ShieldIllo() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>
      {[80, 140, 200].map((r, i) => (
        <View key={r} style={{
          position: 'absolute', width: r, height: r, borderRadius: r / 2,
          borderWidth: 1, borderColor: `rgba(108,99,255,${0.3 - i * 0.08})`,
        }} />
      ))}
      <PiMark size={120} color={Colors.purple} />
    </View>
  );
}

function LockIllo() {
  return (
    <View style={{ width: 200, height: 220, position: 'relative' }}>
      <View style={{
        position: 'absolute', left: 20, top: 0, width: 130, height: 200,
        borderRadius: 24, borderWidth: 2, borderColor: Colors.purple,
        backgroundColor: 'rgba(108,99,255,0.06)', padding: 16,
      }}>
        <Text style={{ fontFamily: 'Menlo', fontSize: 9, color: Colors.purple, lineHeight: 16 }}>
          {'$ key.generate()\n──────────────\npriv: 0xA3F9…\npub:  0x2B1C…\n\n✓ sealed'}
        </Text>
      </View>
      <View style={{
        position: 'absolute', right: 0, top: 60, width: 80, height: 80,
        borderRadius: 18, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 28,
        elevation: 12,
      }}>
        <LockIcon size={40} color="#fff" />
      </View>
    </View>
  );
}

function GlobeIllo() {
  return (
    <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="84" fill="none" stroke="#27AE60" strokeWidth="1.5" opacity="0.4" />
        <Ellipse cx="100" cy="100" rx="84" ry="40" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4" />
        <Ellipse cx="100" cy="100" rx="40" ry="84" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4" />
        {[[40,60],[160,80],[60,150],[150,150],[100,30]].map(([x, y], i) => (
          <React.Fragment key={i}>
            <Circle cx={x} cy={y} r="5" fill="#27AE60" />
            <Circle cx={x} cy={y} r="10" fill="none" stroke="#27AE60" strokeWidth="1" opacity="0.4" />
          </React.Fragment>
        ))}
      </Svg>
      <View style={{
        position: 'absolute', width: 60, height: 60, borderRadius: 30,
        backgroundColor: Colors.verified, alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.verified, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24,
        elevation: 8,
      }}>
        <CheckIcon size={32} color="#fff" stroke={2.4} />
      </View>
    </View>
  );
}

// ── Key Gen ───────────────────────────────────────────────────────────────────

function KeyGenStep() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const stages = ['Initializing…', 'Creating key pair…', 'Securing to device…', 'Done!'];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const np = Math.min(100, p + 4);
        if (np >= 100) { clearInterval(interval); setDone(true); setStageIdx(3); }
        return np;
      });
    }, 90);
    const t1 = setTimeout(() => setStageIdx(1), 700);
    const t2 = setTimeout(() => setStageIdx(2), 1500);

    generateKeypair().catch(console.error);

    const t3 = setTimeout(() => router.replace('/(tabs)/camera'), 3500);
    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const R = 36, C = 2 * Math.PI * R;
  const strokeDash = C - (progress / 100) * C;
  const strokeColor = done ? Colors.verified : Colors.purple;

  return (
    <View style={[styles.container, { backgroundColor: Colors.navy }]}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {[0,1,2,3,4,5,6,7].map((i) => (
          <HashStream key={i} speed={18 + i * 3} color={i % 2 ? Colors.purpleLt : Colors.verified} opacity={0.14} />
        ))}
      </View>

      <Svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <Circle cx="48" cy="48" r={R} fill="none" stroke={strokeColor} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${C}`} strokeDashoffset={`${strokeDash}`} />
      </Svg>
      <View style={styles.progressIcon}>
        {done
          ? <CheckIcon size={36} color="#fff" stroke={2.4} />
          : <LockIcon size={28} color="#fff" />}
      </View>

      <Text style={styles.keyTitle}>
        {done ? 'Your key is ready' : 'Generating your secure key'}
      </Text>
      <Text style={styles.keySub}>Your private key never leaves this device.</Text>
      <Text style={styles.keyStage}>{stages[stageIdx]}</Text>
    </View>
  );
}

// ── Main Onboarding ───────────────────────────────────────────────────────────

const SLIDES = [
  {
    title: 'Every shot, verified.',
    body: 'Pi CAM signs every photo and video with a cryptographic proof. No one can fake what you captured.',
    Illo: ShieldIllo,
  },
  {
    title: 'Works offline, always.',
    body: 'Your device generates a secure key. Signing happens on-device — no internet needed.',
    Illo: LockIllo,
  },
  {
    title: 'Trusted worldwide.',
    body: 'Link your camera to your public TETA+PI profile, so anyone can check who really captured a photo.',
    Illo: GlobeIllo,
  },
];

export default function OnboardingScreen() {
  const t = useTheme();
  const [step, setStep] = useState(0);

  const goNext = () => {
    if (step < 2) setStep((s) => s + 1);
    else setStep(3);
  };

  if (step === 3) {
    return <KeyGenStep />;
  }

  const slide = SLIDES[step];
  const isLast = step === 2;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Skip */}
      {!isLast && (
        <Pressable
          onPress={() => setStep(2)}
          style={styles.skipBtn}
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[styles.skipText, { color: t.textMuted }]}>Skip</Text>
        </Pressable>
      )}

      {/* Illustration */}
      <View style={styles.illoArea}>
        <slide.Illo />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: t.textBody }]}>{slide.body}</Text>

        <View style={{ flex: 1 }} />

        {/* Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[
              styles.pageDot,
              {
                width: i === step ? 24 : 8,
                backgroundColor: i === step ? t.purple : t.grayLt,
              },
            ]} />
          ))}
        </View>

        {/* CTA */}
        <Pressable onPress={goNext} style={[styles.cta, { backgroundColor: t.purple }]}>
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute', top: 60, right: 16, zIndex: 5, padding: 8,
  },
  skipText: { fontSize: 14, fontWeight: '500' },
  illoArea: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  content: {
    flex: 0.55,
    padding: 32,
    paddingBottom: 28,
  },
  title: {
    fontSize: 26, fontWeight: '700', textAlign: 'center', letterSpacing: -0.6, lineHeight: 30,
  },
  body: {
    marginTop: 12, fontSize: 15, lineHeight: 22, textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20,
  },
  pageDot: {
    height: 8, borderRadius: 4,
  },
  cta: {
    height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 8,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // KeyGen styles
  progressIcon: {
    position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center',
    marginTop: -96,
  },
  keyTitle: {
    marginTop: 28, fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', maxWidth: 280,
  },
  keySub: {
    marginTop: 8, fontSize: 14, color: Colors.purpleLt, textAlign: 'center', maxWidth: 280, lineHeight: 20,
  },
  keyStage: {
    marginTop: 28, fontFamily: 'Menlo', fontSize: 13, color: Colors.purpleLt,
  },
});
