import React, { Component } from 'react';
import { Loader } from 'semantic-ui-react';
import QRCode from 'qrcode';

class MyQRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
    this.qrcodeURL = "";
    this.getURL();
  }

  async getURL() {
    const URL = await QRCode.toDataURL(this.props.data)
    .then(URL => URL)
    .catch(err => console.error(err));
    this.qrcodeURL = URL;
    this.setState({loading: false});
  }

  render() {
    if(this.state.loading) return <Loader active />
    else return <img alt="Your qrcode" src={this.qrcodeURL} />
  }
}


export default MyQRCode;