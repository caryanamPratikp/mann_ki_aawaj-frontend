import React, { useState } from 'react';
import { ThreeAvatarViewer } from './ThreeAvatarViewer.jsx';
import {
  SKIN_TONES,
  FACE_SHAPES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_SHAPES,
  EYEBROWS,
  NOSE_SHAPES,
  MOUTH_EXPRESSIONS,
  FACIAL_HAIR,
  GLASSES,
  ACCESSORIES,
  OUTFITS,
  OUTFIT_COLORS,
  DEFAULT_AVATAR_CONFIG,
  generateRandomAvatar
} from './avatarOptionsData.js';
import { ArrowLeft, Dices, RotateCcw, Check, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function SnapchatAvatarCreator({
  initialConfig = DEFAULT_AVATAR_CONFIG,
  onSave,
  onBack,
  stepText = 'Step 3 of 4',
  title = 'Create Your Anonymous 3D Avatar'
}) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [avatarConfig, setAvatarConfig] = useState(() => ({
    ...DEFAULT_AVATAR_CONFIG,
    ...(currentUser?.avatarConfig || initialConfig),
  }));

  const [activeCategory, setActiveCategory] = useState('skinTone');

  const handleSelectOption = (key, value) => {
    setAvatarConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    const randomConfig = generateRandomAvatar();
    setAvatarConfig(randomConfig);
    addToast('🎲 Generated random 3D anonymous avatar!', 'info');
  };

  const handleReset = () => {
    setAvatarConfig(DEFAULT_AVATAR_CONFIG);
    addToast('🔄 Reset avatar to default style.', 'info');
  };

  const handleSaveAndContinue = () => {
    if (updateProfile) {
      updateProfile({ avatarConfig });
    }
    if (onSave) {
      onSave(avatarConfig);
    }
    addToast('3D Anonymous Avatar configuration saved!', 'success');
  };

  const CATEGORIES = [
    { id: 'skinTone', label: 'Skin Tone 🎨' },
    { id: 'face', label: 'Face 👤' },
    { id: 'hair', label: 'Hair 💇' },
    { id: 'eyes', label: 'Eyes 👁️' },
    { id: 'eyebrows', label: 'Eyebrows 🤨' },
    { id: 'nose', label: 'Nose 👃' },
    { id: 'mouth', label: 'Mouth 👄' },
    { id: 'facialHair', label: 'Facial Hair 🧔' },
    { id: 'glasses', label: 'Glasses 👓' },
    { id: 'accessories', label: 'Accessories 👑' },
    { id: 'outfit', label: 'Outfit 👕' },
  ];

  return (
    <div
      className="snapchat-avatar-creator-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--soft-white)',
        color: '#2D1D15',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP HEADER (BACK BUTTON + PROGRESS BAR + ACTION BUTTONS) ── */}
      <header
        style={{
          padding: '12px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #D4CECC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6F405F',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {stepText}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#2D1D15' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '6px 12px',
              borderRadius: '18px',
              background: '#ffffff',
              border: '1px solid #9F9794',
              color: '#8C8385',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset Avatar"
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            type="button"
            onClick={handleRandomize}
            style={{
              padding: '6px 12px',
              borderRadius: '18px',
              background: '#F5F2F1',
              border: '1.5px solid #6F405F',
              color: '#6F405F',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Randomize Avatar"
          >
            <Dices size={14} /> Surprise Me
          </button>
        </div>
      </header>

      {/* ── CENTER: 70% HEIGHT INTERACTIVE THREE.JS 3D AVATAR VIEWER ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, #ffffff 0%, #F5F2F1 100%)',
          minHeight: '0',
        }}
      >
        {/* Interactive WebGL 3D Canvas */}
        <ThreeAvatarViewer config={avatarConfig} height="100%" />

        {/* Floating Hint Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            padding: '5px 14px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #D4CECC',
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#6F405F',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <Sparkles size={13} />
          <span>Drag to orbit 360° • Auto-rotates when idle</span>
        </div>
      </main>

      {/* ── BOTTOM CUSTOMIZATION PANEL ── */}
      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid #D4CECC',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Category Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            padding: '8px 14px',
            borderBottom: '1px solid #E1DCDB',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '7px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: activeCategory === cat.id ? 700 : 500,
                background: activeCategory === cat.id ? '#6F405F' : '#F5F2F1',
                color: activeCategory === cat.id ? '#ffffff' : '#2D1D15',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Options Picker Grid */}
        <div style={{ padding: '12px 16px', height: '140px', overflowY: 'auto' }}>
          
          {/* SKIN TONE CATEGORY */}
          {activeCategory === 'skinTone' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {SKIN_TONES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectOption('skinTone', st.id)}
                  style={{
                    height: '36px',
                    borderRadius: '10px',
                    background: st.hex,
                    border: `3px solid ${avatarConfig.skinTone === st.id ? '#6F405F' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                  title={st.name}
                />
              ))}
            </div>
          )}

          {/* FACE CATEGORY */}
          {activeCategory === 'face' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {FACE_SHAPES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectOption('face', f.id)}
                  style={{
                    padding: '9px',
                    borderRadius: '10px',
                    border: `1.5px solid ${avatarConfig.face === f.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.face === f.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '12px',
                    fontWeight: avatarConfig.face === f.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* HAIR STYLE & COLOR CATEGORY */}
          {activeCategory === 'hair' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                <span style={{ fontSize: '11.5px', color: '#8C8385', alignSelf: 'center' }}>Color:</span>
                {HAIR_COLORS.map((hc) => (
                  <button
                    key={hc.id}
                    type="button"
                    onClick={() => handleSelectOption('hairColor', hc.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: hc.hex,
                      border: `2px solid ${avatarConfig.hairColor === hc.id ? '#6F405F' : 'transparent'}`,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title={hc.name}
                  />
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectOption('hair', h.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1.5px solid ${avatarConfig.hair === h.id ? '#6F405F' : '#D4CECC'}`,
                      background: avatarConfig.hair === h.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                      fontSize: '11.5px',
                      fontWeight: avatarConfig.hair === h.id ? 700 : 500,
                      color: '#2D1D15',
                      cursor: 'pointer',
                    }}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EYES CATEGORY */}
          {activeCategory === 'eyes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {EYE_SHAPES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleSelectOption('eyes', e.id)}
                  style={{
                    padding: '9px',
                    borderRadius: '10px',
                    border: `1.5px solid ${avatarConfig.eyes === e.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.eyes === e.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '12px',
                    fontWeight: avatarConfig.eyes === e.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}

          {/* EYEBROWS CATEGORY */}
          {activeCategory === 'eyebrows' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {EYEBROWS.map((eb) => (
                <button
                  key={eb.id}
                  type="button"
                  onClick={() => handleSelectOption('eyebrows', eb.id)}
                  style={{
                    padding: '9px',
                    borderRadius: '10px',
                    border: `1.5px solid ${avatarConfig.eyebrows === eb.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.eyebrows === eb.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '12px',
                    fontWeight: avatarConfig.eyebrows === eb.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {eb.name}
                </button>
              ))}
            </div>
          )}

          {/* NOSE CATEGORY */}
          {activeCategory === 'nose' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {NOSE_SHAPES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleSelectOption('nose', n.id)}
                  style={{
                    padding: '9px',
                    borderRadius: '10px',
                    border: `1.5px solid ${avatarConfig.nose === n.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.nose === n.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '12px',
                    fontWeight: avatarConfig.nose === n.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {n.name}
                </button>
              ))}
            </div>
          )}

          {/* MOUTH CATEGORY */}
          {activeCategory === 'mouth' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {MOUTH_EXPRESSIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectOption('mouth', m.id)}
                  style={{
                    padding: '9px',
                    borderRadius: '10px',
                    border: `1.5px solid ${avatarConfig.mouth === m.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.mouth === m.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '12px',
                    fontWeight: avatarConfig.mouth === m.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* FACIAL HAIR CATEGORY */}
          {activeCategory === 'facialHair' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {FACIAL_HAIR.map((fh) => (
                <button
                  key={fh.id}
                  type="button"
                  onClick={() => handleSelectOption('facialHair', fh.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1.5px solid ${avatarConfig.facialHair === fh.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.facialHair === fh.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '11.5px',
                    fontWeight: avatarConfig.facialHair === fh.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {fh.name}
                </button>
              ))}
            </div>
          )}

          {/* GLASSES CATEGORY */}
          {activeCategory === 'glasses' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {GLASSES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectOption('glasses', g.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1.5px solid ${avatarConfig.glasses === g.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.glasses === g.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '11.5px',
                    fontWeight: avatarConfig.glasses === g.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {g.icon} {g.name}
                </button>
              ))}
            </div>
          )}

          {/* ACCESSORIES CATEGORY */}
          {activeCategory === 'accessories' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {ACCESSORIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelectOption('accessories', a.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1.5px solid ${avatarConfig.accessories === a.id ? '#6F405F' : '#D4CECC'}`,
                    background: avatarConfig.accessories === a.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                    fontSize: '11.5px',
                    fontWeight: avatarConfig.accessories === a.id ? 700 : 500,
                    color: '#2D1D15',
                    cursor: 'pointer',
                  }}
                >
                  {a.symbol} {a.name}
                </button>
              ))}
            </div>
          )}

          {/* OUTFIT CATEGORY */}
          {activeCategory === 'outfit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                <span style={{ fontSize: '11.5px', color: '#8C8385', alignSelf: 'center' }}>Color:</span>
                {OUTFIT_COLORS.map((oc) => (
                  <button
                    key={oc.id}
                    type="button"
                    onClick={() => handleSelectOption('outfitColor', oc.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: oc.hex,
                      border: `2px solid ${avatarConfig.outfitColor === oc.id ? '#6F405F' : 'transparent'}`,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title={oc.name}
                  />
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {OUTFITS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => handleSelectOption('outfit', o.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1.5px solid ${avatarConfig.outfit === o.id ? '#6F405F' : '#D4CECC'}`,
                      background: avatarConfig.outfit === o.id ? 'rgba(111,64,95,0.08)' : '#F5F2F1',
                      fontSize: '11.5px',
                      fontWeight: avatarConfig.outfit === o.id ? 700 : 500,
                      color: '#2D1D15',
                      cursor: 'pointer',
                    }}
                  >
                    {o.icon} {o.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── SAVE & CONTINUE BUTTON ── */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #E1DCDB' }}>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '22px',
              background: '#6F405F',
              color: '#ffffff',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(111,64,95,0.25)',
            }}
          >
            <Check size={16} /> Save Avatar &amp; Continue
          </button>
        </div>
      </footer>
    </div>
  );
}
