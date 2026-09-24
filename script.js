async function buscarFilmes() {
    const resposta = await fetch("https://filmes-gabi-lau-backend.vercel.app/all-movies")
    const filmes = await resposta.json()

    const lista = document.getElementById("lista-filmes")
    lista.innerHTML = ""

    filmes.forEach((filme) => {
    lista.innerHTML += `
        <li class="card">
            <h2>${filme.title}</h2>
            <p><span>Gênero:</span> ${filme.gender}</p>
            <p><span>Duração:</span> ${filme.duration} min</p>
            <p><span>Classificação:</span> ${filme.ageLimit}</p>
        </li>
    `
})
}
buscarFilmes()