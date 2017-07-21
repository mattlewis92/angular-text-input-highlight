import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'chai';
import { TextInputHighlightComponent } from '../src/text-input-highlight.component';
import { TextInputHighlightModule } from '../src';

describe('mwl-text-input-highlight component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputHighlightModule]
    });
  });

  it('should say hello world', () => {
    const fixture: ComponentFixture<
      TextInputHighlightComponent
    > = TestBed.createComponent(TextInputHighlightComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML.trim()).to.equal(
      'Hello world from the angular text input highlight module!'
    );
  });
});
