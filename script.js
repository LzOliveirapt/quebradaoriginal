const jsIntroBtn = document.getElementById('jsIntroBtn');
const jsIntroMessage = document.getElementById('jsIntroMessage');

jsIntroBtn.addEventListener('click', () => {
    jsIntroMessage.textContent = 'JavaScript está ativo! Ele acabou de mudar este texto quando você clicou no botão.';
    jsIntroBtn.textContent = 'Muito bom!';
});
