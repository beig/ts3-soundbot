import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {CoreService} from '../core.service';
import {Observable, Subject} from 'rxjs';
import {SoundFile} from '../data/sound-file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {BotControlComponent} from './bot-control/bot-control.component';
import {MatPaginator} from '@angular/material/paginator';
import {Status} from '../data/health';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {takeUntil} from 'rxjs/operators';

interface TabData {
  category: string;
  dataSource: MatTableDataSource<SoundFile>;
}

@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, OnDestroy, AfterViewInit {

  private static SEARCH = 'SUCHE';
  private static UNKNOWN = 'UNBEKANNTE';

  /**
   *  TODO: -> Config für UserJoined/UserLeft/Disconnected
   *  TODO: -> Server Sent Events
   */

  private unsubscribe = new Subject<boolean>();

  @ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;
  @ViewChildren(MatSort) sorts: QueryList<MatSort>;

  private _categories = new Set<string>();
  private tabData = new Map<string, TabData>();
  displayedColumns: string[] = ['id', 'name', 'description', 'duration', 'play', 'playLocal'];
  soundFiles!: Observable<SoundFile[]>;
  filterForm!: FormGroup;
  health = this.core.health;
  status = Status;
  initialized = false;
  selectedIndex = 0;
  tabDataPure: TabData[] = [];
  soundFilesCount: number[] = [];

  get categories(): string[] {
    if (this._categories.size === 0) {
      return [];
    }
    const array = [SoundboardComponent.SEARCH];
    array.push(...Array.from(this._categories.keys()));
    array.push(SoundboardComponent.UNKNOWN);
    return array;
  }

  constructor(private core: CoreService,
              public dialog: MatDialog,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      inputFilter: []
    });

    this.core.soundFiles$.subscribe(value => {
      value.forEach(v => {
        if (v.category) {
          this._categories.add(v.category);
        }
      });
    });

    this.filterForm.controls.inputFilter.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe((value: string) => {
      this.selectedIndex = 0;
      this.tabData.get(SoundboardComponent.SEARCH)!.dataSource.filter = value.trim().toLowerCase() || 'NULL';
      this.tabData.get(SoundboardComponent.SEARCH)!.dataSource.paginator?.firstPage();
    });
  }

  ngAfterViewInit(): void {
    this.core.soundFiles$.subscribe(value => {
      this.categories.forEach((c: string) => {
        let files;
        if (c === SoundboardComponent.UNKNOWN) {
          files = value.filter(f => !f.category);
        } else {
          files = value.filter(f => f.category === c);
        }
        const dataSource = new MatTableDataSource<SoundFile>(files);

        this.tabData.set(c, {
          category: c,
          dataSource
        });
        this.soundFilesCount.push(files.length);
        this.tabDataPure.push(this.tabData.get(c)!);

        if (c === SoundboardComponent.SEARCH) {
          this.tabData.get(SoundboardComponent.SEARCH)!.dataSource.filterPredicate = (data: SoundFile, filter: string) => {
            if (filter === 'NULL') {
              return true;
            }
            const matchDescription = data.description === null ? false : data.description.toLowerCase().includes(filter);
            return data.name.toLowerCase().includes(filter) || matchDescription;
          };
          this.tabData.get(SoundboardComponent.SEARCH)!.dataSource.data = this.core.soundFiles;
        }
      });
      this.setUpPaginatorSort();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
  }

  showBotControl(): void {
    this.dialog.open(BotControlComponent);
  }

  async playFile(file: SoundFile): Promise<void> {
    await this.core.playFile(file).toPromise();
  }

  private setUpPaginatorSort(): void {
    this.cd.detectChanges();
    this.categories.forEach((value: string, index: number) => {
      this.tabData.get(value)!.dataSource.paginator = this.paginators.get(index) || null;
      this.tabData.get(value)!.dataSource.sort = this.sorts.get(index) || null;
    });
    this.initialized = true;
    this.cd.detectChanges();
  }
}
