import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard, LocalAuthGuard } from './modules/auth/guards';
import { AuthService } from './modules/auth/services';
import fs = require('fs');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('rest/edelweiss/data')
  async test(@Req() req: Request) {
    // console.log(req);

    const response: string = JSON.stringify(req.body);
    console.log(response);

    fs.writeFile('test.json', response, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });

    return;
  }
}
