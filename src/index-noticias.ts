import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { db } from './db/index-noticias.js';
import { ufs, cidades, noticias, tags, noticiasTags } from './db/schema-noticias.js';
import { desc, asc, eq } from 'drizzle-orm';

const rl = readline.createInterface({ input, output });

async function exibirMenuPrincipal() {
    console.log(`
==================================
    SISTEMA DE NOTÍCIAS
==================================
0 - Cadastrar notícia
1 - Exibir todas as notícias (mais recentes primeiro)
2 - Exibir todas as notícias (mais antigas primeiro)
3 - Exibir notícias de um estado específico
4 - Exibir todas as notícias agrupadas por estado
5 - Cadastrar UF
6 - Cadastrar cidade
7 - Sair    
8 - Cadastrar TAG
    `);
}

async function main() {
    let rodando = true;

    while (rodando) {
        await exibirMenuPrincipal();
        const opcaoBruta = await rl.question('Escolha uma opção: ');
        const opcao = opcaoBruta.trim();

        switch (opcao) {
            case '0':
                const listaCidades = await db.select().from(cidades);
                if (listaCidades.length === 0) {
                    console.log("\nNenhuma cidade cadastrada!");
                    break;
                }
                
                console.log("");
                listaCidades.forEach(c => console.log(`[${c.id}] - ${c.nome}`));
                const cidId = await rl.question('\nID da cidade: ');
                const titulo = await rl.question('Título: ');
                const texto = await rl.question('Texto: ');

                if (!cidId || !titulo || !texto) break;

                try {
                    const novaNoticia = await db.insert(noticias).values({
                        titulo: titulo.trim(),
                        texto: texto.trim(),
                        cidadeId: Number(cidId.trim())
                    }).returning({ id: noticias.id });

                    const idNoticia = novaNoticia[0].id;
                    
                    const listaTags = await db.select().from(tags);
                    if (listaTags.length > 0) {
                        console.log("\nTags disponíveis:");
                        listaTags.forEach(t => console.log(`[${t.id}] - ${t.nome}`));
                        const tagsStr = await rl.question('\nIDs das tags (separados por vírgula, ou Enter para pular): ');
                        
                        if (tagsStr.trim()) {
                            const ids = tagsStr.split(',').map(id => Number(id.trim()));
                            for (const tId of ids) {
                                if (!isNaN(tId)) {
                                    await db.insert(noticiasTags).values({
                                        noticiaId: idNoticia,
                                        tagId: tId
                                    });
                                }
                            }
                        }
                    }
                    console.log("\nNotícia cadastrada com sucesso!");
                } catch (error) {
                    console.log("\nErro ao salvar.");
                }
                break;

            case '1':
            case '2':
                const isRecente = opcao === '1';
                const todasNoticias = await db.select().from(noticias)
                    .orderBy(isRecente ? desc(noticias.dataCriacao) : asc(noticias.dataCriacao));
                
                console.log("");
                todasNoticias.forEach(n => {
                    console.log(`- ${n.titulo} (${n.dataCriacao})`);
                });
                
                await rl.question('\n(z) Voltar: ');
                break;

            case '3':
                const ufDesejada = await rl.question('\nSigla do estado: ');
                const ord = await rl.question('(a) Mais recentes\n(b) Mais antigas\nOpção: ');
                
                if (ord.trim().toLowerCase() === 'z') break;

                const notsEstado = await db.select({
                    titulo: noticias.titulo,
                    data: noticias.dataCriacao
                }).from(noticias)
                    .innerJoin(cidades, eq(noticias.cidadeId, cidades.id))
                    .innerJoin(ufs, eq(cidades.ufId, ufs.id))
                    .where(eq(ufs.sigla, ufDesejada.trim().toUpperCase()))
                    .orderBy(ord.trim().toLowerCase() === 'a' ? desc(noticias.dataCriacao) : asc(noticias.dataCriacao));

                console.log("");
                notsEstado.forEach(n => console.log(`- ${n.titulo}`));
                await rl.question('\n(z) Voltar: ');
                break;

            case '4':
                const agrupado = await db.select({
                    uf: ufs.sigla,
                    cidade: cidades.nome,
                    titulo: noticias.titulo,
                    texto: noticias.texto
                }).from(noticias)
                    .innerJoin(cidades, eq(noticias.cidadeId, cidades.id))
                    .innerJoin(ufs, eq(cidades.ufId, ufs.id))
                    .orderBy(ufs.sigla, desc(noticias.dataCriacao));

                let ufAtual = '';
                let contador = 1;
                const mapaNoticias: any[] = [];

                agrupado.forEach(item => {
                    if (ufAtual !== item.uf) {
                        ufAtual = item.uf;
                        console.log(`\n# ${item.uf}`);
                    }
                    console.log(`${contador} - ${item.titulo} - ${item.cidade}`);
                    mapaNoticias[contador] = item;
                    contador++;
                });

                const acao = await rl.question('\n(d) Detalhar\n(z) Voltar\nOpção: ');

                if (acao.trim().toLowerCase() === 'd') {
                    const numStr = await rl.question('Número da notícia: ');
                    const num = Number(numStr.trim());
                    const n = mapaNoticias[num];

                    if (n) {
                        console.log(`\nTítulo: ${n.titulo}`);
                        console.log(`Texto : ${n.texto}\n`);
                    }
                    await rl.question('(z) Voltar: ');
                }
                break;

            case '5':
                const nomeUf = await rl.question('\nNome do estado: ');
                const siglaUf = await rl.question('Sigla do estado: ');

                if (!nomeUf || !siglaUf) break;

                try {
                    await db.insert(ufs).values({
                        nome: nomeUf.trim(),
                        sigla: siglaUf.trim().toUpperCase()
                    });
                } catch (error) {}
                break;

            case '6':
                const listaUfs = await db.select().from(ufs);
                if (listaUfs.length === 0) break;
                
                console.log("");
                listaUfs.forEach(uf => {
                    console.log(`[${uf.id}] - ${uf.nome} (${uf.sigla})`);
                });

                const ufIdStr = await rl.question('\nID do estado: ');
                const nomeCidade = await rl.question('Nome da cidade: ');

                if (!ufIdStr || !nomeCidade) break;

                try {
                    await db.insert(cidades).values({
                        nome: nomeCidade.trim(),
                        ufId: Number(ufIdStr.trim())
                    });
                } catch (error) {}
                break;

            case '8':
                const nomeTag = await rl.question('\nNome da TAG: ');
                if (!nomeTag) break;
                
                try {
                    await db.insert(tags).values({
                        nome: nomeTag.trim().toUpperCase()
                    });
                    console.log("TAG cadastrada com sucesso!");
                } catch (error) {}
                break;

            case '7':
                rodando = false;
                break;
        }
    }
    rl.close();
}

main();