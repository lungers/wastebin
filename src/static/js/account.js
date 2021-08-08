const enable2FAButton = document.querySelector('.enable-2fa');
const confirm2FAContainer = document.querySelector('.confirm-2fa');
const confirm2FAButton = document.querySelector('.confirm-2fa-code');
const qrCodeContainer = document.querySelector('.qrcode');

enable2FAButton.addEventListener('click', async () => {
    const request = await fetch('/account/2fa/init', {
        method: 'POST',
    });
    const response = await request.json();

    enable2FAButton.remove();

    confirm2FAContainer.style.display = 'block';
    qrCodeContainer.innerHTML = response.result.qr_code.svg;
});
