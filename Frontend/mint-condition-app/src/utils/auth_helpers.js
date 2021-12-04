

// helper to check if we have an auth code either in query parameters or in storage. Redirect to log in if we don't
function check_auth_code() {
    // if there's an auth code in the query parameters, store auth code in localstorage
    let search = window.location.search
    let params = new URLSearchParams(search)
    let auth_code = params.get('code')
    if (auth_code) {
        // store auth code
        localStorage.setItem('auth_code', auth_code)
    }

    // if we don't have an auth code in storage, redirect to log in page
    auth_code = localStorage.getItem('auth_code')
    if (!auth_code) {
        window.location.href = "/"
    }
}

// clear the auth code stored in browser
// planning to use this every time we get an expired code response from an api request
function clear_auth_code() {
    localStorage.removeItem('auth_code')
    window.location.href = "/"
}

export {check_auth_code, clear_auth_code};