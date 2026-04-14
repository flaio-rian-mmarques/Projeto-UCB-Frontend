import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const ufs = sqliteTable('uf', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    sigla: text('sigla').notNull(),
});

export const cidades = sqliteTable('cidade', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    ufId: integer('uf_id').notNull().references(() => ufs.id),
});

export const noticias = sqliteTable('noticia', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    titulo: text('titulo').notNull(),
    texto: text('texto').notNull(),
    cidadeId: integer('cidade_id').notNull().references(() => cidades.id),
    dataCriacao: text('data_criacao').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const tags = sqliteTable('tag', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
});

export const noticiasTags = sqliteTable('noticia_tag', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    noticiaId: integer('noticia_id').notNull().references(() => noticias.id),
    tagId: integer('tag_id').notNull().references(() => tags.id),
});