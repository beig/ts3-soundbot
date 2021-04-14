import { Component, OnInit } from '@angular/core';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { FileEditComponent } from '../file-edit/file-edit.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SoundFile } from '../../core/state/sound-file/sound-file.model';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  public files: NgxFileDropEntry[] = [];

  constructor(private dialog: MatDialog,
              public dialogRef: MatDialogRef<UploadFileComponent>) {
  }

  ngOnInit(): void {
  }

  public dropped(files: NgxFileDropEntry[]): void {
    this.files = files;
    for (const droppedFile of files) {

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
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
}
