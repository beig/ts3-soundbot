export interface SoundFile {
  name: string;
  description: string;
  duration: number;
  category: string;
  tags: string[];
  clientId?: string;
  playCount: number;
}

export function createSoundFile(params: Partial<SoundFile>): SoundFile {
  return {} as SoundFile;
}
