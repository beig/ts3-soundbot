import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CoreService } from '../core/core.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Status } from '../data/health';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SoundFileQuery } from '../core/state/sound-file/sound-file.query';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TabData } from '../data/tab-data';
import { SoundFile } from '../core/state/sound-file/sound-file.model';
import { BotControlComponent } from './bot-control/bot-control.component';
import { FileEditComponent } from './file-edit/file-edit.component';
import { CategoryStore } from '../core/state/category/category.store';
import { NgEntityServiceLoader } from '@datorama/akita-ng-entity-service';

@UntilDestroy()
@Component({
  selector: 'app-soundboard',
  templateUrl: './soundboard.component.html',
  styleUrls: ['./soundboard.component.scss']
})
export class SoundboardComponent implements OnInit, AfterViewInit {

  public static SEARCH = 'SUCHE';
  public static UNKNOWN = 'UNBEKANNTE';

  private _categories = new Set<string>([SoundboardComponent.SEARCH, SoundboardComponent.UNKNOWN]);

  @ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;
  @ViewChildren(MatSort) sorts: QueryList<MatSort>;

  displayedColumns: string[] = ['name', 'description', 'duration', 'play', 'playLocal', 'edit'];
  filterForm!: FormGroup;
  health = this.core.health;
  status = Status;
  selectedIndex = 0;
  tabData: TabData[] = [];
  loading = true;

  /**
   *  TODO: -> Config für UserJoined/UserLeft/Disconnected
   *  TODO: -> Sound per Tag zu Leave/Connect hinzufügen
   */

  constructor(private core: CoreService,
              public dialog: MatDialog,
              private soundQuery: SoundFileQuery,
              private categoryStore: CategoryStore,
              public loader: NgEntityServiceLoader,
              private cd: ChangeDetectorRef,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      inputFilter: []
    });

    this.loader.loadersFor('files').get$.pipe(untilDestroyed(this)).subscribe(value => {
      this.loading = value;
    });

    this.soundQuery.selectAll().pipe().subscribe(value => {
      value.forEach(v => {
        if (v.category) {
          this.categoryStore.add({id: v.category});
          this._categories.add(v.category);
        }
      });

      Array.from(this._categories).forEach((category: string, index: number) => {
        let files;
        if (category === SoundboardComponent.UNKNOWN) {
          files = value.filter(f => !f.category);
        } else if (category === SoundboardComponent.SEARCH) {
          files = value;
        } else {
          files = value.filter(f => f.category === category);
        }

        if (!this.getTabData(category)) {
          this.setUpDatasource(category, files, index);
        } else {
          this.getTabData(category).dataSource.data = files;
          this.getTabData(category).filesCount = files.length;
        }
      });
    });

    this.filterForm.controls.inputFilter.valueChanges.pipe(untilDestroyed(this)).subscribe((value: string) => {
      this.selectedIndex = 0;
      const tabData = this.getTabData(SoundboardComponent.SEARCH);
      tabData.dataSource.filter = value.trim().toLowerCase() || 'NULL';
      tabData.dataSource.paginator!.firstPage();
    });
  }

  private setUpDatasource(category: string, files: SoundFile[], index: number): void {
    const dataSource = new MatTableDataSource<SoundFile>(files);

    this.tabData = [...this.tabData, {category, dataSource, filesCount: files.length}];

    if (category === SoundboardComponent.SEARCH) {
      dataSource.filterPredicate = (data: SoundFile, filter: string) => {
        if (filter === 'NULL') {
          return true;
        }
        const matchDescription = data.description === null ? false : data.description.toLowerCase().includes(filter);
        const matchTags = data.tags.includes(filter);
        return data.name.toLowerCase().includes(filter) || matchDescription || matchTags;
      };
    }

    this.cd.detectChanges();
    dataSource.paginator = this.paginators.get(index) || null;
    dataSource.sort = this.sorts.get(index) || null;
  }

  ngAfterViewInit(): void {
  }

  showBotControl(): void {
    this.dialog.open(BotControlComponent);
  }

  openSettings(file: SoundFile): void {
    this.dialog.open(FileEditComponent, {data: file});
  }

  async playFile(file: SoundFile): Promise<void> {
    await this.core.playFile(file).toPromise();
  }

  private getTabData(category: string): TabData {
    return this.tabData.find(t => t.category === category)!;
  }
}
