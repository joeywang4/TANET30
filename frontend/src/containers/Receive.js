import React, { Component } from 'react';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';

const mapStateToProps = (state) => ({
  id: state.user.id
})

class Receive extends Component {
  render() {
    return <QRCode value={this.props.id} size={512} level={'H'} style={{marginTop:"3em", display: "block", width: "80%", maxWidth: "500px", height: "auto"}}  />
  }
}


export default connect(mapStateToProps)(Receive);