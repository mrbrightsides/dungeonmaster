
export type SoundEffect = 'attack' | 'spell' | 'hurt' | 'enemy_hurt' | 'item' | 'level_up' | 'death' | 'click' | 'quest';

class SoundManager {
  private static sounds: Record<string, HTMLAudioElement> = {};
  private static muted: boolean = false;

  static init() {
    const soundUrls: Record<SoundEffect, string> = {
      attack: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      spell: 'https://assets.mixkit.co/active_storage/sfx/2581/2581-preview.mp3',
      hurt: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
      enemy_hurt: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      item: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      level_up: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
      death: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      quest: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    };

    if (typeof window !== 'undefined') {
      Object.entries(soundUrls).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[key] = audio;
      });
    }
  }

  static play(name: SoundEffect) {
    if (this.muted || !this.sounds[name]) return;
    
    try {
      // Clone to allow overlapping sounds of the same type
      const sound = this.sounds[name].cloneNode() as HTMLAudioElement;
      sound.volume = name === 'death' ? 0.6 : 0.35;
      sound.play().catch(e => console.warn('Audio play blocked:', e));
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }

  static toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  static isMuted() {
    return this.muted;
  }
}

export default SoundManager;
