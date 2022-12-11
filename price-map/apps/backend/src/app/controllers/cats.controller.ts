import { Body, 
  Controller, 
  Get, 
  Header, 
  HttpCode, 
  Param, 
  Post, 
  Req, 
  Res, 
  HttpException, 
  UseFilters, 
  ParseIntPipe, 
  UseGuards, 
  UseInterceptors, 
  Request } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AuthGuard } from '../guards/auth.guard';
import { LoggingInterceptor } from '../interceptor/logging.interceptor';
import { JustPipe } from '../pipes/validation.pipe';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  getData() {
    return this.catsService.getData();
  }

  @Get('findall')
  @UseGuards(AuthGuard)
  findAll(@Req() request: Request): string {

    return '34';
  }

  @Post('surl')
  surl(@Req() request: Request, @Body() body): string {
    console.log(body);
    return '34';
  }

  @Get(':id')
  @UseInterceptors(LoggingInterceptor)
  findOne(@Param('id', ParseIntPipe, JustPipe) id: string): string {
    return `This action returns a #${id} cat`;
  }

  // @Get('findr')
  // findr(@Req() request: Request, @Res() res): Observable<string> {
  //   return res.json('3dfsdfd43');
  // }

  @Post('pos')
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  add(@Req() request: Request): string {
    console.log(request.body);

    return 'dfgdgdgdfgd';
  }

  @Post('kkk')
  @UseFilters(HttpExceptionFilter)
  da(@Req() request: Request): string {
    console.log('error');

    throw new HttpException('er', 400);
  }
}
