import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfigService, StorageClient, YamcsService } from '@yamcs/webapp-sdk';
import { Viewer } from './Viewer';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './ImageViewer.html',
  styles: [`
    .checkerboard {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewer implements Viewer {

  url: string;

  private storageClient: StorageClient;
  private bucket: string;

  constructor(yamcs: YamcsService, configService: ConfigService) {
    this.storageClient = yamcs.createStorageClient();
    this.bucket = configService.getDisplayBucket();
  }

  public init(objectName: string) {
    this.url = this.storageClient.getObjectURL(this.bucket, objectName);
    return Promise.resolve();
  }

  public hasPendingChanges() {
    return false;
  }
}
