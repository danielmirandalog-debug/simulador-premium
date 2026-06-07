/* PROJETO: Compara taxa - Simulador Premium
   VERSÃO: Master V7.8 - Inclusão de Termos Automática e Padronização do Rodapé
*/

// 1. PROTEÇÃO E BLINDAGEM NATIVA DO SISTEMA
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
};

// 2. CONFIGURAÇÃO DE SEGURANÇA ADMINISTRATIVA
const SENHA_MESTRE = "Marcos2026";

function checarStatusManutencao() {
    const estado = localStorage.getItem("status_manutencao_ba21") || "online";
    const tela = document.getElementById("telaManutencao");
    
    if (estado === "manutencao") {
        if (tela) tela.style.display = "flex";
    } else {
        if (tela) tela.style.display = "none";
    }
}

function gerenciarPainelAdmin() {
    const senhaDigitada = prompt("Digite a senha mestre administrativa:");
    if (senhaDigitada === null) return;

    if (senhaDigitada === SENHA_MESTRE) {
        const estadoAtual = localStorage.getItem("status_manutencao_ba21") || "online";
        
        if (estadoAtual === "online") {
            if (confirm("Deseja ativar o MODO MANUTENÇÃO? Isso bloqueará o acesso ao simulador para a equipe.")) {
                localStorage.setItem("status_manutencao_ba21", "manutencao");
                alert("Modo manutenção ATIVADO com sucesso!");
                location.reload();
            }
        } else {
            if (confirm("Deseja desativar o MODO MANUTENÇÃO e liberar o acesso ao simulador?")) {
                localStorage.setItem("status_manutencao_ba21", "online");
                alert("O aplicativo está ONLINE novamente!");
                location.reload();
            }
        }
    } else {
        alert("Senha incorreta! Acesso negado.");
    }
}

// 3. MODAL E CONTADOR DE ACESSOS
function confirmarTermos() {
    const checkbox = document.getElementById("chk_termos_uso");
    if (checkbox && checkbox.checked) {
        document.getElementById("modalTermos").style.display = "none";
        localStorage.setItem("termos_aceitos_ba21", "sim");
    } else {
        alert("Para utilizar o simulador, você deve ler e aceitar os termos de uso.");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    checarStatusManutencao();

    const estadoAtual = localStorage.getItem("status_manutencao_ba21") || "online";
    if (estadoAtual === "manutencao") {
        return; 
    }

    const modalTermos = document.getElementById("modalTermos");
    if (modalTermos) modalTermos.style.display = "flex";
    
    gerarInputs();
    buscarCDI();
    
    if(document.getElementById("input_data")) {
        document.getElementById("input_data").value = new Date().toLocaleDateString('pt-BR');
    }
    
    let visitas = localStorage.getItem("contador_visitas") || 0;
    visitas++;
    localStorage.setItem("contador_visitas", visitas);
    if(document.getElementById("num_visitas")) {
        document.getElementById("num_visitas").innerText = visitas;
    }

    const cnpjInput = document.getElementById("input_cnpj");
    if(cnpjInput) {
        cnpjInput.addEventListener("input", function(e) {
            let x = e.target.value.replace(/\D/g, "").match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + (x[4] ? '/' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        });
    }
});

const IDs_SHARE = ["share_pix","share_debito","share_1x","share_2x","share_3x","share_4x","share_6x","share_10x"];

function gerarInputs() {
    let mpH = ""; 
    let outH = `<div style="grid-column: span 2; text-align: center; font-size: 11px; color: #888; font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed #eee;">⬅️ Esquerda: Visa/Master | Direita: Demais Bandeiras ➡️</div>`;
    
    for (let i = 2; i <= 18; i++) {
        mpH += `<span><label>${i}x (%)</label> <input id="mp${i}" type="number" step="0.01" class="input-mp"></span>`;
        outH += `<span>
                    <label>${i}x (%)</label>
                    <input id="out${i}_manual" type="number" step="0.01" class="input-out" style="width:100%; margin-top:5px;">
                 </span>
                 <span>
                    <label>${i}x Demais (%)</label>
                    <input id="out${i}_demais" type="number" step="0.01" class="input-out" style="width:100%; margin-top:5px;">
                 </span>`;
    }
    document.getElementById("mpParcelas").innerHTML = mpH;
    document.getElementById("outrasParcelas").innerHTML = outH;
}

async function buscarCDI() {
    try {
        const r = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');
        const d = await r.json();
        window.selicAtual = parseFloat(d[0].valor);
    } catch (e) { window.selicAtual = 10.75; }
}

function limparSecao(tipo) {
    if (tipo === 'mp') {
        document.getElementById("mp_pix").value = "0.49"; 
        document.getElementById("mp_debito").value = "0.99";
        document.getElementById("mp1").value = "3.05";
        document.querySelectorAll(".input-mp").forEach(i => i.value = "");
    } else if (tipo === 'out') {
        ["out_pix_manual","out_pix_demais","out_debito_manual","out_debito_demais","out1_manual","out1_demais"].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = "";
        });
        document.querySelectorAll(".input-out").forEach(i => i.value = "");
    } else if (tipo === 'share') {
        IDs_SHARE.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
        if(document.getElementById("faturamento")) document.getElementById("faturamento").value = "";
        if(document.getElementById("perc_demais_bandeiras")) document.getElementById("perc_demais_bandeiras").value = "10";
        atualizarBarra();
    } else if (tipo === 'fixos') {
        ["fixo_sistema","fixo_maquina","fixo_cesta","fixo_manutencao","vol_pix_app","taxa_pix_app"].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = "";
        });
    } else if (tipo === 'cofrinho') {
        if(document.getElementById("cofrinho_reserva")) document.getElementById("cofrinho_reserva").value = "";
        if(document.getElementById("cofrinho_cdi_alvo")) document.getElementById("cofrinho_cdi_alvo").value = "115";
    }
}

function simular() {
    let html = `<table class="tabela-moderna">
                    <tr>
                        <th>Plano</th>
                        <th>Mercado Pago</th>
                        <th>Conc. (Visa/Master)</th>
                        <th>Conc. (Demais)</th>
                    </tr>`;
    const bases = ["pix", "debito", "1"];
    bases.forEach(p => {
        let idMP = (p === "pix") ? "mp_pix" : (p === "debito" ? "mp_debito" : "mp1");
        let idOut = (p === "pix") ? "out_pix_manual" : (p === "debito" ? "out_debito_manual" : "out1_manual");
        let idOutDemais = (p === "pix") ? "out_pix_demais" : (p === "debito" ? "out_debito_demais" : "out1_demais");
        
        let tMP = parseFloat(document.getElementById(idMP).value) || 0;
        let tOut = parseFloat(document.getElementById(idOut).value) || 0;
        let tOutDemais = parseFloat(document.getElementById(idOutDemais).value) || 0;
        
        let nome = p === "pix" ? "Pix" : p === "debito" ? "Débito" : "1x";
        
        let clOut = 'taxaNormal';
        if (tOut > tMP) clOut = 'taxaRuim';
        else if (tOut < tMP) clOut = 'taxaBoa';

        let clDemais = 'taxaNormal';
        if (tOutDemais > tMP) clDemais = 'taxaRuim';
        else if (tOutDemais < tMP) clDemais = 'taxaBoa';

        html += `<tr>
                    <td><b>${nome}</b></td>
                    <td class="taxa-destaque" style="color:#333 !important;">${tMP.toFixed(2)}%</td>
                    <td class="taxa-destaque ${clOut}">${tOut.toFixed(2)}%</td>
                    <td class="taxa-destaque ${clDemais}">${tOutDemais.toFixed(2)}%</td>
                 </tr>`;
    });

    for (let i = 2; i <= 18; i++) {
        let valMP = document.getElementById("mp" + i).value;
        if (valMP !== "" && !isNaN(valMP)) {
            let tMP = parseFloat(valMP);
            let tOut = parseFloat(document.getElementById("out" + i + "_manual").value) || 0;
            let tOutDemais = parseFloat(document.getElementById("out" + i + "_demais").value) || 0;
            
            let clOut = 'taxaNormal';
            if (tOut > tMP) clOut = 'taxaRuim';
            else if (tOut < tMP) clOut = 'taxaBoa';

            let clDemais = 'taxaNormal';
            if (tOutDemais > tMP) clDemais = 'taxaRuim';
            else if (tOutDemais < tMP) clDemais = 'taxaBoa';
            
            html += `<tr>
                        <td><b>${i}x</b></td>
                        <td class="taxa-destaque" style="color:#333 !important;">${tMP.toFixed(2)}%</td>
                        <td class="taxa-destaque ${clOut}">${tOut.toFixed(2)}%</td>
                        <td class="taxa-destaque ${clDemais}">${tOutDemais.toFixed(2)}%</td>
                     </tr>`;
        }
    }
    html += "</table>";
    document.getElementById("resultado").innerHTML = html;
    document.getElementById("btnExportarSimples").style.display = "block";
}

function atualizarBarra() {
    let soma = 0;
    IDs_SHARE.forEach(id => {
        const el = document.getElementById(id);
        if(el) soma += parseFloat(el.value) || 0;
    });
    document.getElementById("contador").innerText = Math.round(soma) + "%";
    document.getElementById("barra").style.width = soma + "%";
    document.getElementById("barra").style.background = (Math.round(soma) === 100) ? "#4CAF50" : "#FFE600";
}

function simularFaturamento() {
    let soma = 0;
    IDs_SHARE.forEach(id => {
        const el = document.getElementById(id);
        if(el) soma += parseFloat(el.value) || 0;
    });
    if (Math.round(soma) !== 100) return alert("O Share total deve somar 100%!");
    
    const fatEl = document.getElementById("faturamento");
    let f = fatEl ? parseFloat(fatEl.value) || 0 : 0;
    if(f <= 0) return alert("Informe o faturamento mensal.");

    const pDemaisEl = document.getElementById("perc_demais_bandeiras");
    let pDemaisGeral = pDemaisEl ? parseFloat(pDemaisEl.value) || 0 : 10;
    if (isNaN(pDemaisGeral) || pDemaisGeral < 0) pDemaisGeral = 0;

    const getTaxaEl = (p, tipo, subTipo = 'manual') => {
        let sufixo = (subTipo === 'demais') ? '_demais' : '_manual';
        let id = (tipo === 'mp') ? (p === 'pix' ? 'mp_pix' : p === 'debito' ? 'mp_debito' : 'mp' + p) : 
                                  (p === 'pix' ? 'out_pix' + sufixo : p === 'debito' ? 'out_debito' + sufixo : 'out' + p + sufixo);
        return document.getElementById(id);
    };

    let custoMP = 0; let custoConc = 0;
    const shareMap = { pix: 'share_pix', debito: 'share_debito', 1: 'share_1x', 2: 'share_2x', 3: 'share_3x', 4: 'share_4x', 6: 'share_6x', 10: 'share_10x' };
    
    Object.keys(shareMap).forEach(p => {
        const elShare = document.getElementById(shareMap[p]);
        let percShare = elShare ? parseFloat(elShare.value) || 0 : 0;
        let valorFatia = f * (percShare / 100);
        
        let elMP = getTaxaEl(p, 'mp');
        let tMP = elMP ? parseFloat(elMP.value) || 0 : 0;
        custoMP += valorFatia * (tMP / 100);
        
        let elOutManual = getTaxaEl(p, 'out', 'manual');
        let elOutDemais = getTaxaEl(p, 'out', 'demais');
        
        let tOutManual = elOutManual ? parseFloat(elOutManual.value) || 0 : 0;
        let tOutDemais = elOutDemais ? parseFloat(elOutDemais.value) || 0 : 0;
        
        let pDemaisDoPlano = pDemaisGeral;
        if (tOutDemais === 0) pDemaisDoPlano = 0;
        let pVisaMasterDoPlano = 100 - pDemaisDoPlano;

        let valorVisaMaster = valorFatia * (pVisaMasterDoPlano / 100);
        let valorDemais = valorFatia * (pDemaisDoPlano / 100);
        
        custoConc += (valorVisaMaster * (tOutManual / 100)) + (valorDemais * (tOutDemais / 100));
    });

    let cSoftware = parseFloat(document.getElementById("fixo_sistema").value) || 0;
    let cMaquina = parseFloat(document.getElementById("fixo_maquina").value) || 0;
    let cCesta = parseFloat(document.getElementById("fixo_cesta").value) || 0;
    let cManutencao = parseFloat(document.getElementById("fixo_manutencao").value) || 0;
    let volPixApp = parseFloat(document.getElementById("vol_pix_app").value) || 0;
    let taxaPixApp = parseFloat(document.getElementById("taxa_pix_app").value) || 0;
    let cPixApp = volPixApp * (taxaPixApp / 100);

    let totalFixos = cSoftware + cMaquina + cCesta + cManutencao + cPixApp;
    custoConc += totalFixos;

    let ecoMes = custoConc - custoMP;
    
    const resMesalEl = document.getElementById("cofrinho_reserva");
    let resMensal = resMesalEl ? parseFloat(resMesalEl.value) || 0 : 0;
    
    const cdiAlvoEl = document.getElementById("cofrinho_cdi_alvo");
    let cdiAlvoVal = cdiAlvoEl ? parseFloat(cdiAlvoEl.value) || 115 : 115;
    
    let cdiAnual = (window.selicAtual || 10.75) - 0.10;
    let alvoPerc = cdiAlvoVal / 100;

    const calcInvestimento = (meses) => {
        let saldoAtual = 0; let lucroBrutoAcumulado = 0;
        let taxaMensalBase = Math.pow((1 + (cdiAnual / 100)), (1/12)) - 1;
        for(let i=1; i<=meses; i++){
            let taxaAplicada = (saldoAtual <= 10000) ? (taxaMensalBase * alvoPerc) : (saldoAtual <= 100000 ? taxaMensalBase : 0);
            let rendimentoDoMes = saldoAtual * taxaAplicada;
            lucroBrutoAcumulado += rendimentoDoMes;
            saldoAtual += rendimentoDoMes + resMensal;
        }
        let aliquotaIR = meses <= 6 ? 0.225 : (meses <= 12 ? 0.20 : (meses <= 24 ? 0.175 : 0.15));
        return saldoAtual - (lucroBrutoAcumulado * aliquotaIR);
    };

    window.dadosRelatorioAnalitico = {
        faturamento: f, aporte: resMensal, cdiAlvo: cdiAlvoVal,
        itensOcultos: { "Software": cSoftware, "Aluguel": cMaquina, "Cesta Bancária": cCesta, "Manutenção": cManutencao, "Pix App Bancário": cPixApp }
    };

    document.getElementById("resultadoFaturamento").innerHTML = `
        <div class="resumo-financeiro" style="background:#f9f9f9; padding:15px; border-radius:10px; border:1px solid #ddd; margin-top:15px;">
            <h4 style="margin-top:0">💰 Rentabilidade Real Individualizada</h4>
            <b>Economia Mensal:</b> <span style="color:${ecoMes > 0 ? '#007bff' : 'red'}; font-size:16px; font-weight:bold">R$ ${ecoMes.toFixed(2)}</span><br>
            <b>Economia em 1 Ano:</b> R$ ${(ecoMes * 12).toFixed(2)}<hr>
            <h4>📈 Projeção Cofrinho (Líquido)</h4>
            <b>Aporte: R$ ${resMensal.toFixed(2)} / mês</b><br>
            <b>Saldo 1 Ano:</b> R$ ${calcInvestimento(12).toFixed(2)}<br>
            <b>Saldo 5 Anos:</b> R$ ${calcInvestimento(60).toFixed(2)}
        </div>`;

const chartBox = document.getElementById("cont_grafico");
    if(chartBox) chartBox.style.display = "block";

    if (window.g) window.g.destroy();
    window.g = new Chart(document.getElementById("graficoEconomia"), {
        type: 'bar',
        data: { labels: ["Eco. 1 Ano", "Eco. 5 Anos", "Cofre 5 Anos"], datasets: [{ label: 'R$', data: [ecoMes*12, ecoMes*60, calcInvestimento(60)], backgroundColor: ['#FFE600','#FFD400','#3483FA'] }] },
        options: { animation: false, plugins: { legend: { display: false } }, maintainAspectRatio: true }
    });

    // ==================================================================
    // 💎 COLETAR DADOS PARA INSTÂNCIAS DOS GRÁFICOS DE PIZZA (SHARE)
    // ==================================================================
    const sharePix = parseFloat(document.getElementById('share_pix').value) || 0;
    const shareDebito = parseFloat(document.getElementById('share_debito').value) || 0;
    const share1x = parseFloat(document.getElementById('share_1x').value) || 0;
    
    const shareParcelado = (
        (parseFloat(document.getElementById('share_2x').value) || 0) +
        (parseFloat(document.getElementById('share_3x').value) || 0) +
        (parseFloat(document.getElementById('share_4x').value) || 0) +
        (parseFloat(document.getElementById('share_6x').value) || 0) +
        (parseFloat(document.getElementById('share_10x').value) || 0)
    );

    const percVisaMaster = 100 - pDemaisGeral;

    if (window.chartShareParcelado) window.chartShareParcelado.destroy();
    if (window.chartShareBandeiras) window.chartShareBandeiras.destroy();

    // 1. Gráfico de Parcelados com Porcentagem Direta nas Legendas
    const ctxParcelado = document.getElementById('graficoShareParcelado').getContext('2d');
    window.chartShareParcelado = new Chart(ctxParcelado, {
        type: 'pie',
        data: {
            labels: [`Pix: ${sharePix.toFixed(1)}%`, `Débito: ${shareDebito.toFixed(1)}%`, `Crédito 1x: ${share1x.toFixed(1)}%`, `Parcelado: ${shareParcelado.toFixed(1)}%`],
            datasets: [{
                data: [sharePix, shareDebito, share1x, shareParcelado],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
    });

    // 2. Gráfico de Bandeiras com Porcentagem Direta nas Legendas
    const ctxBandeiras = document.getElementById('graficoShareBandeiras').getContext('2d');
    window.chartShareBandeiras = new Chart(ctxBandeiras, {
        type: 'pie',
        data: {
            labels: [`Visa / Master: ${percVisaMaster.toFixed(1)}%`, `Outras: ${pDemaisGeral.toFixed(1)}%`],
            datasets: [{
                data: [percVisaMaster, pDemaisGeral],
                backgroundColor: ['#0056b3', '#FFE600'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
    });
}
function salvarNoHistorico() {
    const inputs = document.querySelectorAll("input");
    const snapshot = {};
    inputs.forEach(i => { if(i.id) snapshot[i.id] = i.value; });
    const dados = { id: Date.now(), seller: document.getElementById("input_loja").value || "Sem Nome", cnpj: document.getElementById("input_cnpj").value || "", responsavel: document.getElementById("input_cliente").value, executivo: document.getElementById("input_executivo").value, data: new Date().toLocaleString(), snapshot: snapshot };
    let historico = JSON.parse(localStorage.getItem("historico_simulacoes") || "[]");
    historico.push(dados);
    localStorage.setItem("historico_simulacoes", JSON.stringify(historico));
    alert("Simulação arquivada com sucesso!");
}

function consultarHistorico() {
    const termoOriginal = prompt("Busque por Seller, CNPJ, Responsável ou Data:");
    if (termoOriginal === null) return;
    
    const termo = termoOriginal.toLowerCase().trim();
    const termoSomenteNumeros = termo.replace(/\D/g, "");
    let historico = JSON.parse(localStorage.getItem("historico_simulacoes") || "[]");
    
    let filtrados = historico.filter(h => {
        const cnpjGuardadoNumeros = h.cnpj ? h.cnpj.replace(/\D/g, "") : "";
        return (termoSomenteNumeros !== "" && cnpjGuardadoNumeros.includes(termoSomenteNumeros)) || h.seller.toLowerCase().includes(termo) || (h.responsavel && h.responsavel.toLowerCase().includes(termo)) || h.data.includes(termo);
    });

    if (filtrados.length === 0) return alert("Nenhum registro encontrado.");
    
    let msg = "Registros encontrados (digite o número para recuperar):\n\n";
    filtrados.forEach((f, i) => msg += `${i+1}. ${f.seller} ${f.cnpj ? '['+f.cnpj+']' : ''} (${f.data})\n`);
    
    const choice = prompt(msg);
    if (choice > 0 && choice <= filtrados.length) {
        const item = filtrados[choice-1].snapshot;
        for (let id in item) { 
            let el = document.getElementById(id); 
            if (el) el.value = item[id]; 
        }
        atualizarBarra();
        alert("Dados carregados!");
    }
}

function exportarBackupJSON() {
    let historico = localStorage.getItem("historico_simulacoes");
    if (!historico || historico === "[]") return alert("Seu histórico local está vazio.");
    
    let blob = new Blob([historico], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let linkLink = document.createElement("a");
    linkLink.href = url;
    linkLink.download = `BACKUP_PROPOSTAS_BA21_${new Date().toISOString().slice(0,10)}.json`;
    linkLink.click();
    alert("Arquivo de backup geral baixado com sucesso!");
}

function importarBackupJSON(event) {
    const file = event.target.files[0]; if (!file) return;
    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            let dadosImportados = JSON.parse(e.target.result);
            if (!Array.isArray(dadosImportados)) throw new Error();
            let historicoLocal = JSON.parse(localStorage.getItem("historico_simulacoes") || "[]");
            let idsExistentes = new Set(historicoLocal.map(item => item.id));
            let novosItensContador = 0;

            dadosImportados.forEach(item => {
                if (!idsExistentes.has(item.id)) { historicoLocal.push(item); novosItensContador++; }
            });

            localStorage.setItem("historico_simulacoes", JSON.stringify(historicoLocal));
            alert(`Sucesso! ${novosItensContador} novas propostas foram mescladas ao seu histórico.`);
            location.reload();
        } catch (erro) { alert("Erro ao ler o arquivo. Use um arquivo .json válido gerado pelo app."); }
    };
    leitor.readAsText(file);
}

function exportarRelatorio(apenasTaxas) {
    document.getElementById("rel_loja").innerText = document.getElementById("input_loja").value || "---";
    document.getElementById("rel_cliente").innerText = document.getElementById("input_cliente").value || "---";
    document.getElementById("rel_executivo").innerText = document.getElementById("input_executivo").value || "---";
    document.getElementById("rel_data").innerText = document.getElementById("input_data").value;
    document.getElementById("rel_tabela_taxas").innerHTML = "<h3>Comparativo de Taxas</h3>" + document.getElementById("resultado").innerHTML;
    let boxCorpo = document.getElementById("rel_share_cofrinho");
    let boxGrafico = document.getElementById("rel_grafico_box");
    let boxInfoAdicional = document.getElementById("rel_info_adicional");
    
    // TEXTO DE INFORMAÇÕES ADICIONAIS AUTOMÁTICO (SEMPRE INCLUSO)
    const textoCompleto = `<b>Informações adicionais:</b>\n➡️ Máquina sem aluguel\n➡️ Opção de TEF\n➡️ Mesma taxa para todas as bandeiras\n➡️ CONTA NEGÓCIO: sem anuidade e sem taxas administrativas\n➡️ PARCELAMENTO ATÉ 18x NA POINT\n➡️ Link de pagamento com "recebimento na hora" (mesma taxa da maquininha)\n➡️ Rendimentos diários no cofrinho (até 120% CDI)\n➡️ PASSOU O CARTÃO, RECEBIMENTO IMEDIATO! (inclusive finais de semana e feriados)\n➡️ FÁCIL ACESSO AO APP\n➡️ TAXAS FINAIS SEM SURPRESAS (antecipação inclusa)\n➡️ Consultoria de vendas no Mercado Livre e Sistema de Gestão completo e gratuito (consulte condições)\n⏳ Simulação com validade de 07 dias.`;
    
    if(boxInfoAdicional) {
        boxInfoAdicional.style.display = "block";
        boxInfoAdicional.innerHTML = textoCompleto;
    }
    if (!apenasTaxas) {
        if(boxCorpo) boxCorpo.style.display = "block"; 
        if(boxGrafico) boxGrafico.style.display = "block";
        let v = window.dadosRelatorioAnalitico;
        if(v) {
            let htmlCustos = "";
            for (let label in v.itensOcultos) { if(v.itensOcultos[label] > 0) htmlCustos += `• ${label}: R$ ${v.itensOcultos[label].toFixed(2)}<br>`; }
            boxCorpo.innerHTML = `<div style="background:#f4f4f4; padding:20px; border-radius:15px; margin-bottom:20px; border:1px solid #ddd"><b>RESUMO DA ANÁLISE:</b><br>Faturamento: R$ ${v.faturamento.toLocaleString()}<br>Aporte Cofrinho: R$ ${v.aporte.toLocaleString()} / mês (CDI: ${v.cdiAlvo}%)<br><br><b style="color:#d32f2f">DETALHAMEMENTO DE CUSTOS CONCORRÊNCIA:</b><br>${htmlCustos || "• Nenhum custo fixo informado."}</div><h3>Rentabilidade e Projeção</h3>` + document.getElementById("resultadoFaturamento").innerHTML;
        }
if (window.g && document.getElementById("img_grafico")) {
            document.getElementById("img_grafico").src = document.getElementById("graficoEconomia").toDataURL();
        }
        if (window.chartShareParcelado && document.getElementById("img_grafico_parcelado")) {
            document.getElementById("img_grafico_parcelado").src = document.getElementById("graficoShareParcelado").toDataURL();
        }
        if (window.chartShareBandeiras && document.getElementById("img_grafico_bandeiras")) {
            document.getElementById("img_grafico_bandeiras").src = document.getElementById("graficoShareBandeiras").toDataURL();
        }
    } else { if(boxCorpo) boxCorpo.style.display = "none"; if(boxGrafico) boxGrafico.style.display = "none"; }
    setTimeout(() => { html2canvas(document.getElementById("areaRelatorio"), { scale: 3, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => { let link = document.createElement("a"); link.download = `BA21_PROPOSTA_${document.getElementById("input_loja").value}.png`; link.href = canvas.toDataURL("image/png", 1.0); link.click(); }); }, 800);
}

function abrirCalculadoraPremium() {
    const box = document.getElementById('boxDescobreTaxa');
    if (box.style.display === 'none' || box.style.display === '') {
        box.style.display = 'block';
        document.getElementById('chaveCalculadora').checked = false;
        alternarModoCalculadora();
    } else {
        box.style.display = 'none';
    }
}

function alternarModoCalculadora() {
    const chave = document.getElementById('chaveCalculadora');
    const labelCobrar = document.getElementById('labelModoCobrar');
    const labelReceber = document.getElementById('labelModoReceber');
    const textoResultadoTopo = document.getElementById('textoResultadoTopo');
    const resultadoBox = document.getElementById('resultadoCalculadoraBox');
    const valorResultadoFinal = document.getElementById('valorResultadoFinal');
    
    const sliderBack = document.getElementById('sliderBack');
    const sliderBall = document.getElementById('sliderBall');

    limparCamposCalculadora();

    if (chave.checked) {
        // 💰 MODO RECEBER (Reverso)
        labelCobrar.style.color = '#94a3b8';
        labelReceber.style.color = '#10b981';
        sliderBack.style.backgroundColor = '#10b981';
        sliderBall.style.transform = 'translateX(24px)';
        
        textoResultadoTopo.innerText = 'O Seller deve Cobrar do Cliente (Bruto):';
        textoResultadoTopo.style.color = '#065f46';
        resultadoBox.style.backgroundColor = '#ecfdf5';
        resultadoBox.style.borderColor = '#a7f3d0';
        valorResultadoFinal.style.color = '#047857';
    } else {
        // 🛒 MODO COBRAR (Direto)
        labelCobrar.style.color = '#0056b3';
        labelReceber.style.color = '#94a3b8';
        sliderBack.style.backgroundColor = '#0056b3';
        sliderBall.style.transform = 'translateX(0px)';
        
        textoResultadoTopo.innerText = 'O Seller receberá Líquido:';
        textoResultadoTopo.style.color = '#1e40af';
        resultadoBox.style.backgroundColor = '#eff6ff';
        resultadoBox.style.borderColor = '#bfdbfe';
        valorResultadoFinal.style.color = '#1d4ed8';
    }
}

function ejecutarCalculoCalculadora(origem) {
    const chave = document.getElementById('chaveCalculadora').checked;
    
    let bruto = parseFloat(document.getElementById('calc_bruto').value) || 0;
    let liquido = parseFloat(document.getElementById('calc_liquido').value) || 0;
    let taxa = parseFloat(document.getElementById('calc_taxa').value) || 0;
    
    const textoResultadoTopo = document.getElementById('textoResultadoTopo');
    const valorResultadoFinal = document.getElementById('valorResultadoFinal');

    if (!chave) {
        // 🛒 MODO COBRAR (Cálculos Diretos)
        if (origem === 'bruto' || origem === 'taxa') {
            if (bruto > 0 && taxa >= 0) {
                let resLiquido = bruto - (bruto * (taxa / 100));
                document.getElementById('calc_liquido').value = resLiquido.toFixed(2);
                textoResultadoTopo.innerText = 'O Seller receberá Líquido:';
                valorResultadoFinal.innerText = resLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
        } else if (origem === 'liquido') {
            if (bruto > 0 && liquido > 0) {
                if (liquido > bruto) {
                    valorResultadoFinal.innerText = 'Líquido maior que Bruto';
                    return;
                }
                let resTaxa = ((bruto - liquido) / bruto) * 100;
                document.getElementById('calc_taxa').value = resTaxa.toFixed(2);
                textoResultadoTopo.innerText = 'Taxa de Juros Descoberta:';
                valorResultadoFinal.innerText = resTaxa.toFixed(2) + '%';
            }
        }
    } else {
        // 💰 MODO RECEBER (Cálculos Reversos)
        if (origem === 'liquido' || origem === 'taxa') {
            if (liquido > 0 && taxa >= 0) {
                if (taxa >= 100) {
                    valorResultadoFinal.innerText = 'Taxa Inválida';
                    return;
                }
                let resBruto = liquido / (1 - (taxa / 100));
                document.getElementById('calc_bruto').value = resBruto.toFixed(2);
                textoResultadoTopo.innerText = 'O Seller deve Cobrar do Cliente (Bruto):';
                valorResultadoFinal.innerText = resBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
        } else if (origem === 'bruto') {
            if (bruto > 0 && liquido > 0) {
                if (liquido > bruto) {
                    valorResultadoFinal.innerText = 'Líquido maior que Bruto';
                    return;
                }
                let resTaxa = ((bruto - liquido) / bruto) * 100;
                document.getElementById('calc_taxa').value = resTaxa.toFixed(2);
                textoResultadoTopo.innerText = 'Taxa de Juros Descoberta:';
                valorResultadoFinal.innerText = resTaxa.toFixed(2) + '%';
            }
        }
    }
}

function limparCamposCalculadora() {
    document.getElementById('calc_bruto').value = '';
    document.getElementById('calc_liquido').value = '';
    document.getElementById('calc_taxa').value = '';
    
    const chave = document.getElementById('chaveCalculadora').checked;
    const textoResultadoTopo = document.getElementById('textoResultadoTopo');
    
    if (chave) {
        textoResultadoTopo.innerText = 'O Seller deve Cobrar do Cliente (Bruto):';
    } else {
        textoResultadoTopo.innerText = 'O Seller receberá Líquido:';
    }
    document.getElementById('valorResultadoFinal').innerText = 'R$ 0,00';
}
async function processarOCR(event, pref) {
    const file = event.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const worker = await Tesseract.createWorker('por');
        await worker.setParameters({ tessedit_char_whitelist: '0123456789xX,.-% ' });
        const res = await worker.recognize(e.target.result);
        let workerLetras = await Tesseract.createWorker('por');
        let resCompleto = await workerLetras.recognize(e.target.result);
        let textoNum = res.data.text.replace(/,/g, ".");
        
        if (pref === 'mp') {
            let regex = /(\d{1,2})x\s*([\d.]+)/g; let match;
            while ((match = regex.exec(textoNum)) !== null) {
                let p = parseInt(match[1]), t = parseFloat(match[2]);
                if (p >= 1 && p <= 18) {
                    let id = (p === 1) ? "mp1" : ("mp" + p);
                    if(document.getElementById(id)) document.getElementById(id).value = t.toFixed(2);
                }
            }
            let lines = textoNum.split('\n');
            for(let i=0; i<lines.length; i++){
                if(lines[i].toLowerCase().includes("déb") || lines[i].toLowerCase().includes("deb")){
                    let m = lines[i].match(/[\d.]+/);
                    if(m) document.getElementById("mp_debito").value = parseFloat(m[0]).toFixed(2);
                }
                if(lines[i].toLowerCase().includes("pix")){
                    let m = lines[i].match(/[\d.]+/);
                    if(m) document.getElementById("mp_pix").value = parseFloat(m[0]).toFixed(2);
                }
            }
            await worker.terminate(); await workerLetras.terminate(); return; 
        }

        const palavras = resCompleto.data.words;
        palavras.forEach(w => {
            let textoPalavra = w.text.toLowerCase().replace(/,/g, ".");
            if(/^[0-9]+(\.[0-9]+)?%?$/.test(textoPalavra)){
                let valorTaxa = parseFloat(textoPalavra.replace('%', ''));
                let centroX = w.bbox.x0 + ((w.bbox.x1 - w.bbox.x0) / 2);
                let larguraImagemTotal = resCompleto.data.image ? resCompleto.data.image.width : 1000;
                let subCampo = (centroX < (larguraImagemTotal / 2)) ? 'manual' : 'demais';
                let linhaTextoProxima = w.line ? w.line.text.toLowerCase() : '';
                
                if (linhaTextoProxima.includes('déb') || linhaTextoProxima.includes('deb')) {
                    if(document.getElementById('out_debito_' + subCampo)) document.getElementById('out_debito_' + subCampo).value = valorTaxa.toFixed(2);
                } else if (linhaTextoProxima.includes('1x')) {
                    if(document.getElementById('out1_' + subCampo)) document.getElementById('out1_' + subCampo).value = valorTaxa.toFixed(2);
                } else if (linhaTextoProxima.includes('pix')) {
                    if(document.getElementById('out_pix_' + subCampo)) document.getElementById('out_pix_' + subCampo).value = valorTaxa.toFixed(2);
                } else {
                    let matchParcela = linhaTextoProxima.match(/(\d{1,2})x/);
                    if(matchParcela){
                        let p = parseInt(matchParcela[1]);
                        if(p >= 2 && p <= 18){
                            if(document.getElementById('out' + p + '_' + subCampo)) document.getElementById('out' + p + '_' + subCampo).value = valorTaxa.toFixed(2);
                        }
                    }
                }
            }
        });
        await worker.terminate(); await workerLetras.terminate();
    };
    reader.readAsDataURL(file);
}
