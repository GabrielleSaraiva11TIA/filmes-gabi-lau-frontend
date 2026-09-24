const API = "https://filmes-gabi-lau-backend.vercel.app"

const formulario = document.getElementById("formulario")
const erro = document.getElementById("erro")
const botaoEnviar = document.getElementById("enviar")

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault()
    erro.textContent = ""

    const filme = {
        title: document.getElementById("title").value.trim(),
        gender: document.getElementById("gender").value.trim(),
        duration: document.getElementById("duration").valueAsNumber,
        ageLimit: document.getElementById("ageLimit").value
    }

    if (!filme.title || !filme.gender || !filme.duration || !filme.ageLimit) {
        erro.textContent = "Preencha todos os campos para cadastrar o filme."
        return
    }

    botaoEnviar.disabled = true
    botaoEnviar.textContent = "Cadastrando..."

    try {
        const resposta = await fetch(`${API}/create-movie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filme)
        })

        if (!resposta.ok) throw new Error()

        window.location.href = "../index.html?aviso=cadastrado"
    } catch {
        erro.textContent = "O filme não foi cadastrado. Confira sua conexão e tente de novo."
        botaoEnviar.disabled = false
        botaoEnviar.textContent = "Cadastrar filme"
    }
})