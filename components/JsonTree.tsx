import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/tokens';
import { ChevRightIcon, ChevDownIcon } from '@/components/ui/Icons';

type Props = { value: unknown; depth?: number; keyName?: string; defaultOpen?: boolean };

function leafColor(v: unknown, t: ReturnType<typeof useTheme>): string {
  if (typeof v === 'string') return Colors.verified;
  if (typeof v === 'number') return Colors.device;
  if (typeof v === 'boolean') return Colors.alert;
  if (v === null) return t.textMuted;
  return t.text;
}

function formatLeaf(v: unknown): string {
  if (typeof v === 'string') return `"${v}"`;
  if (v === null) return 'null';
  return String(v);
}

export function JsonNode({ value: v, depth = 0, keyName: k, defaultOpen = false }: Props) {
  const t = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  const isObj = v !== null && typeof v === 'object';
  const isArr = Array.isArray(v);
  const indent = 16 + depth * 16;

  if (!isObj) {
    return (
      <View style={[styles.leafRow, {
        paddingLeft: indent,
        backgroundColor: depth > 0 ? t.bgAlt : t.bg,
        borderLeftWidth: depth > 0 ? 2 : 0,
        borderLeftColor: t.border,
        borderBottomColor: t.borderSoft,
      }]}>
        {k != null && (
          <>
            <Text style={[styles.key, { color: t.purple }]}>{k}</Text>
            <Text style={[styles.colon, { color: t.textMuted }]}>: </Text>
          </>
        )}
        <Text style={[styles.value, { color: leafColor(v, t) }]}>{formatLeaf(v)}</Text>
      </View>
    );
  }

  const entries = Object.entries(v as Record<string, unknown>);
  const preview = isArr
    ? `array · ${entries.length} items`
    : `{ ${Object.keys(v as object).slice(0, 2).join(', ')}${Object.keys(v as object).length > 2 ? '…' : ''} }`;

  return (
    <>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={[styles.objRow, {
          paddingLeft: indent,
          backgroundColor: depth > 0 ? t.bgAlt : t.bg,
          borderLeftWidth: depth > 0 ? 2 : 0,
          borderLeftColor: t.border,
          borderBottomColor: t.borderSoft,
        }]}
      >
        {open ? <ChevDownIcon size={14} color={t.grayLt} /> : <ChevRightIcon size={14} color={t.grayLt} />}
        {k != null && <Text style={[styles.key, { color: t.purple, marginLeft: 8 }]}>{k}</Text>}
        <Text style={[styles.preview, { color: t.textMuted }]}> {preview}</Text>
      </Pressable>
      {open && entries.map(([ck, cv]) => (
        <JsonNode
          key={ck}
          keyName={isArr ? `[${ck}]` : ck}
          value={cv}
          depth={depth + 1}
          defaultOpen={false}
        />
      ))}
    </>
  );
}

export default function JsonTree({ value }: { value: Record<string, unknown> }) {
  return (
    <View>
      {Object.entries(value).map(([k, v]) => (
        <JsonNode key={k} keyName={k} value={v} depth={0} defaultOpen={k === 'assertions'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  leafRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingRight: 16,
    borderBottomWidth: 0.5,
  },
  objRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingRight: 16,
    borderBottomWidth: 0.5,
  },
  key: { fontFamily: 'Menlo', fontSize: 12, fontWeight: '700' },
  colon: { fontFamily: 'Menlo', fontSize: 12 },
  value: { fontFamily: 'Menlo', fontSize: 12, flexShrink: 1 },
  preview: { fontFamily: 'Menlo', fontSize: 11, flexShrink: 1 },
});
