import { Component, input, output } from '@angular/core';

/**
 * Generic modal shell: `open` input controls visibility, `closed` output
 * fires on backdrop click / the built-in × button. Body content is the
 * default projection slot; footer buttons go in an element with the
 * `modal-footer` attribute, e.g. `<div modal-footer>...</div>`.
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');

  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
