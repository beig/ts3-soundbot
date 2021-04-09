import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../../core.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Health} from '../../data/health';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {take, takeUntil, tap} from 'rxjs/operators';
import {Channel} from '../../data/channel';
import {MatSelectChange} from '@angular/material/select';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-bot-control',
  templateUrl: './bot-control.component.html',
  styleUrls: ['./bot-control.component.scss']
})
export class BotControlComponent implements OnInit, OnDestroy {

  private greetings = ['servus.mp3', 'hallo.mp3', 'hallo2.mp3', 'dooochaller.mp3', 'fettiwas.mp3', 'rainer winkler.mp3'];
  private unsubscribe = new Subject<boolean>();

  health!: Observable<Health>;
  online = new BehaviorSubject<boolean>(false);
  channels = new BehaviorSubject<Channel[]>([]);
  currentChannel: Channel;

  constructor(private core: CoreService,
              public dialogRef: MatDialogRef<BotControlComponent>) {
  }

  ngOnInit(): void {
    this.health = this.core.health.pipe(tap(x => this.online.next(x.online)));

    this.online.pipe(takeUntil(this.unsubscribe)).subscribe(async online => {
      if (online) {
        this.channels.next(await this.core.channels().toPromise());
      } else {
        this.channels.next([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  async toggleOnline(event: MatSlideToggleChange): Promise<void> {
    await this.core.toggleConnection(event.checked);
    this.online.next(event.checked);
  }

  async changeChannel(event: MatSelectChange): Promise<void> {
    if (event.value !== this.currentChannel) {
      await this.core.joinChannel(event.value);
      this.currentChannel = event.value;
      this.dialogRef.close();
      this.core.soundFiles.pipe(take(1)).subscribe(async value => {
        const max = Math.floor(this.greetings.length);
        const randomFile = Math.floor(Math.random() * (max - 1) + 1);
        const found = value.find(soundFile => soundFile.fileName === this.greetings[randomFile]);
        if (found) {
          await this.core.playFile(found).toPromise();
        }
      });
    }
  }

  async restart(): Promise<void> {
    await this.core.restart();
  }
}
