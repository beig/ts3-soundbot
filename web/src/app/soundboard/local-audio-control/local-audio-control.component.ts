import {Component, Input, OnInit} from '@angular/core';
import {Howl} from 'howler';
import {SoundFile} from '../../data/sound-file';
import {take} from 'rxjs/operators';
import {CoreService} from '../../core.service';

@Component({
  selector: 'app-local-audio-control',
  templateUrl: './local-audio-control.component.html',
  styleUrls: ['./local-audio-control.component.scss']
})
export class LocalAudioControlComponent implements OnInit {

  private file: SoundFile;
  private howl: Howl;

  isPlaying = false;
  loading = false;

  @Input()
  set audio(file: SoundFile) {
    this.file = file;
  }

  constructor(private core: CoreService) {
  }

  ngOnInit(): void {
  }

  playFileLocal(): void {
    this.loading = true;
    this.core.downloadFile(this.file).pipe(take(1)).subscribe(blob => {
      this.loading = false;

      const url = URL.createObjectURL(blob);
      this.howl = new Howl({
        src: [url],
        autoplay: true,
        format: ['mp3']
      });

      this.howl.on('play', () => {
        this.isPlaying = true;
      });

      this.howl.on('end', () => {
        this.isPlaying = false;
      });
    });
  }

  stopPlay(): void {
    this.howl.stop();
    this.isPlaying = false;
  }
}
