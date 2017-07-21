# angular text input highlight
[![Build Status](https://travis-ci.org/mattlewis92/angular-text-input-highlight.svg?branch=master)](https://travis-ci.org/mattlewis92/angular-text-input-highlight)
[![codecov](https://codecov.io/gh/mattlewis92/angular-text-input-highlight/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/angular-text-input-highlight)
[![npm version](https://badge.fury.io/js/angular-text-input-highlight.svg)](http://badge.fury.io/js/angular-text-input-highlight)
[![devDependency Status](https://david-dm.org/mattlewis92/angular-text-input-highlight/dev-status.svg)](https://david-dm.org/mattlewis92/angular-text-input-highlight?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/mattlewis92/angular-text-input-highlight.svg)](https://github.com/mattlewis92/angular-text-input-highlight/issues)
[![GitHub stars](https://img.shields.io/github/stars/mattlewis92/angular-text-input-highlight.svg)](https://github.com/mattlewis92/angular-text-input-highlight/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mattlewis92/angular-text-input-highlight/master/LICENSE)

## Demo
https://mattlewis92.github.io/angular-text-input-highlight/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About

A component that can highlight parts of text in an input or textarea. Useful for displaying mentions etc

## Installation

Install through npm:
```
npm install --save angular-text-input-highlight
```

Then include in your apps module:

```typescript
import { NgModule } from '@angular/core';
import { TextInputHighlightModule } from 'angular-text-input-highlight';

@NgModule({
  imports: [
    TextInputHighlightModule
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';

@Component({
  template: `
    <textarea [(ngModel)]="text" #textarea></textarea>
    <mwl-text-input-highlight tagCssClass="default-tag-class" [tags]="tags" [highlightElement]="textarea" (tagClicked)="tagClicked($event)"></mwl-text-input-highlight>
  `
})
class MyComponent {

  text = 'this is some text';

  tags = [{indices: {start: 8, end: 12}, cssClass: 'highlight-tag-primary', data: {user: {id: 1}}}];

  tagClicked(event) {
    console.log(event); // logs {tagElement: HTMLElement, highlight: [{indices: {start: 8, end: 12}, cssClass: 'highlight-tag-primary', data: {user: {id: 1}}}]}
  }

}
```

You may also find it useful to view the [demo source](https://github.com/mattlewis92/angular-text-input-highlight/blob/master/demo/demo.component.ts).

### Usage without a module bundler
```
<script src="node_modules/angular-text-input-highlight/bundles/angular-text-input-highlight.umd.js"></script>
<script>
    // everything is exported angularTextInputHighlight namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://mattlewis92.github.io/angular-text-input-highlight/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
