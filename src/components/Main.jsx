require('normalize.css/normalize.css');
require('styles/App.scss');
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, Button, Alert} from 'react-bootstrap';
import React from 'react';
var NodeRSA = require('node-rsa');

class AppComponent extends React.Component {

    constructor(props) {
        super(props);
        const pubKey = this.getParameterByName('pubKey') ? this.decodeValueForUrl(this.getParameterByName('pubKey')) : '';
        this.state = {
            encryptedData: '',
            clearData: '',
            pubKey: pubKey,
            privateKey: '',
            encryptedOutput: '',
            decryptedOutput: '',
            errorMessage: ''
        };
        this.handlePubKeyChange = this.handlePubKeyChange.bind(this);
        this.handleClearDataChange = this.handleClearDataChange.bind(this);
        this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this);
        this.encryptClick = this.encryptClick.bind(this);
        this.decryptClick = this.decryptClick.bind(this);
        this.handleEncryptedDataChange = this.handleEncryptedDataChange.bind(this);
        this.hideErrorMessage = this.hideErrorMessage.bind(this);
        this.showErrorMessage = this.showErrorMessage.bind(this);
        this.renderAlert = this.renderAlert.bind(this);
        this.generateKeyPair = this.generateKeyPair.bind(this);
    }


    encryptClick() {
        this.hideErrorMessage();
        try {
            const key = new NodeRSA(this.state.pubKey);
            const text = this.state.clearData;
            const encrypted = key.encrypt(text, 'base64');
            this.setState({encryptedOutput: encrypted});
        }
        catch (err) {
            this.showErrorMessage(err);
        }
    }

    decryptClick() {
        this.hideErrorMessage();
        try {
            const key = new NodeRSA(this.state.privateKey);
            var encrypted = this.state.encryptedData;
            var decrypted = key.decrypt(encrypted, 'utf8');
            this.setState({decryptedOutput: decrypted});
        }
        catch (err) {
            this.showErrorMessage(err);
        }

    }

    generateKeyPair() {
        if (this.state.pubKey || this.state.privateKey) {
            this.showErrorMessage('Fields are not empty. Empty key fields before generating a new key pair.');
            return;
        }
        let key = new NodeRSA();
        key.generateKeyPair(2048, 65537);
        const privateKey = key.exportKey('pkcs1-private-pem');
        const publicKey = key.exportKey('pkcs1-public-pem');
        console.log(privateKey, publicKey);
        this.setState({privateKey: privateKey, pubKey: publicKey});
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.pubKey != this.state.pubKey)
        {
            this.pushPubKeyToUrl(this.state.pubKey);
        }
    }

    pushPubKeyToUrl(publicKey) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?pubKey=' + this.encodeValueForUrl(publicKey);
        window.history.pushState({path: newurl}, '', newurl);
    }

    encodeValueForUrl(value) {
        return encodeURIComponent(new Buffer(value).toString('base64'));
    }

    decodeValueForUrl(value) {
        return decodeURIComponent(new Buffer(value, 'base64').toString('ascii'));
    }

    handlePubKeyChange(e) {
        this.handleChange('pubKey', e);
    }

    handlePrivateKeyChange(e) {
        this.handleChange('privateKey', e);
    }

    handleClearDataChange(e) {
        this.handleChange('clearData', e);
    }

    handleEncryptedDataChange(e) {
        this.handleChange('encryptedData', e);
    }

    handleChange(field, e) {
        let stateChange = {};
        stateChange[field] = e.target.value;
        this.setState(stateChange);
    }

    hideErrorMessage() {
        this.setState({errorMessage: ''});
    }

    showErrorMessage(err) {
        console.log('Something went wrong:', err);
        this.setState({errorMessage: err.message});
    }

    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


    isGenerateKeyEnabled() {
        return (this.state.pubKey || this.state.privateKey) ? true : false;
    }

    renderAlert() {
        if (this.state.errorMessage) {
            setTimeout(() => {
                window.scrollTo(0, 100);
            }, 100);
            return (<Alert bsStyle="danger" onDismiss={this.hideErrorMessage}>
                <h4>Something went wrong.</h4>
                <p>{this.state.errorMessage}</p>
            </Alert>)
        }
        return null;
    }

    render() {
        return (
            <div className="mainApp">
                <h1 className="center">Open GPG Simple Encryption/Decryption</h1>
                <Grid>
                    {this.renderAlert()}
                    <Button bsStyle="primary" onClick={this.generateKeyPair} className="pull-right"
                            disabled={this.isGenerateKeyEnabled()}>Generate Key Pair (2048 bits)</Button>
                    <h2 id="encrypt">Encryption</h2>
                    <div>
                        <p>Once you've entered your Public Key, you can share the URL to make it easier for others to share data with you.</p>
                    </div>
                    <div>
                        <p>Run this command to get your id_rsa.pub in pem format:</p>
                        <blockquote>ssh-keygen -f id_rsa -e -m pem</blockquote>
                    </div>
                    <Row>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Public Key (.PEM)</ControlLabel>
                                <FormControl componentClass="textarea" placeholder=".pem format" style={{height: 300}}
                                             value={this.state.pubKey} onChange={this.handlePubKeyChange}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Cleartext</ControlLabel>
                                <FormControl componentClass="textarea" placeholder="The secret you want to encrypt"
                                             style={{height: 300}}
                                             value={this.state.clearData} onChange={this.handleClearDataChange}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Output</ControlLabel>
                                <FormControl readOnly componentClass="textarea" style={{height: 300}}
                                             placeholder="The encrypted secret" value={this.state.encryptedOutput}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="controls">
                        <Col md={12}>
                            <Button bsStyle="danger" onClick={this.encryptClick}>Encrypt!</Button>
                            <Button onClick={() => {this.setState({clearData:'', encryptedOutput:''})}}>Clear text</Button>
                            <Button bsStyle="warning" onClick={() => {this.setState({pubKey:''})}}>Clear PubKey</Button>
                        </Col>
                    </Row>
                    <h2 id="decrypt">Decryption</h2>
                    <div>
                        <p>Run this command to get your id_rsa in pem format:</p>
                        <blockquote>openssl rsa -in ~/.ssh/id_rsa -outform pem</blockquote>
                    </div>
                    <Row>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Private Key (.PEM)</ControlLabel>
                                <FormControl componentClass="textarea" placeholder=".pem format" style={{height: 300}}
                                             value={this.state.privateKey} onChange={this.handlePrivateKeyChange}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Encrypted text</ControlLabel>
                                <FormControl componentClass="textarea" placeholder="The encrypted secret"
                                             style={{height: 300}}
                                             value={this.state.encryptedData}
                                             onChange={this.handleEncryptedDataChange}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <FormGroup controlId="formControlsTextarea">
                                <ControlLabel>Output</ControlLabel>
                                <FormControl readOnly componentClass="textarea" placeholder="The decrypted secret"
                                             style={{height: 300}}
                                             value={this.state.decryptedOutput}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="controls">
                        <Col md={12}>
                            <Button bsStyle="success" onClick={this.decryptClick}>Decrypt!</Button>
                            <Button onClick={() => {this.setState({encryptedData:'', decryptedOutput:''})}}>Clear text</Button>
                            <Button bsStyle="warning" onClick={() => {this.setState({privateKey:''})}}>Clear PrivateKey</Button>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

AppComponent.defaultProps = {};

export default AppComponent;
