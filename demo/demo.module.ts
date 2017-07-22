import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TextInputHighlightModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, FormsModule, TextInputHighlightModule],
  bootstrap: [DemoComponent]
})
export class DemoModule {}
