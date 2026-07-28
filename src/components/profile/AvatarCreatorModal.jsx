import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import {
  AvatarGraphic,
  SKIN_TONES,
  AVATAR_BACKGROUNDS,
  FEMALE_HAIRSTYLES,
  MALE_HAIRSTYLES,
  NEUTRAL_HAIRSTYLES,
  OUTFITS,
  SPECS,
  ACCESSORIES
} from './avatarGraphics.jsx';
import { Check, Sparkles, Shirt, Glasses, Palette, User, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function AvatarCreatorModal({ isOpen, onClose, onSaveAvatar }) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [gender, setGender] = useState(currentUser?.avatarConfig?.gender || 'female');
  const [hairStyle, setHairStyle] = useState(currentUser?.avatarConfig?.hairStyle || 'long_waves');
  const [skinToneId, setSkinToneId] = useState(currentUser?.avatarConfig?.skinToneId || 'honey');
  const [outfitId, setOutfitId] = useState(currentUser?.avatarConfig?.outfitId || 'hoodie');
  const [specsId, setSpecsId] = useState(currentUser?.avatarConfig?.specsId || 'none');
  const [accessoryId, setAccessoryId] = useState(currentUser?.avatarConfig?.accessoryId || 'none');
  const [bgId, setBgId] = useState(currentUser?.avatarConfig?.bgId || 'plum');

  const [activeTab, setActiveTab] = useState('outfits'); // 'outfits' | 'hair' | 'specs' | 'skin' | 'accessories' | 'gender'

  const currentHairList = gender === 'female' ? FEMALE_HAIRSTYLES : gender === 'male' ? MALE_HAIRSTYLES : NEUTRAL_HAIRSTYLES;

  const handleGenderSelect = (g) => {
    setGender(g);
    if (g === 'female') setHairStyle('long_waves');
    else if (g === 'male') setHairStyle('short_crop');
    else setHairStyle('beanie');
  };

  const handleSave = () => {
    const config = { gender, hairStyle, skinToneId, outfitId, specsId, accessoryId, bgId };
    if (updateProfile) {
      updateProfile({ avatarConfig: config });
    }
    if (onSaveAvatar) {
      onSaveAvatar(config);
    }
    addToast('Bitmoji-style avatar saved successfully!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Snapchat-Style Bitmoji Creator">
      <div className="flex-col gap-md" style={{ alignItems: 'center', width: '100%' }}>

        {/* ── LIVE SNAPCHAT BITMOJI PREVIEW WINDOW ── */}
        <div
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, #F5F2F1 0%, #E8E2E1 100%)',
            border: '1.5px solid #9F9794',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(45,29,21,0.12)',
            width: '100%',
            maxWidth: '360px',
          }}
        >
          <AvatarGraphic
            gender={gender}
            hairStyle={hairStyle}
            skinToneId={skinToneId}
            outfitId={outfitId}
            specsId={specsId}
            accessoryId={accessoryId}
            bgId={bgId}
            size={130}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#6F405F' }}>
            Anonymous Bitmoji Preview
          </span>
        </div>

        {/* ── SNAPCHAT CATEGORY SWITCHER TABS ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #D4CECC',
            width: '100%',
            gap: '2px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'outfits', label: 'Outfits 👕' },
            { id: 'hair', label: 'Hairs 💇' },
            { id: 'specs', label: 'Specs 👓' },
            { id: 'skin', label: 'Skin & Theme 🎨' },
            { id: 'accessories', label: 'Accessories 👑' },
            { id: 'gender', label: 'Gender 👤' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 10px',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 700 : 400,
                color: activeTab === tab.id ? '#6F405F' : '#8C8385',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === tab.id ? '2.5px solid #6F405F' : '2.5px solid transparent',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OUTFITS & DRESSES ── */}
        {activeTab === 'outfits' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
            {OUTFITS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOutfitId(o.id)}
                style={{
                  padding: '12px 6px',
                  borderRadius: '12px',
                  border: `1.5px solid ${outfitId === o.id ? '#6F405F' : '#D4CECC'}`,
                  background: outfitId === o.id ? 'rgba(111,64,95,0.08)' : '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: outfitId === o.id ? 700 : 400,
                  color: '#2D1D15',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {/* ── TAB 2: HAIRSTYLES ── */}
        {activeTab === 'hair' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
            {currentHairList.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHairStyle(h.id)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: `1.5px solid ${hairStyle === h.id ? '#6F405F' : '#D4CECC'}`,
                  background: hairStyle === h.id ? 'rgba(111,64,95,0.08)' : '#ffffff',
                  fontSize: '12px',
                  fontWeight: hairStyle === h.id ? 700 : 400,
                  color: '#2D1D15',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}

        {/* ── TAB 3: SPECS & EYEWEAR ── */}
        {activeTab === 'specs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
            {SPECS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpecsId(s.id)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: `1.5px solid ${specsId === s.id ? '#6F405F' : '#D4CECC'}`,
                  background: specsId === s.id ? 'rgba(111,64,95,0.08)' : '#ffffff',
                  fontSize: '12px',
                  fontWeight: specsId === s.id ? 700 : 400,
                  color: '#2D1D15',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{s.icon || '👤'}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── TAB 4: SKIN TONE & COLOR THEME ── */}
        {activeTab === 'skin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8C8385' }}>Select Skin Tone:</span>
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              {SKIN_TONES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSkinToneId(st.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: st.hex,
                    border: `2.5px solid ${skinToneId === st.id ? '#6F405F' : 'transparent'}`,
                    cursor: 'pointer',
                    boxShadow: skinToneId === st.id ? '0 0 0 2px #ffffff, 0 4px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                  title={st.name}
                />
              ))}
            </div>

            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8C8385', marginTop: '4px' }}>Select Background Theme:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
              {AVATAR_BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBgId(b.id)}
                  style={{
                    height: '38px',
                    borderRadius: '8px',
                    background: b.bg,
                    border: `2px solid ${bgId === b.id ? '#ffffff' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                  title={b.name}
                >
                  {bgId === b.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: ACCESSORIES ── */}
        {activeTab === 'accessories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
            {ACCESSORIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccessoryId(a.id)}
                style={{
                  padding: '10px 4px',
                  borderRadius: '10px',
                  border: `1.5px solid ${accessoryId === a.id ? '#6F405F' : '#D4CECC'}`,
                  background: accessoryId === a.id ? 'rgba(111,64,95,0.08)' : '#ffffff',
                  fontSize: '12px',
                  fontWeight: accessoryId === a.id ? 700 : 400,
                  color: '#2D1D15',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{a.symbol || '👤'}</span>
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── TAB 6: GENDER SELECTOR ── */}
        {activeTab === 'gender' && (
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
            {[
              { id: 'female', label: 'Female 👩' },
              { id: 'male', label: 'Male 👨' },
              { id: 'neutral', label: 'Neutral 🧑' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenderSelect(g.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${gender === g.id ? '#6F405F' : '#D4CECC'}`,
                  background: gender === g.id ? 'rgba(111,64,95,0.08)' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#2D1D15',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* ── ACTION FOOTER ── */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '20px',
              background: '#6F405F',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={15} /> Save Bitmoji Avatar
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              background: '#F5F2F1',
              color: '#8C8385',
              border: '1px solid #9F9794',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </Modal>
  );
}
