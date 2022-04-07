import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CheckBoxInterface } from 'src/app/interfaces/CheckBox';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss'],
})
export class CheckBoxComponent implements OnInit {
  index: number = 0;
  value: boolean = false;
  content: string = '';
  @Input() someData: any;
  @Output() outputEvent: EventEmitter<CheckBoxInterface> =
    new EventEmitter<CheckBoxInterface>();
  constructor() {}

  ngOnInit() {
    this.index = this.someData.index;
  }
  delete() {
    const data: CheckBoxInterface = {
      index: this.index,
      value: this.value,
      content: this.content,
      deleted: true,
    };
    this.outputEvent.emit(data);
  }

  onClickCheckBox() {
    const data: CheckBoxInterface = {
      index: this.index,
      value: this.value,
      content: this.content,
      deleted: false,
    };
    this.outputEvent.emit(data);
  }
  onChangeText() {
    const data: CheckBoxInterface = {
      index: this.index,
      value: this.value,
      content: this.content,
      deleted: false,
    };
    this.outputEvent.emit(data);
  }
}
