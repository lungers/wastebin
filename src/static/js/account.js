const enable2FAButton = document.querySelector('.enable-2fa');
const confirm2FAContainer = document.querySelector('.confirm-2fa');
const confirm2FAButton = document.querySelector('.confirm-2fa-code');
const qrCodeContainer = document.querySelector('.qrcode');
const addPasskeyButton = document.querySelector('.add-passkey');

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

if (enable2FAButton) {
    enable2FAButton.addEventListener('click', async () => {
        const request = await fetch('/account/2fa/init', {
            method: 'POST',
        });
        const response = await request.json();

        enable2FAButton.remove();

        confirm2FAContainer.style.display = 'block';
        qrCodeContainer.innerHTML = response.result.qr_code.svg;
    });
}

addPasskeyButton.addEventListener('click', async () => {
    const name = await prompt('What do you want to name this passkey?');
    if (name === null || name === '') {
        return;
    }

    const initRequest = await fetch('/account/passkeys/init', {
        method: 'POST',
    });
    const initResponse = await initRequest.json();

    let authOptions;
    try {
        authOptions = await SimpleWebAuthnBrowser.startRegistration({
            optionsJSON: initResponse,
        });
    } catch (error) {
        console.error(error);
        alert('Failed to add passkey');
        return;
    }

    const verificationRequest = await fetch('/account/passkeys/verify-init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, ...authOptions }),
    });
    const verificationResponse = await verificationRequest.json();

    if (verificationResponse.verified) {
        location.reload();
    } else {
        alert(
            `Oh no, something went wrong! Response: ${JSON.stringify(
                verificationResponse,
            )}`,
        );
    }
});

document.addEventListener('submit', event => {
    const form = event.target.closest('.delete-passkey-form');
    if (form) {
        event.preventDefault();

        const confirmation = confirm(
            'Are you sure you want to delete this passkey?',
        );

        if (confirmation) {
            form.submit();
        }
    }
});
