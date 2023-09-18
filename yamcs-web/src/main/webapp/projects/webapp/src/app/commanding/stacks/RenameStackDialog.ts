import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BasenamePipe, ConfigService, ExtensionPipe, FilenamePipe, StorageClient, YamcsService } from '@yamcs/webapp-sdk';

@Component({
  selector: 'app-rename-stack-dialog',
  templateUrl: './RenameStackDialog.html',
})
export class RenameStackDialog {

  filenameForm: UntypedFormGroup;

  private storageClient: StorageClient;
  private bucket: string;

  constructor(
    private dialogRef: MatDialogRef<RenameStackDialog>,
    formBuilder: UntypedFormBuilder,
    yamcs: YamcsService,
    basenamePipe: BasenamePipe,
    private filenamePipe: FilenamePipe,
    private extensionPipe: ExtensionPipe,
    configService: ConfigService,
    @Inject(MAT_DIALOG_DATA) readonly data: any,
  ) {
    this.storageClient = yamcs.createStorageClient();
    this.bucket = configService.getStackBucket();

    const basename = basenamePipe.transform(filenamePipe.transform(this.data.name));
    this.filenameForm = formBuilder.group({
      name: [basename, [Validators.required]],
    });
  }

  async rename() {
    let prefix;
    const idx = this.data.name.lastIndexOf('/');
    if (idx !== -1) {
      prefix = this.data.name.substring(0, idx + 1);
    }

    const response = await this.storageClient.getObject(this.bucket, this.data.name);
    const blob = await response.blob();

    const format = this.extensionPipe.transform(this.filenamePipe.transform(this.data.name))?.toLowerCase();

    const newObjectName = (prefix || '') + this.filenameForm.get('name')!.value + (format ? "." + format : '');
    if (newObjectName !== this.data.name) {
      await this.storageClient.uploadObject(this.bucket, newObjectName, blob);
      await this.storageClient.deleteObject(this.bucket, this.data.name);
    }
    this.dialogRef.close(newObjectName);
  }
}
