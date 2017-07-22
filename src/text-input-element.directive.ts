import { Directive } from '@angular/core';

@Directive({
  selector: 'textarea[mwlTextInputElement]',
  host: {
    '[class.text-input-element]': 'true'
  }
})
export class TextInputElementDirective {}
