require('normalize.css/normalize.css');
require('styles/App.css');
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, Button, Alert} from 'react-bootstrap';
import React from 'react';
var NodeRSA = require('node-rsa');

class AppComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            encryptedData: '',
            clearData: '',
            pubKey: '',
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
            var text = this.state.clearData;
            var encrypted = key.encrypt(text, 'base64');
            this.setState({encryptedOutput: encrypted});
        }
        catch (err) {
            console.log('Something went wrong:', err);
            this.showErrorMessage(err.message);
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
            console.log('Something went wrong:', err);
            this.showErrorMessage(err.message);
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
        this.state[field] = e.target.value;
        this.forceUpdate();
    }

    hideErrorMessage() {
        this.setState({errorMessage: ''});
    }

    showErrorMessage(message) {
        this.setState({errorMessage: message});
    }

    renderAlert() {
        if (this.state.errorMessage)
            return (<Alert bsStyle="danger" onDismiss={this.hideErrorMessage}>
                <h4>Something went wrong.</h4>
                <p>{this.state.errorMessage}</p>
            </Alert>)
        return null;
    }

    render() {
        return (
            <div className="mainApp">
                <h1 className="center">Open GPG Simple Encryption/Decryption</h1>
                <Grid>
                    {this.renderAlert()}
                    <Button bsStyle="primary" onClick={this.generateKeyPair} className="pull-right"
                            disabled={this.state.pubKey || this.state.privateKey}>Generate Key Pair (2048 bits)</Button>
                    <h2 id="encrypt">Encryption</h2>
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
                                             value={this.state.data} onChange={this.handleClearDataChange}/>
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
                    <Row>
                        <Col md={12}>
                            <Button bsStyle="danger" onClick={this.encryptClick}>Encrypt!</Button>
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
                    <Row>
                        <Col md={12}>
                            <Button bsStyle="success" onClick={this.decryptClick}>Decrypt!</Button>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

AppComponent.defaultProps = {};

export default AppComponent;
