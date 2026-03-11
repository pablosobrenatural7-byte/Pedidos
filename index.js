// Gerenciamento da URL da API
let API_BASE_URL = localStorage.getItem("API_URL") || "https://sua-url-padrao.ngrok-free.app";

// Elementos da UI
const areaPublica = document.getElementById("area-publica");
const areaAdmin = document.getElementById("area-admin");
const modalLogin = document.getElementById("modal-login");
const corpoTabela = document.getElementById("corpo-tabela-publica");

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("input-ngrok-url").value = API_BASE_URL;
    carregarPrecos();
    verificarSessao();
});

// --- COMUNICAÇÃO COM O BACKEND ---

// Carregar tabela (Público - Não precisa de Token)
async function carregarPrecos() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/precos`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        const dados = await res.json();
        renderizarTabela(dados);
    } catch (erro) {
        corpoTabela.innerHTML = `<tr><td colspan="2">Servidor offline ou URL do ngrok desatualizada.</td></tr>`;
    }
}

// Fazer Login (Envia Admin:132465As@ pro backend, recebe JWT)
document.getElementById("btn-logar").addEventListener("click", async () => {
    const user = document.getElementById("login-user").value;
    const pass = document.getElementById("login-pass").value;
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ username: user, password: pass })
        });

        if (res.ok) {
            const dados = await res.json();
            // Salva o JWT no navegador de forma segura
            localStorage.setItem("token_jwt", dados.token);
            fecharModal();
            verificarSessao();
        } else {
            document.getElementById("msg-erro").innerText = "Credenciais inválidas!";
        }
    } catch (e) {
        document.getElementById("msg-erro").innerText = "Erro ao conectar com o servidor.";
    }
});

// Adicionar/Editar Item (Requer JWT)
document.getElementById("btn-salvar-item").addEventListener("click", async () => {
    const nome = document.getElementById("input-nome").value;
    const preco = document.getElementById("input-preco").value;
    const token = localStorage.getItem("token_jwt");

    await fetch(`${API_BASE_URL}/api/precos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Passa o token de segurança
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ nome: nome, preco: parseFloat(preco) })
    });
    alert("Salvo com sucesso!");
    carregarPrecos();
});

// Alterar URL do Ngrok pelo Painel
document.getElementById("btn-salvar-url").addEventListener("click", () => {
    const novaUrl = document.getElementById("input-ngrok-url").value;
    localStorage.setItem("API_URL", novaUrl);
    API_BASE_URL = novaUrl;
    alert("URL do Backend atualizada localmente!");
    carregarPrecos();
});

// --- UTILIDADES ---
function renderizarTabela(dados) {
    corpoTabela.innerHTML = "";
    dados.forEach(item => {
        corpoTabela.innerHTML += `<tr><td>${item.nome}</td><td>R$ ${item.preco.toFixed(2)}</td></tr>`;
    });
}

function verificarSessao() {
    if (localStorage.getItem("token_jwt")) {
        areaAdmin.classList.remove("escondido");
        document.getElementById("btn-abrir-login").classList.add("escondido");
    } else {
        areaAdmin.classList.add("escondido");
        document.getElementById("btn-abrir-login").classList.remove("escondido");
    }
}

// Botões de Modal e Logout
document.getElementById("btn-abrir-login").addEventListener("click", () => modalLogin.classList.remove("escondido"));
document.getElementById("btn-fechar-login").addEventListener("click", fecharModal);
document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("token_jwt");
    verificarSessao();
});
function fecharModal() { modalLogin.classList.add("escondido"); document.getElementById("msg-erro").innerText = ""; }