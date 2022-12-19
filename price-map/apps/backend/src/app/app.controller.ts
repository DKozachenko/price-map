import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard, LocalAuthGuard } from './modules/auth/guards';
import { AuthService } from './modules/auth/services';
import { Roles } from './decorators';
import { Role } from './modules/auth/models/enums';

@Controller()
export class AppController {}
