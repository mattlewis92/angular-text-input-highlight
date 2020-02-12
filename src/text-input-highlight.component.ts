import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
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

const tagIndexIdPrefix = 'text-highlight-tag-id-';

function indexIsInsideTag(index: number, tag: HighlightTag) {
  return tag.indices.start < index && index < tag.indices.end;
}

function overlaps(tagA: HighlightTag, tagB: HighlightTag) {
  return (
    indexIsInsideTag(tagB.indices.start, tagA) ||
    indexIsInsideTag(tagB.indices.end, tagA)
  );
}

function isCoordinateWithinRect(rect: ClientRect, x: number, y: number) {
  return rect.left < x && x < rect.right && (rect.top < y && y < rect.bottom);
}

function escapeHtml(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface TagMouseEvent {
  tag: HighlightTag;
  target: HTMLElement;
  event: MouseEvent;
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
   * The textarea to highlight
   */
  @Input() textInputElement: HTMLTextAreaElement;

  /**
   * The textarea value, in not provided will fall back to trying to grab it automatically from the textarea
   */
  @Input() textInputValue: string;

  /**
   * Called when the area over a tag is clicked
   */
  @Output() tagClick = new EventEmitter<TagMouseEvent>();

  /**
   * Called when the area over a tag is moused over
   */
  @Output() tagMouseEnter = new EventEmitter<TagMouseEvent>();

  /**
   * Called when the area over the tag has the mouse is removed from it
   */
  @Output() tagMouseLeave = new EventEmitter<TagMouseEvent>();

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

  private highlightTagElements: Array<{
    element: HTMLElement;
    clientRect: ClientRect;
  }>;

  private mouseHoveredTag: TagMouseEvent | undefined;

  private isDestroyed = false;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  /**
   * Manually call this function to refresh the highlight element if the textarea styles have changed
   */
  refresh() {
    const computed: any = getComputedStyle(this.textInputElement);
    styleProperties.forEach(prop => {
      this.highlightElementContainerStyle[prop] = computed[prop];
    });
  }

  /**
   * @private
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.textInputElement) {
      this.textInputElementChanged();
    }

    if (changes.tags || changes.tagCssClass || changes.textInputValue) {
      this.addTags();
    }
  }

  /**
   * @private
   */
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.textareaEventListeners.forEach(unregister => unregister());
  }

  /**
   * @private
   */
  @HostListener('window:resize')
  onWindowResize() {
    this.refresh();
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

    setTimeout(() => {
      // in case the element was destroyed before the timeout fires
      if (!this.isDestroyed) {
        this.refresh();

        this.textareaEventListeners.forEach(unregister => unregister());
        this.textareaEventListeners = [
          this.renderer.listen(this.textInputElement, 'input', () => {
            this.addTags();
          }),
          this.renderer.listen(this.textInputElement, 'scroll', () => {
            this.highlightElement.nativeElement.scrollTop = this.textInputElement.scrollTop;
            this.highlightTagElements = this.highlightTagElements.map(tag => {
              tag.clientRect = tag.element.getBoundingClientRect();
              return tag;
            });
          }),
          this.renderer.listen(this.textInputElement, 'mouseup', () => {
            this.refresh();
          })
        ];

        // only add event listeners if the host component actually asks for it
        if (this.tagClick.observers.length > 0) {
          const onClick = this.renderer.listen(
            this.textInputElement,
            'click',
            event => {
              this.handleTextareaMouseEvent(event, 'click');
            }
          );
          this.textareaEventListeners.push(onClick);
        }

        if (this.tagMouseEnter.observers.length > 0) {
          const onMouseMove = this.renderer.listen(
            this.textInputElement,
            'mousemove',
            event => {
              this.handleTextareaMouseEvent(event, 'mousemove');
            }
          );
          const onMouseLeave = this.renderer.listen(
            this.textInputElement,
            'mouseleave',
            event => {
              if (this.mouseHoveredTag) {
                this.tagMouseLeave.emit(this.mouseHoveredTag);
                this.mouseHoveredTag = undefined;
              }
            }
          );
          this.textareaEventListeners.push(onMouseMove);
          this.textareaEventListeners.push(onMouseLeave);
        }

        this.addTags();
      }
    });
  }

  private addTags() {
    const textInputValue =
      typeof this.textInputValue !== 'undefined'
        ? this.textInputValue
        : this.textInputElement.value;

    const prevTags: HighlightTag[] = [];
    const parts: string[] = [];

    [...this.tags]
      .sort((tagA, tagB) => {
        return tagA.indices.start - tagB.indices.start;
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

        // TODO - implement this as an ngFor of items that is generated in the template for a cleaner solution

        const expectedTagLength = tag.indices.end - tag.indices.start;
        const tagContents = textInputValue.slice(
          tag.indices.start,
          tag.indices.end
        );
        if (tagContents.length === expectedTagLength) {
          const previousIndex =
            prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
          const before = textInputValue.slice(previousIndex, tag.indices.start);
          parts.push(escapeHtml(before));
          const cssClass = tag.cssClass || this.tagCssClass;
          const tagId = tagIndexIdPrefix + this.tags.indexOf(tag);
          // text-highlight-tag-id-${id} is used instead of a data attribute to prevent an angular sanitization warning
          parts.push(
            `<span class="text-highlight-tag ${tagId} ${cssClass}">${escapeHtml(
              tagContents
            )}</span>`
          );
          prevTags.push(tag);
        }
      });
    const remainingIndex =
      prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
    const remaining = textInputValue.slice(remainingIndex);
    parts.push(escapeHtml(remaining));
    parts.push('&nbsp;');
    this.highlightedText = parts.join('');
    this.cdr.detectChanges();
    this.highlightTagElements = Array.from(
      this.highlightElement.nativeElement.getElementsByTagName('span')
    ).map((element: HTMLElement) => {
      return { element, clientRect: element.getBoundingClientRect() };
    });
  }

  private handleTextareaMouseEvent(
    event: MouseEvent,
    eventName: 'click' | 'mousemove'
  ) {
    const matchingTagIndex = this.highlightTagElements.findIndex(elm =>
      isCoordinateWithinRect(elm.clientRect, event.clientX, event.clientY)
    );
    if (matchingTagIndex > -1) {
      const target = this.highlightTagElements[matchingTagIndex].element;
      const tagClass = Array.from(target.classList).find(className =>
        className.startsWith(tagIndexIdPrefix)
      );
      if (tagClass) {
        const tagId = tagClass.replace(tagIndexIdPrefix, '');
        const tag: HighlightTag = this.tags[+tagId];
        const tagMouseEvent = { tag, target, event };
        if (eventName === 'click') {
          this.tagClick.emit(tagMouseEvent);
        } else if (!this.mouseHoveredTag) {
          this.mouseHoveredTag = tagMouseEvent;
          this.tagMouseEnter.emit(tagMouseEvent);
        }
      }
    } else if (eventName === 'mousemove' && this.mouseHoveredTag) {
      this.mouseHoveredTag.event = event;
      this.tagMouseLeave.emit(this.mouseHoveredTag);
      this.mouseHoveredTag = undefined;
    }
  }
}
