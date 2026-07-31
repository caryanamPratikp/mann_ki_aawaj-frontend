import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAvatarStore } from './useAvatarStore.js';
import { ThreeAvatarViewer } from './ThreeAvatarViewer.jsx';
import {
  SKIN_TONES,
  FACE_SHAPES,
  HAIR_STYLES_MALE,
  HAIR_STYLES_FEMALE,
  OUTFIT_TOPS,
  GLASSES_OPTIONS,
} from './avatarOptionsData.js';
import { X, Undo2, Check } from 'lucide-react';

// Pre-defined Face Presets combining skin tone and face shape
const FACE_PRESETS = [
  { id: 'face1', shape: 'oval', skin: '#F8D4C0', label: '👱🏻' },
  { id: 'face2', shape: 'round', skin: '#EAB496', label: '👱🏼' },
  { id: 'face3', shape: 'square', skin: '#E2A77F', label: '👱🏽' },
  { id: 'face4', shape: 'diamond', skin: '#CB8A5C', label: '👱🏾' },
  { id: 'face5', shape: 'heart', skin: '#B06F3D', label: '👱🏿' },
  { id: 'face6', shape: 'oval', skin: '#472106', label: '🧔🏿' },
  { id: 'face7', shape: 'round', skin: '#FCE4D6', label: '👨🏻' },
  { id: 'face8', shape: 'square', skin: '#9D5E2F', label: '👨🏾' }
];

export function AvatarStudioModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const {
    config,
    updateField,
    loadUserConfig,
    randomize,
    reset,
  } = useAvatarStore();

  const [isMobile, setIsMobile] = useState(false);
  const [activeFace, setActiveFace] = useState(FACE_PRESETS[0].id);

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
      addToast('Avatar saved successfully!', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to save avatar configuration', 'error');
    }
  };

  const handleFaceSelect = (preset) => {
    setActiveFace(preset.id);
    updateField('faceShape', preset.shape);
    updateField('skinTone', preset.skin);
  };

  const currentHairList = config.gender === 'female' ? HAIR_STYLES_FEMALE : HAIR_STYLES_MALE;
  // Limit to first 8 for BGMI style grid
  const displayHairList = currentHairList.slice(0, 8);
  const displayOutfitList = OUTFIT_TOPS.slice(0, 8);
  const displayGlassesList = GLASSES_OPTIONS.slice(0, 4);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 10, 12, 0.85)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '1200px',
          height: isMobile ? '100vh' : '90vh',
          backgroundColor: '#FAFAFA',
          borderRadius: isMobile ? '0' : '16px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #E1DCDB',
          backgroundColor: '#FFFFFF',
          zIndex: 10,
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
              Customize
            </h2>
            <p style={{ fontSize: '11px', color: '#6F405F', margin: '2px 0 0 0', fontWeight: 600 }}>
              You will still be able to change this after creation.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8C8385', padding: '4px', display: 'flex'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
          
          {/* LEFT COLUMN: CUSTOMIZATION (Scrollable) */}
          <div style={{
            flex: isMobile ? '1' : '0 0 45%',
            backgroundColor: '#FAFAFA',
            borderRight: isMobile ? 'none' : '1px solid #E1DCDB',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            order: isMobile ? 2 : 1,
          }}>
            
            {/* GENDER TOGGLE */}
            <div style={{ display: 'flex', border: '1px solid #D4CECC', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => updateField('gender', 'male')}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700,
                  backgroundColor: config.gender === 'male' ? '#6F405F' : '#F5F2F1',
                  color: config.gender === 'male' ? '#FFFFFF' : '#8C8385',
                  border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                }}
              >
                ♂ Male
              </button>
              <button
                onClick={() => updateField('gender', 'female')}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700,
                  backgroundColor: config.gender === 'female' ? '#6F405F' : '#F5F2F1',
                  color: config.gender === 'female' ? '#FFFFFF' : '#8C8385',
                  border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                }}
              >
                ♀ Female
              </button>
            </div>

            {/* FACE */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15', marginBottom: '12px' }}>Face</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {FACE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleFaceSelect(preset)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      backgroundColor: preset.skin,
                      border: activeFace === preset.id ? '2px solid #6F405F' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      boxShadow: activeFace === preset.id ? '0 0 0 2px #FFFFFF inset' : 'none',
                      position: 'relative',
                    }}
                  >
                    {preset.label}
                    {activeFace === preset.id && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: '#6F405F', color: '#FFF', borderRadius: '50%', padding: '2px' }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* HAIR */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15', marginBottom: '12px' }}>Hair</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {displayHairList.map((hair) => (
                  <button
                    key={hair.id}
                    onClick={() => updateField('hairStyle', hair.id)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      backgroundColor: '#EAE5E3',
                      border: config.hairStyle === hair.id ? '2px solid #6F405F' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: config.hairStyle === hair.id ? '#6F405F' : '#524643',
                      textAlign: 'center',
                      padding: '4px',
                      position: 'relative'
                    }}
                  >
                    {hair.name}
                    {config.hairStyle === hair.id && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: '#6F405F', color: '#FFF', borderRadius: '50%', padding: '2px' }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CLOTHES */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15', marginBottom: '12px' }}>Clothes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {displayOutfitList.map((top) => (
                  <button
                    key={top.id}
                    onClick={() => updateField('outfitTop', top.id)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      backgroundColor: '#EAE5E3',
                      border: config.outfitTop === top.id ? '2px solid #6F405F' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: config.outfitTop === top.id ? '#6F405F' : '#524643',
                      textAlign: 'center',
                      padding: '4px',
                      gap: '4px',
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{top.icon}</span>
                    {config.outfitTop === top.id && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: '#6F405F', color: '#FFF', borderRadius: '50%', padding: '2px' }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* GLASSES */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15', marginBottom: '12px' }}>Glasses</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {displayGlassesList.map((gl) => (
                  <button
                    key={gl.id}
                    onClick={() => updateField('glasses', gl.id)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      backgroundColor: '#EAE5E3',
                      border: config.glasses === gl.id ? '2px solid #6F405F' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: config.glasses === gl.id ? '#6F405F' : '#524643',
                      textAlign: 'center',
                      padding: '4px',
                      gap: '4px',
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{gl.icon}</span>
                    {config.glasses === gl.id && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: '#6F405F', color: '#FFF', borderRadius: '50%', padding: '2px' }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D PREVIEW */}
          <div style={{
            flex: isMobile ? '0 0 50vh' : '1',
            backgroundColor: '#EDE8E6',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            order: isMobile ? 1 : 2,
            backgroundImage: 'radial-gradient(circle at center, #F8F5F4 0%, #D4CECC 100%)',
          }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ThreeAvatarViewer config={config} width="100%" height="100%" />
            </div>
            
            {/* Action Bar Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              pointerEvents: 'none', // let clicks pass through to 3D canvas if missed
            }}>
              <div style={{ display: 'flex', gap: '16px', pointerEvents: 'auto' }}>
                <button
                  onClick={reset}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1.5px solid #9F9794',
                    color: '#2D1D15',
                    padding: '10px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <Undo2 size={16} /> Undo
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: '#E5A93C', // Warm yellow/gold like BGMI OK button
                    border: 'none',
                    color: '#2D1D15',
                    padding: '10px 40px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
