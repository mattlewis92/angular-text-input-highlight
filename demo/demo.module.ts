import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TextInputHighlightModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, TextInputHighlightModule],
  bootstrap: [DemoComponent]
})
export class DemoModule {}
