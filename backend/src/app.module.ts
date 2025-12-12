import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { PostsModule } from './posts/posts.module';
import { PostCategoriesModule } from './post-categories/post-categories.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SupabaseModule,
    PostsModule,
    PostCategoriesModule,
    TagsModule,
  ],
})
export class AppModule {}
