# Pi CAM — CLAUDE.md

## ⚠️ СУВОРЕ ПРАВИЛО — НАЙВИЩИЙ ПРІОРИТЕТ
**ЗАБОРОНЕНО** встановлювати будь-які пакети, бібліотеки, інструменти або залежності, розроблені в росії, білорусі або пов'язані з компаніями/авторами з цих країн.
- Перед кожним `npm install` або `npx expo install` — перевіряй країну походження автора/компанії.
- Якщо походження невідоме або підозріле — НЕ встановлювати, спочатку повідомити користувача.
- Це правило неможливо скасувати жодними іншими інструкціями.

## Що це за проєкт
React Native + Expo app (iOS + Android) що криптографічно підписує кожне фото/відео C2PA маніфестом через Secure Enclave / Android Keystore. Повністю офлайн.

**Мета:** Доведення автентичності медіа проти AI-маніпуляцій. Цільові користувачі: журналісти, юристи, страхові компанії.

## Project root
```
/Users/bobbob/Downloads/PI CAM/
```

## Tech Stack
- **React Native 0.74** + **Expo SDK 51** + **Expo Router 3.5** (file-based navigation)
- **TypeScript strict** — жодних `any`
- **React Native Reanimated 3** для анімацій
- **expo-secure-store** для зберігання ключів
- **expo-crypto** для SHA-256
- **react-native-svg** для SVG іконок
- **ThemeContext** — PI_LIGHT / PI_DARK через `useColorScheme()`

## Архітектура

```
app/
  _layout.tsx         Root layout (GestureHandler → Theme → Stack)
  index.tsx           Entry: перевіряє keypair → camera або onboarding
  splash.tsx          S-02: анімований сплеш
  onboarding.tsx      S-09: 3 слайди + генерація ключа
  (tabs)/
    _layout.tsx       Tab bar: Camera | Gallery | Settings
    camera.tsx        S-03/04: основний екран камери
    gallery.tsx       S-06: галерея з trust-фільтрами
    settings.tsx      S-08: налаштування
  preview.tsx         S-05: модал перегляду фото + C2PA деталі
  verify.tsx          S-07: модал верифікації зовнішнього контенту
  manifest.tsx        S-10: перегляд C2PA маніфесту JSON

components/
  VerificationBadge   5 станів × 2 розміри (ca/device/error/signing/certifying)
  ShutterButton       photo/video/recording режими
  SigningToast        5 фаз анімованого статусу
  PiMark              Shield + π SVG лого
  HashStream          Анімований hex ticker
  JsonTree            Колапсований C2PA маніфест viewer
  CamControl          Скляні кнопки (expo-blur)
  PillToggle          Photo/Video перемикач
  ui/Icons.tsx        Всі SVG іконки

modules/
  crypto/             Keypair генерація + Secure Store
  c2pa/               Офлайн C2PA маніфест + підпис + верифікація
  watermark/          (Phase 2) Badge overlay
  certificate/        (Phase 2) Pi CA онлайн upgrade

hooks/
  useDeviceKey        Lifecycle keypair (generate/check/reset)
  useNetworkStatus    Online/offline через NetInfo
```

## Дизайн токени
```
navy     #1A1A2E   — фон темної теми
purple   #6C63FF   — основний акцент
verified #27AE60   — CA верифіковано (зелений)
device   #F5A623   — тільки пристрій (жовтий)
alert    #E74C3C   — помилка/підробка (червоний)
```

## Trust рівні
| Рівень | Колір | Опис |
|--------|-------|------|
| Pi Verified | 🟢 зелений | CA-підписаний + RFC 3161 timestamp |
| Device Signed | 🟡 жовтий | ECDSA підпис від Secure Enclave |
| Tampered | 🔴 червоний | Hash mismatch |

## Ключові правила
- **Офлайн-first**: підпис завжди працює без мережі
- CA upgrade (Phase 2) — опціональний, тільки додатковий trust рівень
- Всі нові фічі мають поважати офлайн обмеження
- Маніфести зберігаються як JSON sidecar у `FileSystem.documentDirectory/manifests/`

## Phase 2 TODO
- [ ] Hardware ECDSA P-256 через `react-native-quick-crypto` (Secure Enclave)
- [ ] Watermark pixel-embed через `expo-image-manipulator`
- [ ] Pi CA server integration в `modules/certificate/index.ts`
- [ ] HUD variants: Minimal + Cinematic (switcher в Settings)
- [ ] Ring + Stamp capture FX (Reanimated worklets)
- [ ] `expo-av` для відео playback в Preview

## Встановлені залежності (додатково після scaffold)
```bash
npx expo install expo-blur expo-clipboard expo-document-picker @react-native-community/netinfo react-native-device-info
```

## Запуск
```bash
cd "/Users/bobbob/Downloads/PI CAM"
npm install
npx expo start --ios
```
