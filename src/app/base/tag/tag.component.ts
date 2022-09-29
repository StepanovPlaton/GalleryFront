import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DELETE, EDIT } from 'src/app/shared/consts/images.const';
import { ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements AfterViewInit {
  EDIT = EDIT;
  DELETE = DELETE;

  @Input()
  tag?: ITag | undefined;
  @Input()
  selected?: boolean = false;
  @Input()
  editable?: boolean = false;
  @Input()
  canToggle?: boolean = false;
  @Input()
  createNew?: boolean = false;

  @Output()
  selectToggle = new EventEmitter<boolean>();
  @Output()
  changeTagName = new EventEmitter<string>();
  @Output()
  createNewTag = new EventEmitter<string>();
  @Output()
  deleteTag = new EventEmitter<void>();

  authorized = false;
  edit = false;

  editableTagName: string = '';

  constructor(
    private readonly authService: AuthorizationService,
    private readonly apiService: ApiService
  ) {
    this.authorized = this.authService.authorized;
    this.authService.$token.subscribe(() => {
      this.authorized = this.authService.authorized;
    });
  }

  ngAfterViewInit(): void {
    if (this.tag) this.editableTagName = this.tag.tag;
  }

  tagSelectToggle() {
    this.selected = !this.selected;
    this.selectToggle.next(this.selected);
  }

  submitNewTagName() {
    if (this.tag) {
      this.tag.tag = this.editableTagName;
      this.changeTagName.next(this.tag.tag);
    }
  }
  createNewTagF() {
    this.createNewTag.next(this.editableTagName);
  }
  deleteThisTag() {
    this.deleteTag.next();
  }
}
