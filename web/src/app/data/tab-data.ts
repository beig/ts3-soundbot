import { MatTableDataSource } from '@angular/material/table';
import { SoundFile } from '../core/state/sound-file/sound-file.model';

export interface TabData {
  category: string;
  dataSource: MatTableDataSource<SoundFile>;
  filesCount: number;
}
