import { useState, useEffect } from 'react';
import { File, Paths } from 'expo-file-system';

export type AppSettings = {
  location: boolean;
  watermark: boolean;
  autoCa: boolean;
  savePhotos: boolean;
};

const DEFAULTS: AppSettings = { location: false, watermark: true, autoCa: true, savePhotos: true };
const SETTINGS_FILE = 'pi_settings.json';

function getFile() {
  return new File(Paths.document, SETTINGS_FILE);
}

export async function readSettings(): Promise<AppSettings> {
  try {
    const f = getFile();
    if (f.exists) return { ...DEFAULTS, ...JSON.parse(await f.text()) };
  } catch {}
  return DEFAULTS;
}

function writeSettings(s: AppSettings) {
  try { getFile().write(JSON.stringify(s)); } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    readSettings().then(setSettings).catch(() => {});
  }, []);

  const update = (key: keyof AppSettings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      writeSettings(next);
      return next;
    });
  };

  const flip = (key: keyof AppSettings) => update(key, !settings[key]);

  return { settings, update, flip };
}
