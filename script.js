async function buscarFilmes() {
    const resposta = await fetch("https://filmes-gabi-lau-backend.vercel.app/all-movies")
    const filmes = await resposta.json()

    const lista = document.getElementById("lista-filmes")
    lista.innerHTML = ""

    filmes.forEach((filme) => {
        lista.innerHTML += `
            <li>
                <strong>${filme.title}</strong> (${filme.gender}) — ${filme.duration} min — Classificação: ${filme.ageLimit}
            </li>
        `
    })
}

buscarFilmes()