const API = "https://filmes-gabi-lau-backend.vercel.app"

const formulario = document.getElementById("formulario")
const erro = document.getElementById("erro")
const botaoEnviar = document.getElementById("enviar")

const inputTitle = document.getElementById("title")
const inputGender = document.getElementById("gender")
const inputDuration = document.getElementById("duration")
const selectAgeLimit = document.getElementById("ageLimit")

const id = new URLSearchParams(window.location.search).get("id")

// Filmes antigos têm "16" ou "Livre"; o select usa "16 anos" e "Livre"
function paraOpcaoDoSelect(valor) {
    const texto = String(valor ?? "").trim()
    if (/livre/i.test(texto)) return "Livre"
    const idade = parseInt(texto, 10)
    return idade ? `${idade} anos` : ""
}

async function carregarFilme() {
    if (!id) {
        erro.textContent = "Nenhum filme foi escolhido. Volte para a lista e clique em Editar."
        return
    }

    try {
        // O backend não tem rota para buscar um filme só, então buscamos todos e filtramos
        const resposta = await fetch(`${API}/all-movies`)
        if (!resposta.ok) throw new Error()

        const filmes = await resposta.json()
        const filme = filmes.find((f) => String(f.id) === id)

        if (!filme) {
            erro.textContent = "Esse filme não existe mais. Ele pode ter sido apagado."
            return
        }

        inputTitle.value = filme.title
        inputGender.value = filme.gender
        inputDuration.value = filme.duration
        selectAgeLimit.value = paraOpcaoDoSelect(filme.ageLimit)

        botaoEnviar.disabled = false
        inputTitle.focus()
    } catch {
        erro.textContent = "Não foi possível carregar o filme. Recarregue a página."
    }
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault()
    erro.textContent = ""

    const filme = {
        title: inputTitle.value.trim(),
        gender: inputGender.value.trim(),
        duration: inputDuration.valueAsNumber,
        ageLimit: selectAgeLimit.value
    }

    if (!filme.title || !filme.gender || !filme.duration || !filme.ageLimit) {
        erro.textContent = "Preencha todos os campos para salvar."
        return
    }

    botaoEnviar.disabled = true
    botaoEnviar.textContent = "Salvando..."

    try {
        const resposta = await fetch(`${API}/update-movie/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filme)
        })

        if (!resposta.ok) throw new Error()

        window.location.href = "../index.html?aviso=editado"
    } catch {
        erro.textContent = "As alterações não foram salvas. Confira sua conexão e tente de novo."
        botaoEnviar.disabled = false
        botaoEnviar.textContent = "Salvar alterações"
    }
})

carregarFilme()