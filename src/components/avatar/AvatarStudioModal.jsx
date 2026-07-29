import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAvatarStore } from './useAvatarStore.js';
import { ThreeAvatarViewer } from './ThreeAvatarViewer.jsx';
import {
  SKIN_TONES,
  FACE_SHAPES,
  EYE_STYLES,
  EYE_SIZES,
  EYE_COLORS,
  EYEBROW_STYLES,
  NOSE_STYLES,
  LIPS_STYLES,
  HAIR_STYLES_MALE,
  HAIR_STYLES_FEMALE,
  HAIR_COLORS,
  BEARD_STYLES,
  GLASSES_OPTIONS,
  OUTFIT_TOPS,
  OUTFIT_BOTTOMS,
  OUTFIT_COLORS,
  ACCESSORIES,
  AVATAR_POSES
} from './avatarOptionsData.js';
import { Sparkles, RotateCcw, Save, ShieldCheck, User, Palette, Eye, Smile, Shirt, Sliders, X, Check } from 'lucide-react';

export function AvatarStudioModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const {
    config,
    updateField,
    loadUserConfig,
    randomize,
    reset,
    activeCategory,
    setActiveCategory
  } = useAvatarStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && currentUser?.avatarConfig) {
      loadUserConfig(currentUser.avatarConfig);
    }
  }, [isOpen, currentUser, loadUserConfig]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      if (updateProfile) {
        await updateProfile({ avatarConfig: config });
      }
      addToast('Anonymous 3D Avatar saved successfully!', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to save avatar configuration', 'error');
    }
  };

  const categories = [
    { id: 'face',       label: 'Face & Shape', icon: User },
    { id: 'skin',       label: 'Skin Tone',    icon: Palette },
    { id: 'eyes',       label: 'Eyes & Brows', icon: Eye },
    { id: 'lips',       label: 'Nose & Lips',  icon: Smile },
    { id: 'hair',       label: 'Hair & Beard', icon: Sparkles },
    { id: 'outfit',     label: 'Clothing',     icon: Shirt },
    { id: 'accessories',label: 'Accessories',  icon: Sliders },
    { id: 'poses',      label: 'Poses',        icon: User },
  ];

  const currentHairList = config.gender === 'female' ? HAIR_STYLES_FEMALE : HAIR_STYLES_MALE;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 10, 12, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1350px',
          height: isMobile ? '100vh' : '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #E2DCDB',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2D1D15',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <X size={20} />
        </button>

        {/* ── COLUMN 1: CUSTOMIZATION CONTROLS (LEFT - 32%) ── */}
        <div
          style={{
            flex: isMobile ? '1' : '0 0 32%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: isMobile ? 'none' : '1px solid #EDE8E6',
            backgroundColor: '#FAFAFA',
            order: isMobile ? 2 : 1,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #EDE8E6' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
              Avatar Studio 🎨
            </h2>
            <p style={{ fontSize: '12.5px', color: '#7A6E6B', margin: '4px 0 0 0' }}>
              Craft your anonymous 3D Bitmoji identity
            </p>
          </div>

          {/* Category Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '12px 16px',
              overflowX: 'auto',
              borderBottom: '1px solid #EDE8E6',
              backgroundColor: '#FFFFFF',
            }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isActive ? '#6F405F' : 'transparent'}`,
                    background: isActive ? 'rgba(111,64,95,0.08)' : 'transparent',
                    color: isActive ? '#6F405F' : '#6E625F',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Control Panel (Scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

            {/* 1. FACE & MORPHS */}
            {activeCategory === 'face' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Gender Style</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['female', 'male'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField('gender', g)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '12px',
                        border: `1.5px solid ${config.gender === g ? '#6F405F' : '#E2DCDB'}`,
                        background: config.gender === g ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: config.gender === g ? '#6F405F' : '#2D1D15',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {g === 'female' ? '👩 Female' : '👨 Male'}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Face Shape</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {FACE_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => updateField('faceShape', shape.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: `1.5px solid ${config.faceShape === shape.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.faceShape === shape.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontWeight: config.faceShape === shape.id ? 700 : 500,
                        fontSize: '12.5px',
                        color: '#2D1D15',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {shape.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Face Width Slider</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={config.faceWidth || 1.0}
                  onChange={(e) => updateField('faceWidth', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6F405F' }}
                />

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Jaw Width Slider</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={config.jawWidth || 1.0}
                  onChange={(e) => updateField('jawWidth', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6F405F' }}
                />

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Cheek Fullness Slider</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={config.cheekFullness || 1.0}
                  onChange={(e) => updateField('cheekFullness', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6F405F' }}
                />
              </div>
            )}

            {/* 2. SKIN TONE */}
            {activeCategory === 'skin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>
                  Skin Tone Swatches (16 Inclusive Tones)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {SKIN_TONES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateField('skinTone', st.hex)}
                      style={{
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: st.hex,
                        border: config.skinTone === st.hex ? '3px solid #6F405F' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        boxShadow: config.skinTone === st.hex ? '0 0 0 2px #FFFFFF' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                      title={st.name}
                    >
                      {config.skinTone === st.hex && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. EYES & BROWS */}
            {activeCategory === 'eyes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Eye Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {EYE_STYLES.map((es) => (
                    <button
                      key={es.id}
                      type="button"
                      onClick={() => updateField('eyeStyle', es.id)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.eyeStyle === es.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.eyeStyle === es.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2D1D15',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {es.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Eye Size</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {EYE_SIZES.map((ez) => (
                    <button
                      key={ez.id}
                      type="button"
                      onClick={() => updateField('eyeSize', ez.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.eyeSize === ez.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.eyeSize === ez.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {ez.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Eye Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.id}
                      type="button"
                      onClick={() => updateField('eyeColor', ec.hex)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: ec.hex,
                        border: config.eyeColor === ec.hex ? '3px solid #6F405F' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                      title={ec.name}
                    />
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Eyebrow Style (20+ Styles)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {EYEBROW_STYLES.map((eb) => (
                    <button
                      key={eb.id}
                      type="button"
                      onClick={() => updateField('eyebrowStyle', eb.id)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '8px',
                        border: `1px solid ${config.eyebrowStyle === eb.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.eyebrowStyle === eb.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '11.5px',
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {eb.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NOSE & LIPS */}
            {activeCategory === 'lips' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Nose Style (10 Styles)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {NOSE_STYLES.map((ns) => (
                    <button
                      key={ns.id}
                      type="button"
                      onClick={() => updateField('noseStyle', ns.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.noseStyle === ns.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.noseStyle === ns.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {ns.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Lips Style (15 Styles)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {LIPS_STYLES.map((ls) => (
                    <button
                      key={ls.id}
                      type="button"
                      onClick={() => updateField('lipStyle', ls.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: `1px solid ${config.lipStyle === ls.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.lipStyle === ls.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '11.5px',
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {ls.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Smile Intensity Slider</label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.smileIntensity || 0.6}
                  onChange={(e) => updateField('smileIntensity', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6F405F' }}
                />
              </div>
            )}

            {/* 5. HAIR & BEARD */}
            {activeCategory === 'hair' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>3D Hair Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {currentHairList.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => updateField('hairStyle', h.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.hairStyle === h.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.hairStyle === h.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: config.hairStyle === h.id ? 700 : 500,
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Hair Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.id}
                      type="button"
                      onClick={() => updateField('hairColor', hc.hex)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: hc.hex,
                        border: config.hairColor === hc.hex ? '3px solid #6F405F' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                      title={hc.name}
                    />
                  ))}
                </div>

                {config.gender === 'male' && (
                  <>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Beard & Mustache</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {BEARD_STYLES.map((bs) => (
                        <button
                          key={bs.id}
                          type="button"
                          onClick={() => updateField('beardStyle', bs.id)}
                          style={{
                            padding: '8px',
                            borderRadius: '10px',
                            border: `1.5px solid ${config.beardStyle === bs.id ? '#6F405F' : '#E2DCDB'}`,
                            background: config.beardStyle === bs.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                            fontSize: '12px',
                            color: '#2D1D15',
                            cursor: 'pointer',
                          }}
                        >
                          {bs.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 6. CLOTHING */}
            {activeCategory === 'outfit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Tops & Jackets</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {OUTFIT_TOPS.map((ot) => (
                    <button
                      key={ot.id}
                      type="button"
                      onClick={() => updateField('outfitTop', ot.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.outfitTop === ot.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.outfitTop === ot.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {ot.icon} {ot.name}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Top Color</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {OUTFIT_COLORS.map((oc) => (
                    <button
                      key={oc.id}
                      type="button"
                      onClick={() => updateField('outfitTopColor', oc.hex)}
                      style={{
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: oc.hex,
                        border: config.outfitTopColor === oc.hex ? '2.5px solid #6F405F' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                      title={oc.name}
                    />
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Eyewear & Glasses</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {GLASSES_OPTIONS.map((gl) => (
                    <button
                      key={gl.id}
                      type="button"
                      onClick={() => updateField('glasses', gl.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: `1.5px solid ${config.glasses === gl.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.glasses === gl.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {gl.icon} {gl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ACCESSORIES */}
            {activeCategory === 'accessories' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Accessories</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => updateField('accessory', acc.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${config.accessory === acc.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.accessory === acc.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12px',
                        color: '#2D1D15',
                        cursor: 'pointer',
                      }}
                    >
                      {acc.icon} {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 8. POSES */}
            {activeCategory === 'poses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Avatar Pose & Rigging</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {AVATAR_POSES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updateField('pose', p.id)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: `1.5px solid ${config.pose === p.id ? '#6F405F' : '#E2DCDB'}`,
                        background: config.pose === p.id ? 'rgba(111,64,95,0.08)' : '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: config.pose === p.id ? 700 : 500,
                        color: '#2D1D15',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{p.emoji} {p.name}</span>
                      <span style={{ fontSize: '11px', color: '#7A6E6B' }}>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── COLUMN 2: LARGE 3D AVATAR VIEWPORT (CENTER - 46%) ── */}
        <div
          style={{
            flex: isMobile ? '0 0 45vh' : '0 0 46%',
            background: 'linear-gradient(145deg, #F8F5F4 0%, #EDE8E6 45%, #E4DDDA 100%)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            order: isMobile ? 1 : 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* First-party rigged-character runtime */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '4px',
              borderRadius: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ padding: '6px 14px', color: '#6F405F', fontSize: '12px', fontWeight: 800 }}>
              First-party Avatar Studio
            </span>
          </div>

          {/* Rigged GLB canvas. External avatar URLs are not part of the platform. */}
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ThreeAvatarViewer config={config} width="100%" height="100%" />
          </div>

          {/* Anonymous Badge Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#2D1D15',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <ShieldCheck size={16} color="#2E7D52" />
            100% Anonymous Identity • Mouse Drag Rotate 360°
          </div>
        </div>

        {/* ── COLUMN 3: SUMMARY & ACTIONS (RIGHT - 22%) ── */}
        <div
          style={{
            flex: isMobile ? '1' : '0 0 22%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            borderLeft: isMobile ? 'none' : '1px solid #EDE8E6',
            order: 3,
            padding: '20px',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
            Identity Summary
          </h3>

          <div
            style={{
              backgroundColor: '#FAFAFA',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #EDE8E6',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: '#524643',
            }}
          >
            <div><strong>Gender:</strong> {config.gender}</div>
            <div><strong>Face Shape:</strong> {config.faceShape}</div>
            <div><strong>Eye Style:</strong> {config.eyeStyle}</div>
            <div><strong>Hair Style:</strong> {config.hairStyle}</div>
            <div><strong>Outfit Top:</strong> {config.outfitTop}</div>
            <div><strong>Active Pose:</strong> {config.pose}</div>
          </div>

          {/* Quick Action Buttons */}
          <button
            type="button"
            onClick={randomize}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid #E2DCDB',
              background: '#FFFFFF',
              color: '#2D1D15',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} color="#6F405F" /> Randomize Identity
          </button>

          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid #E2DCDB',
              background: '#FFFFFF',
              color: '#7A6E6B',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={15} /> Reset Default
          </button>

          {/* Primary Save Button */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '20px',
                background: '#6F405F',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(111,64,95,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Save size={18} /> Save Avatar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
