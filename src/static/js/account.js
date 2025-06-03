const enable2FAButton = document.querySelector('.enable-2fa');
const confirm2FAContainer = document.querySelector('.confirm-2fa');
const confirm2FAButton = document.querySelector('.confirm-2fa-code');
const qrCodeContainer = document.querySelector('.qrcode');

// remove the `error` query params
const params = new URLSearchParams(location.search.slice(1));
if (params.has('error')) {
    params.delete('error');
    history.replaceState(
        null,
        '',
        location.pathname + (params.size > 0 ? '?' + params.toString() : ''),
    );
}

enable2FAButton.addEventListener('click', async () => {
    const request = await fetch('/account/2fa/init', {
        method: 'POST',
    });
    const response = await request.json();

    enable2FAButton.remove();

    confirm2FAContainer.style.display = 'block';
    qrCodeContainer.innerHTML = response.result.qr_code.svg;
});
