import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { HighlightTag } from './highlight-tag.interface';

const styleProperties = Object.freeze([
  'direction', // RTL support
  'boxSizing',
  'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY', // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration', // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize'
]);

function indexIsInsideTag(index: number, tag: HighlightTag) {
  return tag.indices.start < index && index < tag.indices.end;
}

function overlaps(tagA: HighlightTag, tagB: HighlightTag) {
  return (
    indexIsInsideTag(tagB.indices.start, tagA) ||
    indexIsInsideTag(tagB.indices.end, tagA)
  );
}

@Component({
  selector: 'mwl-text-input-highlight',
  template: `
    <div
      class="text-highlight-element"
      [ngStyle]="highlightElementContainerStyle"
      [innerHtml]="highlightedText"
      #highlightElement>
    </div>
  `
})
export class TextInputHighlightComponent implements OnChanges, OnDestroy {
  /**
   * The CSS class to add to highlighted tags
   */
  @Input() tagCssClass: string = '';

  /**
   * An array of indices of the textarea value to highlight
   */
  @Input() tags: HighlightTag[] = [];

  /**
   * The textarea to highlight. Currently only works with textareas.
   */
  @Input() textInputElement: HTMLTextAreaElement;

  /**
   * @private
   */
  highlightElementContainerStyle: { [key: string]: string } = {};

  /**
   * @private
   */
  highlightedText: string;

  @ViewChild('highlightElement') private highlightElement: ElementRef;

  private textareaEventListeners: Array<() => void> = [];

  constructor(private renderer: Renderer2) {}

  /**
   * @private
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.textInputElement) {
      this.textInputElementChanged();
    }

    if (changes.tags || changes.tagCssClass) {
      this.addTags();
    }
  }

  /**
   * @private
   */
  ngOnDestroy(): void {
    this.textareaEventListeners.forEach(unregister => unregister());
  }

  private textInputElementChanged() {
    const elementType = this.textInputElement.tagName.toLowerCase();
    if (elementType !== 'textarea') {
      throw new Error(
        'The angular-text-input-highlight component must be passed ' +
          'a textarea to the `textInputElement` input. Instead received a ' +
          elementType
      );
    }

    const computed: any = getComputedStyle(this.textInputElement);
    styleProperties.forEach(prop => {
      this.highlightElementContainerStyle[prop] = computed[prop];
    });

    this.textareaEventListeners.forEach(unregister => unregister());
    this.textareaEventListeners = [
      this.renderer.listen(this.textInputElement, 'input', () => {
        this.addTags();
      }),
      this.renderer.listen(this.textInputElement, 'scroll', () => {
        this.highlightElement.nativeElement.scrollTop = this.textInputElement.scrollTop;
      })
    ];

    setTimeout(() => {
      this.addTags();
    });
  }

  private addTags() {
    let textareaValue = this.textInputElement.value;

    const prevTags: HighlightTag[] = [];

    [...this.tags]
      .sort((tagA, tagB) => {
        return tagB.indices.start - tagA.indices.start;
      })
      .forEach(tag => {
        if (tag.indices.start > tag.indices.end) {
          throw new Error(
            `Highlight tag with indices [${tag.indices.start}, ${tag.indices
              .end}] cannot start after it ends.`
          );
        }

        prevTags.forEach(prevTag => {
          if (overlaps(prevTag, tag)) {
            throw new Error(
              `Highlight tag with indices [${tag.indices.start}, ${tag.indices
                .end}] overlaps with tag [${prevTag.indices.start}, ${prevTag
                .indices.end}]`
            );
          }
        });

        // TODO - implement this as an ngFor of items that is generated in the template
        const before = textareaValue.slice(0, tag.indices.start);
        const after = textareaValue.slice(tag.indices.end);

        const expectedTagLength = tag.indices.end - tag.indices.start;
        const tagContents = textareaValue.slice(
          tag.indices.start,
          tag.indices.end
        );
        if (tagContents.length === expectedTagLength) {
          const cssClass = tag.cssClass || this.tagCssClass;
          textareaValue =
            before +
            `<span class="text-highlight-tag${cssClass
              ? ' '
              : ''}${cssClass}">${tagContents}</span>` +
            after;
          prevTags.push(tag);
        }
      });
    this.highlightedText = `${textareaValue}&nbsp;`;
  }
}
