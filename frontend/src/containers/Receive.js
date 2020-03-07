import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader } from 'semantic-ui-react';
import QRCode from 'qrcode';

const mapStateToProps = (state) => ({
  id: state.user.id
})

class Receive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
    this.qrcodeURL = "";
    this.getURL();
  }

  async getURL() {
    const URL = await QRCode.toDataURL(this.props.id)
    .then(URL => URL)
    .catch(err => console.error(err));
    this.qrcodeURL = URL;
    this.setState({loading: false});
  }

  render() {
    if(this.state.loading) return <Loader active />
    else return <img src={this.qrcodeURL} />
  }
}


export default connect(mapStateToProps)(Receive);