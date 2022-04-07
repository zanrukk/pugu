import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonInput } from '@ionic/angular';
import { NumBox } from 'src/app/interfaces/NumBox';

@Component({
  selector: 'app-num-box',
  templateUrl: './num-box.component.html',
  styleUrls: ['./num-box.component.scss'],
})
export class NumBoxComponent implements OnInit, OnChanges {
  @Input() currentBox: number;
  @Input() errorValue: boolean;
  @Input() index: number;
  @Input() valueFromParent: string;
  @Output() changeNumber: EventEmitter<NumBox> = new EventEmitter<NumBox>();
  @Output() focusAnyBox = new EventEmitter();
  @Output() pasteHandler = new EventEmitter();
  @ViewChild('autofocus', { static: false, read: IonInput })
  autofocus: IonInput;
  borderColor: string;
  focused = true;
  pressedKey: string;
  value: string;

  constructor() {}

  ngOnInit() {
    if (this.index === 0) {
      this.focused = true;
    }
  }

  ngOnChanges() {
    if (this.errorValue) this.borderColor = '#DD143C';
    else this.borderColor = 'white';
    this.value = this.valueFromParent;
    if (this.currentBox === this.index) {
      this.focused = true;
      this.autofocus?.setFocus();
    } else {
      this.focused = false;
    }
  }

  onFocusBox(): void {
    this.focusAnyBox.emit(this.index);
  }

  onPasteContent(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');
    const list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let noProblem = true;
    for (let i = 0; i < pastedText.length; i++) {
      if (!list.includes(pastedText[i])) {
        noProblem = false;
        break;
      }
    }
    if (noProblem) this.pasteHandler.emit(pastedText);
  }

  onValueChanged(event: KeyboardEvent): void {
    event.preventDefault();
    if (
      event.key === 'Backspace' ||
      event.key === '0' ||
      event.key === '1' ||
      event.key === '2' ||
      event.key === '3' ||
      event.key === '4' ||
      event.key === '5' ||
      event.key === '6' ||
      event.key === '7' ||
      event.key === '8' ||
      event.key === '9'
    ) {
      if (event.key === 'Backspace') this.value = '';
      else this.value = event.key;
      const val: NumBox = {
        focused: this.focused,
        index: this.index,
        value: this.value,
      };
      this.changeNumber.emit(val);
    }
  }

  onPressKey(event: KeyboardEvent) {
    event.preventDefault();
    if (
      !(
        event.key === 'Backspace' ||
        event.key === '0' ||
        event.key === '1' ||
        event.key === '2' ||
        event.key === '3' ||
        event.key === '4' ||
        event.key === '5' ||
        event.key === '6' ||
        event.key === '7' ||
        event.key === '8' ||
        event.key === '9'
      )
    ) {
      this.value = this.valueFromParent;
    }
  }
}
