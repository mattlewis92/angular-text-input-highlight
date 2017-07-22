import { Directive } from '@angular/core';

@Directive({
  selector: '[mwlTextInputHighlightContainer]',
  host: {
    '[class.text-input-highlight-container]': 'true'
  }
})
export class TextInputHighlightContainerDirective {}
