import { Component, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { All_Tab_JSON } from './all-json'
import { LIST_JSON } from './list-json'
import { SEARCH_JSON } from './search-json'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styles.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  allJSON
  listJSON
  searchJSON
  constructor() {
    this.allJSON = All_Tab_JSON
    this.listJSON = LIST_JSON
    this.searchJSON = SEARCH_JSON;
  }
  test(event) {
    console.log(event)
  }
}