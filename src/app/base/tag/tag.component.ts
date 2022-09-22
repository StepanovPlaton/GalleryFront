import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DELETE, EDIT } from 'src/app/shared/consts/images.const';
import { ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements OnInit {
  EDIT = EDIT;
  DELETE = DELETE;

  @Input()
  tag: ITag | undefined;
  @Input()
  selected: boolean = false;
  @Input()
  edit: boolean = false;

  @Output()
  selectToggle = new EventEmitter<boolean>();

  authorized = false;

  constructor(
    private readonly authService: AuthorizationService,
    private readonly apiService: ApiService
  ) {
    this.authorized = this.authService.authorized;
    this.authService.$token.subscribe(() => {
      this.authorized = this.authService.authorized;
    });
  }

  ngOnInit() {}

  tagSelectToggle() {
    this.selected = !this.selected;
    this.selectToggle.next(this.selected);
  }
}
