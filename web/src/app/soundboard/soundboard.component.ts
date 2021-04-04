import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreService} from '../core.service';
import {combineLatest, Observable, Subject} from 'rxjs';
import {Health} from '../data/health';
import {SoundFile} from '../data/sound-file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject<boolean>();

  health!: Observable<Health>;
  soundFiles!: Observable<SoundFile[]>;
  filterForm!: FormGroup;
  filter = new Subject<string>();

  constructor(private core: CoreService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      filter: []
    });

    this.checkHealth();

    this.soundFiles = combineLatest([this.filter.pipe(startWith(''),
      distinctUntilChanged(), debounceTime(300)), this.core.getFiles()]).pipe(map(([filter, soundFiles]) => {
      return soundFiles.filter(value =>
        value.displayName?.toLowerCase().includes(filter.toLowerCase())
        || value.fileName?.toLowerCase().includes(filter.toLowerCase())
        || value.category?.toLowerCase().includes(filter.toLowerCase())
      );
    }), takeUntil(this.unsubscribe));

    this.filterForm.controls.filter.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.filter.next(value);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  private checkHealth(): void {
    this.health = this.core.status();

    setTimeout(() => this.checkHealth(), 5000);
  }

}
