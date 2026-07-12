// PiCamApp — composes screens with tab nav + overlay state.
// Each device frame embeds one instance of this; they are independent.
//
// props:
//   initial:        'camera' | 'gallery' | 'settings' | 'splash' | 'onboarding' | 'verify' | 'manifest' | 'preview'
//   theme:          'light' | 'dark'
//   hudVariant:     forwarded to Camera
//   captureVariant: forwarded to Camera
//   online:         start online or offline
//   showTabBar:     whether to render the bottom tab bar (off for splash/onboarding)

function PiCamApp({
  initial = 'camera', theme: initTheme = 'light',
  hudVariant = 'classic', captureVariant = 'hash',
  online: initOnline = true,
}) {
  const [tab, setTab] = React.useState(initial in { camera:1, gallery:1, settings:1 } ? initial : 'camera');
  const [overlay, setOverlay] = React.useState(
    initial in { preview:1, verify:1, manifest:1, splash:1, onboarding:1 } ? initial : null,
  );
  const [theme, setTheme] = React.useState(initTheme);
  const [online, setOnline] = React.useState(initOnline);
  const [previewPhoto, setPreviewPhoto] = React.useState(PHOTOS[0]);

  const closeOverlay = () => setOverlay(null);

  return (
    <ThemeProvider mode={theme}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: theme === 'dark' ? PI_DARK.bg : PI_LIGHT.bg }}>
        {/* Main tab content */}
        {tab === 'camera' && (
          <CameraScreen
            hudVariant={hudVariant} captureVariant={captureVariant} online={online}
            onOpenPreview={() => { setPreviewPhoto(PHOTOS[0]); setOverlay('preview'); }}
            onOpenSettings={() => setTab('settings')}
          />
        )}
        {tab === 'gallery' && (
          <GalleryScreen
            onOpenPhoto={(p) => { setPreviewPhoto(p); setOverlay('preview'); }}
            onOpenCamera={() => setTab('camera')}
          />
        )}
        {tab === 'settings' && (
          <SettingsScreen
            theme={theme} setTheme={setTheme}
            online={online} setOnline={setOnline}
            onOpenVerify={() => setOverlay('verify')}
            onOpenManifest={() => setOverlay('manifest')}
          />
        )}

        {/* Tab bar */}
        {tab !== null && !overlay && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
            <TabBar tab={tab} onChange={setTab} theme={tab === 'camera' ? 'dark' : (theme === 'dark' ? 'dark' : 'light')}/>
          </div>
        )}

        {/* Full-screen overlays */}
        {overlay === 'preview' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 40, animation: 'pic-fade-in 200ms' }}>
            <PreviewScreen photo={previewPhoto} onClose={closeOverlay}/>
          </div>
        )}
        {overlay === 'verify' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 40, animation: 'pic-fade-in 200ms' }}>
            <VerifyScreen onClose={closeOverlay}/>
          </div>
        )}
        {overlay === 'manifest' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 40, animation: 'pic-fade-in 200ms' }}>
            <ManifestViewer onClose={closeOverlay}/>
          </div>
        )}
        {overlay === 'splash' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
            <SplashScreen status="initializing"/>
          </div>
        )}
        {overlay === 'onboarding' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
            <OnboardingScreen onDone={() => setOverlay(null)}/>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

Object.assign(window, { PiCamApp });
