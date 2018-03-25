import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataSource } from '@angular/cdk/table';
import { Alarm } from '@yamcs/client';
import { YamcsService } from '../../core/services/YamcsService';
import { CollectionViewer } from '@angular/cdk/collections';

export class AlarmsDataSource extends DataSource<Alarm> {

  alarms$ = new BehaviorSubject<Alarm[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);

  private alarmsByName: { [key: string]: Alarm } = {};

  constructor(private yamcs: YamcsService) {
    super();
  }

  connect(collectionViewer: CollectionViewer) {
    return this.alarms$;
  }

  loadAlarms(processorName: string) {
    this.loading$.next(true);
    this.yamcs.getSelectedInstance().getActiveAlarms(processorName)
      .then(alarms => {
        this.loading$.next(false);
        for (const alarm of alarms) {
          this.processAlarm(alarm);
        }
        this.alarms$.next(Object.values(this.alarmsByName));
      });

    this.yamcs.getSelectedInstance().getAlarmUpdates().subscribe(alarm => {
      this.processAlarm(alarm);
      this.alarms$.next(Object.values(this.alarmsByName));
    });
  }

  disconnect(collectionViewer: CollectionViewer) {
    this.alarms$.complete();
    this.loading$.complete();
  }

  isEmpty() {
    return !this.alarms$.getValue().length;
  }

  private processAlarm(alarm: Alarm) {
    switch (alarm.type) {
      case 'ACTIVE':
      case 'TRIGGERED':
      case 'SEVERITY_INCREASED':
      case 'PVAL_UPDATED':
      case 'ACKNOWLEDGED':
        this.alarmsByName[alarm.triggerValue.id.name] = alarm;
        break;
      case 'CLEARED':
        delete this.alarmsByName[alarm.triggerValue.id.name];
        break;
      default:
        console.warn('Unexpected alarm event of type', alarm.type);
    }
  }
}
