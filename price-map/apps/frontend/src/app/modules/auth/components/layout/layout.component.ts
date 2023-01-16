import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbIconConfig, NbToastrService } from '@nebular/theme';
import { WebSocketService, TokenService } from '../../../../services';

@Component({
  selector: 'auth-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService,
    private readonly tokenService: TokenService,
    private readonly toastrService: NbToastrService) {}

  public ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.socket.on('login failed', (response: any) => {
      console.log('on login failed', response);

      const iconConfig: NbIconConfig = { icon: 'minus-circle-outline', pack: 'eva' };
      this.toastrService.show(response.message, 'Ошибка',
        {
          status: 'danger',
          duration: 2000,
          destroyByClick: true,
          icon: iconConfig
        }
      )
    });

    this.webSocketSevice.socket.on('login successed', (response: any) => {
      console.log('on login successed', response);
      const iconConfig: NbIconConfig = { icon: 'checkmark-circle-2-outline', pack: 'eva' };
      this.toastrService.show(response.message, 'Успех',
        {
          status: 'success',
          duration: 2000,
          destroyByClick: true,
          icon: iconConfig
        }
      );
      this.tokenService.setToken(response.data);
      this.router.navigate(['map'], { queryParamsHandling: 'merge' });
    });
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('login attempt', {
      ...this.form.value,
      role: 'user'
    });
  }
}
