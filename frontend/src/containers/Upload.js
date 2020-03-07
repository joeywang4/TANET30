import React, { Component, createRef } from 'react';
import { Header, Icon, Button } from 'semantic-ui-react';
import { BACKEND } from '../config';

const Blank = ({size}) => <div style={{height: `${size}em`}} />;
const [IDLE, UPLOADING, SUCCESS, FAIL] = [0, 1, 2, 3];
const toHumanSize = (size) => {
  if(size < 1024) {
    return `${size} B`;
  }
  else if(size < 1024*1024) {
    return `${(size/1024).toFixed(1)} KB`
  }
  else {
    return `${(size/(1024*1024)).toFixed(1)} MB`
  }
}

class Upload extends Component {
  constructor(props) {
    super(props);
    this.fileInput = createRef();
    this.state ={
      status: IDLE,
      name: "",
      size: 0,
      errMsg: ""
    }
  }

  fileChoosed() {
    const file = this.fileInput.current.files[0];
    const { name, size } = file;
    const reader = new FileReader();
    reader.onload = () => {
      console.log(reader.result);
      this.uploadFile(reader.result);
    }
    reader.onerror = () => {
      alert("You uploaded an invalid file");
    }
    if(file && size > 0) {
      if(size > 50*1024*1024) {
        this.setState(state => {
          state.status = FAIL;
          state.errMsg = "Oversized file (> 50 MB)"
        })
      }
      this.setState(state => {
        state.status = UPLOADING;
        state.name = name;
        state.size = size;
      })
      reader.readAsArrayBuffer(file);
    }
  }

  uploadFile(data) {
    console.log(data);
    fetch(BACKEND+"/file", {
      method: "POST",
      body: data,
      headers: {'Content-Type': 'application/octet-stream'}
    })
    .then(res => {
      if(res.status === 200) {
        this.setState({status: SUCCESS});
      }
    })
  }

  render() {
    return (
      <div style={{
        backgroundColor: "rgb(250, 250, 250)", 
        width: "50%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <Blank size="0.5" />
        <Header as='h3'>Upload PCAP file</Header>
        <Blank size="0.5" />
        <Icon 
          style={{flexGrow: 2, cursor: "pointer"}}
          onClick={() => this.fileInput.current.click()}
          name="file alternate outline"
          size="huge"
        />
        {this.state.status > 0?(
          this.state.status === SUCCESS?
          <label style={{margin: "1em"}}>
            Upload Success!
            <br />
            Filename: {this.state.name}
            <br />
            Size: {toHumanSize(this.state.size)}
          </label>
          :
          <label style={{margin: "2em"}}>{this.state.status===FAIL?this.state.errMsg:"Uploading..."}</label>)
          :<Blank size="3" />
        }
        <Button loading={this.state.status===UPLOADING} onClick={() => this.fileInput.current.click()}>
          Choose File
          <input ref={this.fileInput} onInput={() => this.fileChoosed()} type="file" hidden />
        </Button>
        <Blank size="1" />
      </div>
    )
  }
}

export default Upload;