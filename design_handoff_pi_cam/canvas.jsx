// Pi CAM — design canvas composition.
// Each section pairs iOS + Android frames so the team can compare them
// side-by-side. Variants get their own artboard.

const IOS_W = 402, IOS_H = 874;
const AND_W = 412, AND_H = 892;

// EDITMODE: persisted tweak defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "globalTheme": "light",
  "hudVariant": "classic",
  "captureVariant": "hash",
  "hashGlyphs": true
}/*EDITMODE-END*/;

function PiCamCanvas() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <DesignCanvas>
        {/* ── HERO: the main app ─────────────────────────── */}
        <DCSection id="hero" title="Pi CAM — the app"
          subtitle="Interactive prototype. Tap shutter to sign a capture, swap tabs, open the gallery. Light = default theme; the camera screen is always dark.">
          <DCArtboard id="ios-main" label={`iOS · ${tw.globalTheme}`} width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="camera" theme={tw.globalTheme}
                hudVariant={tw.hudVariant} captureVariant={tw.captureVariant}/>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="and-main" label={`Android · ${tw.globalTheme}`} width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="camera" theme={tw.globalTheme}
                hudVariant={tw.hudVariant} captureVariant={tw.captureVariant}/>
            </AndroidDevice>
          </DCArtboard>
          <DCArtboard id="ios-gallery" label="iOS · Gallery start" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="gallery" theme={tw.globalTheme}/>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="ios-settings" label="iOS · Settings" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="settings" theme={tw.globalTheme}/>
            </IOSDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Launch ──────────────────────────────────────── */}
        <DCSection id="launch" title="S-02 · Splash & first launch"
          subtitle="Dark navy, drifting hash backdrop, Pi shield with pulse. Three states.">
          <DCArtboard id="splash-init" label="Initializing" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="dark"><SplashScreen status="initializing"/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="splash-key" label="Generating key" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="dark"><SplashScreen status="generating-key"/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="splash-and" label="Android · Initializing" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark>
              <ThemeProvider mode="dark"><SplashScreen status="initializing"/></ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Onboarding ─────────────────────────────────── */}
        <DCSection id="onboarding" title="S-09 · Onboarding"
          subtitle="Three slides + on-device key generation. Tap Next to advance; the keygen screen completes the flow.">
          <DCArtboard id="onb-ios" label="iOS · Slide 1 (interactive)" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H}>
              <ThemeProvider mode="light"><OnboardingScreen/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="onb-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H}>
              <ThemeProvider mode="light"><OnboardingScreen/></ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
          <DCArtboard id="onb-keygen" label="Key generation" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="dark"><KeyGenScreen/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Camera HUD variants ────────────────────────── */}
        <DCSection id="hud" title="S-03 · Camera HUD variants"
          subtitle="Three takes on the viewfinder chrome. Tap each shutter to compare capture animations. The Tweaks panel applies the chosen HUD + capture style to the hero frames above.">
          <DCArtboard id="hud-classic" label="A · Classic (spec)" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant="classic" captureVariant={tw.captureVariant}/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="hud-minimal" label="B · Minimal · Pi-mark badge" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant="minimal" captureVariant={tw.captureVariant}/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="hud-cinematic" label="C · Cinematic · letterbox" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant="cinematic" captureVariant={tw.captureVariant}/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Capture animation variants ─────────────────── */}
        <DCSection id="capture" title="S-04 · Capture animation"
          subtitle="Three signing-moment feels. Tap the shutter in each — they share the same toast cycle (Signing → Signed → Certifying → Pi Verified) but the on-image effect differs.">
          <DCArtboard id="cap-hash" label="A · Hash glyphs rise" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant={tw.hudVariant} captureVariant="hash"/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="cap-ring" label="B · Shockwave ring" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant={tw.hudVariant} captureVariant="ring"/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="cap-stamp" label="C · Pi-mark stamp + scan" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark>
              <ThemeProvider mode="light">
                <PiCamApp initial="camera" hudVariant={tw.hudVariant} captureVariant="stamp"/>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Preview ────────────────────────────────────── */}
        <DCSection id="preview" title="S-05 · Preview"
          subtitle="Photo + verification details. Switch tabs to see the full C2PA payload.">
          <DCArtboard id="prv-ios-ca" label="iOS · Pi Verified" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><PreviewScreen photo={PHOTOS[0]}/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="prv-ios-dev" label="iOS · Device only" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><PreviewScreen photo={PHOTOS[1]}/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="prv-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><PreviewScreen photo={PHOTOS[0]}/></ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Gallery ────────────────────────────────────── */}
        <DCSection id="gallery" title="S-06 · Gallery"
          subtitle="3-column grid with verification pips. Right-click any cell to enter selection mode.">
          <DCArtboard id="gal-ios" label="iOS · default" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <GalleryScreen/>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                    <TabBar tab="gallery" onChange={() => {}} theme={tw.globalTheme}/>
                  </div>
                </div>
              </ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="gal-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <GalleryScreen/>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                    <TabBar tab="gallery" onChange={() => {}} theme={tw.globalTheme}/>
                  </div>
                </div>
              </ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Verify ─────────────────────────────────────── */}
        <DCSection id="verify" title="S-07 · Verify external content"
          subtitle="Drop-zone + four result states. Tap a sample chip to walk through each case.">
          <DCArtboard id="ver-ios" label="iOS · interactive" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><VerifyScreen/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="ver-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><VerifyScreen/></ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Settings ───────────────────────────────────── */}
        <DCSection id="settings" title="S-08 · Settings"
          subtitle="Grouped sections; toggling Auto-CA Upgrade in here flips the verification badge state. Reset Key opens a destructive bottom sheet.">
          <DCArtboard id="set-ios" label="iOS" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="settings" theme={tw.globalTheme}/>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="set-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <PiCamApp initial="settings" theme={tw.globalTheme}/>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Manifest viewer ────────────────────────────── */}
        <DCSection id="manifest" title="S-10 · Manifest viewer"
          subtitle="C2PA JSON tree. Mono fonts, type-colored leaves, collapsible nodes with purple depth rails.">
          <DCArtboard id="man-ios" label="iOS" width={IOS_W} height={IOS_H}>
            <IOSDevice width={IOS_W} height={IOS_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><ManifestViewer/></ThemeProvider>
            </IOSDevice>
          </DCArtboard>
          <DCArtboard id="man-and" label="Android" width={AND_W} height={AND_H}>
            <AndroidDevice width={AND_W} height={AND_H} dark={tw.globalTheme === 'dark'}>
              <ThemeProvider mode={tw.globalTheme}><ManifestViewer/></ThemeProvider>
            </AndroidDevice>
          </DCArtboard>
        </DCSection>

        {/* ── Component library ──────────────────────────── */}
        <DCSection id="components" title="S-01 · Component library"
          subtitle="Atomic UI in light / dark. Drop these into any screen.">
          <DCArtboard id="comp-badges" label="Verification badges" width={420} height={360}>
            <ComponentBoard t1="Light">
              <ThemeProvider mode="light"><BadgeBoard/></ThemeProvider>
            </ComponentBoard>
          </DCArtboard>
          <DCArtboard id="comp-badges-d" label="Verification badges · dark" width={420} height={360}>
            <ComponentBoard dark t1="Dark">
              <ThemeProvider mode="dark"><BadgeBoard/></ThemeProvider>
            </ComponentBoard>
          </DCArtboard>
          <DCArtboard id="comp-buttons" label="Buttons" width={420} height={460}>
            <ComponentBoard t1="Buttons">
              <ThemeProvider mode="light"><ButtonBoard/></ThemeProvider>
            </ComponentBoard>
          </DCArtboard>
          <DCArtboard id="comp-shutter" label="Shutter & controls" width={420} height={360}>
            <ComponentBoard dark t1="Shutter">
              <ShutterBoard/>
            </ComponentBoard>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Global">
          <TweakRadio label="Theme" value={tw.globalTheme}
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            onChange={(v) => setTweak('globalTheme', v)}/>
        </TweakSection>
        <TweakSection label="Camera">
          <TweakRadio label="HUD" value={tw.hudVariant}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'cinematic', label: 'Cinema' },
            ]}
            onChange={(v) => setTweak('hudVariant', v)}/>
          <TweakRadio label="Capture" value={tw.captureVariant}
            options={[
              { value: 'hash', label: 'Hash' },
              { value: 'ring', label: 'Ring' },
              { value: 'stamp', label: 'Stamp' },
            ]}
            onChange={(v) => setTweak('captureVariant', v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ComponentBoard({ children, dark, t1 }) {
  const t = dark ? PI_DARK : PI_LIGHT;
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.text,
      fontFamily: FONT_STACK, padding: 24, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textMuted }}>{t1}</div>
      {children}
    </div>
  );
}

function BadgeBoard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <VerificationBadge status="ca"/>
      <VerificationBadge status="device"/>
      <VerificationBadge status="signing"/>
      <VerificationBadge status="certifying"/>
      <VerificationBadge status="error"/>
    </div>
  );
}

function ButtonBoard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PrimaryButton fullWidth icon={IconShieldCheck}>Sign & Verify</PrimaryButton>
      <SecondaryButton fullWidth>Choose File</SecondaryButton>
      <DangerButton fullWidth>Reset Device Key</DangerButton>
      <GhostButton style={{ alignSelf: 'flex-start' }}>Cancel</GhostButton>
      <div style={{ marginTop: 8 }}>
        <PillToggle value="photo" onChange={() => {}} options={[
          { value: 'photo', label: 'Photo' }, { value: 'video', label: 'Video' },
        ]}/>
      </div>
    </div>
  );
}

function ShutterBoard() {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 16, flex: 1, justifyContent: 'center' }}>
      <ShutterButton mode="photo"/>
      <ShutterButton mode="video"/>
      <ShutterButton mode="video" recording/>
      <CamControl label="flash"><IconZap size={22} color="#fff"/></CamControl>
      <CamControl label="flip"><IconFlip size={22} color="#fff"/></CamControl>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PiCamCanvas/>);
