import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { LOCK, UNLOCK } from 'src/app/shared/consts/images.const';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  LOCK = LOCK;
  UNLOCK = UNLOCK;

  @Input()
  authorized: boolean = false;
  showAuthModal: boolean = false;

  @ViewChild('password') adminPassword: ElementRef | undefined;

  constructor(
    private readonly authService: AuthorizationService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.authorized = authService.authorized;
    this.authService.$token.subscribe(() => {
      if (this.authorized !== authService.authorized) {
      }
      this.authorized = authService.authorized;
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {}

  auth() {
    this.authService
      .authorization(this.adminPassword?.nativeElement.value)
      .subscribe();
    this.showAuthModal = false;
  }
  logout() {
    this.authService.logout();
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }
}
