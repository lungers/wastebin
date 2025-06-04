const loginWithPasskeyButton = document.querySelector('.login-with-passkey');

const getAuthOptions = async (useBrowserAutofill = false) => {
    const request = await fetch('/account/passkeys/auth-options');
    const result = await request.json();

    return SimpleWebAuthnBrowser.startAuthentication({
        optionsJSON: result,
        useBrowserAutofill,
    });
};

const verifyAuth = async authOptions => {
    const request = await fetch('/account/passkeys/verify-auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authOptions),
    });

    return request.json();
};

if (!SimpleWebAuthnBrowser.browserSupportsWebAuthn()) {
    loginWithPasskeyButton.remove();
} else {
    getAuthOptions(true)
        .then(authOptions => {
            loginWithPasskeyButton.textContent = 'Loading...';
            return verifyAuth(authOptions);
        })
        .then(({ verified }) => {
            if (verified) {
                location.href = '/';
            }

            loginWithPasskeyButton.textContent = 'Login with Passkey';
        });
}

loginWithPasskeyButton.addEventListener('click', async () => {
    loginWithPasskeyButton.textContent = 'Loading...';

    const authOptions = await getAuthOptions();
    const { verified } = await verifyAuth(authOptions);

    if (verified) {
        location.href = '/';
    }

    loginWithPasskeyButton.textContent = 'Login with Passkey';
});
