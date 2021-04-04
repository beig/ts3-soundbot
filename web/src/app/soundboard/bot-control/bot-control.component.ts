import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../../core.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Health} from '../../data/health';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {takeUntil, tap} from 'rxjs/operators';
import {Channel} from '../../data/channel';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-bot-control',
  templateUrl: './bot-control.component.html',
  styleUrls: ['./bot-control.component.scss']
})
export class BotControlComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject<boolean>();

  health!: Observable<Health>;
  online = new BehaviorSubject<boolean>(false);
  channels = new BehaviorSubject<Channel[]>([]);

  constructor(private core: CoreService) {
  }

  ngOnInit(): void {
    this.health = this.core.status().pipe(tap(x => this.online.next(x.online)));

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
    await this.core.joinChannel(event.value);
  }
}
