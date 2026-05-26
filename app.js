/* PROJETO: Compara taxa - Simulador Premium
   VERSÃO: Master V6 - Calculadora Reversa Completa (Bruto vs Líquido)
*/

// 1. PROTEÇÃO E BLINDAGEM
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
};

// 2. MODAL E CONTADOR
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
    document.getElementById("modalTermos").style.display = "flex";
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
});

const IDs_SHARE = ["share_pix","share_debito","share_1x","share_2x","share_3x","share_4x","share_6x","share_10x"];

function gerarInputs() {
    let mpH = ""; let outH = "";
    for (let i = 2; i <= 18; i++) {
        mpH += `<span><label>${i}x (%)</label> <input id="mp${i}" type="number" step="0.01" class="input-mp"></span>`;
        outH += `<span style="display:flex; flex-direction:column; gap:2px;">
                    <label>${i}x (%)</label> 
                    <input id="out${i}_manual" type="number" step="0.01" class="input-out" placeholder="Visa/Master" style="margin:2px 0;">
                    <input id="out${i}_demais" type="number" step="0.01" class="input-out" placeholder="Demais">
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
        IDs_SHARE.forEach(id => document.getElementById(id).value = "");
        if(document.getElementById("faturamento")) document.getElementById("faturamento").value = "";
        if(document.getElementById("perc_demais_bandeiras")) document.getElementById("perc_demais_bandeiras").value = "10";
        atualizarBarra();
    } else if (tipo === 'fixos') {
        ["fixo_sistema","fixo_maquina","fixo_cesta","fixo_manutencao","vol_pix_app","taxa_pix_app"].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = "";
        });
    } else if (tipo === 'cofrinho') {
        document.getElementById("cofrinho_reserva").value = "";
        document.getElementById("cofrinho_cdi_alvo").value = "115";
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
        
        let clOut = tOut > tMP ? 'taxaRuim' : '';
        let clDemais = tOutDemais > tMP ? 'taxaRuim' : '';
        let classeFinalMP = (tMP <= tOut || tMP <= tOutDemais) ? 'taxaBoa' : 'taxaRuim';

        html += `<tr>
                    <td><b>${nome}</b></td>
                    <td class="taxa-destaque ${classeFinalMP}">${tMP.toFixed(2)}%</td>
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
            
            let clOut = tOut > tMP ? 'taxaRuim' : '';
            let clDemais = tOutDemais > tMP ? 'taxaRuim' : '';
            let classeFinalMP = (tMP <= tOut || tMP <= tOutDemais) ? 'taxaBoa' : 'taxaRuim';
            
            html += `<tr>
                        <td><b>${i}x</b></td>
                        <td class="taxa-destaque ${classeFinalMP}">${tMP.toFixed(2)}%</td>
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
    IDs_SHARE.forEach(id => soma += parseFloat(document.getElementById(id).value) || 0);
    document.getElementById("contador").innerText = Math.round(soma) + "%";
    document.getElementById("barra").style.width = soma + "%";
    document.getElementById("barra").style.background = (Math.round(soma) === 100) ? "#4CAF50" : "#FFE600";
}

function simularFaturamento() {
    let soma = 0;
    IDs_SHARE.forEach(id => soma += parseFloat(document.getElementById(id).value) || 0);
    if (Math.round(soma) !== 100) return alert("O Share total deve somar 100%!");
    let f = parseFloat(faturamento.value) || 0;
    if(f <= 0) return alert("Informe o faturamento mensal.");

    let pDemais = parseFloat(document.getElementById("perc_demais_bandeiras").value);
    if (isNaN(pDemais)) pDemais = 0;
    let pVisaMaster = 100 - pDemais;

    const getTaxa = (p, tipo, subTipo = 'manual') => {
        let sufixo = (subTipo === 'demais') ? '_demais' : '_manual';
        let id = (tipo === 'mp') ? (p === 'pix' ? 'mp_pix' : p === 'debito' ? 'mp_debito' : 'mp' + p) : 
                                  (p === 'pix' ? 'out_pix' + sufixo : p === 'debito' ? 'out_debito' + sufixo : 'out' + p + sufixo);
        let el = document.getElementById(id);
        return el ? parseFloat(el.value) || 0 : 0;
    };

    let custoMP = 0; let custoConc = 0;
    const shareMap = { pix: 'share_pix', debito: 'share_debito', 1: 'share_1x', 2: 'share_2x', 3: 'share_3x', 4: 'share_4x', 6: 'share_6x', 10: 'share_10x' };
    
    Object.keys(shareMap).forEach(p => {
        let percShare = parseFloat(document.getElementById(shareMap[p]).value) || 0;
        let valorFatia = f * (percShare / 100);
        
        custoMP += valorFatia * (getTaxa(p, 'mp') / 100);
        
        let valorVisaMaster = valorFatia * (pVisaMaster / 100);
        let valorDemais = valorFatia * (pDemais / 100);
        
        custoConc += (valorVisaMaster * (getTaxa(p, 'out', 'manual') / 100)) + 
                     (valorDemais * (getTaxa(p, 'out', 'demais') / 100));
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
    let resMensal = parseFloat(cofrinho_reserva.value) || 0;
    let cdiAnual = (window.selicAtual || 10.75) - 0.10;
    let alvoPerc = (parseFloat(cofrinho_cdi_alvo.value) || 115) / 100;

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
        faturamento: f, aporte: resMensal, cdiAlvo: parseFloat(cofrinho_cdi_alvo.value) || 115,
        itensOcultos: { "Software": cSoftware, "Aluguel": cMaquina, "Cesta Bancária": cCesta, "Manutenção": cManutencao, "Pix App Bancário": cPixApp }
    };

    document.getElementById("resultadoFaturamento").innerHTML = `
        <div class="resumo-financeiro" style="background:#f9f9f9; padding:15px; border-radius:10px; border:1px solid #ddd; margin-top:15px;">
            <h4 style="margin-top:0">💰 Rentabilidade Real Individualizada</h4>
            <small style="color:#666; display:block; margin-bottom:10px;">Simulação considerando ${pDemais}% em Demais Bandeiras na concorrência.</small>
            <b>Economia Mensal:</b> <span style="color:${ecoMes > 0 ? '#007bff' : 'red'}; font-size:16px; font-weight:bold">R$ ${ecoMes.toFixed(2)}</span><br>
            <b>Economia em 1 Ano:</b> R$ ${(ecoMes * 12).toFixed(2)}<hr>
            <h4>📈 Projeção Cofrinho (Líquido)</h4>
            <b>Aporte: R$ ${resMensal.toFixed(2)} / mês</b><br>
            <b>Saldo 1 Ano:</b> R$ ${calcInvestimento(12).toFixed(2)}<br>
            <b>Saldo 5 Anos:</b> R$ ${calcInvestimento(60).toFixed(2)}
        </div>`;

    if (window.g) window.g.destroy();
    window.g = new Chart(document.getElementById("graficoEconomia"), {
        type: 'bar',
        data: { labels: ["Eco. 1 Ano", "Eco. 5 Anos", "Cofre 5 Anos"], datasets: [{ label: 'R$', data: [ecoMes*12, ecoMes*60, calcInvestimento(60)], backgroundColor: ['#FFE600','#FFD400','#3483FA'] }] },
        options: { animation: false }
    });
}

function salvarNoHistorico() {
    const inputs = document.querySelectorAll("input");
    const snapshot = {};
    inputs.forEach(i => { if(i.id) snapshot[i.id] = i.value; });
    const dados = { id: Date.now(), seller: document.getElementById("input_loja").value || "Sem Nome", responsavel: document.getElementById("input_cliente").value, executivo: document.getElementById("input_executivo").value, data: new Date().toLocaleString(), snapshot: snapshot };
    let historico = JSON.parse(localStorage.getItem("historico_simulacoes") || "[]");
    historico.push(dados);
    localStorage.setItem("historico_simulacoes", JSON.stringify(historico));
    alert("Simulação arquivada com sucesso!");
}

function consultingHistorico() { /* Mapeado para consultarHistorico */ consultarHistorico(); }
function consultarHistorico() {
    const termo = prompt("Busque por Seller, Responsável ou Data:").toLowerCase();
    if (termo === null) return;
    let historico = JSON.parse(localStorage.getItem("historico_simulacoes") || "[]");
    let filtrados = historico.filter(h => h.seller.toLowerCase().includes(termo) || (h.responsavel && h.responsavel.toLowerCase().includes(termo)) || h.data.includes(termo));
    if (filtrados.length === 0) return alert("Nenhum registro encontrado.");
    let msg = "Registros encontrados (digite o número para recuperar):\n\n";
    filtrados.forEach((f, i) => msg += `${i+1}. ${f.seller} (${f.data})\n`);
    const escolha = prompt(msg);
    if (escolha > 0 && escolha <= filtrados.length) {
        const item = filtrados[escolha-1].snapshot;
        for (let id in item) { let el = document.getElementById(id); if (el) el.value = item[id]; }
        atualizarBarra();
        alert("Dados carregados!");
    }
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
    const textoCompleto = `<b>Informações adicionais:</b>\n➡️ Máquina sem aluguel\n➡️ TEF\n➡️ Mesma taxa para todas as bandeiras\n➡️ Conta sem anuidade e taxas administrativas\n➡️ Link de pagamento com recebimento na hora\n➡️ Rendimentos diários no cofrinho\n🗒️Simulação com validade de 07 dias.`;
    let checkboxAtivo = apenasTaxas ? document.getElementById("chk_info_simples") : document.getElementById("chk_info_completo");
    if(boxInfoAdicional) {
        boxInfoAdicional.style.display = (checkboxAtivo && checkboxAtivo.checked) ? "block" : "none";
        if (checkboxAtivo && checkboxAtivo.checked) boxInfoAdicional.innerHTML = textoCompleto;
    }
    if (!apenasTaxas) {
        if(boxCorpo) boxCorpo.style.display = "block"; 
        if(boxGrafico) boxGrafico.style.display = "block";
        let v = window.dadosRelatorioAnalitico;
        if(v) {
            let htmlCustos = "";
            for (let label in v.itensOcultos) { if(v.itensOcultos[label] > 0) htmlCustos += `• ${label}: R$ ${v.itensOcultos[label].toFixed(2)}<br>`; }
            boxCorpo.innerHTML = `<div style="background:#f4f4f4; padding:20px; border-radius:15px; margin-bottom:20px; border:1px solid #ddd"><b>RESUMO DA ANÁLISE:</b><br>Faturamento: R$ ${v.faturamento.toLocaleString()}<br>Aporte Cofrinho: R$ ${v.aporte.toLocaleString()} / mês (CDI: ${v.cdiAlvo}%)<br><br><b style="color:#d32f2f">DETALHAMENTO DE CUSTOS CONCORRÊNCIA:</b><br>${htmlCustos || "• Nenhum custo fixo informado."}</div><h3>Rentabilidade e Projeção</h3>` + document.getElementById("resultadoFaturamento").innerHTML;
        }
        if (window.g && document.getElementById("img_grafico")) document.getElementById("img_grafico").src = document.getElementById("graficoEconomia").toDataURL();
    } else { 
        if(boxCorpo) boxCorpo.style.display = "none"; 
        if(boxGrafico) boxGrafico.style.display = "none"; 
    }
    setTimeout(() => { html2canvas(document.getElementById("areaRelatorio"), { scale: 3, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => { let link = document.createElement("a"); link.download = `BA21_PROPOSTA_${document.getElementById("input_loja").value}.png`; link.href = canvas.toDataURL("image/png", 1.0); link.click(); }); }, 800);
}

function toggleDescobreTaxa() {
    const box = document.getElementById("boxDescobreTaxa");
    box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
}

function calcularDescobreTaxa(origem) {
    let valorOp = parseFloat(document.getElementById("calc_valor_op").value) || 0;
    let valorRec = parseFloat(document.getElementById("calc_valor_rec").value) || 0;
    let taxaPercent = parseFloat(document.getElementById("calc_taxa_perc").value) || 0;
    const resTaxa = document.getElementById("res_taxa_percent");
    const resFinal = document.getElementById("res_valor_final");

    if (origem === 'valor' || origem === 'recebido') {
        if (valorOp > 0 && valorRec > 0) {
            let taxa = ((valorOp - valorRec) / valorOp) * 100;
            resTaxa.innerText = `${taxa.toFixed(2)}%`;
            resFinal.innerText = `R$ ${valorRec.toFixed(2)}`;
            document.getElementById("calc_taxa_perc").value = taxa.toFixed(2);
        }
    } 
    if (origem === 'taxa') {
        if (valorOp > 0 && taxaPercent > 0) {
            let liquido = valorOp - (valorOp * (taxaPercent / 100));
            resFinal.innerText = `R$ ${liquido.toFixed(2)}`;
            resTaxa.innerText = `${taxaPercent.toFixed(2)}%`;
            document.getElementById("calc_valor_rec").value = liquido.toFixed(2);
        } else if (valorRec > 0 && taxaPercent > 0) {
            let brutoNecessario = valorRec / (1 - (taxaPercent / 100));
            resFinal.innerText = `R$ ${valorRec.toFixed(2)} (Liq)`;
            resTaxa.innerText = `Cobrar: R$ ${brutoNecessario.toFixed(2)}`;
            document.getElementById("calc_valor_op").value = brutoNecessario.toFixed(2);
        }
    }
}

async function processarOCR(event, pref) {
    const file = event.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const worker = await Tesseract.createWorker('por');
        await worker.setParameters({ tessedit_char_whitelist: '0123456789xX,.-% ' });
        const res = await worker.recognize(e.target.result);
        let txt = res.data.text.toLowerCase().replace(/,/g, ".").replace(/\s*x\s*/g, "x");
        let regex = /(\d{1,2})x\s*([\d.]+)/g; let match;
        while ((match = regex.exec(txt)) !== null) {
            let p = parseInt(match[1]), t = parseFloat(match[2]);
            if (p >= 1 && p <= 18) {
                let id = (p === 1) ? (pref === "mp" ? "mp1" : "out1_manual") : (pref + p + (pref === "out" ? "_manual" : ""));
                if(document.getElementById(id)) document.getElementById(id).value = t.toFixed(2);
            }
        }
        await worker.terminate();
    };
    reader.readAsDataURL(file);
}
