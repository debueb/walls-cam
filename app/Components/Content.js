import React from 'react';

const LOADING_IMAGE_PATH = '/balls.svg';

export default class Content extends React.Component {
  
  constructor(props){
      super(props);
      this.state = {
        imagePath: LOADING_IMAGE_PATH,
        email: '',
        emailValid: false,
        recordDuration: 30,
        recording: undefined,
        recordCount: undefined
      }
      this.refreshData  = this.refreshData.bind(this);
      this.refreshImage  = this.refreshImage.bind(this);
      this.stopRecording = this.stopRecording.bind(this);
      this.startRecording = this.startRecording.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.refreshData();
  }

  stopRecording(){
    fetch('/api/stoprecording', {method: 'POST'}).then(response =>{
      this.refreshData();
    });
  }

  refreshData() {
    fetch('/api/status').then(response => response.json()).then(json =>{
        this.setState(Object.assign(this.state, json));
        if (this.state.recording){
          setTimeout(this.refreshData, 3000);
        } else {
          fetch('/api/image').then(response => response.json()).then(json => {
            this.setState({ imagePath: json.path });
          });
        }
    });
  }

  refreshImage(){
    this.setState({imagePath: LOADING_IMAGE_PATH});
    this.refreshData();
  }
  
  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    if (name === 'email'){
      this.validateEmail(value);
    }
  }
  
  startRecording(event) {
    if (this.state.emailValid){
      fetch('/api/startrecording', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.state.email,
            recordDuration: this.state.recordDuration
          })
      }).then(response => response.json()).then(json => {
          this.setState({recording: json.recording});
          setTimeout(this.refreshData, 5000);
      });
    }
    event.preventDefault();
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.setState({emailValid: re.test(email)})
  }

  render() {
    let content = null;
    switch (this.state.recording){
      case undefined:
        content = (
          <div className="form">
            <p className="text">
              Initialisierung...
            </p>
            <img src={this.state.imagePath} width="100%"/>
            </div>
        );
        break;
      case true:
        content = (
          <div className="form">
            <p className="text">
              Die Kamera nimmt gerade ein Video auf.
            </p>
            <input type='button' onClick={this.stopRecording} className="btn btn-primary full-width" value='Aufnahme stoppen'></input>
          </div>
        )
        break;
      case false:
        content = (
          <div className="form text">
            <p className="text">
              Hier kannst Du die Kamera auf Padel Platz 3 ausrichten und Videoaufzeichnungen starten. 
            </p>
            <img src={this.state.imagePath} className="previewImage"/>
            <input type="button" onClick={this.refreshImage} disabled={this.state.imagePath === LOADING_IMAGE_PATH} className={"btn btn-primary unit full-width"} value="Bild aktualisieren"/>
            <hr className="unit"/>
            <p className="text unit">
                Die Kamera nimmt dein Spiel auf, lädt es bei Youtube hoch und schickt dir eine Email mit dem nicht öffentlichen Youtube Link.
            </p>
            <form onSubmit={this.startRecording}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" value={this.state.email} onChange={this.handleChange} className={"form-input full-width " + (this.state.emailValid ? '' : 'border-red')} type="text" placeholder="Email" />
            </div>
            <div className="form-group">
              <label className="form-label">Dauer</label>
              <select name="recordDuration" value={this.state.recordDuration} onChange={this.handleChange} className="form-select full-width">
                <option value="30">30min</option>
                <option value="60">60min</option>
                <option value="90">90min</option>
              </select>
              <input type="submit" value="Video aufnehmen" className="btn btn-primary unit full-width"/>
            </div>
            <hr className="unit"/>
            <p className="text unit">
                Anzahl Videos, die noch auf Youtube hochgeladen werden müssen: {this.state.recordCount}
                <br/>
                Videos werden automatisch und nachts hochgeladen.
            </p>
            </form>
          </div>
        )
    }
    return (
      <div>
        {content}
      </div>
    )
  }
}