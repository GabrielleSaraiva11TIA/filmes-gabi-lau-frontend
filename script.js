const API = "https://filmes-gabi-lau-backend.vercel.app"

const lista = document.getElementById("lista-filmes")
const contagem = document.getElementById("contagem")

// Evita que um título com < ou > quebre o HTML da página
function escaparHTML(texto) {
    const div = document.createElement("div")
    div.textContent = String(texto ?? "")
    return div.innerHTML
}

// Aceita "Livre", "14 anos", "14" ou 14 e devolve a sigla e o texto do selo
function lerClassificacao(valor) {
    const texto = String(valor ?? "").trim()

    if (/livre/i.test(texto) || texto.toUpperCase() === "L") {
        return { sigla: "L", classe: "classind-L", rotulo: "Livre" }
    }

    const idade = parseInt(texto, 10)
    if ([10, 12, 14, 16, 18].includes(idade)) {
        return { sigla: idade, classe: `classind-${idade}`, rotulo: `${idade} anos` }
    }

    return { sigla: "?", classe: "classind-outra", rotulo: texto || "Sem classificação" }
}

// 136 vira "2h 16min"
function formatarDuracao(minutos) {
    const total = Number(minutos)
    if (!total) return "Duração não informada"
    const horas = Math.floor(total / 60)
    const resto = total % 60
    if (horas === 0) return `${resto}min`
    return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`
}

function atualizarContagem(quantidade) {
    if (quantidade === 0) {
        contagem.textContent = "Nenhum filme na lista"
    } else if (quantidade === 1) {
        contagem.textContent = "1 filme na lista"
    } else {
        contagem.textContent = `${quantidade} filmes na lista`
    }
}

function mostrarAviso(mensagem) {
    const aviso = document.getElementById("aviso")
    aviso.textContent = mensagem
    aviso.classList.add("visivel")
    clearTimeout(aviso.timer)
    aviso.timer = setTimeout(() => aviso.classList.remove("visivel"), 3000)
}

function mostrarListaVazia() {
    lista.innerHTML = `
        <li class="estado">
            Nenhum filme na lista ainda.
            <a href="./cadastrar/cadastrar.html">Cadastre o primeiro</a>.
        </li>
    `
}

function criarIngresso(filme) {
    const classificacao = lerClassificacao(filme.ageLimit)

    return `
        <li class="ingresso" data-id="${filme.id}">
            <div class="ingresso-corpo">
                <p class="genero">${escaparHTML(filme.gender)}</p>
                <h2>${escaparHTML(filme.title)}</h2>
                <p class="duracao">${formatarDuracao(filme.duration)}</p>

                <div class="acoes">
                    <a class="acao" href="./editar/editar.html?id=${filme.id}">Editar</a>
                    <button class="acao apagar" type="button" data-id="${filme.id}">Apagar</button>
                </div>
            </div>

            <div class="ingresso-canhoto">
                <span class="classind ${classificacao.classe}" aria-hidden="true">${classificacao.sigla}</span>
                <span class="rotulo">${escaparHTML(classificacao.rotulo)}</span>
            </div>
        </li>
    `
}

async function buscarFilmes() {
    try {
        const resposta = await fetch(`${API}/all-movies`)
        if (!resposta.ok) throw new Error()

        const filmes = await resposta.json()
        atualizarContagem(filmes.length)

        if (filmes.length === 0) {
            mostrarListaVazia()
            return
        }

        lista.innerHTML = filmes.map(criarIngresso).join("")
    } catch {
        contagem.textContent = "Não foi possível carregar a lista"
        lista.innerHTML = `
            <li class="estado">
                Os filmes não carregaram. Confira se o backend está no ar e recarregue a página.
            </li>
        `
    }
}

// Apagar em dois cliques: o primeiro pede confirmação, o segundo apaga
async function apagarFilme(botao) {
    if (!botao.classList.contains("confirmando")) {
        botao.classList.add("confirmando")
        botao.textContent = "Confirmar exclusão"
        botao.timer = setTimeout(() => {
            botao.classList.remove("confirmando")
            botao.textContent = "Apagar"
        }, 4000)
        return
    }

    clearTimeout(botao.timer)
    botao.disabled = true
    botao.textContent = "Apagando..."

    try {
        const resposta = await fetch(`${API}/delete-movie/${botao.dataset.id}`, { method: "DELETE" })
        if (!resposta.ok) throw new Error()

        const ingresso = botao.closest(".ingresso")
        ingresso.classList.add("saindo")

        setTimeout(() => {
            ingresso.remove()
            const restantes = lista.querySelectorAll(".ingresso").length
            atualizarContagem(restantes)
            if (restantes === 0) mostrarListaVazia()
        }, 350)

        mostrarAviso("Filme apagado")
    } catch {
        botao.disabled = false
        botao.classList.remove("confirmando")
        botao.textContent = "Apagar"
        mostrarAviso("Não foi possível apagar o filme. Tente de novo.")
    }
}

lista.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".apagar")
    if (botao) apagarFilme(botao)
})

// Mostra o aviso quando a pessoa volta do cadastro ou da edição
const parametros = new URLSearchParams(window.location.search)
const avisos = {
    cadastrado: "Filme cadastrado",
    editado: "Alterações salvas"
}

if (avisos[parametros.get("aviso")]) {
    mostrarAviso(avisos[parametros.get("aviso")])
    history.replaceState(null, "", window.location.pathname)
}

buscarFilmes()