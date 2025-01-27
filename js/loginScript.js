        function login(){
        const authUrl = `${config.domain}/login?` + 
        `response_type=token` + 
        `&client_id=${config.clientId}` + 
        `&redirect_uri=${encodeURIComponent(config.redirectUris.signIn)}` + 
        `&scope=openid+aws.cognito.signin.user.admin`;
        window.location.href = authUrl;
    }