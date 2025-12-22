import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService } from './popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrls: ['./popup.css'],
})
export class PopupComponent {
  private svc = inject(PopupService);
  visible = this.svc.visible;
  message = this.svc.message;
  type = this.svc.type;

  close() {
    this.svc.hide();
  }
}
