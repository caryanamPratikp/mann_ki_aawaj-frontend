import { create } from 'zustand';
import { DEFAULT_AVATAR_CONFIG, generateRandomAvatar } from './avatarOptionsData.js';

export const useAvatarStore = create((set, get) => ({
  config: DEFAULT_AVATAR_CONFIG,
  history: [DEFAULT_AVATAR_CONFIG],
  historyIndex: 0,
  activeCategory: 'face', // 'face' | 'skin' | 'eyes' | 'brows' | 'nose' | 'lips' | 'hair' | 'beard' | 'glasses' | 'outfit' | 'accessories' | 'poses' | 'rpm'

  // Actions
  setConfig: (newConfig) => {
    const updated = { ...get().config, ...newConfig };
    set({
      config: updated,
      history: [...get().history.slice(0, get().historyIndex + 1), updated],
      historyIndex: get().historyIndex + 1,
    });
  },

  updateField: (field, value) => {
    get().setConfig({ [field]: value });
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  randomize: () => {
    const random = generateRandomAvatar();
    get().setConfig(random);
  },

  reset: () => {
    get().setConfig(DEFAULT_AVATAR_CONFIG);
  },

  loadUserConfig: (savedConfig) => {
    if (savedConfig && (savedConfig.skinTone || savedConfig.hairStyle)) {
      const merged = { ...DEFAULT_AVATAR_CONFIG, ...savedConfig };
      set({ config: merged, history: [merged], historyIndex: 0 });
    }
  },
}));
