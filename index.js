import { Component } from 'preact';
import fetch from 'isomorphic-unfetch'
const url = require('url')
const queryString = require('query-string');

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
		this.loginFacebook = this.loginFacebook.bind(this);
		this.renderLoginButton = this.renderLoginButton.bind(this);


		this.state = {
			fbRootLoaded: false,
			fbInitLoaded: false,
			authorized: false,
			user: undefined
		}
	}

	componentDidMount() {
		this.init().then(() => {

		});
	}

	loadFacebookSDK() {
		return new Promise((resolve) => {
				(function (d, s, id) {
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) { return; }
					js = d.createElement(s); js.id = id;
					js.src = "https://connect.facebook.net/en_US/sdk.js";
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));

				resolve();
		})
	}

	init() {
		return new Promise((r) => {
			this.loadFacebookSDK().then(() => {
				return new Promise((resolve) => {
					if (typeof FB !== 'undefined') {
						resolve();
					} else {
						window.fbAsyncInit = () => {
							FB.init(facebookInitOptions);
	
							this.setState({ fbInitLoaded: true })
							resolve();
						};
						this.setState({ fbRootLoaded: true });
					}
				})
			});
			r();
		})
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
		const { fbInitLoaded, fbRootLoaded, authorized } = this.state;
		console.log(fbInitLoaded && fbRootLoaded && !authorized);


		if (fbInitLoaded && fbRootLoaded && !authorized) {
			console.log(this.state);

			return (
				<button onClick={this.loginFacebook}>facebook login</button>
			);
		} else if (authorized) {
			return (<div>success</div>)
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
					const path = url.parse(location.href)
					const params = queryString.parse(path.search);
					const stringified = queryString.stringify({ ...params, ...authResponse })

					fetch(`https://${path.hostname}/facebook/login?${stringified}`, { method: 'GET' }).then(() => {
					})
				}

				resolve();

			}, {
					auth_type: 'reauthorize',
					scopes: 'email'
				});

		});
	}

	render() {
		return (
			<div>
				<button onClick={this.loginFacebook}>facebook login</button>
			</div>
		);
	}
}
