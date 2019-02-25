import './style';
import { Component } from 'preact';

const facebookInitOptions = {
    appId: '398277270719379',
    version: 'v3.2',
    cookie: true,
    xfbml: true
}

export default class App extends Component {
    constructor(props) {
        super(props);

        this.init = this.init.bind(this);
        this.loadFacebookSDK = this.loadFacebookSDK.bind(this);
        this.checkLoginStatus = this.checkLoginStatus.bind(this);
        this.logoutFacebook = this.logoutFacebook.bind(this);
        this.loginFacebook = this.loginFacebook.bind(this);


        this.state = {
            fbRootLoaded: false,
            fbInitLoaded: false,
            authorized: false,
            user: undefined,
            open: false
        }
    }

    componentDidMount() {
        this.init().then(() => {

        });
    }

    loadFacebookSDK() {
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    init() {
        return new Promise((resolve) => {
            if (typeof FB !== 'undefined') {
                resolve();
            } else {
                window.fbAsyncInit = () => {
                    FB.init(facebookInitOptions);

                    this.setState({ fbInitLoaded: true })
                    resolve();
                };
                this.loadFacebookSDK();
                this.setState({ fbRootLoaded: true });
            }
        });
    }

    checkLoginStatus() {
        return new Promise((resolve) => {
            FB.getLoginStatus((response) => {
                const {
                    status,
                    authResponse
                } = response;

                if (status === 'connected') {
                    this.setState({ authorized: true, user: authResponse });
                }

                resolve(response);
            });
        });
    }

    renderLoginButton() {
        const { fbInitLoaded, fbRootLoaded } = this.state;

        if (fbInitLoaded && fbRootLoaded) {
            if (!this.state.authorized) {
                return (
                    <div class="fb-login-button"
                        data-size="large"
                        data-button-type="continue_with"
                        data-auto-logout-link="false"
                        data-use-continue-as="false"
                        onClick={this.loginFacebook}
                    >
                    </div>
                );
            }
        }
    }

    loginFacebook() {
        return new Promise((resolve) => {
            FB.login((response) => {
                const {
                    status,
                    authResponse
                } = response;

                if (status === 'connected') {
                    this.setState({ authorized: true, user: authResponse });
                }

                resolve();
            }, {
                    auth_type: 'reauthorize',
                    scopes: 'email'
                });
        });
    }

    logoutFacebook() {
        FB.logout((response) => {
            this.setState({ authorized: false, user: undefined });
        });
    }

    render() {
        return (
            <div>
                {this.renderLoginButton()}
            </div>
        );
    }
}
