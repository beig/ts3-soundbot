import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { FileEditComponent } from '../file-edit/file-edit.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SoundFile } from '../../core/state/sound-file/sound-file.model';
import { BatchUploadComponent } from './batch-upload/batch-upload.component';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  @ViewChild(BatchUploadComponent, {static: false}) batchUploadComponent: BatchUploadComponent;

  public files: NgxFileDropEntry[] = [];
  multiUpload: boolean;

  constructor(private dialog: MatDialog,
              private cd: ChangeDetectorRef,
              public dialogRef: MatDialogRef<UploadFileComponent>) {
  }

  ngOnInit(): void {
  }

  public async dropped(files: NgxFileDropEntry[]): Promise<void> {
    this.files = files;

    if (this.files.length > 1) {
      const soundFiles = await Promise.all(files.filter(f => f.fileEntry.isFile).map(f => f.fileEntry as FileSystemFileEntry)
        .map(value => this.loadFile(value)));
      this.multiUpload = true;
      this.cd.detectChanges();
      this.batchUploadComponent.soundFiles = soundFiles;
    } else {
      const fileEntry = files[0].fileEntry as FileSystemFileEntry;
      if (fileEntry.isFile) {
        fileEntry.file(async (file: File) => {

          const arrayBuffer = await file.arrayBuffer();
          const base64File = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

          const createFile: SoundFile = {
            tags: [],
            description: '',
            name: file.name,
            category: '',
            duration: 0,
            playCount: 0,
            isNew: true,
            data: base64File
          };

          this.dialog.open(FileEditComponent, {data: createFile});
          this.dialogRef.close();
        });
      }
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private loadFile(fileSystemEntry: FileSystemFileEntry): Promise<SoundFile> {
    return new Promise<SoundFile>(resolve => {
      fileSystemEntry.file(async (file: File) => {

        const base64File = this.arrayBufferToBase64(await file.arrayBuffer());

        const createFile: SoundFile = {
          tags: [],
          description: '',
          name: file.name,
          category: '',
          duration: 0,
          playCount: 0,
          isNew: true,
          data: base64File
        };

        resolve(createFile);
      });
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
