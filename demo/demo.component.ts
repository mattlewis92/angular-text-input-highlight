import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HighlightTag } from '../src/';

@Component({
  selector: 'mwl-demo-app',
  template: `
    <div mwlTextInputHighlightContainer>
      <textarea
        mwlTextInputElement
        rows="6"
        class="form-control"
        [(ngModel)]="text"
        #textarea
        (input)="addTags()">
      </textarea>
      <mwl-text-input-highlight
        [tags]="tags"
        [tagCssClass]="'bg-blue'"
        [textInputElement]="textarea"
        (tagMouseEnter)="addDarkClass($event.target)"
        (tagMouseLeave)="removeDarkClass($event.target)"
        (tagClick)="tagClicked = $event.tag">
      </mwl-text-input-highlight>
    </div>
    <br>
    <div class="alert alert-info" *ngIf="tagClicked">
      Tag clicked! {{ tagClicked.data }}
    </div>
  `,
  styles: [
    `
      .bg-blue {
        background-color: lightblue;
      }
      .bg-pink {
        background-color: lightcoral;
      }
      .bg-blue-dark {
        background-color: #86c5da;
      }
      .bg-pink-dark {
        background-color: #eb5252;
      }
      textarea {
        width: 500px;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
  text: string = 'Hello @mattlewis92 how are you today?\n\nLook I have a #different background color!\n\n@angular is pretty awesome!';

  tags: HighlightTag[] = [];

  tagClicked: HighlightTag;

  ngOnInit(): void {
    this.addTags();
  }

  addTags() {
    this.tags = [];
    const matchMentions = /(@\w+) ?/g;
    let mention;
    // tslint:disable-next-line
    while ((mention = matchMentions.exec(this.text))) {
      this.tags.push({
        indices: {
          start: mention.index,
          end: mention.index + mention[1].length
        },
        data: mention[1]
      });
    }

    const matchHashtags = /(#\w+) ?/g;
    let hashtag;
    // tslint:disable-next-line
    while ((hashtag = matchHashtags.exec(this.text))) {
      this.tags.push({
        indices: {
          start: hashtag.index,
          end: hashtag.index + hashtag[1].length
        },
        cssClass: 'bg-pink',
        data: hashtag[1]
      });
    }
  }

  addDarkClass(elm: HTMLElement) {
    if (elm.classList.contains('bg-blue')) {
      elm.classList.add('bg-blue-dark');
    } else if (elm.classList.contains('bg-pink')) {
      elm.classList.add('bg-pink-dark');
    }
  }

  removeDarkClass(elm: HTMLElement) {
    elm.classList.remove('bg-blue-dark');
    elm.classList.remove('bg-pink-dark');
  }
}
