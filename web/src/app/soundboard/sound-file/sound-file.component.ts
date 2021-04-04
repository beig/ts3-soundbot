import {Component, Input, OnInit} from '@angular/core';
import {SoundFile} from '../../data/sound-file';
import {CoreService} from '../../core.service';

@Component({
  selector: 'app-sound-file',
  templateUrl: './sound-file.component.html',
  styleUrls: ['./sound-file.component.scss']
})
export class SoundFileComponent implements OnInit {

  @Input()
  soundFile: SoundFile | undefined;

  constructor(private core: CoreService) {
  }

  ngOnInit(): void {
  }

  async playFile(): Promise<any> {
    if (this.soundFile) {
      await this.core.playFile(this.soundFile).toPromise();
    }
  }
}
