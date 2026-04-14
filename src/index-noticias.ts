import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { db } from './db/index-noticias.js';
import { ufs, cidades, noticias } from './db/schema-noticias.js';

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
    `)
}

async function main() {
    let rodando = true;

    while (rodando) {
        await exibirMenuPrincipal();
        const opcao = await rl.question('Escolha uma opção: ');

        switch (opcao) {
            case '5':
                console.log("\n-- Cadastrando UF --");
                break;
            case '7':
                console.log("Saindo do sistema...");
                rodando = false;
                break;
            default:
                console.log("Opção inválida ou ainda não implementada");
        }
    }
    rl.close()
}

main();