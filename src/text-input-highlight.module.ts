import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInputHighlightComponent } from './text-input-highlight.component';
import { TextInputHighlightContainerDirective } from './text-input-highlight-container.directive';
import { TextInputElementDirective } from './text-input-element.directive';

@NgModule({
  declarations: [
    TextInputHighlightComponent,
    TextInputHighlightContainerDirective,
    TextInputElementDirective
  ],
  imports: [CommonModule],
  exports: [
    TextInputHighlightComponent,
    TextInputHighlightContainerDirective,
    TextInputElementDirective
  ]
})
export class TextInputHighlightModule {}
