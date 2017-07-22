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
        [textInputElement]="textarea">
      </mwl-text-input-highlight>
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
    `
  ],
  encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
  text: string = 'Hello @mattlewis92 how are you today?\n\n@angular is pretty awesome!\n\nLook I have a #different background color!';

  tags: HighlightTag[] = [];

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
        }
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
        cssClass: 'bg-pink'
      });
    }
  }
}
