# Apresentações de Slides de Física para Aulas Particulares

Material didático interativo construído para aulas particulares online de Física (Mecânica, Dinâmica do Impacto, Estática e Hidrostática) e posterior estudo autônomo da aluna.

O projeto foi desenhado com **caminhos 100% relativos (`./`)**, pronto para ser hospedado diretamente em uma subpasta do seu domínio no GitHub Pages:

👉 **URL de Acesso da Aluna:**
`https://rafareisz07.github.io/fisica/`

---

## 📚 Estrutura das Aulas e Tópicos

Cada tópico é uma página independente de slides com simulador interativo em Canvas e exercício resolvido passo a passo:

1. **[Tópico 01 - Potência Média e Instantânea](topico1.html)**
   - Trabalho vs. Potência, unidades S.I. (Watt), cavalo-vapor (cv), kWh.
   - Fórmula instantânea $P = \vec{F} \cdot \vec{v}$, análise gráfica $P \times t$ (Área = Trabalho) e rendimento ($\eta$).
   - *Simulador:* Potência de motor de veículo em rampa com atrito e velocidade variável.

2. **[Tópico 02 - Impulso, Força Variável e Colisões](topico2.html)**
   - Vetor Impulso ($\vec{I} = \vec{F} \Delta t$), força variável como a área sob a curva do gráfico $F \times t$.
   - Teorema do Impulso ($\vec{I} = \Delta \vec{Q}$) e a física que salva vidas (Airbags, zonas deformáveis, luvas de boxe).
   - *Simulador:* Curva de Impacto $F \times t$ com pico de força ajustável pelo tempo de contato.

3. **[Tópico 03 - Sistemas Isolados, 3ª Lei de Newton e Conservação de Q](topico3.html)**
   - Quantidade de Movimento ($\vec{Q} = m\vec{v}$), forças internas vs. externas ($\sum \vec{F}_{ext} = 0$).
   - Como a Ação e Reação gera a conservação: $\vec{Q}_{antes} = \vec{Q}_{depois}$.
   - Aplicações: Recuo de armas de fogo, canhões e propulsão de foguetes no vácuo.
   - *Simulador:* Disparo e recuo de canhão com conservação vetorial de $\vec{Q}$.

4. **[Tópico 04 - Tipos de Colisões e Coeficiente de Restituição](topico4.html)**
   - Conservação de $\vec{Q}$ vs. destino da energia cinética ($E_c$).
   - Coeficiente de restituição $e = \frac{v_{afast}}{v_{aprox}} = \sqrt{\frac{h'}{h}}$.
   - Choques elásticos ($e=1$), inelásticos ($e=0$, saem juntos) e parcialmente elásticos.
   - Casos especiais: troca de velocidades para massas iguais e pêndulo balístico.
   - *Simulador:* Trilho de ar 1D com medição de $E_c$ e perda de energia percentual.

5. **[Tópico 05 - Equilíbrio de um Ponto Material](topico5.html)**
   - Condição necessária e suficiente: $\sum \vec{F} = \vec{0}$ ($\sum F_x = 0$ e $\sum F_y = 0$).
   - Equilíbrio estático vs. dinâmico, método do polígono fechado e Teorema de Lamy.
   - Casos práticos: rampa com atrito estático ($\tan\theta \le \mu_e$) e nós de cabos.
   - *Simulador:* Nó de cabos suspensos com ângulos e massas configuráveis.

6. **[Tópico 06 - Equilíbrio: Translação e Rotação](topico6.html)**
   - Ponto material vs. Corpo extenso, braço de alavanca e Torque ($\tau = F \cdot d$).
   - As duas condições de equilíbrio estático: $\sum \vec{F} = \vec{0}$ e $\sum \vec{\tau}_{(polo)} = 0$.
   - A escolha estratégica do polo para anular forças desconhecidas.
   - Classes de alavancas (interfixa, inter-resistente, interpotente) e viga sobre apoios.
   - *Simulador:* A Gangorra / Alavanca Perfeita com inclinação e torque em tempo real.

7. **[Tópico 07 - Pressão nos Líquidos e Limites de Sucção](topico7.html)**
   - Conceito de pressão ($p = F/A$), Teorema de Stevin ($p = p_0 + \rho gh$) e o paradoxo hidrostático.
   - O Experimento de Torricelli e o barômetro de mercúrio ($76\text{ cmHg} \approx 10^5\text{ Pa}$).
   - **Os Limites Físicos da Sucção:** por que canudos e bombas de sucção na superfície não conseguem puxar água além de ~10,3 metros (limite da atmosfera externa empurrando a coluna).
   - *Simulador:* Barômetro e coluna líquida máxima com Mercúrio, Água e Álcool.

8. **[Tópico 08 - Transmissão de Pressão e Vasos Comunicantes](topico8.html)**
   - O Princípio de Pascal em líquidos incompressíveis.
   - A Prensa Hidráulica e a multiplicação de força: $\frac{F_1}{A_1} = \frac{F_2}{A_2} \implies \frac{F_2}{F_1} = \left(\frac{R_2}{R_1}\right)^2$.
   - Conservação do Trabalho: $W_1 = W_2 \implies F_1 d_1 = F_2 d_2$.
   - Vasos comunicantes e tubo em U com líquidos imiscíveis: $\rho_1 h_1 = \rho_2 h_2$.
   - *Simulador:* Tubo em U com dois líquidos imiscíveis e interface isobárica.

---

## ⌨️ Atalhos do Teclado durante a Aula Online

- `→` ou `Espaço`: Próximo slide
- `←`: Slide anterior
- `P`: **Modo Professor / Anotações** (revela caixas exclusivas com dicas pedagógicas, pegadinhas de prova e perguntas chave para fazer para a aluna)
- `F`: Ativar/Desativar modo Tela Cheia
- `M`: Abrir Menu Gaveta com o sumário de slides
- `Home` / `End`: Primeiro / Último slide
- `?`: Exibir guia de atalhos

---

## 🚀 Como Subir para o GitHub Pages

A pasta `fisica/` já foi criada diretamente no seu repositório local em:
`C:\Users\rraab\OneDrive\Desktop\Rafareisz07.github.io\fisica\`

Para colocar no ar no seu GitHub (`https://github.com/Rafareisz07/Rafareisz07.github.io`):

1. Abra o **GitHub Desktop** (ou o terminal/VS Code).
2. Você verá a pasta `fisica/` com todos os novos arquivos detectados.
3. Faça o commit:
   `Adiciona apresentações de slides e simuladores de física na subpasta /fisica`
4. Clique em **Push origin**.
5. Em cerca de 1 minuto, o GitHub Pages atualizará e o material estará acessível em:
   `https://rafareisz07.github.io/fisica/`
