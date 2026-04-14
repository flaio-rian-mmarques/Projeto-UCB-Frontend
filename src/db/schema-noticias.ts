import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm'

export const ufs = sqliteTable('uf', {
    id: integer('id').primaryKey({autoIncrement: true}),
    nome: text('nome').notNull(),
    sigla: text('sigla').notNull()
});

export const cidades = sqliteTable('cidade', {
    id: integer('id').primaryKey({autoIncrement: true}),
    nome: text('nome').notNull(),
    ufId: integer('uf_id').notNull().references(() => ufs.id),
});

export const noticias = sqliteTable('noticia', {
    id: integer('id').primaryKey({autoIncrement: true}),
    titulo: text('titulo').notNull(),
    texto: text('texto').notNull(),
    cidadeId: integer('cidade_id').notNull().references(() => cidades.id),
    dataCriacao: text('data_criacao').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const ufsRelations = relations(ufs, ({ many }) => ({
    cidades: many(cidades),
}));

export const cidadesRelations = relations(cidades, ({ one, many }) => ({
    uf: one(ufs, { fields: [cidades.ufId], references: [ufs.id] }),
    noticias: many(noticias),
}));

export const noticiasRelations = relations(noticias, ({ one }) => ({
    cidade: one(cidades, { fields: [noticias.cidadeId], references: [cidades.id] }),
}));

