import { Component } from '@angular/core';
import { ITag } from './shared/models/image.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  filteredTags: ITag[] = [];

  title = 'GalleryFront';
}
