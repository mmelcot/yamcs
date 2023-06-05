import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ThreadInfo } from '@yamcs/webapp-sdk';

@Component({
  selector: 'app-threads-table',
  templateUrl: './ThreadsTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreadsTable implements AfterViewInit, OnChanges {

  displayedColumns = [
    'id',
    'state',
    'name',
    'trace',
    'native',
    'suspended',
    'group',
    'actions',
  ];

  @Input()
  threads: ThreadInfo[];

  @Input()
  filter: string;

  @ViewChild(MatSort)
  sort: MatSort;

  dataSource = new MatTableDataSource<ThreadInfo>();

  ngAfterViewInit() {
    this.dataSource.filterPredicate = (thread, filter) => {
      return thread.name.toLowerCase().indexOf(filter) >= 0;
    };
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource.data = this.threads || [];
    this.dataSource.filter = this.filter;
  }
}
